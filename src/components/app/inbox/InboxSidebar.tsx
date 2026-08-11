'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Tag, Plus } from 'lucide-react'
import { FanAvatar } from '@/components/app/inbox/FanAvatar'
import { NewConversationModal } from '@/components/app/inbox/NewConversationModal'
import { FAN_FLOW_LABELS, FAN_FLOW_BADGE_CLASSES, type FanFlowStage } from '@/lib/fans/fanFlow'
import { relativeTimeFr } from '@/lib/utils/relativeTime'

export interface InboxRow {
  id: string
  fanId: string
  fanName: string
  creatorName: string
  fanTags: string[]
  lastMessage: { text: string; sent_at: string } | null
  totalSpent: number
  flowStage: FanFlowStage
  awaitingReply: boolean
  assignedUserId: string | null
  assignedName: string | null
}

type FilterKey = 'all' | 'to_reply' | 'mine'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'to_reply', label: 'À répondre' },
  { key: 'mine', label: 'Assignées à moi' },
]

export function InboxSidebar({
  rows,
  allTags,
  creators,
  currentUserId,
}: {
  rows: InboxRow[]
  allTags: { id: string; name: string }[]
  creators: { id: string; display_name: string }[]
  currentUserId: string | null
}) {
  const pathname = usePathname()
  const selectedId = pathname?.startsWith('/inbox/') ? pathname.split('/')[2] : null

  const [filter, setFilter] = useState<FilterKey>('all')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)

  const toReplyCount = useMemo(() => rows.filter((r) => r.awaitingReply).length, [rows])

  const filteredRows = useMemo(
    () =>
      rows
        .filter((r) => !activeTag || r.fanTags.includes(activeTag))
        .filter((r) => {
          if (filter === 'to_reply') return r.awaitingReply
          if (filter === 'mine') return currentUserId && r.assignedUserId === currentUserId
          return true
        }),
    [rows, filter, activeTag, currentUserId]
  )

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="shrink-0 space-y-3 border-b border-[color:var(--border)] p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Inbox</h1>
          <button
            onClick={() => setShowNewModal(true)}
            title="Nouvelle conversation de test"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--border-strong)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filter === f.key
                  ? 'border-[color:var(--border-strong)] bg-white/5 text-[color:var(--foreground)]'
                  : 'border-[color:var(--border)] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]'
              }`}
            >
              {f.label}
              {f.key === 'to_reply' && toReplyCount > 0 && (
                <span className="ml-1 rounded-full bg-[color:var(--danger)]/20 px-1.5 py-0.5 text-[9px] text-[color:var(--danger)]">
                  {toReplyCount}
                </span>
              )}
            </button>
          ))}
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
              <FanAvatar name={r.fanName} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="truncate text-xs font-medium">{r.fanName}</p>
                  {r.lastMessage && (
                    <span className="shrink-0 text-[9px] text-[color:var(--foreground-muted)]">
                      {relativeTimeFr(r.lastMessage.sent_at)}
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-[color:var(--foreground-muted)]">
                  {r.lastMessage?.text || 'Aucun message'}
                </p>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${FAN_FLOW_BADGE_CLASSES[r.flowStage]}`}>
                    {FAN_FLOW_LABELS[r.flowStage]}
                  </span>
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
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between border-t border-[color:var(--border)] px-4 py-2 text-[10px] text-[color:var(--foreground-muted)]">
        <span>{rows.length} conversation{rows.length !== 1 ? 's' : ''}</span>
        <span>
          <span className={toReplyCount > 0 ? 'text-[color:var(--danger)]' : ''}>{toReplyCount}</span> à répondre
        </span>
      </div>

      {showNewModal && <NewConversationModal creators={creators} onClose={() => setShowNewModal(false)} />}
    </div>
  )
}
