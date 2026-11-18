/**
 * The device's own voices work offline on iOS and macOS. Listening drills rotate between them:
 * hearing several speakers is what high-variability phonetic training relies on (Uchihara, Karas &
 * Thomson, 2025).
 */
import { signal } from '@preact/signals';
import { isQuiet, settings } from '../state/store';

/** A signal: the system loads voices late, and views must update then. */
const voices = signal<SpeechSynthesisVoice[]>([]);

const NOVELTY =
  /Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Deranged|Good News|Hysterical|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox/;
const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function load() {
  voices.value = speechSynthesis.getVoices().filter(v => !NOVELTY.test(v.name));
}

export function initSpeech(): void {
  if (!supported) return;
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

export const canSpeak = (lang: string) => supported && voicesFor(lang).length > 0;

export const soundFor = (lang: string) => canSpeak(lang) && !isQuiet();

export function stopSpeech(): void {
  if (supported) speechSynthesis.cancel();
}

/**
 * Resolves on end, or after a timeout: some engines drop the event. Without a voice for the
 * language it stays silent: the engine would read the phrase with the default voice, often English.
 */
export function say(text: string, opts: { lang: string; slow?: boolean; variant?: number }): Promise<void> {
  const list = supported ? voicesFor(opts.lang) : [];
  if (!list.length) return Promise.resolve();
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = opts.lang;
  const variant = settings.value.variedVoices ? (opts.variant ?? 0) : 0;
  utterance.voice = list[variant % list.length]!;
  utterance.rate = opts.slow ? 0.68 : 0.92;
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
