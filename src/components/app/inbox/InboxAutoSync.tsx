'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { syncAllConnectedMymCreators } from '@/lib/platforms/sync'

const POLL_INTERVAL_MS = 45_000

// The actual fix for "messages don't refresh automatically": MYM has no
// webhook/push API, so nothing tells OmniFlow a fan sent a new message —
// the only way to find out is to ask MYM periodically. Mounted once in
// inbox/layout.tsx (the persistent part of the master-detail layout), so
// this keeps running across conversation navigation without restarting.
export function InboxAutoSync() {
  const router = useRouter()
  const syncingRef = useRef(false)

  useEffect(() => {
    const tick = async () => {
      // Don't poll a backgrounded tab — no one's watching, and it's one
      // less set of requests against MYM's (unofficial, rate-limit-unknown)
      // API for every idle browser tab left open.
      if (document.visibilityState !== 'visible') return
      if (syncingRef.current) return
      syncingRef.current = true
      try {
        const { synced } = await syncAllConnectedMymCreators()
        if (synced > 0) router.refresh()
      } catch (err) {
        console.error('[mym-autosync] tick failed:', err)
      } finally {
        syncingRef.current = false
      }
    }

    // Fire once shortly after opening the Inbox rather than waiting a full
    // interval for the first update.
    const initial = setTimeout(tick, 3_000)
    const interval = setInterval(tick, POLL_INTERVAL_MS)
    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [router])

  return null
}
