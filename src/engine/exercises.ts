import { type CourseIndex, itemKey } from '../content';
import type { Item } from '../content/types';
import { tokens } from './grade';
import { type Rng, shuffle } from './random';

export type Kind = 'guess' | 'learn' | 'reco' | 'listen' | 'pick' | 'tilesFr' | 'tilesTarget' | 'dictation' | 'speak';

/** 0 = recognise, 1 = recall with support, 2 = produce. Guess and learn introduce an item. */
export const TIER: Record<Kind, number> = {
  guess: -1,
  learn: -1,
  reco: 0,
  listen: 0,
  pick: 1,
  tilesFr: 1,
  tilesTarget: 2,
  dictation: 2,
  speak: 2,
};

/**
 * Expected success on a well-remembered item, by format. Multiplied by predicted recall, it aims
 * each exercise at about 85 % success.
 */
export const EASE: Record<Kind, number> = {
  guess: 1,
  learn: 1,
  reco: 0.97,
  listen: 0.9,
  pick: 0.94,
  tilesFr: 0.93,
  tilesTarget: 0.83,
  dictation: 0.74,
  speak: 0.86,
};

export const GRADED: readonly Kind[] = ['reco', 'listen', 'pick', 'tilesFr', 'tilesTarget', 'dictation', 'speak'];
export const NEEDS_AUDIO: readonly Kind[] = ['listen', 'dictation'];

export interface Card {
  key: string;
  item: Item;
  lang: string;
}

export type Exercise =
  | { kind: 'learn'; card: Card }
  | { kind: 'guess' | 'reco' | 'listen' | 'pick'; card: Card; options: string[]; answer: string }
  | { kind: 'tilesFr' | 'tilesTarget'; card: Card; tiles: string[]; answer: string[] }
  | { kind: 'dictation' | 'speak'; card: Card }
  | { kind: 'match'; cards: Card[] };

export const cardOf = (index: CourseIndex, item: Item): Card => ({
  key: itemKey(index.course.id, item.id),
  item,
  lang: index.entries.get(item.id)?.lang ?? index.course.lang,
});

const tileable = (text: string) => !/[/()…]/.test(text) && tokens(text).length >= 2 && tokens(text).length <= 8;

export function canBuild(kind: Kind, card: Card): boolean {
  if (kind === 'tilesFr') return !card.item.kind && tileable(card.item.fr);
  if (kind === 'tilesTarget') return !card.item.kind && tileable(card.item.t);
  if (kind === 'dictation') return card.item.t.length <= 40;
  return true;
}

function rivals(index: CourseIndex, card: Card, field: 't' | 'fr', rng: Rng): Item[] {
  const own = card.item;
  const source = index.entries.get(own.id)?.source;
  const pool = [...index.entries.values()].filter(
    e =>
      e.lang === card.lang &&
      e.item.id !== own.id &&
      e.item[field] !== own[field] &&
      !(own.syn && e.item.syn === own.syn),
  );
  const score = (item: Item) =>
    (own.kind ? (item.kind === own.kind ? 0 : 4) : item.kind ? 3 : 0) +
    (index.entries.get(item.id)?.source === source ? 0 : 1);
  return shuffle(rng, pool)
    .map(e => e.item)
    .sort((a, b) => score(a) - score(b));
}

function options(index: CourseIndex, card: Card, field: 't' | 'fr', rng: Rng): string[] {
  const picked = new Set<string>([card.item[field]]);
  for (const item of rivals(index, card, field, rng)) {
    if (picked.size >= 4) break;
    picked.add(item[field]);
  }
  return shuffle(rng, [...picked]);
}

function tiles(index: CourseIndex, card: Card, field: 't' | 'fr', rng: Rng): { tiles: string[]; answer: string[] } {
  const answer = tokens(card.item[field]);
  const taken = new Set(answer.map(w => w.toLowerCase()));
  const extra: string[] = [];
  for (const item of rivals(index, card, field, rng)) {
    for (const word of tokens(item[field])) {
      if (extra.length >= Math.max(3, 9 - answer.length)) break;
      if (!taken.has(word.toLowerCase())) {
        taken.add(word.toLowerCase());
        extra.push(word);
      }
    }
  }
  return { tiles: shuffle(rng, [...answer, ...extra]), answer };
}

export function build(kind: Kind, card: Card, index: CourseIndex, rng: Rng): Exercise {
  switch (kind) {
    case 'learn':
    case 'dictation':
    case 'speak':
      return { kind, card };
    case 'guess':
    case 'reco':
      return { kind, card, options: options(index, card, 'fr', rng), answer: card.item.fr };
    case 'listen':
    case 'pick':
      return { kind, card, options: options(index, card, 't', rng), answer: card.item.t };
    case 'tilesFr':
      return { kind, card, ...tiles(index, card, 'fr', rng) };
    case 'tilesTarget':
      return { kind, card, ...tiles(index, card, 't', rng) };
  }
}
