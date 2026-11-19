/**
 * Situation pages: what travellers search for before leaving, answered by a lesson of each course
 * and the scene that follows it on the itinerary. `build/pages.ts` writes them as static pages
 * next to the app (docs/SEARCH.md).
 */
import type { Course, Scene } from './types';

export interface Situation {
  /** The lesson that answers it, the same id in every course. */
  lesson: string;
  slug: string;
  /** For links between pages. */
  title: string;
  /** As people type it; {langue} becomes the course's language, « espagnol ». */
  question: string;
}

export const SITUATIONS: readonly Situation[] = [
  { lesson: 'base', slug: 'dire-bonjour', title: 'Dire bonjour', question: 'Comment dire bonjour en {langue} ?' },
  {
    lesson: 'bar',
    slug: 'commander-un-cafe',
    title: 'Commander un café',
    question: 'Comment commander un café en {langue} ?',
  },
  {
    lesson: 'resto',
    slug: 'commander-au-restaurant',
    title: 'Commander au restaurant',
    question: 'Comment commander au restaurant en {langue} ?',
  },
  {
    lesson: 'ville',
    slug: 'acheter-un-billet-de-train',
    title: 'Acheter un billet de train',
    question: 'Comment acheter un billet de train en {langue} ?',
  },
  {
    lesson: 'hotel',
    slug: 'arriver-a-l-hotel',
    title: 'Arriver à l’hôtel',
    question: 'Que dire en arrivant à l’hôtel en {langue} ?',
  },
  {
    lesson: 'urgences',
    slug: 'demander-de-l-aide',
    title: 'Demander de l’aide',
    question: 'Comment demander de l’aide en {langue} ?',
  },
];

export const languageOf = (course: Course) => course.name.toLowerCase();

/** Relative to the app's folder, like every address in the build. */
export const pagePath = (course: Course, situation: Situation) => `${languageOf(course)}/${situation.slug}/`;

export const questionOf = (course: Course, situation: Situation) =>
  situation.question.replace('{langue}', languageOf(course));

/** The scene right after the lesson on the itinerary, where its phrases are used. */
export function sceneAfter(course: Course, lessonId: string): Scene | undefined {
  for (const unit of course.units) {
    const i = unit.steps.findIndex(s => s.kind === 'lesson' && s.id === lessonId);
    const next = unit.steps[i + 1];
    if (i >= 0 && next?.kind === 'scene') return course.scenes.find(s => s.id === next.id);
  }
  return undefined;
}
