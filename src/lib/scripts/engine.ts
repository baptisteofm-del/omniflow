import type { SupabaseClient } from '@supabase/supabase-js'

// Loop Protection (spec 13.39): a broken graph (e.g. a cycle of 'always'
// edges) must never spin forever.
const MAX_NODE_HOPS = 20

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

// Advances a script run through its node chain: sends message-node text
// immediately and keeps moving via 'always' edges, but stops (and waits)
// the moment it reaches a paid_media node — the run only continues once
// resolveScriptOffer() is called with the real purchase outcome (spec
// 13.12: never treat an intention/message as a confirmed transaction).
export async function advanceScriptRun(supabase: AnySupabaseClient, agencyId: string, runId: string) {
  for (let hop = 0; hop < MAX_NODE_HOPS; hop++) {
    const { data: run } = await supabase
      .from('script_runs')
      .select('id, conversation_id, current_node_id, status')
      .eq('id', runId)
      .single()
    if (!run || run.status !== 'active' || !run.current_node_id) return

    const { data: node } = await supabase
      .from('script_nodes')
      .select('id, node_type, message_template, price_amount, currency')
      .eq('id', run.current_node_id)
      .single()
    if (!node) return

    if (node.node_type === 'end') {
      await supabase
        .from('script_runs')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', runId)
      await supabase
        .from('script_run_events')
        .insert({ agency_id: agencyId, script_run_id: runId, node_id: node.id, event_type: 'completed' })
      return
    }

    if (node.node_type === 'message' && node.message_template) {
      await supabase.from('messages').insert({
        agency_id: agencyId,
        conversation_id: run.conversation_id,
        direction: 'outbound',
        sender_type: 'ai',
        text: node.message_template,
      })
      await supabase
        .from('script_run_events')
        .insert({ agency_id: agencyId, script_run_id: runId, node_id: node.id, event_type: 'message_sent' })
    } else if (node.node_type === 'paid_media' && node.message_template) {
      await supabase.from('messages').insert({
        agency_id: agencyId,
        conversation_id: run.conversation_id,
        direction: 'outbound',
        sender_type: 'ai',
        text: node.message_template,
        is_paid: true,
        price_amount: node.price_amount,
        currency: node.currency ?? 'EUR',
      })
      await supabase
        .from('script_run_events')
        .insert({ agency_id: agencyId, script_run_id: runId, node_id: node.id, event_type: 'offer_sent' })
      return // wait for resolveScriptOffer()
    }

    const { data: edge } = await supabase
      .from('script_edges')
      .select('to_node_id')
      .eq('from_node_id', node.id)
      .eq('condition_type', 'always')
      .order('priority', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!edge) {
      await supabase
        .from('script_runs')
        .update({ status: 'stopped', completed_at: new Date().toISOString() })
        .eq('id', runId)
      await supabase
        .from('script_run_events')
        .insert({ agency_id: agencyId, script_run_id: runId, node_id: node.id, event_type: 'stopped', outcome: 'no_edge' })
      return
    }

    await supabase.from('script_runs').update({ current_node_id: edge.to_node_id }).eq('id', runId)
  }

  await supabase.from('script_runs').update({ status: 'stopped' }).eq('id', runId)
  await supabase
    .from('script_run_events')
    .insert({ agency_id: agencyId, script_run_id: runId, event_type: 'stopped', outcome: 'loop_guard' })
}

// Resolves the paid_media node a run is currently waiting on, once a real
// purchase/decline is known, then continues advancing down the matching
// branch. No-op if there's no active run at that conversation, or the run
// isn't actually waiting on an offer (spec 13.13: not-purchased isn't the
// same as "pending" — this only fires on an explicit resolution).
export async function resolveScriptOffer(
  supabase: AnySupabaseClient,
  agencyId: string,
  conversationId: string,
  outcome: 'purchased' | 'not_purchased'
) {
  const { data: run } = await supabase
    .from('script_runs')
    .select('id, current_node_id')
    .eq('conversation_id', conversationId)
    .eq('status', 'active')
    .maybeSingle()
  if (!run || !run.current_node_id) return

  const { data: node } = await supabase.from('script_nodes').select('node_type').eq('id', run.current_node_id).single()
  if (!node || node.node_type !== 'paid_media') return

  await supabase
    .from('script_run_events')
    .insert({ agency_id: agencyId, script_run_id: run.id, node_id: run.current_node_id, event_type: outcome })

  const { data: edge } = await supabase
    .from('script_edges')
    .select('to_node_id')
    .eq('from_node_id', run.current_node_id)
    .eq('condition_type', outcome)
    .order('priority', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!edge) {
    await supabase
      .from('script_runs')
      .update({
        status: outcome === 'purchased' ? 'converted' : 'stopped',
        completed_at: new Date().toISOString(),
      })
      .eq('id', run.id)
    return
  }

  await supabase.from('script_runs').update({ current_node_id: edge.to_node_id }).eq('id', run.id)
  await advanceScriptRun(supabase, agencyId, run.id)
}
