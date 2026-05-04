const CACHE_NAME = 'burger-rush-static-v1'
const STATIC_ASSET_PATTERN = /\.(?:js|css|svg|png|jpg|jpeg|webp|avif|ico)$/i

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== self.location.origin || !STATIC_ASSET_PATTERN.test(url.pathname)) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request)
      const networkResponsePromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone())
          }

          return response
        })
        .catch(() => cachedResponse)

      return cachedResponse || networkResponsePromise
    }),
  )
})
