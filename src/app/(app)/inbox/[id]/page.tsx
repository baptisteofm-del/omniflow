import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationView } from '@/components/app/inbox/ConversationView'
import { FanPanel } from '@/components/app/inbox/FanPanel'
import { AiModeToggle } from '@/components/app/inbox/AiModeToggle'
import { ScriptRunPanel } from '@/components/app/inbox/ScriptRunPanel'
import { checkDueScriptRuns } from '@/lib/scripts/engine'
import { computeFanFlowStage } from '@/lib/fans/fanFlow'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      'id, agency_id, ai_mode, fan_id, creator_id, creators(display_name), fans(id, display_name, birthday, location, income_amount, income_frequency, subscription_status, source)'
    )
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  const fanId = conversation.fan_id as string
  const creatorId = conversation.creator_id as string

  // No background scheduler yet (see TECH_DEBT) — catch up any delayed
  // script step that's now due whenever this page is opened/refreshed.
  await checkDueScriptRuns(supabase, conversation.agency_id as string, id)

  const { data: messages } = await supabase
    .from('messages')
    .select('id, direction, sender_type, text, is_paid, price_amount, message_type, sent_at')
    .eq('conversation_id', id)
    .order('sent_at', { ascending: true })

  const { data: memories } = await supabase
    .from('fan_memories')
    .select('id, category, label, value, confidence, importance, status, source, last_confirmed_at')
    .eq('fan_id', fanId)
    .order('importance', { ascending: false })

  const { data: scores } = await supabase
    .from('fan_scores')
    .select(
      'purchase_intent, relationship_score, spending_potential, engagement_score, churn_risk, omni_score, reasons, computed_by, version'
    )
    .eq('fan_id', fanId)
    .maybeSingle()

  const { data: notes } = await supabase
    .from('fan_notes')
    .select('id, text, priority, created_at')
    .eq('fan_id', fanId)
    .order('created_at', { ascending: false })

  const { data: fanTagRows } = await supabase
    .from('fan_tags')
    .select('id, tags(name)')
    .eq('fan_id', fanId)

  const { data: pendingSuggestion } = await supabase
    .from('copilot_suggestions')
    .select('id, suggested_text')
    .eq('conversation_id', id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: fanConversations } = await supabase.from('conversations').select('id').eq('fan_id', fanId)
  const conversationIds = (fanConversations ?? []).map((c) => c.id)

  const { data: purchaseMessages } = conversationIds.length
    ? await supabase
        .from('messages')
        .select('price_amount')
        .in('conversation_id', conversationIds)
        .eq('message_type', 'purchase_confirmation')
    : { data: [] }

  const totalSpent = (purchaseMessages ?? []).reduce((sum, m) => sum + (m.price_amount ?? 0), 0)
  const purchaseCount = (purchaseMessages ?? []).length

  const creator = conversation.creators as unknown as { display_name: string } | null
  const fan = conversation.fans as unknown as {
    id: string
    display_name: string
    birthday: string | null
    location: string | null
    income_amount: number | null
    income_frequency: string | null
    subscription_status: string
    source: string | null
  } | null

  const flowStage = computeFanFlowStage({
    totalSpent,
    messageCount: messages?.length ?? 0,
    purchaseIntent: scores?.purchase_intent ?? null,
  })

  const tags = (fanTagRows ?? []).map((t) => ({
    id: t.id as string,
    name: (t.tags as unknown as { name: string } | null)?.name ?? '',
  }))

  const { data: activeRunRow } = await supabase
    .from('script_runs')
    .select('id, script_version_id, current_node_id, scheduled_at')
    .eq('conversation_id', id)
    .eq('status', 'active')
    .maybeSingle()

  let activeRun: { id: string; scriptName: string; currentNodeTitle: string | null; scheduledAt: string | null } | null = null
  if (activeRunRow) {
    const { data: version } = await supabase
      .from('script_versions')
      .select('script_id')
      .eq('id', activeRunRow.script_version_id)
      .single()
    const { data: scriptRow } = version
      ? await supabase.from('scripts').select('name').eq('id', version.script_id).single()
      : { data: null }
    const { data: node } = activeRunRow.current_node_id
      ? await supabase.from('script_nodes').select('title, node_type').eq('id', activeRunRow.current_node_id).single()
      : { data: null }
    activeRun = {
      id: activeRunRow.id,
      scriptName: scriptRow?.name ?? 'Script',
      currentNodeTitle: node ? node.title || (node.node_type === 'paid_media' ? 'Offre en attente' : null) : null,
      scheduledAt: activeRunRow.scheduled_at,
    }
  }

  const { data: availableScriptRows } = await supabase
    .from('scripts')
    .select('id, name, creator_id')
    .eq('status', 'active')
  const availableScripts = (availableScriptRows ?? [])
    .filter((s) => !s.creator_id || s.creator_id === creatorId)
    .map((s) => ({ id: s.id, name: s.name }))

  const { data: commercialSettings } = await supabase
    .from('creator_commercial_settings')
    .select('full_ai_enabled')
    .eq('creator_id', creatorId)
    .maybeSingle()

  let escalationReason: string | null = null
  if (conversation.ai_mode === 'paused') {
    const { data: lastEscalation } = await supabase
      .from('ai_actions')
      .select('validator_outcome')
      .eq('conversation_id', id)
      .eq('action_type', 'escalate')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    escalationReason = lastEscalation?.validator_outcome ?? null
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{fan?.display_name ?? 'Fan'}</h1>
          <p className="text-sm text-[color:var(--foreground-muted)]">{creator?.display_name}</p>
        </div>
        <AiModeToggle
          conversationId={id}
          aiMode={conversation.ai_mode}
          fullAiEnabled={commercialSettings?.full_ai_enabled ?? false}
          escalationReason={escalationReason}
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-h-0">
          <ConversationView
            conversationId={id}
            initialMessages={messages ?? []}
            aiMode={conversation.ai_mode}
            pendingSuggestion={pendingSuggestion ?? null}
          />
        </div>
        <div className="min-h-0 space-y-6 overflow-y-auto pr-1">
          <ScriptRunPanel conversationId={id} activeRun={activeRun} availableScripts={availableScripts} />
          {fan && (
            <FanPanel
              conversationId={id}
              fanId={fanId}
              fan={fan}
              flowStage={flowStage}
              totalSpent={totalSpent}
              purchaseCount={purchaseCount}
              memories={memories ?? []}
              scores={scores ?? null}
              notes={notes ?? []}
              tags={tags}
            />
          )}
        </div>
      </div>
    </div>
  )
}
