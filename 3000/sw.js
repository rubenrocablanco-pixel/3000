const CACHE_NAME = 'anniv-cache-v1';
const FILES_TO_CACHE = [
  '/lita.html',
  '/sw.js'
];

// install phase: precache core files
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  // take over immediately
  self.skipWaiting();
});

// activate phase: remove old caches and claim clients
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// fetch handler: network-first for navigation/html, cache-first for others
self.addEventListener('fetch', evt => {
  if(evt.request.mode === 'navigate' || evt.request.headers.get('accept').includes('text/html')){
    evt.respondWith(
      fetch(evt.request).then(resp => {
        // update cache in background
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(evt.request, copy));
        return resp;
      }).catch(()=> caches.match(evt.request))
    );
  } else {
    evt.respondWith(
      caches.match(evt.request).then(resp => resp || fetch(evt.request))
    );
  }
});
