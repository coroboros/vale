/// <reference lib="webworker" />
/**
 * Service worker: precaches the whole app (Workbox), answers navigations from the cache,
 * and accepts the update message of the v3 app so installed copies move to this version.
 */
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | { url: string; revision: string | null })[] };

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

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
