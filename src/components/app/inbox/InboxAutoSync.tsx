'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { syncAllConnectedMymCreators } from '@/lib/platforms/sync'

const POLL_INTERVAL_MS = 45_000
// Design handoff: "Prévoir ... analyse IA temporairement indisponible" and
// "Risque ou erreur: retour rouge mesuré, jamais agressif" — a single tick
// failure is normal network noise (don't alarm the owner over it), but
// several in a row is a real signal the MYM sync itself is broken, which was
// previously only visible in the browser console (i.e. never, to the owner).
const FAILURES_BEFORE_VISIBLE = 3

// The actual fix for "messages don't refresh automatically": MYM has no
// webhook/push API, so nothing tells OmniFlow a fan sent a new message —
// the only way to find out is to ask MYM periodically. Mounted once in
// inbox/layout.tsx (the persistent part of the master-detail layout), so
// this keeps running across conversation navigation without restarting.
export function InboxAutoSync() {
  const router = useRouter()
  const syncingRef = useRef(false)
  const consecutiveFailuresRef = useRef(0)
  const [syncBroken, setSyncBroken] = useState(false)

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
        consecutiveFailuresRef.current = 0
        setSyncBroken(false)
        if (synced > 0) router.refresh()
      } catch (err) {
        console.error('[mym-autosync] tick failed:', err)
        consecutiveFailuresRef.current += 1
        if (consecutiveFailuresRef.current >= FAILURES_BEFORE_VISIBLE) setSyncBroken(true)
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

  if (!syncBroken) return null

  return (
    <div className="mb-2 flex items-center gap-2 rounded-xl border border-[color:var(--danger)]/40 bg-[color:var(--danger)]/10 px-3 py-2 text-xs text-[color:var(--danger)]">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      Synchronisation MYM indisponible depuis plusieurs tentatives — les nouveaux messages peuvent être en retard.
    </div>
  )
}
