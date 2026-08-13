import { InboxSidebar, type InboxRow } from '@/components/app/inbox/InboxSidebar'
import { InboxAutoSync } from '@/components/app/inbox/InboxAutoSync'
import { InboxRealtimeSync } from '@/components/app/inbox/InboxRealtimeSync'
import { InboxListPane, InboxDetailPane } from '@/components/app/inbox/InboxMobileVisibility'
import { OfflineBanner } from '@/components/app/inbox/OfflineBanner'
import { TeamPresenceProvider } from '@/components/app/inbox/TeamPresence'
import { computeFanFlowStage } from '@/lib/fans/fanFlow'
import { checkPageAccess } from '@/lib/permissions/check'
import { AccessRestricted } from '@/components/app/AccessRestricted'

// A background sync tick (InboxAutoSync, polled every ~45s) can take longer
// than Vercel's default Server Action timeout once there's real activity to
// pull — same reasoning as creators/[id]/page.tsx's maxDuration.
export const maxDuration = 60

// Master-detail layout (owner request: "je dois voir toute les conv sur la
// colonne de gauche... au milieu la conv sélectionnée") — the conversation
// list lives here, in the shared layout for the whole /inbox segment, so it
// stays mounted across navigations between conversations instead of being
// torn down and refetched on every click (this is also the fix for the
// "plus de fluidité" complaint: only {children} — the selected
// conversation's thread + fan panel — re-renders on navigation, not the
// list). Filtering itself is client-side (InboxSidebar) since Next.js
// layouts don't receive searchParams as a prop.
export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  const { supabase, agencyId, userId, allowed } = await checkPageAccess('inbox.view')

  if (!allowed) {
    return (
      <div className="mx-auto max-w-2xl">
        <AccessRestricted feature="l'Inbox" />
      </div>
    )
  }

  const { data: currentUser } = await supabase.from('users').select('display_name, email').eq('id', userId).single()
  const currentUserName = currentUser?.display_name || currentUser?.email || 'Membre'

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Wave 1: nothing here depends on anything else — was 3+ sequential
  // round-trips, now one. (appUser was already fetched above, for the
  // permission check.)
  const [{ data: rawConversations }, { data: allTags }, { data: todaysTransactions }, { data: platforms }] =
    await Promise.all([
      supabase
        .from('conversations')
        .select(
          'id, platform_id, ai_mode, fan_id, assigned_user_id, last_message_at, last_inbound_at, last_outbound_at, creators(display_name), fans(display_name, avatar_url, is_subscriber, last_seen_at)'
        )
        .order('last_message_at', { ascending: false, nullsFirst: false }),
      supabase.from('tags').select('id, name').order('name'),
      supabase.from('transactions').select('gross_amount, conversation_id').eq('status', 'confirmed').gte('occurred_at', todayStart.toISOString()),
      supabase.from('platforms').select('id, code'),
    ])

  // Test/simulation conversations (platform MOCK) stay fully usable by direct
  // URL for internal testing, but the owner asked that the test phase's
  // artifacts stop being visible in the normal production Inbox list — and
  // their fake sales must never count toward a real revenue number either.
  const mockPlatformId = (platforms ?? []).find((p) => p.code === 'MOCK')?.id
  const mockConversationIds = new Set((rawConversations ?? []).filter((c) => c.platform_id === mockPlatformId).map((c) => c.id))
  const conversations = (rawConversations ?? []).filter((c) => c.platform_id !== mockPlatformId)

  const salesToday = (todaysTransactions ?? [])
    .filter((t) => !mockConversationIds.has(t.conversation_id as string))
    .reduce((sum, t) => sum + (t.gross_amount as number), 0)

  const fanIds = conversations.map((c) => c.fan_id)
  const conversationIds = conversations.map((c) => c.id)
  const assignedUserIds = [...new Set(conversations.map((c) => c.assigned_user_id).filter(Boolean))] as string[]

  // Wave 2: each only needs fanIds/conversationIds/assignedUserIds from
  // wave 1, not each other's results.
  const [{ data: fanTagRows }, { data: conversationSummaries }, { data: scoresRows }, { data: assignedUsers }, { data: pendingOfferRows }] =
    await Promise.all([
      fanIds.length ? supabase.from('fan_tags').select('fan_id, tags(name)').in('fan_id', fanIds) : Promise.resolve({ data: [] }),
      // Owner report: "chargement très long" with real production data (117
      // conversations) — this used to fetch every message across every
      // conversation just to compute a preview/count/total in application
      // code. inbox_conversation_summaries (0028_inbox_perf.sql) does that
      // aggregation in Postgres instead, returning one row per conversation.
      conversationIds.length
        ? supabase.rpc('inbox_conversation_summaries', { conv_ids: conversationIds })
        : Promise.resolve({
            data: [] as { conversation_id: string; last_text: string | null; last_sent_at: string | null; message_count: number; purchase_total: number }[],
          }),
      fanIds.length
        ? supabase.from('fan_scores').select('fan_id, purchase_intent, churn_risk').in('fan_id', fanIds)
        : Promise.resolve({ data: [] }),
      assignedUserIds.length
        ? supabase.from('users').select('id, display_name, email').in('id', assignedUserIds)
        : Promise.resolve({ data: [] }),
      // PPV waiting on the fan (spec brief §10/§15): shown as a badge on the
      // conversation row so an agency can see "an offer is out there" without
      // opening every conversation.
      conversationIds.length
        ? supabase.from('offers').select('conversation_id').eq('status', 'sent').in('conversation_id', conversationIds)
        : Promise.resolve({ data: [] }),
    ])

  const tagsByFan = new Map<string, string[]>()
  for (const row of fanTagRows ?? []) {
    const name = (row.tags as unknown as { name: string } | null)?.name
    if (!name) continue
    const list = tagsByFan.get(row.fan_id as string) ?? []
    list.push(name)
    tagsByFan.set(row.fan_id as string, list)
  }

  const lastMessageByConv = new Map<string, { text: string; sent_at: string }>()
  const messageCountByConv = new Map<string, number>()
  const convToFan = new Map(conversations.map((c) => [c.id, c.fan_id as string]))
  const totalSpentByFan = new Map<string, number>()

  for (const s of conversationSummaries ?? []) {
    const convId = s.conversation_id
    messageCountByConv.set(convId, Number(s.message_count))
    if (s.last_text !== null && s.last_sent_at !== null) {
      lastMessageByConv.set(convId, { text: s.last_text, sent_at: s.last_sent_at })
    }
    const purchaseTotal = Number(s.purchase_total ?? 0)
    if (purchaseTotal > 0) {
      const fanId = convToFan.get(convId)
      if (fanId) totalSpentByFan.set(fanId, (totalSpentByFan.get(fanId) ?? 0) + purchaseTotal)
    }
  }

  const purchaseIntentByFan = new Map((scoresRows ?? []).map((s) => [s.fan_id as string, s.purchase_intent as number]))
  const churnRiskByFan = new Map((scoresRows ?? []).map((s) => [s.fan_id as string, s.churn_risk as number]))
  const userNameById = new Map((assignedUsers ?? []).map((u) => [u.id as string, (u.display_name as string) || (u.email as string)]))
  const conversationsWithPendingOffer = new Set((pendingOfferRows ?? []).map((o) => o.conversation_id as string))

  const rows: InboxRow[] = conversations.map((c) => {
    const fanId = c.fan_id as string
    const lastInbound = c.last_inbound_at as string | null
    const lastOutbound = c.last_outbound_at as string | null
    const awaitingReply = !!lastInbound && (!lastOutbound || lastInbound > lastOutbound)
    const purchaseIntent = purchaseIntentByFan.get(fanId) ?? null
    const churnRisk = churnRiskByFan.get(fanId) ?? null
    const flowStage = computeFanFlowStage({
      totalSpent: totalSpentByFan.get(fanId) ?? 0,
      messageCount: messageCountByConv.get(c.id) ?? 0,
      purchaseIntent,
    })
    // Same thresholds as analyzeConversationWithAI()'s notification triggers
    // (churn_risk >= 70 / purchase_intent >= 80) — reusing the exact signal
    // that already drives a real notification, not a new invented cutoff,
    // surfaced here as a row badge (matches the reference's "Risque"/
    // "Opportunité" tags).
    const signal: 'risk' | 'opportunity' | null =
      churnRisk !== null && churnRisk >= 70 ? 'risk' : purchaseIntent !== null && purchaseIntent >= 80 ? 'opportunity' : null
    const creator = c.creators as unknown as { display_name: string } | null
    const fan = c.fans as unknown as {
      display_name: string
      avatar_url: string | null
      is_subscriber: boolean
      last_seen_at: string | null
    } | null
    // "Recently online" is derived from last_seen_at at render time, not
    // from MYM's own is_online flag — that flag is only as fresh as our
    // last manual sync, while last_seen_at stays accurate regardless of
    // when we last synced (see 0023_fan_presence.sql).
    const isRecentlyOnline = !!fan?.last_seen_at && Date.now() - new Date(fan.last_seen_at).getTime() < 15 * 60 * 1000
    return {
      id: c.id as string,
      fanId,
      fanName: fan?.display_name ?? 'Fan',
      fanAvatarUrl: fan?.avatar_url ?? null,
      isSubscriber: fan?.is_subscriber ?? false,
      isRecentlyOnline,
      creatorName: creator?.display_name ?? '',
      fanTags: tagsByFan.get(fanId) ?? [],
      lastMessage: lastMessageByConv.get(c.id) ?? null,
      totalSpent: totalSpentByFan.get(fanId) ?? 0,
      flowStage,
      signal,
      awaitingReply,
      hasPendingOffer: conversationsWithPendingOffer.has(c.id as string),
      assignedUserId: (c.assigned_user_id as string | null) ?? null,
      assignedName: c.assigned_user_id ? (userNameById.get(c.assigned_user_id as string) ?? null) : null,
    }
  })

  return (
    <TeamPresenceProvider agencyId={agencyId!} userId={userId!} userName={currentUserName}>
      <OfflineBanner />
      {/* Logic-only (InboxAutoSync can render a visible banner on repeated
          sync failure, InboxRealtimeSync never renders) — kept outside the
          grid below so a rendered banner can't become an unwanted grid
          item and shove the list/detail columns out of place. */}
      <InboxAutoSync />
      <InboxRealtimeSync />
      {/* minmax(0,1fr): same fix as [id]/page.tsx's conversation/Fan
          Intelligence grid — a bare 1fr won't shrink below its content's
          intrinsic width, which can push the detail pane off-screen at
          narrower desktop widths instead of it actually filling the
          remaining space next to the fixed 320px list. */}
      <div className="grid h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <InboxListPane>
          <InboxSidebar rows={rows} allTags={allTags ?? []} currentUserId={userId} salesToday={salesToday} />
        </InboxListPane>
        <InboxDetailPane>{children}</InboxDetailPane>
      </div>
    </TeamPresenceProvider>
  )
}
