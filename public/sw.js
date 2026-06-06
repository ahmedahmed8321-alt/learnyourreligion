// Minimal service worker — exists ONLY so Android Chrome treats the site as an
// installable PWA (required for the WhatsApp/share-sheet share target).
// It deliberately does NOT cache anything: every request goes to the network as
// normal, so there is zero risk of serving stale/broken pages.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // No-op: do not call event.respondWith(), so the browser handles the request
  // normally (network). No caching, no interception.
});
