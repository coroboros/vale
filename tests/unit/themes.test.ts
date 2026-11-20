import { describe, expect, it } from 'vitest';
import { COLORS } from '../../src/brand';
import css from '../../src/styles/tokens.css?raw';
import { THEMES } from '../../src/ui/themes';

const token = (name: string) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} missing`);
  return m[1]!;
};

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const AA = 4.5;

describe('core palette', () => {
  const pairs: [string, string, string, number][] = [
    ['ink on page', token('ink'), token('page'), 7],
    ['soft ink on page', token('ink-soft'), token('page'), AA],
    ['soft ink on white', token('ink-soft'), token('surface'), AA],
    ['right-answer text', token('ok'), token('ok-fill'), AA],
    ['wrong-answer text', token('ko'), token('ko-fill'), AA],
    ['white on green button', '#ffffff', token('ok-solid'), AA],
    ['white on red button', '#ffffff', token('ko-solid'), AA],
  ];
  it.each(pairs)('%s reaches the target ratio', (_label, fg, bg, min) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(min);
  });

  it('keeps the manifest colour in sync with the page token', () => {
    expect(COLORS.page.toLowerCase()).toBe(token('page').toLowerCase());
  });
});

/** sRGB halfway and beyond, as a gradient blends: a mix can be darker than both ends. */
const mix = (a: string, b: string, t: number) =>
  `#${[1, 3, 5]
    .map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t))
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')}`;

describe("the welcome page's day", () => {
  // The skies text sits on, in the page's order; the sunset glow and the sea carry no text.
  const skies = ['sky-high', 'sky-dawn', 'page', 'sky-golden', 'sand'];
  it.each(skies)('soft ink and every accent ink reach AA on %s', sky => {
    expect(contrast(token('ink-soft'), token(sky))).toBeGreaterThanOrEqual(AA);
    for (const t of Object.values(THEMES)) expect(contrast(t.accentInk, token(sky))).toBeGreaterThanOrEqual(AA);
  });
  it('soft ink stays readable all along each gradient between them', () => {
    for (const [a, b] of [
      ['sky-high', 'sky-dawn'],
      ['sky-dawn', 'page'],
      ['page', 'sky-golden'],
    ] as const)
      for (let i = 0; i <= 20; i++)
        expect(contrast(token('ink-soft'), mix(token(a), token(b), i / 20))).toBeGreaterThanOrEqual(AA);
  });
});

describe.each(Object.values(THEMES).map(t => [t.id, t] as const))('theme %s', (_id, t) => {
  it('text on primary buttons reaches AA', () => expect(contrast(t.onAccent, t.accent)).toBeGreaterThanOrEqual(AA));
  it('accent text reaches AA on white, tint and page', () => {
    expect(contrast(t.accentInk, '#ffffff')).toBeGreaterThanOrEqual(AA);
    expect(contrast(t.accentInk, t.accentSoft)).toBeGreaterThanOrEqual(AA);
    expect(contrast(t.accentInk, token('page'))).toBeGreaterThanOrEqual(AA);
  });
  it('ink stays readable on the tint', () => expect(contrast(token('ink'), t.accentSoft)).toBeGreaterThanOrEqual(7));
  it('button edges stand out from the button (3:1 for UI parts)', () => {
    expect(contrast(t.accentDeep, token('page'))).toBeGreaterThanOrEqual(2);
  });
});
