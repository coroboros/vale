/**
 * Offline, the course and the learner's history answer. Online, the Worker in worker/ when the
 * build sets VITE_TRANSLATE_URL, otherwise a DeepL link with the sentence filled in.
 */
import type { CourseIndex } from './content';
import type { Course, Item } from './content/types';
import { normalize, stripAccents } from './engine/grade';
import type { Translation } from './state/schema';
import { asTranslated, type Translated, type TranslateRequest } from './translation-api';

const ENDPOINT = ((import.meta.env.VITE_TRANSLATE_URL as string | undefined) ?? '').replace(/\/$/, '');
export const hasTranslator = ENDPOINT !== '';

const FAILURES: Record<number, string> = {
  429: 'Beaucoup de traductions d’un coup : réessaie dans une minute.',
  503: 'Le service de traduction est très demandé : réessaie dans un instant.',
  504: 'Le service de traduction a mis trop de temps : réessaie.',
};

export async function translateOnline(fr: string, course: Course): Promise<Translated> {
  const request: TranslateRequest = { text: fr, course: course.id };
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/translate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new Error('Pas de connexion au service de traduction.');
  }
  if (!res.ok) throw new Error(FAILURES[res.status] ?? 'La traduction n’a pas abouti. Réessaie.');
  const answer = asTranslated(await res.json().catch(() => null));
  if (!answer) throw new Error('Réponse inattendue du service de traduction.');
  return answer;
}

export const deeplLink = (fr: string, course: Course) =>
  `https://www.deepl.com/translator#fr/${course.lang.split('-')[0]}/${encodeURIComponent(fr)}`;

const fold = (text: string) => stripAccents(normalize(text));
const wordsOf = (query: string) =>
  fold(query)
    .split(' ')
    .filter(w => w.length >= 2);

function matches(words: string[], ...fields: string[]): number | null {
  const hay = fields.map(fold).join(' | ');
  if (!words.every(w => hay.includes(w))) return null;
  return hay.length;
}

export function searchCourse(query: string, index: CourseIndex, limit = 8): Item[] {
  const words = wordsOf(query);
  if (!words.length) return [];
  return [...index.entries.values()]
    .map(e => ({ item: e.item, score: matches(words, e.item.fr, e.item.t) }))
    .filter((x): x is { item: Item; score: number } => x.score !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(x => x.item);
}

export function searchHistory(query: string, history: Translation[]): Translation[] {
  const words = wordsOf(query);
  if (!words.length) return history;
  return history.filter(t => matches(words, t.fr, t.t) !== null);
}
