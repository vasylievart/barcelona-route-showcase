// public/sw.js

const CACHE_NAME     = 'barcelona-route-v1'
const OFFLINE_URL    = '/offline'

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/plan',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install — precache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, fall back to cache
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET') return
  if (!url.protocol.startsWith('http')) return

  // Skip Stripe, Google APIs, Supabase — always need fresh data
  if (
    url.hostname.includes('stripe.com')    ||
    url.hostname.includes('supabase.co')   ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('/maps/api/place') ||
    url.hostname.includes('googleapis.com') && url.pathname.includes('/maps/api/geocode')
  ) return

  // For itinerary pages — cache first (offline support)
  if (url.pathname.startsWith('/itinerary/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async cache => {
        const cached = await cache.match(request)
        if (cached) return cached

        try {
          const response = await fetch(request)
          if (response.ok) cache.put(request, response.clone())
          return response
        } catch {
          return cached ?? new Response('Offline', { status: 503 })
        }
      })
    )
    return
  }

  // For everything else — network first, fall back to cache
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL) ??
            new Response('<h1>You are offline</h1>', {
              headers: { 'Content-Type': 'text/html' }
            })
        }
        return new Response('Offline', { status: 503 })
      })
  )
})