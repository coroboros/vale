/**
 * Sends the anonymous counts (counts-api.ts) to the service the build names (VITE_COUNTS_URL),
 * unless the traveller switched them off in « Moi ». Each goes once: a moment after a session or
 * any change, when the app goes to the background, or at the next start if it could not leave.
 */
import { effect } from '@preact/signals';
import { dueCounts, inFirstWeek } from './engine/counts';
import { dayKey } from './engine/progress';
import { isStandalone } from './platform/env';
import { db, update } from './state/store';

const ENDPOINT = ((import.meta.env.VITE_COUNTS_URL as string | undefined) ?? '').replace(/\/$/, '');

export const countsOn = ENDPOINT !== '';

let sending = false;

async function sendCounts(now = Date.now()): Promise<void> {
  if (!ENDPOINT || sending || !navigator.onLine || !db.value.settings.shareCounts) return;
  const today = dayKey(now);
  const fresh = isStandalone()
    ? db.value.profiles.filter(p => inFirstWeek(p, today) && db.value.data[p.id]?.counts.installed === false)
    : [];
  if (fresh.length)
    update(draft => {
      for (const p of fresh) draft.data[p.id]!.counts.installed = true;
    });
  const due = db.value.profiles.flatMap(p => {
    const data = db.value.data[p.id];
    return data ? dueCounts(p, data, today).map(count => ({ id: p.id, count })) : [];
  });
  if (!due.length) return;
  sending = true;
  try {
    const response = await fetch(`${ENDPOINT}/count`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ counts: due.map(d => d.count) }),
      keepalive: true,
    });
    if (response.ok)
      update(draft => {
        for (const { id, count } of due) draft.data[id]?.counts.sent.push(count.name);
      });
  } catch {
    // Offline or blocked: they leave next time.
  } finally {
    sending = false;
  }
}

export function initCounts(): void {
  if (!ENDPOINT) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  effect(() => {
    void db.value;
    clearTimeout(timer);
    timer = setTimeout(() => void sendCounts(), 3000);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void sendCounts();
  });
}
