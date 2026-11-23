// Service Worker für Lichtweg: macht das Spiel offline spielbar.
// Die Seite selbst kommt "network first" (Updates sind sofort da), alles andere aus dem Cache.
const CACHE = "lichtweg-v3";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png",
];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    ev.respondWith(fetch(req)
      .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => Promise.all([c.put("./index.html", copy.clone()), c.put("./", copy)])); } return res; })
      .catch(() => caches.match("./index.html")));
    return;
  }
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req)));
});
