'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Viewer {
  userId: string
  userName: string
}

// One agency-wide presence channel (not per-conversation — a single
// connection that everyone's client updates as they navigate) so both the
// open conversation's header AND every row in the Inbox list can show "who
// else is here right now" from the same live state (owner request: "si un
// membre de l'équipe est sur une conversation son nom apparaît... en
// direct").
const TeamPresenceContext = createContext<Record<string, Viewer[]>>({})

export function useConversationViewers(conversationId: string): Viewer[] {
  const map = useContext(TeamPresenceContext)
  return map[conversationId] ?? []
}

// A per-row hook call inside InboxSidebar's .map() would break the Rules of
// Hooks (a dynamic number of hook calls) — this component exists purely so
// each conversation row can read its own slice of the shared context as one
// hook call per component instance instead.
export function ConversationViewerBadge({ conversationId }: { conversationId: string }) {
  const viewers = useConversationViewers(conversationId)
  if (viewers.length === 0) return null
  return (
    <span
      title={`${viewers.map((v) => v.userName).join(', ')} regarde aussi cette conversation`}
      className="flex items-center gap-0.5 rounded-full bg-[color:var(--cyan)]/15 px-1.5 py-0.5 text-[9px] text-[color:var(--cyan)]"
    >
      {viewers[0].userName}
    </span>
  )
}

export function TeamPresenceProvider({
  agencyId,
  userId,
  userName,
  children,
}: {
  agencyId: string
  userId: string
  userName: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentConversationId = pathname?.startsWith('/inbox/') ? pathname.split('/')[2] : null
  const [viewersByConversationId, setViewersByConversationId] = useState<Record<string, Viewer[]>>({})
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)

  // Join once per agency session — re-tracking on navigation (below) reuses
  // this same channel rather than reconnecting on every conversation click.
  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) supabase.realtime.setAuth(session.access_token)

      const channel = supabase.channel(`presence-agency-${agencyId}`, {
        config: { presence: { key: userId } },
      })
      channelRef.current = channel

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string; userName: string; conversationId: string | null }>()
        const map: Record<string, Viewer[]> = {}
        for (const key in state) {
          for (const presence of state[key]) {
            if (presence.userId === userId) continue // never show yourself as a "teammate viewing"
            if (!presence.conversationId) continue
            const list = map[presence.conversationId] ?? []
            list.push({ userId: presence.userId, userName: presence.userName })
            map[presence.conversationId] = list
          }
        }
        setViewersByConversationId(map)
      })

      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.track({ userId, userName, conversationId: currentConversationId })
        }
      })
    })

    return () => {
      cancelled = true
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
    // Deliberately not depending on currentConversationId — that's handled
    // by the effect below, re-tracking on the same live channel instead of
    // reconnecting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, userId, userName])

  // Re-announce "where I am" whenever the operator switches conversations.
  useEffect(() => {
    channelRef.current?.track({ userId, userName, conversationId: currentConversationId })
  }, [currentConversationId, userId, userName])

  return <TeamPresenceContext.Provider value={viewersByConversationId}>{children}</TeamPresenceContext.Provider>
}
