import { type CourseIndex, itemKey } from '../content';
import type { Item } from '../content/types';
import type { ProfileData, Translation } from '../state/schema';
import { type Card, cardOf } from './exercises';
import { recall } from './memory';
import type { Mode, PoolCard } from './session';

const NEW_PER_LESSON = 5;
const INTERLEAVED = 2;
const REVIEW_SIZE = 12;

const phraseCard = (index: CourseIndex, t: Translation): Card => ({
  key: itemKey(index.course.id, `user-${t.id}`),
  item: { id: `user-${t.id}`, t: t.t, ph: t.ph, fr: t.fr, note: t.note || undefined },
  lang: index.course.lang,
});

export interface PoolInput {
  index: CourseIndex;
  data: ProfileData;
  now: number;
  /** Fragile practice aims at this moment: the departure. */
  horizon: number;
}

export function buildPool(mode: Mode, input: PoolInput): PoolCard[] {
  const { index, data, now } = input;
  const course = index.course;
  const toPool = (card: Card): PoolCard => {
    const mem = data.mem[card.key];
    return { card, recall: recall(mem, now), isNew: !mem };
  };
  const known = (items: Item[]) => items.map(i => toPool(cardOf(index, i))).filter(p => !p.isNew);
  const saved = data.translations.filter(t => t.saved && t.course === course.id).map(t => toPool(phraseCard(index, t)));
  const byRecall = (a: PoolCard, b: PoolCard) => a.recall - b.recall;

  switch (mode.kind) {
    case 'lesson':
    case 'pack': {
      const items =
        mode.kind === 'lesson'
          ? (index.lessons.get(mode.lessonId)?.items ?? [])
          : (course.packs.find(p => p.id === mode.packId)?.items ?? []);
      const pool = items.map(i => toPool(cardOf(index, i)));
      const fresh = pool.filter(p => p.isNew).slice(0, NEW_PER_LESSON);
      if (!fresh.length) return pool.sort(byRecall).slice(0, REVIEW_SIZE);
      const ids = new Set(items.map(i => i.id));
      const interleaved = known(index.coreItems.filter(i => !ids.has(i.id)))
        .sort(byRecall)
        .slice(0, INTERLEAVED);
      const warmup = pool
        .filter(p => !p.isNew)
        .sort(byRecall)
        .slice(0, 2);
      return [...warmup, ...interleaved, ...fresh];
    }
    case 'test': {
      const items = index.lessons.get(mode.lessonId)?.items ?? [];
      return items.map(i => toPool(cardOf(index, i)));
    }
    case 'review': {
      const unit = course.units.find(u => u.id === mode.unitId);
      const lessonIds = unit
        ? unit.steps.flatMap(s => (s.kind === 'lesson' ? [s.id] : []))
        : course.lessons.map(l => l.id);
      const items = lessonIds.flatMap(id => index.lessons.get(id)?.items ?? []);
      return [...known(items), ...(unit ? [] : saved)].sort(byRecall).slice(0, REVIEW_SIZE);
    }
    case 'practice': {
      const all = [...known(index.coreItems), ...known(course.packs.flatMap(p => p.items)), ...saved];
      if (mode.focus === 'mistakes') {
        return all
          .filter(p => (data.mistakes[p.card.key] ?? 0) > 0)
          .sort((a, b) => (data.mistakes[b.card.key] ?? 0) - (data.mistakes[a.card.key] ?? 0))
          .slice(0, 10);
      }
      if (mode.focus === 'fragile') {
        const at = (p: PoolCard) => recall(data.mem[p.card.key], input.horizon);
        return all.sort((a, b) => at(a) - at(b)).slice(0, 10);
      }
      return all.sort(byRecall).slice(0, 10);
    }
  }
}
