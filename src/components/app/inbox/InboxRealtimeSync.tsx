'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Design handoff: "Mise à jour instantanée après réception ou envoi d'un
// message" for the conversation LIST, not just the conversation currently
// open — ConversationView already has its own Realtime channel, but that
// only covers the one conversation someone happens to have open. Without
// this, a message on any other conversation only reaches the list via
// InboxAutoSync's 45s MYM poll. `touch_conversation_on_message` (see
// 0025_fix_conversation_touch_trigger.sql) updates `conversations` on every
// new message regardless of which one, so subscribing to UPDATE on the
// whole table (RLS still scopes delivery to this agency's rows) is a
// reliable, single-channel proxy for "something changed in the list" —
// no need for a second subscription on `messages`.
export function InboxRealtimeSync() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let cancelled = false

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) supabase.realtime.setAuth(session.access_token)

      channel = supabase
        .channel('inbox-list-sync')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, () => router.refresh())
        .subscribe()
    })

    return () => {
      cancelled = true
      if (channel) supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
