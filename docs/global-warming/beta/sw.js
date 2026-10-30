// Network-first service worker: always fresh when online, still playable offline.
importScripts('version.js');
const CACHE = `phylarium-${CHANNEL}-${VERSION}`;
// Old caches of this channel, plus names used before channels. Other apps on the site share the origin.
const OWN = [`phylarium-${CHANNEL}-`, 'phylarium-v', 'global-warming-'];
const ASSETS = ['./', 'index.html', 'style.css', 'version.js', 'sprites.js', 'terrain.js', 'scene.js', 'game.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys
      .filter(k => k !== CACHE && OWN.some(p => k.startsWith(p)))
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
