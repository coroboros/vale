/**
 * Word by word, which words of the phrase a speech recogniser heard. Recognition with explicit
 * corrective feedback is what makes it help pronunciation (Ngo, Chen & Lai, 2024, docs/LEARNING.md).
 */
import { normalize, stripAccents } from './grade';

interface HeardWord {
  /** Punctuation around the word, shown as is. */
  pre: string;
  word: string;
  post: string;
  /** None on punctuation, on the unsaid side of "francés / francesa", on an unsaid "a…". */
  mark?: 'heard' | 'missed';
}

export interface SpeechCheck {
  words: HeardWord[];
  /** The transcript that matched best, as the recogniser wrote it. */
  heard: string;
  all: boolean;
  ok: boolean;
}

/** Number words, from the course: recognisers write "2" where the phrase says "dos". */
type Spell = (n: number) => string;

const AROUND = /^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u;

/** Accents and elisions are spelling, not sound. */
const keys = (text: string, spell: Spell): string[] =>
  normalize(text.replace(/€/g, ' euro '))
    .split(' ')
    .filter(Boolean)
    .flatMap(w => (/^\d+$/.test(w) ? normalize(spell(Number(w))).split(' ') : [w]))
    .map(w =>
      stripAccents(w)
        .replace(/'/g, '')
        .replace(/^euros$/, 'euro'),
    );

/** Order is free: a recogniser formats "cuatro euros con veinte" as "4,20 €". */
function heardIn(words: string[][], transcript: string, spell: Spell): boolean[] {
  const bag = new Map<string, number>();
  for (const k of keys(transcript, spell)) bag.set(k, (bag.get(k) ?? 0) + 1);
  const take = (k: string) => {
    const left = bag.get(k) ?? 0;
    if (left) bag.set(k, left - 1);
    return left > 0;
  };
  return words.map(w => w.length > 0 && w.every(take));
}

export function checkSpeech(target: string, transcripts: readonly string[], spell: Spell): SpeechCheck {
  const chunks = target
    .replace(/\s*\/\s*/g, ' / ')
    .split(/\s+/)
    .filter(Boolean);
  const words: HeardWord[] = [];
  const wordKeys: string[][] = [];
  const optional = new Set<number>();
  const pairs: [number, number][] = [];
  chunks.forEach((chunk, i) => {
    if (chunk === '/') {
      if (i > 0 && i < chunks.length - 1) pairs.push([words.length - 1, words.length + 1]);
      words.push({ pre: '', word: '', post: '/' });
      wordKeys.push([]);
      return;
    }
    const [, pre = '', word = '', post = ''] = AROUND.exec(chunk) ?? [];
    if (/…|\.\.\./.test(post)) optional.add(words.length);
    words.push({ pre, word, post });
    wordKeys.push(word ? keys(word, spell) : []);
  });

  const tries = (transcripts.length ? transcripts : ['']).map(t => ({ t, heard: heardIn(wordKeys, t, spell) }));
  const count = (h: boolean[]) => h.filter(Boolean).length;
  const best = tries.reduce((a, b) => (count(b.heard) > count(a.heard) ? b : a));

  const paired = new Map<number, number>();
  for (const [a, b] of pairs) {
    paired.set(a, b);
    paired.set(b, a);
  }
  const slots: number[][] = [...pairs];
  wordKeys.forEach((k, i) => {
    if (k.length && !paired.has(i) && !optional.has(i)) slots.push([i]);
  });
  words.forEach((w, i) => {
    if (!wordKeys[i]!.length) return;
    const partner = paired.get(i);
    if (best.heard[i]) w.mark = 'heard';
    else if (!optional.has(i) && !(partner !== undefined && best.heard[partner])) w.mark = 'missed';
  });
  const misses = slots.filter(s => !s.some(i => best.heard[i])).length;
  return {
    words,
    heard: best.t,
    all: misses === 0,
    // Lenient on purpose: recognisers drop short words even from native speakers, and a wrong
    // "missed" discourages more than a lenient pass.
    ok: misses <= Math.floor(slots.length / 4),
  };
}
