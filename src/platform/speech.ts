/**
 * The device's own voices work offline on iOS and macOS. Listening drills rotate between them:
 * hearing several speakers is what high-variability phonetic training relies on (Uchihara, Karas &
 * Thomson, 2025).
 */
import { isQuiet, settings } from '../state/store';
import { speak, speechSupported, voicesFor } from './voices';

export const canSpeak = (lang: string) => speechSupported && voicesFor(lang).length > 0;

export const soundFor = (lang: string) => canSpeak(lang) && !isQuiet();

export function stopSpeech(): void {
  if (speechSupported) speechSynthesis.cancel();
}

/**
 * Without a voice for the language it stays silent: the engine would read the phrase with the
 * default voice, often English.
 */
export function say(text: string, opts: { lang: string; slow?: boolean; variant?: number }): Promise<void> {
  const list = speechSupported ? voicesFor(opts.lang) : [];
  const variant = settings.value.variedVoices ? (opts.variant ?? 0) : 0;
  const voice = list[variant % Math.max(1, list.length)];
  return voice ? speak(text, voice, opts) : Promise.resolve();
}
