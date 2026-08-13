'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MessageSquare, Tag, ArrowRight, Clock3, Volume2, VolumeX, Search, X, Wifi, UserCheck } from 'lucide-react'
import { FanAvatar } from '@/components/app/inbox/FanAvatar'
import { FAN_FLOW_LABELS, FAN_FLOW_BADGE_CLASSES, type FanFlowStage } from '@/lib/fans/fanFlow'
import { relativeTimeFr } from '@/lib/utils/relativeTime'
import { isCategoryMuted, setCategoryMuted, type SoundCategory } from '@/lib/utils/notificationSound'
import { ConversationViewerBadge } from '@/components/app/inbox/TeamPresence'

const SOUND_CATEGORIES: { key: SoundCategory; label: string }[] = [
  { key: 'message', label: 'Nouveaux messages' },
  { key: 'sale', label: 'Ventes' },
]

export interface InboxRow {
  id: string
  fanId: string
  fanName: string
  fanAvatarUrl: string | null
  isSubscriber: boolean
  isRecentlyOnline: boolean
  creatorName: string
  fanTags: string[]
  lastMessage: { text: string; sent_at: string } | null
  totalSpent: number
  flowStage: FanFlowStage
  awaitingReply: boolean
  hasPendingOffer: boolean
  assignedUserId: string | null
  assignedName: string | null
}

type FilterKey = 'all' | 'to_reply' | 'mine'

const FILTERS: { key: FilterKey; label: string; icon: typeof MessageSquare | null }[] = [
  { key: 'all', label: 'Toutes', icon: null },
  { key: 'to_reply', label: 'À répondre', icon: MessageSquare },
  { key: 'mine', label: 'Assignées à moi', icon: UserCheck },
]

export function InboxSidebar({
  rows,
  allTags,
  currentUserId,
  salesToday,
}: {
  rows: InboxRow[]
  allTags: { id: string; name: string }[]
  currentUserId: string | null
  salesToday: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const selectedId = pathname?.startsWith('/inbox/') ? pathname.split('/')[2] : null

  const [filter, setFilter] = useState<FilterKey>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [mutedCategories, setMutedCategories] = useState<Record<SoundCategory, boolean>>({ message: false, sale: false })
  const [showSoundMenu, setShowSoundMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [onlineOnly, setOnlineOnly] = useState(false)

  useEffect(() => {
    setMutedCategories({ message: isCategoryMuted('message'), sale: isCategoryMuted('sale') })
  }, [])

  const toggleCategoryMute = (category: SoundCategory) => {
    setMutedCategories((prev) => {
      const next = { ...prev, [category]: !prev[category] }
      setCategoryMuted(category, next[category])
      return next
    })
  }

  const allSoundsMuted = mutedCategories.message && mutedCategories.sale

  const toReplyCount = useMemo(() => rows.filter((r) => r.awaitingReply).length, [rows])
  const onlineCount = useMemo(() => rows.filter((r) => r.isRecentlyOnline).length, [rows])

  const filteredRows = useMemo(
    () =>
      rows
        .filter((r) => !activeTag || r.fanTags.includes(activeTag))
        .filter((r) => {
          if (filter === 'to_reply') return r.awaitingReply
          if (filter === 'mine') return currentUserId && r.assignedUserId === currentUserId
          return true
        })
        .filter((r) => !onlineOnly || r.isRecentlyOnline)
        .filter((r) => !query.trim() || r.fanName.toLowerCase().includes(query.trim().toLowerCase())),
    [rows, filter, activeTag, currentUserId, query, onlineOnly]
  )

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="shrink-0 space-y-3 border-b border-[color:var(--border)] p-4">
        <div className="relative flex items-center justify-between">
          <h1 className="text-sm font-semibold">Inbox</h1>
          <button
            onClick={() => setShowSoundMenu((v) => !v)}
            title="Réglages des sons"
            className="text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
          >
            {allSoundsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          {showSoundMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSoundMenu(false)} />
              <div className="glass absolute right-0 top-6 z-20 w-48 space-y-1 rounded-xl p-2">
                {SOUND_CATEGORIES.map((c) => (
                  <label
                    key={c.key}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-white/5"
                  >
                    {c.label}
                    <input
                      type="checkbox"
                      checked={!mutedCategories[c.key]}
                      onChange={() => toggleCategoryMute(c.key)}
                      className="accent-[color:var(--violet)]"
                    />
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[color:var(--foreground-muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un fan..."
            className="w-full rounded-full border border-[color:var(--border)] bg-white/5 py-1.5 pl-8 pr-7 text-xs focus:border-[color:var(--border-strong)] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {toReplyCount > 0 && !selectedId && (
          <button
            onClick={() => {
              const first = rows.find((r) => r.awaitingReply)
              if (first) router.push(`/inbox/${first.id}`)
            }}
            className="gradient-bg-signature flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_2px_12px_rgba(124,58,237,0.3)] transition-transform hover:scale-[1.02]"
          >
            Ouvrir la première à répondre
            <ArrowRight className="h-3 w-3" />
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filter === f.key
                  ? 'border-[color:var(--border-strong)] bg-white/5 text-[color:var(--foreground)]'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {f.icon && <f.icon className="h-3 w-3 shrink-0" />}
              {f.label}
              {f.key === 'to_reply' && toReplyCount > 0 && (
                <span className="rounded-full bg-[color:var(--danger)]/20 px-1.5 py-0.5 text-[9px] text-[color:var(--danger)]">
                  {toReplyCount}
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => setOnlineOnly((v) => !v)}
            title="Fans en ligne récemment"
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              onlineOnly
                ? 'border-[color:var(--success)]/50 bg-[color:var(--success)]/10 text-[color:var(--success)]'
                : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
            }`}
          >
            <Wifi className="h-3 w-3 shrink-0" />
            En ligne
            {onlineCount > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                  onlineOnly ? 'bg-[color:var(--success)]/25 text-[color:var(--success)]' : 'bg-white/10 text-[color:var(--foreground-muted)]'
                }`}
              >
                {onlineCount}
              </span>
            )}
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="h-3 w-3 shrink-0 text-[color:var(--foreground-muted)]" />
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                !activeTag
                  ? 'border-[color:var(--border-strong)] text-[color:var(--foreground)]'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              Toutes
            </button>
            {allTags.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTag(t.name)}
                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                  activeTag === t.name
                    ? 'border-[color:var(--border-strong)] text-[color:var(--foreground)]'
                    : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 divide-y divide-[color:var(--border)] overflow-y-auto">
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)]">
              <MessageSquare className="h-5 w-5 text-[color:var(--cyan)]" />
            </div>
            <p className="text-xs text-[color:var(--foreground-muted)]">
              {activeTag || filter !== 'all' ? 'Aucune conversation pour ce filtre.' : 'Aucune conversation.'}
            </p>
          </div>
        ) : (
          filteredRows.map((r) => (
            <Link
              key={r.id}
              href={`/inbox/${r.id}`}
              className={`relative flex items-center gap-2.5 px-4 py-3 text-sm transition-colors duration-150 hover:bg-white/5 ${
                selectedId === r.id ? 'bg-white/[0.07]' : ''
              }`}
            >
              {selectedId === r.id && <span className="gradient-bg-signature absolute inset-y-0 left-0 w-0.5" />}
              <FanAvatar name={r.fanName} avatarUrl={r.fanAvatarUrl} online={r.isRecentlyOnline} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    {r.awaitingReply && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--cyan)]" title="En attente de réponse" />
                    )}
                    <p className={`truncate text-xs ${r.awaitingReply ? 'font-semibold text-[color:var(--foreground)]' : 'font-medium'}`}>
                      {r.fanName}
                    </p>
                  </span>
                  {r.lastMessage && (
                    <span className="shrink-0 text-[9px] text-[color:var(--foreground-muted)]">
                      {relativeTimeFr(r.lastMessage.sent_at)}
                    </span>
                  )}
                </div>
                <p
                  className={`truncate text-[11px] ${
                    r.awaitingReply ? 'text-[color:var(--foreground)]' : 'text-[color:var(--foreground-muted)]'
                  }`}
                >
                  {r.lastMessage?.text || 'Aucun message'}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${FAN_FLOW_BADGE_CLASSES[r.flowStage]}`}>
                    {FAN_FLOW_LABELS[r.flowStage]}
                  </span>
                  {r.hasPendingOffer && (
                    <span
                      title="Offre envoyée, en attente de réponse"
                      className="flex items-center gap-0.5 rounded-full bg-[color:var(--warning)]/15 px-1.5 py-0.5 text-[9px] text-[color:var(--warning)]"
                    >
                      <Clock3 className="h-2.5 w-2.5" />
                      PPV
                    </span>
                  )}
                  {r.isSubscriber && (
                    <span className="rounded-full bg-[color:var(--violet)]/15 px-1.5 py-0.5 text-[9px] text-[color:var(--violet)]">
                      ABO
                    </span>
                  )}
                  {r.totalSpent > 0 && (
                    <span className="rounded-full bg-[color:var(--success)]/15 px-1.5 py-0.5 text-[9px] text-[color:var(--success)]">
                      {r.totalSpent}€
                    </span>
                  )}
                  {r.assignedName && (
                    <span className="rounded-full bg-[color:var(--cyan)]/15 px-1.5 py-0.5 text-[9px] text-[color:var(--cyan)]">
                      {r.assignedName}
                    </span>
                  )}
                  <ConversationViewerBadge conversationId={r.id} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[color:var(--border)] px-4 py-2 text-[10px] text-[color:var(--foreground-muted)]">
        <span className={salesToday > 0 ? 'text-[color:var(--success)]' : ''}>{salesToday}€ aujourd&apos;hui</span>
        <span>{rows.length} conv. · <span className={toReplyCount > 0 ? 'text-[color:var(--danger)]' : ''}>{toReplyCount}</span> à répondre</span>
      </div>
    </div>
  )
}
