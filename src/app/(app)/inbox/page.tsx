import Link from 'next/link'
import { MessageSquare, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NewMockConversationForm } from '@/components/app/inbox/NewMockConversationForm'
import { FanAvatar } from '@/components/app/inbox/FanAvatar'
import { computeFanFlowStage, FAN_FLOW_LABELS, FAN_FLOW_BADGE_CLASSES } from '@/lib/fans/fanFlow'
import { relativeTimeFr } from '@/lib/utils/relativeTime'

// Reproduces myfeed.fans' inbox structure (owner reference) as closely as
// OmniFlow's Mock-only data model honestly supports: filter tabs, a
// per-fan status badge, amount spent, and a last-message preview in the
// list. Two things MyFeed shows that we deliberately don't fake here:
// "En ligne" (no presence tracking exists) and a separate "Non lus" count
// (no per-message read state exists — see TECH_DEBT.md). "À répondre"
// covers the same real signal MyFeed's own "Non lus"/"Répondre" tabs both
// point at: the fan wrote last and nobody has replied yet.
type FilterKey = 'all' | 'to_reply' | 'mine'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'to_reply', label: 'À répondre' },
  { key: 'mine', label: 'Assignées à moi' },
]

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; filter?: string }>
}) {
  const { tag: activeTag, filter: filterParam } = await searchParams
  const activeFilter: FilterKey = FILTERS.some((f) => f.key === filterParam) ? (filterParam as FilterKey) : 'all'
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  const { data: appUser } = authUser
    ? await supabase.from('users').select('id').eq('auth_user_id', authUser.id).single()
    : { data: null }

  const { data: creators } = await supabase.from('creators').select('id, display_name').order('created_at')

  const { data: conversations } = await supabase
    .from('conversations')
    .select(
      'id, ai_mode, fan_id, assigned_user_id, last_message_at, last_inbound_at, last_outbound_at, creators(display_name), fans(display_name)'
    )
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const { data: allTags } = await supabase.from('tags').select('id, name').order('name')

  const fanIds = (conversations ?? []).map((c) => c.fan_id)
  const conversationIds = (conversations ?? []).map((c) => c.id)

  const { data: fanTagRows } = fanIds.length
    ? await supabase.from('fan_tags').select('fan_id, tags(name)').in('fan_id', fanIds)
    : { data: [] }

  const tagsByFan = new Map<string, string[]>()
  for (const row of fanTagRows ?? []) {
    const name = (row.tags as unknown as { name: string } | null)?.name
    if (!name) continue
    const list = tagsByFan.get(row.fan_id as string) ?? []
    list.push(name)
    tagsByFan.set(row.fan_id as string, list)
  }

  // Last message preview + total message count per conversation, and total
  // spent per fan (purchase confirmations) — same source of truth as the
  // conversation detail page's Fan Flow computation, just aggregated across
  // the whole list at once (app-level, fine at Mock-testing volume — same
  // trade-off already accepted in src/lib/analytics/metrics.ts).
  const { data: allMessages } = conversationIds.length
    ? await supabase
        .from('messages')
        .select('conversation_id, text, message_type, price_amount, sent_at')
        .in('conversation_id', conversationIds)
        .order('sent_at', { ascending: false })
    : { data: [] }

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

  const { data: scoresRows } = fanIds.length
    ? await supabase.from('fan_scores').select('fan_id, purchase_intent').in('fan_id', fanIds)
    : { data: [] }
  const purchaseIntentByFan = new Map((scoresRows ?? []).map((s) => [s.fan_id as string, s.purchase_intent as number]))

  const assignedUserIds = [...new Set((conversations ?? []).map((c) => c.assigned_user_id).filter(Boolean))] as string[]
  const { data: assignedUsers } = assignedUserIds.length
    ? await supabase.from('users').select('id, display_name, email').in('id', assignedUserIds)
    : { data: [] }
  const userNameById = new Map((assignedUsers ?? []).map((u) => [u.id as string, (u.display_name as string) || (u.email as string)]))

  const rows = (conversations ?? []).map((c) => {
    const fanId = c.fan_id as string
    const lastInbound = c.last_inbound_at as string | null
    const lastOutbound = c.last_outbound_at as string | null
    const awaitingReply = !!lastInbound && (!lastOutbound || lastInbound > lastOutbound)
    const flowStage = computeFanFlowStage({
      totalSpent: totalSpentByFan.get(fanId) ?? 0,
      messageCount: messageCountByConv.get(c.id) ?? 0,
      purchaseIntent: purchaseIntentByFan.get(fanId) ?? null,
    })
    return {
      conversation: c,
      fanTags: tagsByFan.get(fanId) ?? [],
      lastMessage: lastMessageByConv.get(c.id) ?? null,
      totalSpent: totalSpentByFan.get(fanId) ?? 0,
      flowStage,
      awaitingReply,
      assignedName: c.assigned_user_id ? userNameById.get(c.assigned_user_id as string) : null,
    }
  })

  const toReplyCount = rows.filter((r) => r.awaitingReply).length

  const filteredRows = rows
    .filter((r) => !activeTag || r.fanTags.includes(activeTag))
    .filter((r) => {
      if (activeFilter === 'to_reply') return r.awaitingReply
      if (activeFilter === 'mine') return appUser && r.conversation.assigned_user_id === appUser.id
      return true
    })

  const filterHref = (filter: FilterKey) => {
    const params = new URLSearchParams()
    if (filter !== 'all') params.set('filter', filter)
    if (activeTag) params.set('tag', activeTag)
    const qs = params.toString()
    return qs ? `/inbox?${qs}` : '/inbox'
  }

  const tagHref = (tag: string | null) => {
    const params = new URLSearchParams()
    if (activeFilter !== 'all') params.set('filter', activeFilter)
    if (tag) params.set('tag', tag)
    const qs = params.toString()
    return qs ? `/inbox?${qs}` : '/inbox'
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Inbox</h1>
      <p className="mb-6 text-sm text-[color:var(--foreground-muted)]">
        Conversations avec vos fans. Environnement Mock — aucune donnée réelle.
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={filterHref(f.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              activeFilter === f.key
                ? 'border-[color:var(--border-strong)] bg-white/5 text-[color:var(--foreground)]'
                : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            {f.label}
            {f.key === 'to_reply' && toReplyCount > 0 && (
              <span className="ml-1.5 rounded-full bg-[color:var(--danger)]/20 px-1.5 py-0.5 text-[10px] text-[color:var(--danger)]">
                {toReplyCount}
              </span>
            )}
          </Link>
        ))}
      </div>

      {allTags && allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-[color:var(--foreground-muted)]" />
          <Link
            href={tagHref(null)}
            className={`rounded-full border px-2.5 py-1 text-xs ${
              !activeTag
                ? 'border-[color:var(--border-strong)] text-[color:var(--foreground)]'
                : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            Toutes les listes
          </Link>
          {allTags.map((t) => (
            <Link
              key={t.id}
              href={tagHref(t.name)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                activeTag === t.name
                  ? 'border-[color:var(--border-strong)] text-[color:var(--foreground)]'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>
      )}

      {!creators || creators.length === 0 ? (
        <div className="glass rounded-2xl p-6 text-sm text-[color:var(--foreground-muted)]">
          Ajoutez d&apos;abord{' '}
          <Link href="/creators/new" className="text-[color:var(--cyan)] hover:underline">
            une créatrice
          </Link>{' '}
          avant de démarrer une conversation.
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {filteredRows.length === 0 ? (
              <div className="glass flex flex-col items-center rounded-2xl px-6 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
                  <MessageSquare className="h-6 w-6 text-[color:var(--cyan)]" />
                </div>
                <h2 className="text-base font-semibold">Aucune conversation</h2>
                <p className="mt-1 max-w-sm text-sm text-[color:var(--foreground-muted)]">
                  {activeTag || activeFilter !== 'all'
                    ? 'Aucune conversation ne correspond à ce filtre.'
                    : 'Démarrez une conversation de test avec le formulaire à droite.'}
                </p>
              </div>
            ) : (
              <div className="glass divide-y divide-[color:var(--border)] overflow-hidden rounded-2xl">
                {filteredRows.map(({ conversation: c, fanTags, lastMessage, totalSpent, flowStage, assignedName }) => {
                  const creator = c.creators as unknown as { display_name: string } | null
                  const fan = c.fans as unknown as { display_name: string } | null
                  const fanName = fan?.display_name ?? 'Fan'
                  return (
                    <Link
                      key={c.id}
                      href={`/inbox/${c.id}`}
                      className="flex items-center gap-3 px-5 py-4 text-sm transition-colors hover:bg-white/5"
                    >
                      <FanAvatar name={fanName} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{fanName}</p>
                          <span className="shrink-0 text-[10px] text-[color:var(--foreground-muted)]">
                            {creator?.display_name}
                          </span>
                        </div>
                        <p className="truncate text-xs text-[color:var(--foreground-muted)]">
                          {lastMessage?.text || 'Aucun message pour l’instant'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {totalSpent > 0 && (
                            <span className="rounded-full bg-[color:var(--success)]/15 px-2 py-0.5 text-[10px] text-[color:var(--success)]">
                              {totalSpent}€
                            </span>
                          )}
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${FAN_FLOW_BADGE_CLASSES[flowStage]}`}>
                            {FAN_FLOW_LABELS[flowStage]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {fanTags.slice(0, 2).map((name) => (
                            <span
                              key={name}
                              className="rounded-full border border-[color:var(--border-strong)] px-2 py-0.5 text-[10px] text-[color:var(--foreground-muted)]"
                            >
                              {name}
                            </span>
                          ))}
                          {assignedName && (
                            <span className="rounded-full bg-[color:var(--cyan)]/15 px-2 py-0.5 text-[10px] text-[color:var(--cyan)]">
                              {assignedName}
                            </span>
                          )}
                          {lastMessage && (
                            <span className="text-[10px] text-[color:var(--foreground-muted)]">
                              {relativeTimeFr(lastMessage.sent_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            <div className="glass mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3 text-xs text-[color:var(--foreground-muted)]">
              <span>{rows.length} conversation{rows.length !== 1 ? 's' : ''}</span>
              <span>
                <span className={toReplyCount > 0 ? 'text-[color:var(--danger)]' : ''}>{toReplyCount}</span> à répondre
              </span>
            </div>
          </div>

          <div className="glass h-fit rounded-2xl p-5">
            <h2 className="mb-4 text-sm font-semibold">Nouvelle conversation de test</h2>
            <NewMockConversationForm creators={creators} />
          </div>
        </div>
      )}
    </div>
  )
}
