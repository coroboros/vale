import { en } from './courses/en.ts';
import { es } from './courses/es.ts';
import { it } from './courses/it.ts';
import { pt } from './courses/pt.ts';
import type { Course, Currency, Flag, Item, Lesson, Pack, Region, Scene } from './types';

export const COURSES: readonly Course[] = [es, it, pt, en];

export const courseById = (id: string): Course => COURSES.find(c => c.id === id) ?? es;

/** The region, or the course's « Ailleurs », which every course has (tested). */
export const regionOf = (course: Course, id: string): Region =>
  course.regions.find(r => r.id === id) ?? course.regions.find(r => r.id === 'autre')!;

/** The destination whose photo and drawing show a trip. */
export function pictureOf(course: Course, regionId: string): string {
  const region = regionOf(course, regionId);
  return region.emblem ?? region.id;
}

/** The country a trip wears: theme colours and Bernard's shell. */
export const flagOf = (course: Course, regionId: string): Flag => regionOf(course, regionId).flag ?? course.flag;

/**
 * The welcome's destinations, each language first: its window flies over them, and the welcome
 * page sends a postcard from each language's first one.
 */
export const WELCOME_TRIP = [
  ['es', 'barcelone'],
  ['it', 'roma'],
  ['pt', 'lisbonne'],
  ['en', 'londres'],
  ['es', 'andalousie'],
  ['it', 'venezia'],
] as const;

const CURRENCY: Record<Flag, Currency> = { es: '€', it: '€', pt: '€', gb: '£', ie: '€', us: '$' };

/** The money of the trip's country: Dublin pays in euros, New York in dollars. */
export const currencyOf = (course: Course, regionId: string): Currency => CURRENCY[flagOf(course, regionId)];

export interface Entry {
  item: Item;
  source: Lesson | Pack;
  lang: string;
}

export interface CourseIndex {
  course: Course;
  entries: Map<string, Entry>;
  lessons: Map<string, Lesson>;
  scenes: Map<string, Scene>;
  /** Path order, regional packs excluded. */
  coreItems: Item[];
}

const indexes = new Map<string, CourseIndex>();

export function indexOf(course: Course): CourseIndex {
  const cached = indexes.get(course.id);
  if (cached) return cached;
  const entries = new Map<string, Entry>();
  for (const lesson of course.lessons)
    for (const item of lesson.items) entries.set(item.id, { item, source: lesson, lang: course.lang });
  for (const pack of course.packs)
    for (const item of pack.items) entries.set(item.id, { item, source: pack, lang: pack.lang });
  const index: CourseIndex = {
    course,
    entries,
    lessons: new Map(course.lessons.map(l => [l.id, l])),
    scenes: new Map(course.scenes.map(s => [s.id, s])),
    coreItems: course.lessons.flatMap(l => l.items),
  };
  indexes.set(course.id, index);
  return index;
}

/** Unique across courses. */
export const itemKey = (courseId: string, itemId: string) => `${courseId}:${itemId}`;

export const splitKey = (key: string): [courseId: string, itemId: string] => {
  const at = key.indexOf(':');
  return [key.slice(0, at), key.slice(at + 1)];
};
