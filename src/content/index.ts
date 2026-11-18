import { es } from './courses/es';
import { it } from './courses/it';
import type { Course, Item, Lesson, Pack, Scene } from './types';

export const COURSES: readonly Course[] = [es, it];

export const courseById = (id: string): Course => COURSES.find(c => c.id === id) ?? es;

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
