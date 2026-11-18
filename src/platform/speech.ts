/**
 * Text-to-speech with the device's own voices (works offline on iOS and macOS).
 * Listening drills can rotate between voices of the language: hearing several speakers
 * is what high-variability phonetic training relies on (Uchihara, Karas & Thomson, 2025).
 */
import { signal } from '@preact/signals';
import { settings } from '../state/store';

/** Installed voices; a signal so views update when the system finishes loading them. */
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

/** Voices for a language, best first: exact region, then on-device voices. */
export function voicesFor(lang: string): SpeechSynthesisVoice[] {
  const wanted = lang.toLowerCase().replace('_', '-');
  const score = (v: SpeechSynthesisVoice) =>
    (v.lang.toLowerCase().replace('_', '-') === wanted ? 0 : 2) + (v.localService ? 0 : 1);
  return voices.value.filter(v => baseOf(v.lang) === baseOf(lang)).sort((a, b) => score(a) - score(b));
}

export const canSpeak = (lang: string) => supported && voicesFor(lang).length > 0;

export function stopSpeech(): void {
  if (supported) speechSynthesis.cancel();
}

/**
 * Speaks `text`; resolves when done (or after a safety timeout on engines that drop events).
 * `variant` picks another voice of the language when « Voix variées » is on.
 */
export function say(text: string, opts: { lang: string; slow?: boolean; variant?: number }): Promise<void> {
  if (!supported) return Promise.resolve();
  stopSpeech();
  const list = voicesFor(opts.lang);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = opts.lang;
  const variant = settings.value.variedVoices ? (opts.variant ?? 0) : 0;
  const voice = list[variant % Math.max(1, list.length)];
  if (voice) utterance.voice = voice;
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
