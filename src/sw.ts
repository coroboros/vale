/// <reference lib="webworker" />
/**
 * Service worker: precaches the whole app (Workbox), opens it from the cache at its own address,
 * and accepts the update message of the v3 app so installed copies move to this version.
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
// Only the app's own address is the app: the situation pages beside it are documents of their own.
const app = new URL('./', self.registration.scope).pathname;
registerRoute(
  ({ request, url }) => request.mode === 'navigate' && [app, `${app}index.html`].includes(url.pathname),
  createHandlerBoundToURL('index.html'),
);

self.addEventListener('message', event => {
  // 'skip' is what the v3 app sends from its update banner.
  if (event.data === 'skip' || event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Drop the v3 hand-written cache ("vale-<hash>").
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('vale-')).map(k => caches.delete(k)))),
  );
});
