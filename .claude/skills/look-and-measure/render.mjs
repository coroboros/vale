// Renders 24 px SVG icons to 96 px PNGs with a transparent background, next to each SVG, for
// `measure.py similar`. Run from the repository root: node .claude/skills/look-and-measure/render.mjs icons/*.svg
import { chromium } from '@playwright/test';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 96, height: 96 } });
for (const svg of process.argv.slice(2)) {
  await page.goto(`file://${new URL(svg, `file://${process.cwd()}/`).pathname}`);
  await page.screenshot({ path: svg.replace(/\.svg$/, '.png'), omitBackground: true });
}
await browser.close();
