/** The one place to configure the product: its name and words, its address, who publishes and hosts it. */
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

export const siteUrl = (path: string) => new URL(path, BRAND.url).href;

/**
 * Who publishes Bagage, on « Mentions légales » and « Confidentialité » as the law asks: in France,
 * article 1-1 of the LCEN; for a UK company or LLP, its trading disclosures (SI 2015/17, reg. 25)
 * and the E-Commerce Regulations 2002 (reg. 6). Public by law, so kept here with the rest; while
 * `name` is empty the pages say the publisher is named before launch (docs/UX.md, « The legal
 * pages »).
 */
export const PUBLISHER = {
  /** As registered: « Exemple LLP », or a person's first names and name. */
  name: '',
  /** Legal form, register and number: « limited liability partnership immatriculée en Angleterre et au pays de Galles sous le n° OC000000 ». */
  registration: '',
  /** The registered office, or a person's home address. */
  address: '',
  /** Read by the publisher: anyone writes there, requests about data included. */
  email: '',
  phone: '',
  /** Only when registered for VAT. */
  vat: '',
  /** The director of publication, a person. */
  director: '',
  /** Its representative in the EU (GDPR, article 27), when the publisher is outside it and names one. */
  representative: '',
};

export type Publisher = typeof PUBLISHER;

/** Who serves the site, for « Mentions légales »; Cloudflare unless the deploy says GitHub Pages (SITE_HOST). */
export const HOSTS = {
  cloudflare: {
    name: 'Cloudflare, Inc.',
    address: '101 Townsend Street, San Francisco, CA 94107, États-Unis',
    phone: '+1 650 319 8930',
    privacy: 'https://www.cloudflare.com/fr-fr/privacypolicy/',
  },
  'github-pages': {
    name: 'GitHub, Inc.',
    address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
    phone: '+1 877 448 4820',
    privacy: 'https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement',
  },
} as const;

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
