/**
 * The photo behind the « Imagine » step: the destination seen from where a traveller would stand.
 * Files come from Wikimedia Commons under free licenses; brand/photos.py fetches and crops them and
 * copies each author and license from Commons into photos.json, so the credit always matches.
 */
import { courseById, pictureOf } from '../content/index.ts';
import list from './photos.json' with { type: 'json' };

export interface Photo {
  id: string;
  alt: string;
  focus: number;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}

const PHOTOS: Record<string, Omit<Photo, 'id'>> = list;

export function photoOf(courseId: string, regionId: string): Photo | undefined {
  const id = pictureOf(courseById(courseId), regionId);
  const photo = PHOTOS[id];
  return photo ? { id, ...photo } : undefined;
}

/** Phones held upright get a 9:16 crop around the landmark instead of a sliver of the wide frame. */
export const PORTRAIT = '(orientation: portrait)';

/** `base`: the app's folder; the build passes its own, outside the app. */
export function photoFiles(id: string, base: string = import.meta.env.BASE_URL) {
  const file = (variant: string) => `${base}photos/${id}-${variant}.webp`;
  return { portrait: file('portrait'), fallback: file('1280'), srcset: `${file('1280')} 1280w, ${file('1920')} 1920w` };
}

/** Starts the download a step ahead, so the photo is already there when the step opens. */
export function preload(photo: Photo): void {
  const files = photoFiles(photo.id);
  const image = new Image();
  if (matchMedia(PORTRAIT).matches) {
    image.src = files.portrait;
  } else {
    image.sizes = '100vw';
    image.srcset = files.srcset;
  }
}
