/**
 * Red and green hues are reserved for answer feedback, so no accent uses them. Contrast pairs are
 * checked by tests/unit/themes.test.ts (WCAG 2.2 AA).
 */
export interface Theme {
  id: string;
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
  /** Second colour of the shell motif. */
  motif: string;
  pattern: 'tiles' | 'waves' | 'azulejo' | 'checks';
}

export const THEMES: Record<string, Theme> = {
  sol: {
    id: 'sol',
    accent: '#FFB21E',
    accentDeep: '#D98A00',
    onAccent: '#16213E',
    accentInk: '#8A5300',
    accentSoft: '#FFF3D6',
    motif: '#2357C6',
    pattern: 'tiles',
  },
  laguna: {
    id: 'laguna',
    accent: '#0B7C8C',
    accentDeep: '#075A66',
    onAccent: '#FFFFFF',
    accentInk: '#0A6B79',
    accentSoft: '#DDF3F5',
    motif: '#F2C230',
    pattern: 'waves',
  },
  azulejo: {
    id: 'azulejo',
    accent: '#1D5FBF',
    accentDeep: '#123F85',
    onAccent: '#FFFFFF',
    accentInk: '#1A56AD',
    accentSoft: '#E2ECFA',
    motif: '#F4B400',
    pattern: 'azulejo',
  },
  tamise: {
    id: 'tamise',
    accent: '#6A4CB0',
    accentDeep: '#4A3387',
    onAccent: '#FFFFFF',
    accentInk: '#5E42A4',
    accentSoft: '#EEE8F8',
    motif: '#F2C230',
    pattern: 'checks',
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
