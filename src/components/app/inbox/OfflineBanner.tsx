'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

// Design handoff: "Prévoir pour chaque zone: ... hors ligne" — the Inbox
// depends on the network for everything (Realtime, MYM polling, every send),
// so silently failing with no explanation when the connection drops is
// exactly the kind of dishonest state the handoff calls out. `navigator
// .onLine` plus the online/offline window events is the standard, reliable
// way to detect this client-side.
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="mb-2 flex items-center gap-2 rounded-xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-3 py-2 text-xs text-[color:var(--warning)]">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      Hors ligne — les messages et mises à jour reprendront automatiquement à la reconnexion.
    </div>
  )
}
