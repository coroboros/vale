import { expect, test } from '@playwright/test';

// The end-to-end test's own rhythm: no pause, so transitions overlap as with a quick traveller.
for (const mode of ['no skip (as in d1cdd30)', 'skip before back', 'no skip, focus without scrolling', 'skip, focus without scrolling'] as const) {
  test(`overlapping: ${mode}`, async ({ page, browser }) => {
    await page.addInitScript(m => {
      const log: string[] = [];
      const w = window as unknown as { __log: string[]; __mark: (s: string) => void };
      w.__log = log;
      const t0 = performance.now();
      const at = () => `${Math.round(performance.now() - t0)}ms`;
      w.__mark = s => log.push(`${at()} --- ${s} (scrollY ${scrollY})`);
      if (m.startsWith('no skip')) ViewTransition.prototype.skipTransition = () => {};
      const focus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function (options?: FocusOptions) {
        const before = scrollY;
        focus.call(this, m.endsWith('without scrolling') ? { ...options, preventScroll: true } : options);
        log.push(`${at()} focus ${this.tagName}.${this.className}: ${before} -> ${scrollY}`);
      };
      const to = window.scrollTo.bind(window);
      window.scrollTo = ((x: number, y: number) => {
        const before = scrollY;
        to(x, y);
        log.push(`${at()} scrollTo(${y}): ${before} -> ${scrollY}, height ${document.documentElement.scrollHeight}`);
      }) as typeof window.scrollTo;
      const start = document.startViewTransition.bind(document);
      let n = 0;
      document.startViewTransition = ((cb: () => void) => {
        const id = ++n;
        log.push(`${at()} VT${id} start at ${scrollY}`);
        const t = start(cb);
        t.updateCallbackDone.then(() => log.push(`${at()} VT${id} updated at ${scrollY}`));
        t.ready.then(
          () => log.push(`${at()} VT${id} ready at ${scrollY}`),
          e => log.push(`${at()} VT${id} ready rejected (${String(e).slice(0, 40)}) at ${scrollY}`),
        );
        t.finished.then(() => log.push(`${at()} VT${id} finished at ${scrollY}`));
        return t;
      }) as typeof document.startViewTransition;
      addEventListener('scroll', () => log.push(`${at()} scroll event at ${scrollY}`), { passive: true });
    }, mode);
    const mark = (s: string) => page.evaluate(x => (window as unknown as { __mark: (s: string) => void }).__mark(x), s);
    await page.goto('./');
    const heading = page.getByRole('heading', { name: 'Quelle langue pour ce voyage ?' });
    const [top, end] = await page.getByRole('button', { name: 'C’est parti' }).all();
    await mark('click top');
    await top!.click();
    await expect(heading).toBeFocused();
    await mark('click Retour');
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(top!).toBeFocused();
    await mark('scroll to the end button');
    await end!.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await mark(`click end (y ${y})`);
    await end!.click();
    await expect(heading).toBeVisible();
    const zero = await page.evaluate(() => scrollY);
    await mark('click Retour');
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(end!).toBeFocused();
    const right = await page.evaluate(() => scrollY);
    await mark('read');
    await page.waitForTimeout(700);
    const later = await page.evaluate(() => scrollY);
    const log = await page.evaluate(() => (window as unknown as { __log: string[] }).__log);
    console.log(
      `\n### ${browser.version()} ${page.viewportSize()!.width}px, ${mode}: y ${y}, in the app ${zero}, back at ${right} (want ${y}), 0.7 s later ${later}\n${log.join('\n')}`,
    );
  });
}
