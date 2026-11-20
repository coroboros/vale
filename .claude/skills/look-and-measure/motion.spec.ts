// Copied to tests/e2e/zz-motion.spec.ts to measure the motion that follows the scroll, then
// deleted: see SKILL.md. Run with --project=desktop; it writes its numbers to tests/shots/.
import { writeFileSync } from 'node:fs';
import { type Page, test } from '@playwright/test';

// The page before its scenes: hidden, and the skies taken off.
const BEFORE = `.wp-clouds, .wp-route, .wp-shore { display: none !important; }
  .wp-hero, .wp-postcards, .wp-go, .wp-foot { background: none !important; border-image: none !important; }`;
// Not the scenes' motion: the phone's buttons that stay in reach, and the window, which flies by the clock.
const STILL = '.welcome-actions { position: static !important; } .porthole { visibility: hidden !important; }';
const DRAWINGS = '.wp-cloud, .wp-plane svg, .shore-sun, .shore-glint, .shore-boat, .shore-gulls, .shore-foam, .shore-case, .wp-bernard';

async function open(page: Page, width: number, css?: string) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto('./');
  if (css) await page.addStyleTag({ content: css });
  await page.waitForTimeout(800);
  // Holds what runs by the clock, so only what follows the scroll moves.
  await page.evaluate(() => {
    for (const a of document.getAnimations())
      if (a.timeline === document.timeline) {
        a.pause();
        a.currentTime = 0;
      }
  });
}

test('share of the screen in motion', async ({ page }) => {
  test.setTimeout(240_000);
  const rows: string[] = [];
  for (const width of [390, 1280])
    for (const reduced of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
      await open(page, width, STILL);
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      let changed = 0;
      let covered = 0;
      for (let y = 0; y + 48 <= max; y += 96) {
        await page.evaluate(v => scrollTo(0, v), y);
        await page.waitForTimeout(120);
        const a = (await page.screenshot()).toString('base64');
        await page.evaluate(v => scrollTo(0, v), y + 48);
        await page.waitForTimeout(120);
        const b = (await page.screenshot()).toString('base64');
        // Pixels that differ once the page's own scroll is taken out.
        changed = Math.max(
          changed,
          await page.evaluate(
            async ([pa, pb]) => {
              const load = async (src: string) => {
                const img = new Image();
                img.src = `data:image/png;base64,${src}`;
                await img.decode();
                const c = new OffscreenCanvas(img.width, img.height).getContext('2d')!;
                c.drawImage(img, 0, 0);
                return c.getImageData(0, 0, img.width, img.height);
              };
              const [ia, ib] = await Promise.all([load(pa!), load(pb!)]);
              const shift = Math.round((48 * ia.width) / innerWidth);
              let moved = 0;
              for (let yy = 0; yy < ia.height - shift; yy++)
                for (let xx = 0; xx < ia.width; xx++) {
                  const i = ((yy + shift) * ia.width + xx) * 4;
                  const j = (yy * ia.width + xx) * 4;
                  const d = [0, 1, 2].reduce((s, k) => s + Math.abs(ia.data[i + k]! - ib.data[j + k]!), 0);
                  if (d > 24) moved++;
                }
              return moved / (ia.width * (ia.height - shift));
            },
            [a, b],
          ),
        );
        // The screen the moving drawings' boxes cover, transparent parts included.
        covered = Math.max(
          covered,
          await page.evaluate(selector => {
            const boxes = [...document.querySelectorAll(selector)].map(el => el.getBoundingClientRect());
            let inside = 0;
            let all = 0;
            for (let py = 0; py < innerHeight; py += 4)
              for (let px = 0; px < innerWidth; px += 4) {
                all++;
                if (boxes.some(r => px >= r.left && px < r.right && py >= r.top && py < r.bottom)) inside++;
              }
            return inside / all;
          }, DRAWINGS),
        );
      }
      rows.push(
        `${width}px, ${reduced ? 'reduced motion' : 'motion'}: drawings cover ≤ ${(covered * 100).toFixed(1)} % of the screen; ≤ ${(changed * 100).toFixed(1)} % of its pixels change per 48 px of scroll`,
      );
    }
  writeFileSync('tests/shots/motion-share.txt', rows.join('\n'));
  console.log(rows.join('\n'));
});

test('main thread while scrolling', async ({ page }) => {
  test.setTimeout(240_000);
  const rows: string[] = [];
  for (const [label, css] of [
    ['before', BEFORE],
    ['after', undefined],
  ] as const) {
    const runs: number[][] = [];
    for (let run = 0; run < 3; run++) {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await open(page, 390, css);
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Performance.enable');
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      const metric = async () => {
        const { metrics } = await cdp.send('Performance.getMetrics');
        const m = Object.fromEntries(metrics.map(x => [x.name, x.value]));
        return [m.TaskDuration!, m.RecalcStyleDuration!];
      };
      await page.mouse.move(195, 400);
      const start = await metric();
      const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
      for (let y = 0; y < max; y += 100) {
        await page.mouse.wheel(0, 100);
        await page.waitForTimeout(16);
      }
      await page.waitForTimeout(300);
      runs.push((await metric()).map((v, i) => (v - start[i]!) * 1000));
      await cdp.detach();
    }
    const median = (i: number) => runs.map(r => r[i]!).sort((x, y) => x - y)[1]!.toFixed(0);
    rows.push(`${label}: ${median(0)} ms on the main thread, ${median(1)} ms of it style (CPU 4×, median of 3)`);
  }
  writeFileSync('tests/shots/main-thread.txt', rows.join('\n'));
  console.log(rows.join('\n'));
});

test('compositor layers', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page, 390);
  await page.evaluate(() => scrollTo(0, 200));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('DOM.getDocument', { depth: -1 });
  const changed = new Promise<{ layers?: { layerId: string; backendNodeId?: number }[] }>(resolve =>
    cdp.once('LayerTree.layerTreeDidChange', resolve as never),
  );
  await cdp.send('LayerTree.enable');
  await page.mouse.wheel(0, 1);
  const rows: string[] = [];
  for (const layer of (await changed).layers ?? []) {
    if (!layer.backendNodeId) continue;
    const { compositingReasonIds = [] } = await cdp.send('LayerTree.compositingReasons', { layerId: layer.layerId });
    const { node } = await cdp.send('DOM.describeNode', { backendNodeId: layer.backendNodeId });
    const cls = node.attributes?.[node.attributes.indexOf('class') + 1] ?? node.nodeName;
    rows.push(`${cls}: ${compositingReasonIds.join(', ')}`);
  }
  // Every drawing that follows the scroll should be listed here with an Active…Animation reason.
  writeFileSync('tests/shots/layers.txt', rows.join('\n'));
  console.log(rows.join('\n'));
});
