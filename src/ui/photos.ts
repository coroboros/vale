/**
 * The photo behind the « Imagine » step: the destination seen from where a traveller would stand.
 * Files come from Wikimedia Commons under free licenses; brand/photos.py fetches and crops them and
 * copies each author and license from Commons into photos.json, so the credit always matches.
 */
import list from './photos.json';

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

/** « Ailleurs » names no place, so it shows the one most travellers picture for the country. */
const ELSEWHERE: Record<string, string> = { es: 'andalousie', it: 'roma', pt: 'lisbonne', en: 'londres' };

export function photoOf(courseId: string, regionId: string): Photo | undefined {
  const id = regionId === 'autre' ? ELSEWHERE[courseId] : regionId;
  const photo = id ? PHOTOS[id] : undefined;
  return id && photo ? { id, ...photo } : undefined;
}

/** Phones held upright get a 9:16 crop around the landmark instead of a sliver of the wide frame. */
export const PORTRAIT = '(orientation: portrait)';

const file = (id: string, variant: string) => `${import.meta.env.BASE_URL}photos/${id}-${variant}.webp`;

export const photoFiles = (id: string) => ({
  portrait: file(id, 'portrait'),
  fallback: file(id, '1280'),
  srcset: `${file(id, '1280')} 1280w, ${file(id, '1920')} 1920w`,
});

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
