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
export function ServiceWorkerCleanup() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) registration.unregister()
    })
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) caches.delete(name)
      })
    }
  }, [])

  return null
}
