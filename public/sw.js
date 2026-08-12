// This Service Worker is retired — it belonged to the pre-rebuild app and
// its offline fallback pointed at a route that no longer exists. Kept at
// this URL (rather than deleted) as a kill switch: a browser with the old
// worker already installed will fetch this file on its periodic update
// check, install this version, and it immediately unregisters itself and
// clears every cache it created, then hands control straight back to the
// network. Safe to delete once confident no returning visitor still has
// the old one installed.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.map((name) => caches.delete(name)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) client.navigate(client.url)
    })()
  )
})
