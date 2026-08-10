import type { SupabaseClient } from '@supabase/supabase-js'
import { computeFanFlowStage, type FanFlowStage } from '@/lib/fans/fanFlow'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = SupabaseClient<any, any, any>

export interface DateRange {
  from: string
  to: string
}

// Metric Service (spec 44.92-44.93: "frontend components must not recompute
// business KPIs" — every number a dashboard shows comes from here, never
// from ad-hoc client-side math). Each function below is the single, documented
// definition for its metric (spec 44.3/44.4 Metric Registry) — see
// docs/implementation/METRIC_REGISTRY.md for the human-readable registry
// this file implements.

// ---------------------------------------------------------------------------
// REVENUE (spec 44.10-44.12)
// ---------------------------------------------------------------------------
export async function getRevenueMetrics(supabase: AnySupabaseClient, agencyId: string, range: DateRange) {
  const { data: purchases } = await supabase
    .from('messages')
    .select('price_amount')
    .eq('agency_id', agencyId)
    .eq('message_type', 'purchase_confirmation')
    .gte('sent_at', range.from)
    .lte('sent_at', range.to)

  const totalRevenue = (purchases ?? []).reduce(
    (sum: number, p: { price_amount: number | null }) => sum + (p.price_amount ?? 0),
    0
  )
  const salesCount = (purchases ?? []).length

  // AI-attributed: only purchases traceable through a real offers row whose
  // source is script_node or full_ai — never guessed from conversation mode
  // (spec 44.12: "a sale must not be arbitrarily attributed to AI"). A mock
  // purchase triggered with no matching offer (e.g. the MOCK panel's
  // freeform button with no active offer) is counted in gross revenue but
  // NOT here — see METRIC_REGISTRY.md's known limitations.
  const { data: aiOffers } = await supabase
    .from('offers')
    .select('final_price, initial_price')
    .eq('agency_id', agencyId)
    .eq('status', 'purchased')
    .in('source_type', ['script_node', 'full_ai'])
    .gte('updated_at', range.from)
    .lte('updated_at', range.to)

  const aiAttributedRevenue = (aiOffers ?? []).reduce(
    (sum: number, o: { final_price: number | null; initial_price: number }) => sum + (o.final_price ?? o.initial_price ?? 0),
    0
  )

  const { count: offersSentCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const { count: offersPurchasedCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('status', 'purchased')
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const conversionRate =
    offersSentCount && offersSentCount > 0 ? (offersPurchasedCount ?? 0) / offersSentCount : null

  return {
    totalRevenue,
    aiAttributedRevenue,
    salesCount,
    offersSentCount: offersSentCount ?? 0,
    offersPurchasedCount: offersPurchasedCount ?? 0,
    conversionRate,
  }
}

// ---------------------------------------------------------------------------
// CREATOR COMPARISON (spec 44.20-44.21)
// ---------------------------------------------------------------------------
export interface CreatorComparisonRow {
  id: string
  displayName: string
  revenue: number
  salesCount: number
}

export async function getCreatorComparison(
  supabase: AnySupabaseClient,
  agencyId: string,
  range: DateRange
): Promise<CreatorComparisonRow[]> {
  const { data: creators } = await supabase.from('creators').select('id, display_name').eq('agency_id', agencyId)
  const { data: conversations } = await supabase.from('conversations').select('id, creator_id').eq('agency_id', agencyId)
  const conversationToCreator = new Map((conversations ?? []).map((c: { id: string; creator_id: string }) => [c.id, c.creator_id]))

  const { data: purchases } = await supabase
    .from('messages')
    .select('conversation_id, price_amount')
    .eq('agency_id', agencyId)
    .eq('message_type', 'purchase_confirmation')
    .gte('sent_at', range.from)
    .lte('sent_at', range.to)

  const revenueByCreator = new Map<string, { revenue: number; salesCount: number }>()
  for (const p of purchases ?? []) {
    const creatorId = conversationToCreator.get(p.conversation_id)
    if (!creatorId) continue
    const existing = revenueByCreator.get(creatorId) ?? { revenue: 0, salesCount: 0 }
    existing.revenue += p.price_amount ?? 0
    existing.salesCount += 1
    revenueByCreator.set(creatorId, existing)
  }

  return (creators ?? [])
    .map((c: { id: string; display_name: string }) => ({
      id: c.id,
      displayName: c.display_name,
      revenue: revenueByCreator.get(c.id)?.revenue ?? 0,
      salesCount: revenueByCreator.get(c.id)?.salesCount ?? 0,
    }))
    .sort((a: CreatorComparisonRow, b: CreatorComparisonRow) => b.revenue - a.revenue)
}

// ---------------------------------------------------------------------------
// SCRIPT PERFORMANCE + STEP DIAGNOSIS (spec 44.14-44.17, 47.98)
// ---------------------------------------------------------------------------
export interface ScriptStepRow {
  nodeId: string
  title: string
  nodeType: string
  entered: number
  offerSent: number
  purchased: number
  notPurchased: number
  stopped: number
}

export interface ScriptPerformanceRow {
  id: string
  name: string
  runs: number
  completed: number
  converted: number
  revenue: number
  steps: ScriptStepRow[]
}

export async function getScriptPerformance(
  supabase: AnySupabaseClient,
  agencyId: string,
  range: DateRange
): Promise<ScriptPerformanceRow[]> {
  const { data: scripts } = await supabase.from('scripts').select('id, name').eq('agency_id', agencyId)
  if (!scripts || scripts.length === 0) return []

  const { data: versions } = await supabase
    .from('script_versions')
    .select('id, script_id')
    .in(
      'script_id',
      scripts.map((s: { id: string }) => s.id)
    )
  const versionIds = (versions ?? []).map((v: { id: string }) => v.id)
  if (versionIds.length === 0) return scripts.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name, runs: 0, completed: 0, converted: 0, revenue: 0, steps: [] }))

  const { data: nodes } = await supabase
    .from('script_nodes')
    .select('id, script_version_id, title, node_type, sequence_order')
    .in('script_version_id', versionIds)
    .in('node_type', ['message', 'paid_media'])

  const { data: runs } = await supabase
    .from('script_runs')
    .select('id, script_version_id, status')
    .eq('agency_id', agencyId)
    .in('script_version_id', versionIds)
    .gte('started_at', range.from)
    .lte('started_at', range.to)
  const runIds = (runs ?? []).map((r: { id: string }) => r.id)

  const { data: events } =
    runIds.length > 0
      ? await supabase.from('script_run_events').select('script_run_id, node_id, event_type').in('script_run_id', runIds)
      : { data: [] }

  const runToVersion = new Map((runs ?? []).map((r: { id: string; script_version_id: string }) => [r.id, r.script_version_id]))

  const { data: offers } = await supabase
    .from('offers')
    .select('source_id, final_price, initial_price')
    .eq('agency_id', agencyId)
    .eq('source_type', 'script_node')
    .eq('status', 'purchased')
    .gte('updated_at', range.from)
    .lte('updated_at', range.to)

  return scripts.map((script: { id: string; name: string }) => {
    const scriptVersionIds = (versions ?? [])
      .filter((v: { script_id: string }) => v.script_id === script.id)
      .map((v: { id: string }) => v.id)
    const scriptRuns = (runs ?? []).filter((r: { script_version_id: string }) => scriptVersionIds.includes(r.script_version_id))
    const scriptNodeIds = (nodes ?? [])
      .filter((n: { script_version_id: string }) => scriptVersionIds.includes(n.script_version_id))
      .map((n: { id: string }) => n.id)

    const revenue = (offers ?? [])
      .filter((o: { source_id: string }) => scriptNodeIds.includes(o.source_id))
      .reduce((sum: number, o: { final_price: number | null; initial_price: number }) => sum + (o.final_price ?? o.initial_price ?? 0), 0)

    const stepMap = new Map<string, ScriptStepRow>()
    for (const node of (nodes ?? []).filter((n: { script_version_id: string }) => scriptVersionIds.includes(n.script_version_id))) {
      stepMap.set(node.id, {
        nodeId: node.id,
        title: node.title || (node.node_type === 'paid_media' ? 'Offre' : 'Message'),
        nodeType: node.node_type,
        entered: 0,
        offerSent: 0,
        purchased: 0,
        notPurchased: 0,
        stopped: 0,
      })
    }
    for (const ev of events ?? []) {
      const version = runToVersion.get(ev.script_run_id)
      if (!version || !scriptVersionIds.includes(version)) continue
      const step = ev.node_id ? stepMap.get(ev.node_id) : null
      if (!step) continue
      if (ev.event_type === 'entered_node') step.entered += 1
      else if (ev.event_type === 'offer_sent') step.offerSent += 1
      else if (ev.event_type === 'purchased') step.purchased += 1
      else if (ev.event_type === 'not_purchased') step.notPurchased += 1
      else if (ev.event_type === 'stopped') step.stopped += 1
    }

    return {
      id: script.id,
      name: script.name,
      runs: scriptRuns.length,
      completed: scriptRuns.filter((r: { status: string }) => r.status === 'completed' || r.status === 'converted').length,
      converted: scriptRuns.filter((r: { status: string }) => r.status === 'converted').length,
      revenue,
      steps: Array.from(stepMap.values()),
    }
  })
}

// ---------------------------------------------------------------------------
// AI USAGE — Copilot (spec 44.29-44.32) + Full AI (spec 44.29, 44.33)
// ---------------------------------------------------------------------------
export interface CopilotMetrics {
  generated: number
  sent: number
  editedSent: number
  discardedOrRegenerated: number
  acceptanceRate: number | null
  editRate: number | null
}

export async function getCopilotMetrics(supabase: AnySupabaseClient, agencyId: string, range: DateRange): Promise<CopilotMetrics> {
  const { data: suggestions } = await supabase
    .from('copilot_suggestions')
    .select('status')
    .eq('agency_id', agencyId)
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const rows = suggestions ?? []
  const generated = rows.length
  const sent = rows.filter((s: { status: string }) => s.status === 'sent').length
  const editedSent = rows.filter((s: { status: string }) => s.status === 'edited_sent').length
  const discardedOrRegenerated = rows.filter((s: { status: string }) => s.status === 'discarded').length
  const resolved = generated - rows.filter((s: { status: string }) => s.status === 'pending').length
  const acceptanceRate = resolved > 0 ? (sent + editedSent) / resolved : null
  const editRate = sent + editedSent > 0 ? editedSent / (sent + editedSent) : null

  return { generated, sent, editedSent, discardedOrRegenerated, acceptanceRate, editRate }
}

export interface FullAiMetrics {
  messagesSent: number
  offersSent: number
  escalations: number
  missedOpportunities: number
  takeovers: number
  fullAiActivations: number
  takeoverRate: number | null
  topEscalationReasons: { reason: string; count: number }[]
}

export async function getFullAiMetrics(supabase: AnySupabaseClient, agencyId: string, range: DateRange): Promise<FullAiMetrics> {
  const { data: actions } = await supabase
    .from('ai_actions')
    .select('action_type, validator_outcome')
    .eq('agency_id', agencyId)
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const rows = actions ?? []
  const escalationReasons = new Map<string, number>()
  for (const a of rows) {
    if (a.action_type === 'escalate' && a.validator_outcome) {
      escalationReasons.set(a.validator_outcome, (escalationReasons.get(a.validator_outcome) ?? 0) + 1)
    }
  }

  const { data: modeEvents } = await supabase
    .from('conversation_mode_events')
    .select('to_mode')
    .eq('agency_id', agencyId)
    .gte('occurred_at', range.from)
    .lte('occurred_at', range.to)

  const events = modeEvents ?? []
  const fullAiActivations = events.filter((e: { to_mode: string }) => e.to_mode === 'full_ai').length
  const takeovers = events.filter((e: { to_mode: string }) => e.to_mode === 'human_takeover').length

  return {
    messagesSent: rows.filter((a: { action_type: string }) => a.action_type === 'send_message').length,
    offersSent: rows.filter((a: { action_type: string }) => a.action_type === 'send_paid_offer').length,
    escalations: rows.filter((a: { action_type: string }) => a.action_type === 'escalate').length,
    missedOpportunities: rows.filter((a: { action_type: string }) => a.action_type === 'missed_opportunity').length,
    takeovers,
    fullAiActivations,
    takeoverRate: fullAiActivations > 0 ? takeovers / fullAiActivations : null,
    topEscalationReasons: Array.from(escalationReasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  }
}

// ---------------------------------------------------------------------------
// FAN SEGMENTS (spec 44.23) — reuses the same Fan Flow logic as the fan
// dossier UI (src/lib/fans/fanFlow.ts), never a separate/divergent formula.
// ---------------------------------------------------------------------------
export async function getFanSegments(supabase: AnySupabaseClient, agencyId: string): Promise<Record<FanFlowStage, number>> {
  const { data: fans } = await supabase.from('fans').select('id').eq('agency_id', agencyId)
  const fanIds = (fans ?? []).map((f: { id: string }) => f.id)
  const counts: Record<FanFlowStage, number> = { new: 0, connaissance: 0, pret: 0, spender: 0 }
  if (fanIds.length === 0) return counts

  const { data: scores } = await supabase.from('fan_scores').select('fan_id, purchase_intent').in('fan_id', fanIds)
  const purchaseIntentByFan = new Map((scores ?? []).map((s: { fan_id: string; purchase_intent: number | null }) => [s.fan_id, s.purchase_intent]))

  const { data: conversations } = await supabase.from('conversations').select('id, fan_id').eq('agency_id', agencyId)
  const conversationIdsByFan = new Map<string, string[]>()
  for (const c of conversations ?? []) {
    const list = conversationIdsByFan.get(c.fan_id) ?? []
    list.push(c.id)
    conversationIdsByFan.set(c.fan_id, list)
  }
  const allConversationIds = (conversations ?? []).map((c: { id: string }) => c.id)

  const { data: messages } =
    allConversationIds.length > 0
      ? await supabase.from('messages').select('conversation_id, message_type, price_amount').in('conversation_id', allConversationIds)
      : { data: [] }

  const conversationToFan = new Map((conversations ?? []).map((c: { id: string; fan_id: string }) => [c.id, c.fan_id]))
  const spentByFan = new Map<string, number>()
  const messageCountByFan = new Map<string, number>()
  for (const m of messages ?? []) {
    const fanId = conversationToFan.get(m.conversation_id)
    if (!fanId) continue
    messageCountByFan.set(fanId, (messageCountByFan.get(fanId) ?? 0) + 1)
    if (m.message_type === 'purchase_confirmation') {
      spentByFan.set(fanId, (spentByFan.get(fanId) ?? 0) + (m.price_amount ?? 0))
    }
  }

  for (const fanId of fanIds) {
    const stage = computeFanFlowStage({
      totalSpent: spentByFan.get(fanId) ?? 0,
      messageCount: messageCountByFan.get(fanId) ?? 0,
      purchaseIntent: purchaseIntentByFan.get(fanId) ?? null,
    })
    counts[stage] += 1
  }

  return counts
}
