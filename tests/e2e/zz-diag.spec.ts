import { expect, type Page, test } from '@playwright/test';

const SLOW = '::view-transition-old(root), ::view-transition-new(root) { animation-duration: 3s !important; }';
const THROUGH = '::view-transition { pointer-events: none; }';

async function tapDuringFade(page: Page, css: string) {
  await page.goto('./');
  await page.addStyleTag({ content: css });
  const heading = page.getByRole('heading', { name: 'Quelle langue pour ce voyage ?' });
  await page.getByRole('button', { name: 'C’est parti' }).first().click();
  await expect(heading).toBeAttached();
  await page.waitForTimeout(400);
  const back = page.getByRole('button', { name: 'Retour' });
  const box = (await back.boundingBox())!;
  const hit = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x!, y!);
    return `${el?.tagName}.${el?.className}`;
  }, [box.x + box.width / 2, box.y + box.height / 2]);
  const running = await page.evaluate(() => document.getAnimations().filter(a => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith('::view-transition')).length);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(300);
  const backHome = await page.locator('#welcome').count();
  return `transition animations running ${running}, element under the finger ${hit}, tap went through: ${backHome === 1}`;
}

test('a tap during the fade', async ({ page, browser }) => {
  const plain = await tapDuringFade(page, SLOW);
  const through = await tapDuringFade(page, `${SLOW} ${THROUGH}`);
  console.log(`\n### ${browser.version()} ${page.viewportSize()!.width}px\nas built: ${plain}\nwith pointer-events: none on ::view-transition: ${through}`);
});

for (const css of ['', THROUGH]) {
  test(`the e2e rhythm, both ways faded${css ? ', taps through the fade' : ''}`, async ({ page, browser }) => {
    await page.goto('./');
    if (css) await page.addStyleTag({ content: css });
    const heading = page.getByRole('heading', { name: 'Quelle langue pour ce voyage ?' });
    const [top, end] = await page.getByRole('button', { name: 'C’est parti' }).all();
    await top!.click();
    await expect(heading).toBeFocused();
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(top!).toBeFocused();
    const fromTop = await page.evaluate(() => scrollY);
    await end!.scrollIntoViewIfNeeded();
    const y = await page.evaluate(() => scrollY);
    await end!.click();
    await expect(heading).toBeVisible();
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(end!).toBeFocused();
    const right = await page.evaluate(() => scrollY);
    console.log(`\n### ${browser.version()} ${page.viewportSize()!.width}px${css ? ', taps through' : ''}: from the top back at ${fromTop}; y ${y}, back at ${right}`);
  });
}
