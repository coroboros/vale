/**
 * Contract of the translation service, shared by the app (src/translate.ts) and the
 * Cloudflare Worker that serves it (worker/src). Keep it free of browser and Worker APIs.
 */

/** Longest French sentence the service accepts, in characters. */
export const MAX_TRANSLATE_CHARS = 300;

export interface TranslateRequest {
  text: string;
  /** Course id: the target language and its phonetic conventions. */
  course: string;
}

export interface Translated {
  /** The sentence in the target language, ready to say aloud. */
  t: string;
  /** French-readable pronunciation of `t`, in the course's conventions. */
  ph: string;
  /** One short tip in French (register, assumption, local alternative), or empty. */
  note: string;
  /** Other natural ways to say it, at most two. */
  alternatives: string[];
}

/** Same sentence, same key: case, spacing, apostrophe style and a final full stop do not count. */
export const sentenceKey = (text: string) =>
  text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[\s.…]+$/u, '')
    .trim();

const isString = (v: unknown): v is string => typeof v === 'string';

/** Validates and tidies a translation from an untrusted source (the network, a cache). */
export function asTranslated(value: unknown): Translated | null {
  if (!value || typeof value !== 'object') return null;
  const { t, ph, note, alternatives } = value as Record<string, unknown>;
  if (!isString(t) || !t.trim()) return null;
  const main = t.trim();
  return {
    t: main,
    ph: isString(ph) ? ph.trim() : '',
    note: isString(note) ? note.trim() : '',
    alternatives: Array.isArray(alternatives)
      ? [...new Set(alternatives.filter(isString).map(a => a.trim()))].filter(a => a && a !== main).slice(0, 2)
      : [],
  };
}
