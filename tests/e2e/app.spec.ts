import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { TRANSLATE_URL } from '../../playwright.config';

/** A deterministic stand-in for the device voices (headless browsers have none). */
const FAKE_VOICES = () => {
  const voices = [
    { name: 'Mónica', lang: 'es-ES', localService: true, default: false, voiceURI: 'm' },
    { name: 'Paulina', lang: 'es-MX', localService: true, default: false, voiceURI: 'p' },
    { name: 'Alice', lang: 'it-IT', localService: true, default: false, voiceURI: 'a' },
    { name: 'Thomas', lang: 'fr-FR', localService: true, default: true, voiceURI: 't' },
  ];
  const spoken: string[] = [];
  (window as unknown as { __spoken: string[] }).__spoken = spoken;
  const synth = {
    getVoices: () => voices,
    speak: (u: { text: string; onend?: () => void }) => {
      spoken.push(u.text);
      setTimeout(() => u.onend?.(), 20);
    },
    cancel() {},
    addEventListener() {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = function (
    this: { text: string },
    t: string,
  ) {
    this.text = t;
  };
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(FAKE_VOICES);
});

async function onboard(page: Page, name = 'Adrien') {
  await page.goto('./');
  await page.getByRole('button', { name: 'C’est parti' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Barcelone' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel('Date de départ').fill('2026-12-20');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel('Ton prénom').fill(name);
  await page.getByRole('button', { name: 'Au masculin' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByText('Régulier').click();
  await page.getByRole('button', { name: 'Avec mon café du matin' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: 'Imagine.' })).toBeVisible();
}

/** Waits until entrance animations are over (looping ones excepted), so checks see the final look. */
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

/** Ends onboarding by opening the first lesson, then leaves it. */
async function leaveFirstLesson(page: Page) {
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();
}

/** Plays whatever exercise is on screen, right or wrong, until the session ticket shows. */
async function playSession(page: Page, keyboard = false) {
  for (let i = 0; i < 80; i++) {
    if (await page.locator('.ticket').isVisible()) return;
    const feedback = page.locator('.feedback .btn-block');
    if (await feedback.isVisible()) {
      await feedback.click();
      continue;
    }
    const ex = page.locator('.ex').first();
    if (await ex.locator('.choice').count()) {
      if (keyboard) {
        await expect(async () => {
          await page.keyboard.press('1');
          await expect(ex.locator('.choice input').first()).toBeChecked({ timeout: 300 });
        }).toPass({ timeout: 5000 });
        await page.keyboard.press('Enter');
      } else {
        await ex.locator('.choice').first().click();
        await ex.locator('.ex-actions .btn').click();
      }
    } else if (await ex.locator('.bank .tile').count()) {
      const free = ex.locator('.bank .tile:not([disabled])');
      while (await free.count()) await free.first().click();
      await ex.locator('.ex-actions .btn').click();
    } else if (await ex.locator('#dictation').count()) {
      await ex.locator('#dictation').fill('hola');
      await ex.locator('.ex-actions .btn').click();
    } else if (await ex.getByRole('button', { name: 'Voir la réponse' }).count()) {
      await ex.getByRole('button', { name: 'Voir la réponse' }).click();
      await ex.getByRole('button', { name: 'Je l’ai bien dit' }).click();
    } else if (await ex.locator('.pairs').count()) {
      const left = ex.locator('.pairs > div').first().locator('.pair:not([disabled])');
      const right = ex.locator('.pairs > div').last().locator('.pair:not([disabled])');
      for (let a = 0; a < 6 && (await left.count()); a++) {
        for (let b = 0; b < (await right.count()); b++) {
          await left.first().click();
          await right.nth(b).click();
          await page.waitForTimeout(450);
          if ((await left.count()) <= a) break;
        }
      }
      await page.waitForTimeout(600);
    } else if (await ex.getByRole('button', { name: 'Continuer' }).count()) {
      await ex.getByRole('button', { name: 'Continuer' }).click();
    }
    await page.waitForTimeout(60);
  }
  throw new Error('the session did not end');
}

test('first launch to first lesson, progress kept after reload', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page);
  await expect(page.locator('.ticket')).toContainText('XP');
  await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
  await expect(page.locator('.readiness')).not.toContainText(' 0 phrases vues');
  await page.reload();
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
  await expect(page.locator('.stop.started, .stop.done').first()).toBeVisible();
});

test('opens without network once visited', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('button', { name: 'C’est parti' })).toBeVisible();
  await context.setOffline(false);
});

test('offers to install the app, with the browser dialog when available', async ({ page }) => {
  await page.goto('./');
  const install = page.getByRole('button', { name: 'Installer l’app' });
  await expect(install).toBeVisible();
  await install.click();
  await expect(page.getByRole('dialog', { name: 'Installer l’app' })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt') as Event & Record<string, unknown>;
    (window as unknown as Record<string, boolean>).__prompted = false;
    e.prompt = async () => {
      (window as unknown as Record<string, boolean>).__prompted = true;
    };
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await install.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as Record<string, boolean>).__prompted)).toBe(true);
  await expect(install).toBeHidden();
});

test('keeps the progress of the previous version', async ({ page }) => {
  const now = Date.now();
  await page.addInitScript(
    ([t]) => {
      if (localStorage.getItem('db-v4')) return;
      localStorage.setItem(
        'vale-v3',
        JSON.stringify({
          v: 3,
          ob: true,
          profiles: [{ id: 'p1', name: 'Léa', g: 'a', color: '#E8458B' }],
          active: 'p1',
          dest: 'madrid',
          date: '',
          goal: 40,
          set: {},
          data: {
            p1: {
              p: { 'base.0': { l: 4, t }, 'base.1': { l: 3, t } },
              sc: { cafe: true },
              days: {},
              favs: { 'base.0': true },
            },
          },
        }),
      );
    },
    [now],
  );
  await page.goto('./');
  await expect(page.getByRole('heading', { name: '¡Hola, Léa!' })).toBeVisible();
  await expect(page.locator('.readiness')).toContainText('2 phrases vues');
  await page.getByRole('link', { name: 'Carte' }).click();
  await expect(page.getByText('Hola', { exact: true })).toBeVisible();
});

test('desktop sessions work from the keyboard', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'keyboard flow is a desktop concern');
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page, true);
  await expect(page.locator('.ticket')).toBeVisible();
});

test('translates a sentence, then finds it again offline', async ({ page, context }) => {
  const asked: unknown[] = [];
  await page.route(`${TRANSLATE_URL}/translate`, async route => {
    asked.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        t: '¿Sería posible tener un late checkout?',
        ph: 'sé-RI-a po-SSI-blé té-NÈR oun late checkout',
        note: 'On dit aussi « salida tardía ».',
        alternatives: ['¿Puedo dejar la habitación más tarde?'],
      },
    });
  });
  await onboard(page, 'Léa');
  await leaveFirstLesson(page);
  await page.goto('./#/phrases');
  const search = page.getByRole('searchbox', { name: 'Phrase en français' });
  await search.fill('Je voudrais savoir s’il serait possible d’avoir un late checkout');
  await page.getByRole('button', { name: 'Traduire en espagnol' }).click();
  await expect(page.getByText('¿Sería posible tener un late checkout?')).toBeVisible();
  await expect(page.getByText('On dit aussi « salida tardía ».')).toBeVisible();
  expect(asked).toEqual([{ text: 'Je voudrais savoir s’il serait possible d’avoir un late checkout', course: 'es' }]);
  await page.getByRole('button', { name: 'Garder pour réviser' }).click();
  await expect(page.getByRole('button', { name: 'Ne plus réviser' })).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Historique' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Phrase en français' }).fill('checkout');
  await expect(page.getByRole('heading', { name: 'Déjà traduit' })).toBeVisible();
  await expect(page.getByText('¿Sería posible tener un late checkout?')).toBeVisible();
  await expect(page.getByText(/Hors ligne/)).toBeVisible();
  await context.setOffline(false);
});

test('the welcome window flies on, Bernard speaks, the journey pauses', async ({ page }) => {
  await page.goto('./');
  const bubble = page.locator('.porthole-bubble');
  await expect(bubble).toHaveText('¡Hola, Barcelona!');
  await expect(bubble).toBeVisible();
  await page.getByRole('button', { name: 'Voler vers la destination suivante' }).click();
  await expect(bubble).toHaveText('Ciao, Roma!', { timeout: 4000 });
  await page.getByRole('button', { name: /Écouter Bernard/ }).click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken))
    .toContain('Ciao, Roma!');
  await page.getByRole('button', { name: 'Mettre le voyage en pause' }).click();
  await expect(page.locator('.porthole')).toHaveAttribute('data-playing', 'false');
  await page.getByRole('button', { name: 'Reprendre le voyage' }).click();
  await expect(page.locator('.porthole')).toHaveAttribute('data-playing', 'true');
});

test('the welcome window stays still for people who ask for less motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('.porthole-bubble')).toHaveText('¡Hola, Barcelona!');
  await expect(page.locator('.porthole')).toHaveAttribute('data-playing', 'false');
  await expect(page.getByRole('button', { name: 'Mettre le voyage en pause' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Voler vers la destination suivante' }).click();
  await expect(page.locator('.porthole-bubble')).toHaveText('Ciao, Roma!');
});

const SCREENS = ['#/', '#/entrainement', '#/phrases', '#/carte', '#/moi'];

test('tap targets are large and choice buttons never touch', async ({ page }) => {
  const audit = async (where: string) => {
    await settle(page);
    const problems = await page.evaluate(() => {
      const sel = 'button, a[href], input:not(.sr-only), select, textarea, label.choice, summary';
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return (
          r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight && r.left >= 0
        );
      };
      const els = [...document.querySelectorAll(sel)].filter(el => visible(el) && !el.closest('.gloss-word, .skip'));
      const out: string[] = [];
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (Math.min(r.width, r.height) < 44)
          out.push(`small ${Math.round(r.width)}x${Math.round(r.height)}: ${el.outerHTML.slice(0, 80)}`);
      }
      const spaced = els.filter(el => el.matches('.choice, .chip, .tile-card'));
      for (let i = 0; i < spaced.length; i++)
        for (let j = i + 1; j < spaced.length; j++) {
          const a = spaced[i]!.getBoundingClientRect();
          const b = spaced[j]!.getBoundingClientRect();
          const gap = Math.max(b.left - a.right, a.left - b.right, b.top - a.bottom, a.top - b.bottom);
          if (gap < 8)
            out.push(
              `gap ${Math.round(gap)}px: ${spaced[i]!.textContent?.slice(0, 20)} / ${spaced[j]!.textContent?.slice(0, 20)}`,
            );
        }
      return out;
    });
    expect(problems, where).toEqual([]);
  };
  await page.goto('./');
  await audit('welcome');
  await onboard(page, 'Léa');
  await audit('onboarding');
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await audit('session');
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await audit('quit dialog');
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();
  for (const hash of SCREENS) {
    await page.goto(`./${hash}`);
    await audit(hash);
  }
});

test('no serious accessibility issue on the main screens', async ({ page }) => {
  const check = async (where: string) => {
    await settle(page);
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const serious = violations
      .filter(v => v.impact === 'serious' || v.impact === 'critical')
      .map(v => `${v.id}: ${v.nodes[0]?.html}`);
    expect(serious, where).toEqual([]);
  };
  await page.goto('./');
  await check('welcome');
  await onboard(page, 'Léa');
  await check('onboarding');
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await check('session');
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();
  for (const hash of SCREENS) {
    await page.goto(`./${hash}`);
    await check(hash);
  }
});
