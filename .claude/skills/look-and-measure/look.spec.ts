// Copied to tests/e2e/zz-look.spec.ts for one look, then deleted: see SKILL.md. Edit freely.
import { type Page, test } from '@playwright/test';

const WIDTHS = [390, 320, 1280];

async function toHome(page: Page) {
  await page.route('https://translate.test/count', route => route.fulfill({ status: 204 }));
  await page.goto('./');
  await page.getByRole('button', { name: 'C’est parti' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Andalousie' }).click();
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel('Ton prénom').fill('Adrien');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Avec mon café du matin' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();
}

async function shoot(page: Page, name: string) {
  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 844 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `tests/shots/${name}-${width}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
}

async function newTrip(page: Page, language: string) {
  await page.getByRole('button', { name: /Mes voyages/ }).click();
  await page.getByRole('button', { name: 'Ajouter un voyage' }).click();
  await page.getByRole('radio', { name: language }).check({ force: true });
}

test('shots', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toHome(page);
  await shoot(page, 'home');
  await page.getByRole('link', { name: 'Survie' }).click();
  await shoot(page, 'card');
});

test('frames', async ({ page }) => {
  await toHome(page);
  await newTrip(page, 'Anglais');
  await page.getByRole('group', { name: 'Destination' }).getByRole('button', { name: 'New York' }).click();
  await page.waitForTimeout(2500);
  for (const ms of [0, 4000, 8000, 12000]) {
    await page.locator('.porthole').evaluate((el, time) => {
      for (const a of el.getAnimations({ subtree: true })) {
        a.pause();
        a.currentTime = time;
      }
    }, ms);
    await page.locator('.porthole').screenshot({ path: `tests/shots/frame-${ms}.png` });
  }
});

test('strips', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toHome(page);
  await newTrip(page, 'Espagnol');
  for (const language of ['Espagnol', 'Italien', 'Portugais', 'Anglais']) {
    await page.getByRole('radio', { name: language }).check({ force: true });
    const chips = page.getByRole('group', { name: 'Destination' }).getByRole('button');
    for (let i = 0; i < (await chips.count()); i++) {
      const name = (await chips.nth(i).innerText()).trim().replace(/\W/g, '_');
      await chips.nth(i).click();
      await page.waitForTimeout(250);
      await page.evaluate(() => {
        const svg = document.querySelector('.porthole .scenery')!.cloneNode(true) as SVGSVGElement;
        svg.setAttribute('viewBox', '-40 -40 800 340');
        svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        svg.style.cssText = 'display:block;width:1600px;height:680px;background:#fff';
        for (const r of svg.querySelectorAll('.scn-sky, .scn-mid > rect')) {
          r.setAttribute('x', '-400');
          r.setAttribute('width', '1600');
        }
        const box = document.createElement('dialog');
        box.id = 'strip';
        box.style.cssText = 'margin:0;padding:0;border:0;max-width:none;max-height:none;inset:0 auto auto 0';
        box.append(svg);
        document.body.append(box);
        box.showModal();
      });
      await page.screenshot({ path: `tests/shots/strip-${language}-${name}.png`, clip: { x: 0, y: 0, width: 1600, height: 680 } });
      await page.evaluate(() => {
        const box = document.getElementById('strip') as HTMLDialogElement;
        box.close();
        box.remove();
      });
    }
  }
});
