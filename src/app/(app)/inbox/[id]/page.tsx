import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationView } from '@/components/app/inbox/ConversationView'
import { FanPanel } from '@/components/app/inbox/FanPanel'
import { FanAvatar } from '@/components/app/inbox/FanAvatar'
import { AiModeToggle } from '@/components/app/inbox/AiModeToggle'
import { checkDueScriptRuns } from '@/lib/scripts/engine'
import { computeFanFlowStage } from '@/lib/fans/fanFlow'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: conversation } = await supabase
    .from('conversations')
    .select(
      'id, agency_id, ai_mode, fan_id, creator_id, creators(display_name), fans(id, display_name, birthday, location, income_amount, income_frequency, subscription_status, source, avatar_url, is_subscriber, last_seen_at), platforms(code)'
    )
    .eq('id', id)
    .single()

  if (!conversation) notFound()

  // The "Outils de test (MOCK)" panel (simulate a fan reply/purchase) only
  // makes sense on Mock conversations — showing it on a real synced MYM
  // conversation is confusing clutter, not a testing tool.
  const platformCode = (conversation.platforms as unknown as { code: string } | null)?.code ?? 'MOCK'
  const isMockConversation = platformCode === 'MOCK'

  const fanId = conversation.fan_id as string
  const creatorId = conversation.creator_id as string

  // No background scheduler yet (see TECH_DEBT) — catch up any delayed
  // script step that's now due whenever this page is opened/refreshed. Must
  // finish before the messages/script-run reads below, since it can itself
  // insert a message or advance the run.
  await checkDueScriptRuns(supabase, conversation.agency_id as string, id)

  // Everything below was previously ~14 sequential round-trips to Supabase
  // (each `await`ed one after another) — the real cause of "long loading
  // when I click a conversation." None of these depend on each other, so
  // they run concurrently instead; a second, smaller wave handles the two
  // queries that do depend on wave 1's results (purchase totals need the
  // fan's conversation ids, script run details need the active run row).
  const [
    { data: messages },
    { data: memories },
    { data: scores },
    { data: notes },
    { data: fanTagRows },
    { data: pendingSuggestion },
    { data: fanConversations },
    { data: availableScriptRows },
    { data: commercialSettings },
    { data: activeRunRow },
    { data: lastEscalation },
    { data: offerRows },
    { data: sellableMedia },
  ] = await Promise.all([
    supabase
      .from('messages')
      .select('id, direction, sender_type, sender_user_id, text, is_paid, price_amount, message_type, sent_at, users(display_name, email)')
      .eq('conversation_id', id)
      .order('sent_at', { ascending: true }),
    supabase
      .from('fan_memories')
      .select('id, category, label, value, confidence, importance, status, source, last_confirmed_at')
      .eq('fan_id', fanId)
      .order('importance', { ascending: false }),
    supabase
      .from('fan_scores')
      .select(
        'purchase_intent, relationship_score, spending_potential, engagement_score, churn_risk, omni_score, reasons, computed_by, version'
      )
      .eq('fan_id', fanId)
      .maybeSingle(),
    supabase.from('fan_notes').select('id, text, priority, created_at').eq('fan_id', fanId).order('created_at', { ascending: false }),
    supabase.from('fan_tags').select('id, tags(name)').eq('fan_id', fanId),
    supabase
      .from('copilot_suggestions')
      .select('id, suggested_text')
      .eq('conversation_id', id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('conversations').select('id').eq('fan_id', fanId),
    supabase.from('scripts').select('id, name, creator_id').eq('status', 'active'),
    supabase.from('creator_commercial_settings').select('full_ai_enabled').eq('creator_id', creatorId).maybeSingle(),
    supabase
      .from('script_runs')
      .select('id, script_version_id, current_node_id, scheduled_at')
      .eq('conversation_id', id)
      .eq('status', 'active')
      .maybeSingle(),
    // Only meaningful when ai_mode is 'paused', but cheap to always fetch
    // rather than branch — avoids a 12th sequential round-trip for the
    // (uncommon) escalated case.
    supabase
      .from('ai_actions')
      .select('validator_outcome')
      .eq('conversation_id', id)
      .eq('action_type', 'escalate')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Offer status per message (spec brief: PPV must show its real status —
    // sent/purchased/declined/expired — never simulated). Matched to the
    // message that announced it via offers.sent_message_id.
    supabase
      .from('offers')
      .select('sent_message_id, status, final_price, initial_price')
      .eq('conversation_id', id)
      .not('sent_message_id', 'is', null),
    // Composer's Média/PPV picker (Inbox V2 §14) — only assets this
    // creator can actually sell (same guard the Script Builder uses when
    // populating a paid_media step's dropdown).
    supabase
      .from('media_assets')
      .select('id, title, media_type, target_price, minimum_price, currency, storage_key')
      .eq('creator_id', creatorId)
      .eq('status', 'active')
      .eq('is_for_sale', true)
      .not('minimum_price', 'is', null)
      .order('created_at', { ascending: false }),
  ])

  const conversationIds = (fanConversations ?? []).map((c) => c.id)

  const [{ data: purchaseMessages }, activeRun, mediaWithUrls] = await Promise.all([
    conversationIds.length
      ? supabase.from('messages').select('price_amount').in('conversation_id', conversationIds).eq('message_type', 'purchase_confirmation')
      : Promise.resolve({ data: [] as { price_amount: number | null }[] }),
    (async () => {
      if (!activeRunRow) return null
      const [{ data: version }, { data: node }] = await Promise.all([
        supabase.from('script_versions').select('script_id').eq('id', activeRunRow.script_version_id).single(),
        activeRunRow.current_node_id
          ? supabase.from('script_nodes').select('title, node_type').eq('id', activeRunRow.current_node_id).single()
          : Promise.resolve({ data: null as { title: string | null; node_type: string } | null }),
      ])
      const { data: scriptRow } = version
        ? await supabase.from('scripts').select('name').eq('id', version.script_id).single()
        : { data: null }
      return {
        id: activeRunRow.id as string,
        scriptName: scriptRow?.name ?? 'Script',
        currentNodeTitle: node ? node.title || (node.node_type === 'paid_media' ? 'Offre en attente' : null) : null,
        scheduledAt: activeRunRow.scheduled_at as string | null,
      }
    })(),
    Promise.all(
      (sellableMedia ?? []).map(async (m) => {
        const { data } = await supabase.storage.from('media').createSignedUrl(m.storage_key, 3600)
        return {
          id: m.id as string,
          title: m.title as string,
          mediaType: m.media_type as string,
          targetPrice: m.target_price as number | null,
          minimumPrice: m.minimum_price as number,
          currency: (m.currency as string) ?? 'EUR',
          signedUrl: data?.signedUrl ?? null,
        }
      })
    ),
  ])

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
    avatar_url: string | null
    is_subscriber: boolean
    last_seen_at: string | null
  } | null
  const isRecentlyOnline = !!fan?.last_seen_at && Date.now() - new Date(fan.last_seen_at).getTime() < 15 * 60 * 1000

  const offersByMessageId = new Map(
    (offerRows ?? []).map((o) => [
      o.sent_message_id as string,
      { status: o.status as string, price: (o.final_price as number | null) ?? (o.initial_price as number) },
    ])
  )

  const flowStage = computeFanFlowStage({
    totalSpent,
    messageCount: messages?.length ?? 0,
    purchaseIntent: scores?.purchase_intent ?? null,
  })

  const tags = (fanTagRows ?? []).map((t) => ({
    id: t.id as string,
    name: (t.tags as unknown as { name: string } | null)?.name ?? '',
  }))

  const availableScripts = (availableScriptRows ?? [])
    .filter((s) => !s.creator_id || s.creator_id === creatorId)
    .map((s) => ({ id: s.id, name: s.name }))

  const escalationReason = conversation.ai_mode === 'paused' ? (lastEscalation?.validator_outcome ?? null) : null

  // Owner request: show which team member actually sent each message, not
  // just the generic "human" sender_type.
  const messagesWithSender = (messages ?? []).map((m) => {
    const sender = m.users as unknown as { display_name: string | null; email: string } | null
    const offer = offersByMessageId.get(m.id as string) ?? null
    return { ...m, senderName: sender?.display_name || sender?.email || null, offer }
  })

  return (
    <div className="flex h-full flex-col">
      <div className="glass mb-4 flex shrink-0 items-center justify-between rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-3">
          <FanAvatar name={fan?.display_name ?? 'Fan'} avatarUrl={fan?.avatar_url} online={isRecentlyOnline} size={42} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">{fan?.display_name ?? 'Fan'}</h1>
              {fan?.is_subscriber && (
                <span className="rounded-full bg-[color:var(--violet)]/15 px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--violet)]">
                  ABONNÉ
                </span>
              )}
              {totalSpent > 0 && (
                <span className="rounded-full bg-[color:var(--success)]/15 px-1.5 py-0.5 text-[9px] font-medium text-[color:var(--success)]">
                  {totalSpent}€ dépensé
                </span>
              )}
            </div>
            <p className="text-xs text-[color:var(--foreground-muted)]">
              {creator?.display_name} {isRecentlyOnline && <span className="text-[color:var(--success)]">· en ligne</span>}
            </p>
          </div>
        </div>
        <AiModeToggle
          conversationId={id}
          aiMode={conversation.ai_mode}
          fullAiEnabled={commercialSettings?.full_ai_enabled ?? false}
          escalationReason={escalationReason}
        />
      </div>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-h-0">
          <ConversationView
            conversationId={id}
            initialMessages={messagesWithSender}
            aiMode={conversation.ai_mode}
            pendingSuggestion={pendingSuggestion ?? null}
            isMockConversation={isMockConversation}
            activeScriptRun={activeRun}
            availableScripts={availableScripts}
            sellableMedia={mediaWithUrls}
          />
        </div>
        <div className="min-h-0 space-y-6 overflow-y-auto pr-1">
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
