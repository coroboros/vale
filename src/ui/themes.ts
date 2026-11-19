/**
 * Each trip wears its country's colours (`flagOf`): the accent comes from the flag, the full flag
 * goes on Bernard's shell. Red stays the colour of wrong answers, so it appears only inside flags,
 * never on buttons: Portugal's flag is mostly red, so its accent is the blue of its azulejos, and
 * the United States' is the blue of its canton. Contrast pairs are checked by
 * tests/unit/themes.test.ts (WCAG 2.2 AA).
 */
import type { Flag } from '../content/types';

export interface Theme {
  id: Flag;
  /** Fill of primary actions and progress. */
  accent: string;
  /** Pressed edge and shadow of accent surfaces. */
  accentDeep: string;
  /** Text and icons drawn on `accent`. */
  onAccent: string;
  /** Accent used as text on white. */
  accentInk: string;
  /** Tinted backgrounds. */
  accentSoft: string;
  /** The flag's second colour, for small marks such as avatars. */
  motif: string;
}

export const THEMES: Record<Flag, Theme> = {
  es: {
    id: 'es',
    accent: '#F1BF00',
    accentDeep: '#C29200',
    onAccent: '#16213E',
    accentInk: '#8A5300',
    accentSoft: '#FFF4CC',
    motif: '#AA151B',
  },
  it: {
    id: 'it',
    accent: '#007A3D',
    accentDeep: '#00572B',
    onAccent: '#FFFFFF',
    accentInk: '#006B35',
    accentSoft: '#E1F2E7',
    motif: '#CE2B37',
  },
  pt: {
    id: 'pt',
    accent: '#1D5FBF',
    accentDeep: '#123F85',
    onAccent: '#FFFFFF',
    accentInk: '#1A56AD',
    accentSoft: '#E2ECFA',
    motif: '#046A38',
  },
  gb: {
    id: 'gb',
    accent: '#012169',
    accentDeep: '#000F3D',
    onAccent: '#FFFFFF',
    accentInk: '#012169',
    accentSoft: '#E5E9F5',
    motif: '#C8102E',
  },
  ie: {
    id: 'ie',
    accent: '#1FA36A',
    accentDeep: '#127A4E',
    onAccent: '#16213E',
    accentInk: '#0B6B42',
    accentSoft: '#DFF3E9',
    motif: '#FF883E',
  },
  us: {
    id: 'us',
    accent: '#3C3B6E',
    accentDeep: '#24234A',
    onAccent: '#FFFFFF',
    accentInk: '#3C3B6E',
    accentSoft: '#E8E8F3',
    motif: '#B22234',
  },
};
export function themeVars(theme: Theme): Record<string, string> {
  return {
    '--accent': theme.accent,
    '--accent-deep': theme.accentDeep,
    '--on-accent': theme.onAccent,
    '--accent-ink': theme.accentInk,
    '--accent-soft': theme.accentSoft,
    '--motif': theme.motif,
  };
}

export function applyTheme(theme: Theme): void {
  for (const [k, v] of Object.entries(themeVars(theme))) document.documentElement.style.setProperty(k, v);
}
