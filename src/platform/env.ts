import { signal } from '@preact/signals';

/** What the app runs on. Read once: none of this changes during a visit. */

export const inFrame = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const ua = navigator.userAgent;

/** iPhone, iPad, or an iPad presenting itself as a Mac. */
export const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
export const isMacSafari =
  !isIOS && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua);
export const isFirefox = /Firefox\//.test(ua);

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Network status, for features that need a connection (translation). */
export const online = signal(navigator.onLine);
window.addEventListener('online', () => (online.value = true));
window.addEventListener('offline', () => (online.value = false));
