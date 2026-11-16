/** Brand identity: the single place to rename the product or retune its core colours. */
export const BRAND = {
  name: 'Bagage',
  tagline: 'Parle dès l’atterrissage.',
  promise: ['Hors ligne', 'Sans compte', 'Sans pub'] as const,
  mascot: 'Bernard',
  /** Deployed URL, used when the app runs inside a frame that cannot install it. */
  url: 'https://coroboros.github.io/vale/',
} as const;

/** Colours needed outside CSS (manifest, browser chrome). Must match --page in styles/tokens.css. */
export const COLORS = {
  page: '#FFFAF3',
} as const;
