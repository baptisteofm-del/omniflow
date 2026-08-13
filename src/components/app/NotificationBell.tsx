'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, CheckCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/notifications/actions'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  conversation_id: string | null
  read_at: string | null
  created_at: string
}

// Owner requirement: notify the agency live when Full AI needs a human
// (escalation) or when it deflected a sale it couldn't fulfill (missed
// opportunity) — a Realtime subscription (same pattern as ConversationView)
// plus, when the browser allows it, a native OS notification so it's
// noticeable even if the tab isn't focused.
export function NotificationBell({ agencyId, initialNotifications }: { agencyId: string; initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read_at).length

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel(`agency-notifications-${agencyId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'agency_notifications', filter: `agency_id=eq.${agencyId}` },
          (payload) => {
            const notification = payload.new as Notification
            setNotifications((prev) => [notification, ...prev].slice(0, 30))
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification(notification.title, { body: notification.body ?? undefined })
            }
          }
        )
        .subscribe()
    })

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
  }, [agencyId])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[color:var(--foreground-muted)] hover:bg-white/5 hover:text-[color:var(--foreground)]"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--danger)] px-1 text-[10px] text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--background)] p-2 shadow-xl">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-medium">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
                  markAllNotificationsRead().catch(() => {})
                }}
                className="flex items-center gap-1 text-[10px] text-[color:var(--foreground-muted)] hover:text-[color:var(--foreground)]"
              >
                <CheckCheck className="h-3 w-3" />
                Tout marquer lu
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="p-3 text-xs text-[color:var(--foreground-muted)]">Aucune notification.</p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                href={n.conversation_id ? `/inbox/${n.conversation_id}` : '#'}
                onClick={() => {
                  if (!n.read_at) {
                    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)))
                    markNotificationRead(n.id).catch(() => {})
                  }
                  setOpen(false)
                }}
                className={`block rounded-xl px-3 py-2 text-xs hover:bg-white/5 ${!n.read_at ? 'bg-white/5' : ''}`}
              >
                <p className="font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-[color:var(--foreground-muted)]">{n.body}</p>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
