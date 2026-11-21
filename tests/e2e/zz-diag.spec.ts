import { expect, test } from '@playwright/test';

for (const mode of ['no transition', 'transition', 'transition, focus without scrolling'] as const) {
  test(`back: ${mode}`, async ({ page, browser }) => {
    await page.addInitScript(m => {
      const log: string[] = [];
      (window as unknown as { __log: string[] }).__log = log;
      if (m === 'no transition') (document as unknown as { startViewTransition?: unknown }).startViewTransition = undefined;
      const focus = HTMLElement.prototype.focus;
      HTMLElement.prototype.focus = function (options?: FocusOptions) {
        const before = scrollY;
        focus.call(this, m === 'transition, focus without scrolling' ? { ...options, preventScroll: true } : options);
        log.push(`focus ${this.tagName}.${this.className}: ${before} -> ${scrollY}`);
      };
      const to = window.scrollTo.bind(window);
      window.scrollTo = ((x: number, y: number) => {
        const before = scrollY;
        to(x, y);
        log.push(`scrollTo(${y}): ${before} -> ${scrollY}, height ${document.documentElement.scrollHeight}`);
      }) as typeof window.scrollTo;
      const start = document.startViewTransition?.bind(document);
      if (start)
        document.startViewTransition = ((cb: () => void) => {
          log.push(`startViewTransition at ${scrollY}`);
          const t = start(cb);
          t.updateCallbackDone.then(() => log.push(`updateCallbackDone at ${scrollY}`));
          t.ready.then(
            () => log.push(`ready at ${scrollY}`),
            e => log.push(`ready rejected: ${e}`),
          );
          t.finished.then(() => log.push(`finished at ${scrollY}`));
          return t;
        }) as typeof document.startViewTransition;
      addEventListener('scroll', () => log.push(`scroll event at ${scrollY}`), { passive: true });
    }, mode);
    await page.goto('./');
    const heading = page.getByRole('heading', { name: 'Quelle langue pour ce voyage ?' });
    const [top, end] = await page.getByRole('button', { name: 'C’est parti' }).all();
    await top!.click();
    await expect(heading).toBeVisible();
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(top!).toBeFocused();
    await page.waitForTimeout(700);
    const fromTop = await page.evaluate(() => scrollY);
    await end!.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await end!.click();
    await expect(heading).toBeVisible();
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(end!).toBeFocused();
    const right = await page.evaluate(() => scrollY);
    await page.waitForTimeout(700);
    const later = await page.evaluate(() => scrollY);
    const log = await page.evaluate(() => (window as unknown as { __log: string[] }).__log);
    console.log(
      `\n### ${browser.version()} ${page.viewportSize()!.width}px, ${mode}: from the top button back at ${fromTop} (want 0); from the end button y ${y}, back at ${right}, 0.7 s later ${later}\n${log.join('\n')}`,
    );
  });
}
