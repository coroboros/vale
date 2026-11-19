/**
 * Draws the picture that shared links and search results show for Bagage (public/og.png, 1200 by
 * 630, the size Open Graph readers expect): Bernard on the brand blue, as on the app icon, so the
 * link is recognised as the app people install. Requires Chrome (CHROME_PATH, else google-chrome).
 * Run from the repository root: node brand/og.ts
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BRAND, promiseLine } from '../src/brand.ts';
import { frenchText } from '../build/french-spaces.ts';

const font = (file: string) =>
  `url(data:font/woff2;base64,${readFileSync(`node_modules/@fontsource-variable/${file}`).toString('base64')})`;
const icon = `data:image/svg+xml;base64,${readFileSync('brand/icon.svg').toString('base64')}`;
const languages = BRAND.languages.charAt(0).toUpperCase() + BRAND.languages.slice(1);

const html = `<!doctype html>
<html lang="fr">
<meta charset="utf-8" />
<style>
  @font-face { font-family: Display; font-weight: 200 800; src: ${font('bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2')}; }
  @font-face { font-family: Text; font-weight: 200 800; src: ${font('atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2')}; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    display: grid; grid-template-columns: 1fr 520px; align-items: center;
    background: #1e5fd0; color: #fff; font-family: Text;
  }
  main { padding: 0 0 0 80px; display: grid; gap: 22px; }
  .mark { font: 800 56px/1 Display; letter-spacing: -0.03em; opacity: 0.92; }
  h1 { margin: 0; font: 800 76px/1.02 Display; letter-spacing: -0.035em; text-wrap: balance; }
  p { margin: 0; font-size: 30px; line-height: 1.3; }
  .soft { opacity: 0.86; }
  img { width: 540px; height: 540px; margin: 40px 0 0 -40px; }
</style>
<main>
  <div class="mark">${BRAND.name.toLowerCase()}</div>
  <h1>${frenchText(BRAND.headline)}</h1>
  <p>${frenchText(languages)}</p>
  <p class="soft">${frenchText(promiseLine())}</p>
</main>
<img src="${icon}" alt="" />
</html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
writeFileSync(join(dir, 'og.html'), html);
execFileSync(process.env.CHROME_PATH || 'google-chrome', [
  '--headless',
  '--hide-scrollbars',
  '--force-device-scale-factor=1',
  '--window-size=1200,630',
  '--virtual-time-budget=3000',
  `--screenshot=${join(process.cwd(), 'public/og.png')}`,
  `file://${join(dir, 'og.html')}`,
]);
console.log('public/og.png written');
