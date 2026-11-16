/** Service worker registration and the "new version available" flow. */

import { registerSW } from 'virtual:pwa-register';
import { signal } from '@preact/signals';
import { inFrame } from './env';

/** The whole app is cached: it opens without network. */
export const offlineReady = signal(false);
/** A newer version is downloaded and waits for the learner's go-ahead. */
export const updateReady = signal(false);

let apply: ((reload?: boolean) => Promise<void>) | null = null;

export function initPWA(): void {
  if (inFrame || !('serviceWorker' in navigator)) return;
  apply = registerSW({
    onNeedRefresh: () => {
      updateReady.value = true;
    },
    onOfflineReady: () => {
      offlineReady.value = true;
    },
    onRegisteredSW: (_url, registration) => {
      if (registration?.active) offlineReady.value = true;
      // Look for a new version when the app comes back to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && navigator.onLine) void registration?.update();
      });
    },
  });
}

export function applyUpdate(): void {
  void apply?.(true);
}
