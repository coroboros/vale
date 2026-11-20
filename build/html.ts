/** Writing the static HTML beside the app (build/pages.ts, build/welcome.ts, build/legal.ts). */
import type { Flag } from '../src/content/types.ts';
import { THEMES, themeVars } from '../src/ui/themes.ts';
import { frenchProse } from './french-spaces.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
export const esc = (s: string) => s.replace(/[&<>"]/g, c => ESCAPES[c]!);

/** The build's French spacing never reaches the build's own strings or the content they read: done here. */
export const t = (s: string) => esc(frenchProse(s));

/** A country's colours in a style attribute, there before any script. */
export const themeStyle = (flag: Flag) =>
  Object.entries(themeVars(THEMES[flag]))
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');
