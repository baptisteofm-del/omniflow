/**
 * OmniFlow Service Worker
 * Provides offline capabilities and caching for PWA functionality
 */

const CACHE_NAME = 'omniflow-v1'
const OFFLINE_URL = '/dashboard'

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/logo-icon.svg'
]

/**
 * Install event: Cache essential assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets')
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        // Non-critical: some assets may not be available yet
        console.warn('[SW] Some assets could not be cached:', err)
        return Promise.resolve()
      })
    })
  )
  self.skipWaiting() // Activate immediately
})

/**
 * Activate event: Clean up old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim() // Claim all clients immediately
})

/**
 * Fetch event: Network first, fallback to cache
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API calls (they should have their own error handling)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // Network-first strategy for HTML/pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then((c) => c.put(request, response.clone()))
          }
          return response
        })
        .catch(() => {
          // Fallback to cache or offline page
          return caches
            .match(request)
            .then((response) => response || caches.match(OFFLINE_URL))
            .catch(() => new Response('Offline mode - Limited functionality'))
        })
    )
    return
  }

  // Cache-first strategy for assets (js, css, images)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response
        }

        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response
          }

          // Cache the asset
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })

          return response
        })
      })
    )
    return
  }

  // Default: network-first
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  )
})

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
