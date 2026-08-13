'use client'

import { useEffect } from 'react'

// Retires the pre-rebuild app's offline/PWA Service Worker (its offline
// fallback pointed at /dashboard, a route that no longer exists — and more
// importantly, a Service Worker sitting in front of every fetch is exactly
// the kind of thing that can make a real-time Inbox look like it "doesn't
// refresh" for anyone who already has it installed from before). Actively
// unregisters it and clears its caches instead of just no longer
// registering a new one — an already-installed worker keeps running
// otherwise, on every future visit, until something tells it to stop.
// Unregistering a Service Worker only stops it from controlling *future*
// loads — the page already running was fetched through the old worker, so
// without a forced reload here, someone stuck on a stale cached version
// stays on that same stale version until they manually reload (which they
// have no particular reason to know to do). sessionStorage guards against a
// reload loop if unregistering ever fails to actually take.
const RELOAD_GUARD_KEY = 'omniflow_sw_cleanup_reloaded'

export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      if (registrations.length === 0) return
      Promise.all(registrations.map((r) => r.unregister())).then(() => {
        if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return
        sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
        window.location.reload()
      })
    })
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name)
      })
    }
  }, [])

  return null
}
