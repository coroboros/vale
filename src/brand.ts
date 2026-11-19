/** The one place to rename the product or retune its core colours. */
export const BRAND = {
  name: 'Bagage',
  tagline: 'Parle dès l’atterrissage.',
  /** What Bagage is, for search results, shared links and the manifest. */
  headline: 'Les phrases de survie pour voyager',
  languages: 'espagnol, italien, portugais, anglais',
  promise: ['Hors ligne', 'Sans compte', 'Sans pub'] as const,
  mascot: 'Bernard',
  /**
   * Deployed URL: canonical addresses, the sitemap, shared links, and the app inside a frame that
   * cannot install it.
   */
  url: 'https://coroboros.github.io/vale/',
} as const;

/**
 * Proves to IndexNow (Bing, Yandex, Naver, Seznam) that the addresses under `BRAND.url` are ours, from
 * a file of that name beside the app (build/pages.ts): public by design, like a site verification file.
 */
export const INDEXNOW_KEY = '3052ad8d5d8372cb5fde79a71872af42';

/** « Hors ligne, sans compte, sans pub. » */
export const promiseLine = () => `${BRAND.promise.map((p, i) => (i ? p.toLowerCase() : p)).join(', ')}.`;

export const description = () => `${BRAND.headline} : ${BRAND.languages}. ${promiseLine()}`;

/** « Bagage : les phrases de survie pour voyager », the app's title in search results and shared links. */
export const appTitle = () => `${BRAND.name} : ${BRAND.headline.charAt(0).toLowerCase()}${BRAND.headline.slice(1)}`;

/**
 * Colours needed outside CSS (manifest, browser chrome). Must match --page in styles/tokens.css.
 */
export const COLORS = {
  page: '#FFFAF3',
} as const;
