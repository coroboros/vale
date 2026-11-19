/**
 * The survival card as a picture to send: the destination's drawing with Bernard, then each phrase
 * in the local language over its French. Fonts and colours are read from the page, so the picture
 * follows tokens.css and the trip's theme.
 */
import { render, type VNode } from 'preact';
import { BRAND } from '../brand';

interface CardPhrase {
  t: string;
  fr: string;
  hero?: boolean;
}

const W = 1080;
const PAD = 72;
const VIEW_H = 720;
const BERNARD = 240;

/** Breaks at ordinary spaces only: the non-breaking ones keep French punctuation on its word. */
function wrap(ctx: CanvasRenderingContext2D, font: string, text: string, width: number): string[] {
  ctx.font = font;
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  return line ? [...lines, line] : lines;
}

const settle = (ms: number) => new Promise<void>(done => setTimeout(done, ms));

/**
 * An SVG drawn as an image sees no page styles, so its colour variables are resolved first. A data
 * URL, loaded through its events: Safari taints a canvas that drew an SVG from a blob URL, and its
 * decode() never settles for SVG (WebKit bugs 134503, 198527). A drawing that does not load is left
 * out rather than holding the whole card back.
 */
async function drawSvg(
  ctx: CanvasRenderingContext2D,
  node: VNode,
  css: CSSStyleDeclaration,
  [x, y, w, h]: [x: number, y: number, w: number, h: number],
) {
  const host = document.createElement('div');
  render(node, host);
  const svg = host.querySelector('svg');
  if (!svg) return;
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h));
  const xml = new XMLSerializer()
    .serializeToString(svg)
    .replace(/var\((--[\w-]+)\)/g, (_, name: string) => css.getPropertyValue(name).trim());
  render(null, host);
  const img = new Image();
  const loaded = new Promise<boolean>(done => {
    img.onload = () => done(true);
    img.onerror = () => done(false);
    void settle(3000).then(() => done(false));
  });
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  if (await loaded) ctx.drawImage(img, x, y, w, h);
}

export async function cardPicture({
  view,
  bernard,
  title,
  phrases,
}: {
  /** The destination's drawing and Bernard, as their SVG components. */
  view: VNode;
  bernard: VNode;
  title: string;
  phrases: readonly CardPhrase[];
}): Promise<File> {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const display = v('--font-display');
  const body = v('--font-text');
  const font = {
    kicker: `700 34px ${body}`,
    title: `800 88px ${display}`,
    hero: `800 62px ${display}`,
    t: `700 50px ${display}`,
    fr: `400 36px ${body}`,
    mark: `800 54px ${display}`,
    foot: `400 32px ${body}`,
  };
  // Fonts still loading after a moment give way to the fallbacks rather than to an endless wait.
  await Promise.race([Promise.all(Object.values(font).map(f => document.fonts.load(f))), settle(2000)]);

  const measure = document.createElement('canvas').getContext('2d')!;
  const draws: ((ctx: CanvasRenderingContext2D) => void)[] = [];
  const write = (lines: string[], f: string, color: string, top: number, lineHeight: number) => {
    draws.push(ctx => {
      ctx.font = f;
      ctx.fillStyle = color;
      for (const [i, line] of lines.entries()) ctx.fillText(line, PAD, top + i * lineHeight);
    });
    return top + lines.length * lineHeight;
  };

  let y = VIEW_H + 64;
  y = write(['Ma carte de voyage'], font.kicker, v('--ink-soft'), y, 44);
  y = write(wrap(measure, font.title, title, W - 2 * PAD), font.title, v('--ink'), y + 4, 96) + 40;
  phrases.forEach((p, i) => {
    const width = W - 2 * PAD - (p.hero ? 80 : 0);
    const t = wrap(measure, p.hero ? font.hero : font.t, p.t, width);
    const fr = wrap(measure, font.fr, p.fr, width);
    if (p.hero) {
      const top = y;
      const height = 40 + t.length * 72 + 12 + fr.length * 48 + 40;
      draws.push(ctx => {
        ctx.fillStyle = v('--accent-soft');
        ctx.beginPath();
        ctx.roundRect(PAD - 40, top, W - 2 * PAD + 80, height, 40);
        ctx.fill();
      });
      write(t, font.hero, v('--ink'), top + 40, 72);
      write(fr, font.fr, v('--ink-soft'), top + 40 + t.length * 72 + 12, 48);
      y = top + height + 36;
      return;
    }
    if (i > 0 && !phrases[i - 1]?.hero) {
      const rule = y;
      draws.push(ctx => {
        ctx.fillStyle = v('--line');
        ctx.fillRect(PAD, rule, W - 2 * PAD, 2);
      });
      y += 36;
    }
    y = write(t, font.t, v('--ink'), y, 62) + 10;
    y = write(fr, font.fr, v('--ink-soft'), y, 48) + 36;
  });
  y = write([BRAND.name.toLowerCase()], font.mark, v('--ink'), y + 40, 64);
  y = write(
    [BRAND.tagline, BRAND.url.replace(/^https?:\/\//, '').replace(/\/$/, '')],
    font.foot,
    v('--ink-soft'),
    y,
    44,
  );

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = y + PAD;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = v('--page');
  ctx.fillRect(0, 0, W, canvas.height);
  await drawSvg(ctx, view, css, [0, 0, W, VIEW_H]);
  await drawSvg(ctx, bernard, css, [W - PAD - BERNARD, VIEW_H - BERNARD * 0.6, BERNARD, BERNARD * 0.85]);
  ctx.textBaseline = 'top';
  for (const draw of draws) draw(ctx);
  const blob = await new Promise<Blob | null>(done => canvas.toBlob(done, 'image/png'));
  if (!blob) throw new Error('The card could not be drawn.');
  return new File([blob], `${BRAND.name.toLowerCase()}-ma-carte.png`, { type: 'image/png' });
}
