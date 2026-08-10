import type { SupabaseClient } from '@supabase/supabase-js'
import { runAiTask } from '@/lib/ai/gateway'
import { buildScriptMessagePrompt, SCRIPT_MESSAGE_PROMPT_VERSION, type ScriptMessageResult } from '@/lib/ai/tasks'

// Loop Protection (spec 13.39): a broken graph (e.g. a cycle of 'always'
// edges) must never spin forever.
const MAX_NODE_HOPS = 20

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

interface RunContext {
  conversation_id: string
  fan_id: string
  creator_id: string
}

interface NodeRow {
  id: string
  node_type: string
  message_template: string | null
  price_amount: number | null
  currency: string | null
  generation_mode: string
}

// LOCKED (spec 13.8): send the template verbatim. ADAPTIVE: the template is
// an objective, not a script to recite — the Conversation Engine rewrites
// it naturally for this specific fan (Model DNA + memory), same pipeline
// Copilot already uses for RESPONSE_GENERATION.
async function resolveMessageText(
  supabase: AnySupabaseClient,
  agencyId: string,
  run: RunContext,
  node: NodeRow
): Promise<string> {
  const template = node.message_template ?? ''
  if (node.generation_mode !== 'adaptive' || !template) return template

  const { data: messages } = await supabase
    .from('messages')
    .select('sender_type, text, message_type, price_amount')
    .eq('conversation_id', run.conversation_id)
    .order('sent_at', { ascending: true })
    .limit(30)

  const transcript = (messages ?? [])
    .map((m) => {
      if (m.message_type === 'purchase_confirmation') {
        return `[Achat confirmé${m.price_amount ? ` — ${m.price_amount}€` : ''}]`
      }
      return `${m.sender_type === 'fan' ? 'Fan' : 'Créatrice'}: ${m.text}`
    })
    .join('\n')

  const { data: dna } = await supabase
    .from('creator_ai_profiles')
    .select('warmth, flirt_intensity, directness, sales_aggressiveness, message_length, emoji_style, tone, persona_description')
    .eq('creator_id', run.creator_id)
    .eq('status', 'published')
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: memories } = await supabase
    .from('fan_memories')
    .select('category, label, value')
    .eq('fan_id', run.fan_id)
    .eq('status', 'active')
    .order('importance', { ascending: false })
    .limit(8)

  const { data: fan } = await supabase.from('fans').select('display_name').eq('id', run.fan_id).single()

  const { system, user } = buildScriptMessagePrompt({
    transcript,
    dna: dna ?? null,
    memories: memories ?? [],
    fanName: fan?.display_name ?? 'Fan',
    objective: template,
  })

  try {
    const { data } = await runAiTask<ScriptMessageResult>({
      taskType: 'SCRIPT_MESSAGE',
      promptVersion: SCRIPT_MESSAGE_PROMPT_VERSION,
      systemPrompt: system,
      userPrompt: user,
      agencyId,
      conversationId: run.conversation_id,
      fanId: run.fan_id,
      creatorId: run.creator_id,
    })
    return data.message.trim() || template
  } catch (err) {
    // Fail safe: an AI hiccup must never leave a script stuck — fall back
    // to the locked template rather than blocking the run.
    console.error('[scripts] adaptive message generation failed, falling back to template:', err)
    return template
  }
}

async function followAlwaysEdge(supabase: AnySupabaseClient, agencyId: string, runId: string, fromNodeId: string) {
  const { data: edge } = await supabase
    .from('script_edges')
    .select('to_node_id')
    .eq('from_node_id', fromNodeId)
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
      .insert({ agency_id: agencyId, script_run_id: runId, node_id: fromNodeId, event_type: 'stopped', outcome: 'no_edge' })
    return null
  }

  await supabase.from('script_runs').update({ current_node_id: edge.to_node_id }).eq('id', runId)
  return edge.to_node_id as string
}

// Advances a script run one meaningful step at a time. 'start' passes
// through immediately (nothing to send). A 'message' node sends its text
// and then STOPS, leaving current_node_id pointing AT that same message
// node — the run only moves past it once the fan actually replies
// (resumeScriptRunAfterFanReply steps it forward then calls this again),
// matching spec 13.20's Wait Node ("wait until fan responds"): a script
// must not fire every step back-to-back regardless of whether the fan
// engaged. A 'paid_media' node sends the offer and STOPS the same way, but
// only resumes via resolveScriptOffer() with a real purchase outcome (spec
// 13.12 — never treat a message as a confirmed transaction).
export async function advanceScriptRun(supabase: AnySupabaseClient, agencyId: string, runId: string) {
  for (let hop = 0; hop < MAX_NODE_HOPS; hop++) {
    const { data: run } = await supabase
      .from('script_runs')
      .select('id, conversation_id, fan_id, creator_id, current_node_id, status')
      .eq('id', runId)
      .single()
    if (!run || run.status !== 'active' || !run.current_node_id) return

    const { data: node } = await supabase
      .from('script_nodes')
      .select('id, node_type, message_template, price_amount, currency, generation_mode')
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
      const text = await resolveMessageText(supabase, agencyId, run, node)
      await supabase.from('messages').insert({
        agency_id: agencyId,
        conversation_id: run.conversation_id,
        direction: 'outbound',
        sender_type: 'ai',
        text,
      })
      await supabase
        .from('script_run_events')
        .insert({ agency_id: agencyId, script_run_id: runId, node_id: node.id, event_type: 'message_sent' })
      return // current_node_id stays on this node — wait for the fan's reply
    }

    if (node.node_type === 'paid_media' && node.message_template) {
      const text = await resolveMessageText(supabase, agencyId, run, node)
      await supabase.from('messages').insert({
        agency_id: agencyId,
        conversation_id: run.conversation_id,
        direction: 'outbound',
        sender_type: 'ai',
        text,
        is_paid: true,
        price_amount: node.price_amount,
        currency: node.currency ?? 'EUR',
      })
      await supabase
        .from('script_run_events')
        .insert({ agency_id: agencyId, script_run_id: runId, node_id: node.id, event_type: 'offer_sent' })
      return // wait for resolveScriptOffer()
    }

    // 'start' (or any content-less pass-through node): just move on.
    const nextId = await followAlwaysEdge(supabase, agencyId, runId, node.id)
    if (!nextId) return
  }

  await supabase.from('script_runs').update({ status: 'stopped' }).eq('id', runId)
  await supabase
    .from('script_run_events')
    .insert({ agency_id: agencyId, script_run_id: runId, event_type: 'stopped', outcome: 'loop_guard' })
}

// Called after a fan message is logged. If a run is waiting after a plain
// message (current node is 'message' — paid_media only resolves via a real
// purchase outcome, never a text reply), step it to the next node and
// process that one now that the fan has actually responded.
export async function resumeScriptRunAfterFanReply(supabase: AnySupabaseClient, agencyId: string, conversationId: string) {
  const { data: run } = await supabase
    .from('script_runs')
    .select('id, current_node_id')
    .eq('conversation_id', conversationId)
    .eq('status', 'active')
    .maybeSingle()
  if (!run || !run.current_node_id) return

  const { data: node } = await supabase.from('script_nodes').select('node_type').eq('id', run.current_node_id).single()
  if (!node || node.node_type !== 'message') return

  const nextId = await followAlwaysEdge(supabase, agencyId, run.id, run.current_node_id)
  if (!nextId) return

  await advanceScriptRun(supabase, agencyId, run.id)
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
