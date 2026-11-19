/**
 * The device's own voices, and speaking with one of them. Free of the app's stored settings, so a
 * situation page can speak its phrases too.
 */
import { signal } from '@preact/signals';

/** A signal: the system loads voices late, and views must update then. */
const voices = signal<SpeechSynthesisVoice[]>([]);

const NOVELTY =
  /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox/;
export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function load() {
  voices.value = speechSynthesis.getVoices().filter(v => !NOVELTY.test(v.name));
}

export function initVoices(): void {
  if (!speechSupported) return;
  load();
  speechSynthesis.addEventListener('voiceschanged', load);
}

const baseOf = (lang: string) => lang.toLowerCase().split(/[-_]/)[0];

/** Best first: exact region, then on-device voices. */
export function voicesFor(lang: string): SpeechSynthesisVoice[] {
  const wanted = lang.toLowerCase().replace('_', '-');
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase().replace('_', '-') === wanted ? 0 : 2) + (v.localService ? 0 : 1);
  return voices.value.filter(v => baseOf(v.lang) === baseOf(lang)).sort((a, b) => score(a) - score(b));
}

/** Resolves on end, or after a timeout: some engines drop the event. */
export function speak(
  text: string,
  voice: SpeechSynthesisVoice,
  { lang = voice.lang, slow = false }: { lang?: string; slow?: boolean } = {},
): Promise<void> {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.voice = voice;
  utterance.rate = slow ? 0.68 : 0.92;
  return new Promise(resolve => {
    const done = () => {
      clearTimeout(guard);
      resolve();
    };
    const guard = setTimeout(done, 1500 + text.length * 120);
    utterance.onend = done;
    utterance.onerror = done;
    speechSynthesis.speak(utterance);
  });
}
