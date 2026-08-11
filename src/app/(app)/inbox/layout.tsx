import { createClient } from '@/lib/supabase/server'
import { InboxSidebar, type InboxRow } from '@/components/app/inbox/InboxSidebar'
import { computeFanFlowStage } from '@/lib/fans/fanFlow'

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
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Wave 1: nothing here depends on anything else — was 3+ sequential
  // round-trips, now one.
  const [{ data: appUser }, { data: creators }, { data: conversations }, { data: allTags }] = await Promise.all([
    authUser ? supabase.from('users').select('id').eq('auth_user_id', authUser.id).single() : Promise.resolve({ data: null }),
    supabase.from('creators').select('id, display_name').order('created_at'),
    supabase
      .from('conversations')
      .select(
        'id, ai_mode, fan_id, assigned_user_id, last_message_at, last_inbound_at, last_outbound_at, creators(display_name), fans(display_name, avatar_url, is_subscriber)'
      )
      .order('last_message_at', { ascending: false, nullsFirst: false }),
    supabase.from('tags').select('id, name').order('name'),
  ])

  const fanIds = (conversations ?? []).map((c) => c.fan_id)
  const conversationIds = (conversations ?? []).map((c) => c.id)
  const assignedUserIds = [...new Set((conversations ?? []).map((c) => c.assigned_user_id).filter(Boolean))] as string[]

  // Wave 2: each only needs fanIds/conversationIds/assignedUserIds from
  // wave 1, not each other's results.
  const [{ data: fanTagRows }, { data: allMessages }, { data: scoresRows }, { data: assignedUsers }] = await Promise.all([
    fanIds.length ? supabase.from('fan_tags').select('fan_id, tags(name)').in('fan_id', fanIds) : Promise.resolve({ data: [] }),
    conversationIds.length
      ? supabase
          .from('messages')
          .select('conversation_id, text, message_type, price_amount, sent_at')
          .in('conversation_id', conversationIds)
          .order('sent_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    fanIds.length ? supabase.from('fan_scores').select('fan_id, purchase_intent').in('fan_id', fanIds) : Promise.resolve({ data: [] }),
    assignedUserIds.length
      ? supabase.from('users').select('id, display_name, email').in('id', assignedUserIds)
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
  const convToFan = new Map((conversations ?? []).map((c) => [c.id, c.fan_id as string]))
  const totalSpentByFan = new Map<string, number>()

  for (const m of allMessages ?? []) {
    const convId = m.conversation_id as string
    messageCountByConv.set(convId, (messageCountByConv.get(convId) ?? 0) + 1)
    if (!lastMessageByConv.has(convId)) {
      lastMessageByConv.set(convId, { text: m.text as string, sent_at: m.sent_at as string })
    }
    if (m.message_type === 'purchase_confirmation') {
      const fanId = convToFan.get(convId)
      if (fanId) totalSpentByFan.set(fanId, (totalSpentByFan.get(fanId) ?? 0) + ((m.price_amount as number) ?? 0))
    }
  }

  const purchaseIntentByFan = new Map((scoresRows ?? []).map((s) => [s.fan_id as string, s.purchase_intent as number]))
  const userNameById = new Map((assignedUsers ?? []).map((u) => [u.id as string, (u.display_name as string) || (u.email as string)]))

  const rows: InboxRow[] = (conversations ?? []).map((c) => {
    const fanId = c.fan_id as string
    const lastInbound = c.last_inbound_at as string | null
    const lastOutbound = c.last_outbound_at as string | null
    const awaitingReply = !!lastInbound && (!lastOutbound || lastInbound > lastOutbound)
    const flowStage = computeFanFlowStage({
      totalSpent: totalSpentByFan.get(fanId) ?? 0,
      messageCount: messageCountByConv.get(c.id) ?? 0,
      purchaseIntent: purchaseIntentByFan.get(fanId) ?? null,
    })
    const creator = c.creators as unknown as { display_name: string } | null
    const fan = c.fans as unknown as { display_name: string; avatar_url: string | null; is_subscriber: boolean } | null
    return {
      id: c.id as string,
      fanId,
      fanName: fan?.display_name ?? 'Fan',
      fanAvatarUrl: fan?.avatar_url ?? null,
      isSubscriber: fan?.is_subscriber ?? false,
      creatorName: creator?.display_name ?? '',
      fanTags: tagsByFan.get(fanId) ?? [],
      lastMessage: lastMessageByConv.get(c.id) ?? null,
      totalSpent: totalSpentByFan.get(fanId) ?? 0,
      flowStage,
      awaitingReply,
      assignedUserId: (c.assigned_user_id as string | null) ?? null,
      assignedName: c.assigned_user_id ? (userNameById.get(c.assigned_user_id as string) ?? null) : null,
    }
  })

  return (
    <div className="grid h-[calc(100vh-9rem)] gap-4 lg:grid-cols-[300px_1fr]">
      <InboxSidebar rows={rows} allTags={allTags ?? []} creators={creators ?? []} currentUserId={appUser?.id ?? null} />
      <div className="min-h-0 min-w-0">{children}</div>
    </div>
  )
}
