/**
 * The browser's own speech recognition. Chrome on a computer promises to stay on the device once
 * its language pack is installed (processLocally), and offers the pack to pages (install(), which
 * needs a tap to start a download). Safari requires on-device recognition whenever the language
 * allows it (WebKit, WebSpeechRecognizerTask.mm). Otherwise the browser's online service hears the
 * audio, as Chrome does on Android. Bagage keeps neither the audio nor the transcript.
 */
import { setAudioSession } from './audio';

type Availability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

interface Recognizer {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally: boolean;
  onstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

interface RecognizerClass {
  new (): Recognizer;
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<Availability>;
  install?: (options: { langs: string[]; processLocally: boolean }) => Promise<boolean>;
}

const { SpeechRecognition, webkitSpeechRecognition } = window as Window & {
  SpeechRecognition?: RecognizerClass;
  webkitSpeechRecognition?: RecognizerClass;
};
const Recognition = SpeechRecognition ?? webkitSpeechRecognition;

type Where = 'device' | 'browser';
type Hearing = { kind: 'heard'; transcripts: string[] } | { kind: 'silence' } | { kind: 'failed' };

const REFUSED = new Set(['not-allowed', 'service-not-allowed', 'language-not-supported']);
/** Refused or deaf: the rest of the visit does without. */
let broken = false;
const where = new Map<string, Where | null>();
/** Heard online for now, on the device once the browser downloads the language's pack. */
const installable = new Set<string>();

export const canHear = () => !!Recognition && !broken;

/** Undefined until `probe` has answered; null when the browser cannot recognise the language. */
export const whereHeard = (lang: string) => where.get(lang);

export async function probe(lang: string): Promise<void> {
  if (!Recognition || where.has(lang)) return;
  const ask = (processLocally: boolean) =>
    Recognition.available?.({ langs: [lang], processLocally }).catch(() => undefined);
  const [local, any] = await Promise.all([ask(true), ask(false)]);
  where.set(lang, local === 'available' ? 'device' : any === 'unavailable' ? null : 'browser');
  if ((local === 'downloadable' || local === 'downloading') && any !== 'unavailable' && Recognition.install)
    installable.add(lang);
}

export const canInstall = (lang: string) => installable.has(lang);

/** Brave answers that the pack is downloading and never finishes: past this, Bagage stops waiting. */
const INSTALL_MS = 120_000;

/** Call it from the tap itself: the browser starts a download only on a fresh user gesture. */
export async function installPack(lang: string): Promise<boolean> {
  installable.delete(lang);
  const ok = await Promise.race([
    Recognition!.install!({ langs: [lang], processLocally: true }).catch(() => false),
    new Promise<boolean>(resolve => setTimeout(() => resolve(false), INSTALL_MS)),
  ]);
  if (ok) where.set(lang, 'device');
  return ok;
}

/** Waiting for speech, then for its end: a recogniser silent past these has gone deaf (WebKit bug 321436). */
const WAIT_MS = 10_000;
const SPEAKING_MS = 12_000;

/**
 * Ends by itself after a pause rather than on a tap: on iOS 27, a session cut short leaves the next
 * ones deaf (same bug).
 */
export function listen(lang: string, at: Where, onStart: () => void): { done: Promise<Hearing>; cancel: () => void } {
  const r = new Recognition!();
  r.lang = lang;
  r.continuous = false;
  r.interimResults = false;
  r.maxAlternatives = 5;
  if (at === 'device') r.processLocally = true;
  // The recorder leaves the session on 'playback', which is for output only.
  setAudioSession('auto');
  let settled = false;
  let timer = 0;
  let resolve: (h: Hearing) => void = () => {};
  const done = new Promise<Hearing>(res => {
    resolve = res;
  });
  const finish = (h: Hearing) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    resolve(h);
  };
  const arm = (ms: number) => {
    if (settled) return;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      broken = true;
      finish({ kind: 'failed' });
      r.abort();
    }, ms);
  };
  r.onstart = () => {
    if (!settled) onStart();
  };
  r.onspeechstart = () => arm(SPEAKING_MS);
  r.onresult = e => {
    const best = e.results[e.results.length - 1];
    const transcripts = best ? Array.from(best, a => a.transcript.trim()).filter(Boolean) : [];
    if (transcripts.length) finish({ kind: 'heard', transcripts });
  };
  r.onerror = e => {
    if (REFUSED.has(e.error)) broken = true;
    finish(e.error === 'no-speech' ? { kind: 'silence' } : { kind: 'failed' });
  };
  r.onend = () => finish({ kind: 'silence' });
  arm(WAIT_MS);
  try {
    r.start();
  } catch {
    finish({ kind: 'failed' });
  }
  return {
    done,
    cancel: () => {
      if (settled) return;
      finish({ kind: 'silence' });
      r.abort();
    },
  };
}
