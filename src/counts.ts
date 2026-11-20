/**
 * Sends the anonymous counts (counts-api.ts) to the service the build names (VITE_COUNTS_URL),
 * unless the traveller switched them off in « Moi ». Each goes once: a moment after a session or
 * any change, when the app goes to the background, or at the next start if it could not leave.
 */
import { effect } from '@preact/signals';
import { countsEndpoint, type FirstStep, type Source, sourceOf, type Tally } from './counts-api';
import { addTally, dueCounts, dueSteps, inFirstWeek, takeTally } from './engine/counts';
import { dayKey } from './engine/progress';
import { isStandalone } from './platform/env';
import { db, update } from './state/store';

const ENDPOINT = countsEndpoint(import.meta.env.VITE_COUNTS_URL);

export const countsOn = ENDPOINT !== '';

/** The link this visit came through, so a new traveller's counts say which experiment brought them. */
export const arrivedFrom = (): Source => sourceOf(new URLSearchParams(location.search).get('utm_source'));

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
  const steps = dueSteps(db.value.funnel);
  const due = db.value.profiles.flatMap(p => {
    const data = db.value.data[p.id];
    return data ? dueCounts(p, data, today).map(count => ({ id: p.id, count })) : [];
  });
  // Every traveller's answers go as one sum: nothing tells the travellers of a phone apart.
  const answers: Tally = {};
  const tallied = db.value.profiles.flatMap(p => {
    const tally = db.value.data[p.id]?.counts.answers;
    return tally && addTally(answers, tally) ? [{ id: p.id, tally: structuredClone(tally) }] : [];
  });
  if (!steps.length && !due.length && !Object.keys(answers).length) return;
  sending = true;
  try {
    const response = await fetch(`${ENDPOINT}/count`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ counts: [...steps, ...due.map(d => d.count)], answers }),
      keepalive: true,
    });
    if (response.ok)
      update(draft => {
        draft.funnel.sent.push(...steps.map(s => s.value as FirstStep));
        for (const { id, count } of due) draft.data[id]?.counts.sent.push(count.name);
        for (const { id, tally } of tallied) {
          const data = draft.data[id];
          if (data) takeTally(data.counts.answers, tally);
        }
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
