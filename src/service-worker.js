const CURRENT_CACHE_NAME = '0.0.15'

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json',
  '/main.bundle.js',
  '/stream-processor.js',
  '/assets/fonts/arcade.png',
  '/assets/fonts/arcade.xml',
  '/assets/icons/66-microphone@2x.png',
  '/assets/particles/flares.json',
  '/assets/particles/flares.png',
  '/assets/particles/star_06.png'
]

self.addEventListener('install', async () => {
  console.log('[service worker install]')
  const cache = await caches.open(CURRENT_CACHE_NAME)
  console.log('[service worker install]', 'cache:', cache)
  if (cache) {
    for (const url of URLS_TO_CACHE) {
      console.log('[service worker install]', 'cache.add:', url)
      await cache.add(url)
    }
  }
})

self.addEventListener('activate', async () => {
  console.log('[service worker activate]')
  const keys = await caches.keys()
  console.log('[service worker activate]', 'old caches:', JSON.stringify(keys))
  for (const key of keys) {
    if (key !== CURRENT_CACHE_NAME) {
      console.log('[service worker activate]', 'deleting old cache:', key)
      await caches.delete(key)
    }
  }
})

self.addEventListener('fetch', async event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        console.log('[service worker fetch]', 'event.request.url:', event.request.url, 'response:', response)
        return response ? response : fetch(event.request)
      })
  )
})
