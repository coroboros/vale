import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { TRANSLATE_URL } from '../../playwright.config';
import { BRAND, INDEXNOW_KEY } from '../../src/brand';

/** Headless browsers have no voices. */
const FAKE_VOICES = () => {
  const voices = [
    { name: 'Mónica', lang: 'es-ES', localService: true, default: false, voiceURI: 'm' },
    { name: 'Paulina', lang: 'es-MX', localService: true, default: false, voiceURI: 'p' },
    { name: 'Alice', lang: 'it-IT', localService: true, default: false, voiceURI: 'a' },
    { name: 'Joana', lang: 'pt-PT', localService: true, default: false, voiceURI: 'j' },
    { name: 'Daniel', lang: 'en-GB', localService: true, default: false, voiceURI: 'd' },
    { name: 'Samantha', lang: 'en-US', localService: true, default: false, voiceURI: 's' },
    { name: 'Thomas', lang: 'fr-FR', localService: true, default: true, voiceURI: 't' },
  ];
  const spoken: string[] = [];
  const speakers: string[] = [];
  Object.assign(window, { __spoken: spoken, __speakers: speakers });
  const synth = {
    getVoices: () => voices,
    speak: (u: { text: string; voice?: { name: string }; onend?: () => void }) => {
      spoken.push(u.text);
      speakers.push(u.voice?.name ?? '');
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

/**
 * Playwright's headless Chromium has no speech service: asking it whether a language can be
 * recognised (SpeechRecognition.available) crashed the page in CI. Tests run without recognition
 * unless they install FAKE_RECOGNITION.
 */
const NO_RECOGNITION = () => {
  Reflect.deleteProperty(window, 'SpeechRecognition');
  Reflect.deleteProperty(window, 'webkitSpeechRecognition');
};

/** What the Content Security Policy refused during a test (build/csp.ts): it must refuse nothing of ours. */
let refused: string[] = [];

test.beforeEach(async ({ page }) => {
  refused = [];
  page.on('console', message => {
    if (message.text().includes('Content Security Policy')) refused.push(message.text());
  });
  await page.addInitScript(FAKE_VOICES);
  await page.addInitScript(NO_RECOGNITION);
  await page.route(`${TRANSLATE_URL}/count`, route => route.fulfill({ status: 204 }));
});

test.afterEach(() => {
  expect(refused, 'refused by the Content Security Policy').toEqual([]);
});

/** A speech recogniser that hears what the test queued: transcripts, an error, or nothing at all. */
const FAKE_RECOGNITION = (onDevice: boolean) => {
  type Next = { transcripts: string[] } | { error: string } | 'deaf';
  const hearing = { queue: [] as Next[], started: [] as { lang: string; processLocally: boolean }[] };
  (window as unknown as { __hearing: typeof hearing }).__hearing = hearing;
  class Recognition {
    static available = async (o: { processLocally: boolean }) =>
      o.processLocally && !onDevice ? 'downloadable' : 'available';
    lang = '';
    processLocally = false;
    onstart: (() => void) | null = null;
    onspeechstart: (() => void) | null = null;
    onresult: ((e: unknown) => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    onend: (() => void) | null = null;
    start() {
      hearing.started.push({ lang: this.lang, processLocally: this.processLocally });
      const next = hearing.queue.shift() ?? { error: 'no-speech' };
      setTimeout(() => {
        this.onstart?.();
        if (next === 'deaf') return;
        if ('error' in next) this.onerror?.({ error: next.error });
        else {
          this.onspeechstart?.();
          this.onresult?.({ results: [next.transcripts.map(transcript => ({ transcript }))] });
        }
        this.onend?.();
      }, 30);
    }
    abort() {}
  }
  Object.assign(window, { SpeechRecognition: Recognition, webkitSpeechRecognition: Recognition });
};

type Hearing = { queue: unknown[]; started: { lang: string; processLocally: boolean }[] };
const hearNext = (page: Page, next: unknown) =>
  page.evaluate(n => (window as unknown as { __hearing: Hearing }).__hearing.queue.push(n), next);
const started = (page: Page) => page.evaluate(() => (window as unknown as { __hearing: Hearing }).__hearing.started);

async function onboard(
  page: Page,
  name = 'Adrien',
  check: (step: string) => Promise<void> = async () => {},
  url = './',
) {
  await page.goto(url);
  await page.getByRole('button', { name: 'C’est parti' }).click();
  await check('language');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await check('destination');
  await page.getByRole('button', { name: 'Barcelone' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await check('date');
  await page.getByLabel('Date de départ').fill('2026-12-20');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await check('travellers');
  await page.getByLabel('Ton prénom').fill(name);
  await page.getByRole('button', { name: 'Au masculin' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await check('pace');
  await page.getByText('Régulier').click();
  await page.getByRole('button', { name: 'Avec mon café du matin' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: `Imagine, ${name}.` })).toBeVisible();
  await expect(page.locator('.imagine .lead')).toHaveText(
    'Le dimanche 20 décembre au petit matin, tu arrives à Barcelone. Tu pousses la porte d’un café et tu dis :',
  );
  await expect(page.locator('.imagine-plan')).toHaveText(
    'Ton plan : 10 minutes par jour au café du matin, jusqu’au 20 décembre.',
  );
}

/** Looping animations excepted, so checks see the final look. */
async function settle(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every(a => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  );
}

async function expectAccessible(page: Page, where: string) {
  await settle(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = violations
    .filter(v => v.impact === 'serious' || v.impact === 'critical')
    .map(v => `${v.id}: ${v.nodes[0]?.html}`);
  expect(serious, where).toEqual([]);
}

async function toSpeakingDrill(page: Page) {
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page);
  await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('link', { name: 'Entraînement' }).click();
  await page.getByRole('button', { name: /^Prononciation/ }).click();
}

async function leaveFirstLesson(page: Page) {
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();
}

async function playSession(page: Page, keyboard = false) {
  for (let i = 0; i < 80; i++) {
    if (await page.locator('.ticket').isVisible()) return;
    await playStep(page, keyboard);
  }
  throw new Error('the session did not end');
}

async function playStep(page: Page, keyboard = false) {
  const feedback = page.locator('.feedback .btn-block');
  if (await feedback.isVisible()) {
    await feedback.click();
    return;
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
      await ex.locator('.ex-actions .btn-primary').click();
    }
  } else if (await ex.locator('.bank .tile').count()) {
    const free = ex.locator('.bank .tile:not([disabled])');
    while (await free.count()) await free.first().click();
    await ex.locator('.ex-actions .btn-primary').click();
  } else if (await ex.locator('#dictation').count()) {
    await ex.locator('#dictation').fill('hola');
    await ex.locator('.ex-actions .btn-primary').click();
  } else if (await ex.getByRole('button', { name: 'Voir la réponse' }).count()) {
    await ex.getByRole('button', { name: 'Voir la réponse' }).click();
    await ex.getByRole('button', { name: /^Je l’(ai bien dit|avais)$/ }).click();
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

/** Screens a newcomer goes through before the first exercise, answering only what is required. */
async function screensBeforeFirstExercise(page: Page, url: string) {
  await page.goto(url);
  for (let screens = 0; screens < 12; screens++) {
    if (await page.locator('.ex').first().isVisible()) return screens;
    const heading = await page.locator('h1').first().textContent();
    const name = page.getByLabel('Ton prénom');
    if (await name.isVisible()) await name.fill('Léa');
    await page.locator('.welcome-actions .btn-primary, .stage-foot .btn-primary').first().click();
    await expect
      .poll(
        async () =>
          (await page.locator('.ex').count()) > 0 || (await page.locator('h1').first().textContent()) !== heading,
      )
      .toBe(true);
  }
  throw new Error('no exercise after 12 screens');
}

// Every screen before the first exercise loses some newcomers: adding one updates docs/UX.md.
test('the first exercise comes 7 screens after the welcome, the first name the only answer required', async ({
  page,
}) => {
  expect(await screensBeforeFirstExercise(page, './')).toBe(7);
});

test('from a page, the first exercise comes 5 screens after its link', async ({ page }) => {
  expect(await screensBeforeFirstExercise(page, './?utm_source=page#/apprendre/es/bar')).toBe(5);
});

test('first launch to first lesson, progress kept after reload', async ({ page }) => {
  const steps: string[] = [];
  await page.route(`${TRANSLATE_URL}/count`, async route => {
    for (const c of route.request().postDataJSON().counts) if (c.name === 'step') steps.push(c.value);
    await route.fulfill({ status: 204 });
  });
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page);
  await expect(page.locator('.ticket')).toContainText('XP');
  await expect.poll(() => steps.at(-1)).toBe('lesson-done');
  const card = page.locator('.from-bernard');
  await expect(card).toContainText('Une carte de Bernard');
  await expect(card).toContainText('« Me voilà à Barcelone !');
  await expectAccessible(page, 'bilan de session');
  await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
  await expect(page.locator('.unit-postcard').first()).toContainText('Bernard : « Me voilà à Barcelone !');
  await expect(page.locator('.readiness')).not.toContainText(' 0 phrases vues');
  await page.reload();
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
  await expect(page.locator('.stop.started, .stop.done').first()).toBeVisible();
});

test('« Imagine » shows the destination photo with its credit, and the mascot without it', async ({ page }, info) => {
  await onboard(page);
  const photo = page.getByRole('img', { name: /parc Güell/ });
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator('.photo-credit').getByRole('link').first()).toHaveAttribute(
    'href',
    /commons\.wikimedia\.org/,
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectAccessible(page, 'imagine with a photo');
  // On a phone, upright, the photo stays in plain view with every word below it, and nothing scrolls.
  if (info.project.name === 'iphone')
    for (const viewport of [null, { width: 375, height: 667 }]) {
      if (viewport) {
        // Small-viewport units follow the first size of the page: a new size needs a new page.
        await page.setViewportSize(viewport);
        await onboard(page);
        await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete)).toBe(true);
      }
      const layout = await page.evaluate(() => {
        const photo = document.querySelector('.imagine-photo')!.getBoundingClientRect();
        const words = document.querySelector('.imagine-text')!.getBoundingClientRect();
        const start = document.querySelector('.stage-foot .btn-primary')!.getBoundingClientRect();
        return {
          clear: (words.top - photo.top) / innerHeight,
          scrolls: document.scrollingElement!.scrollHeight > innerHeight + 1,
          startShown: start.bottom <= innerHeight,
        };
      });
      expect(layout.clear, `photo share at ${page.viewportSize()!.width}px`).toBeGreaterThan(0.3);
      expect(layout).toMatchObject({ scrolls: false, startShown: true });
    }

  await page.route('**/photos/**', route => route.abort());
  await onboard(page);
  await expect(page.locator('.imagine-photo')).toHaveCount(0);
  await expect(page.locator('.imagine .mascot')).toBeVisible();
});

test('a new trip lands on « Imagine » for it, in the scene of the practice moment', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  await page.getByRole('link', { name: 'Moi' }).click();
  await page.getByRole('button', { name: 'Le soir, avant de dormir' }).click();
  await page.getByRole('link', { name: 'Itinéraire' }).click();
  const addTrip = async (language: string, place: string, date?: string) => {
    await page.getByRole('button', { name: /^Mes voyages/ }).click();
    await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
    await page.getByText(language, { exact: true }).click();
    await page.getByRole('button', { name: place }).click();
    if (date) await page.getByLabel('Date de départ').fill(date);
    await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  };

  await addTrip('Italien', 'Rome', '2027-01-10');
  await expect(page).toHaveURL(/#\/arrivee$/);
  await expect(page.getByRole('heading', { name: 'Imagine, Adrien.' })).toBeVisible();
  await expect(page.locator('.imagine .lead')).toHaveText(
    'Le dimanche 10 janvier au coucher du soleil, tu arrives à Rome. Tu poses ta valise à la réception et tu dis :',
  );
  await expect(page.locator('.imagine-line')).toContainText('Ho una prenotazione a nome di Adrien.');
  await expect(page.locator('.imagine-plan')).toHaveText(
    'Ton plan : 10 minutes par jour le soir, avant de dormir, jusqu’au 10 janvier.',
  );
  await expect(page.getByRole('img', { name: /Panthéon/ })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectAccessible(page, 'landing');
  await page.getByRole('button', { name: 'Plus tard' }).click();
  await expect(page.getByRole('heading', { name: 'Ciao, Adrien!' })).toBeVisible();

  // A new language starts with its first lesson; a language already begun goes back to the itinerary.
  await addTrip('Portugais', 'Lisbonne');
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page);
  await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Adrien!' })).toBeVisible();
  await addTrip('Portugais', 'Porto');
  await expect(page.getByRole('button', { name: 'Apprendre ma première phrase' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Voir mon itinéraire' }).click();
  await expect(page.getByRole('heading', { name: 'Olá, Adrien!' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Mes voyages/ })).toContainText('Portugais · Porto');
});

test('home brings back the practice moment while the day’s goal is open', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-20T08:30:00'));
  await onboard(page);
  await leaveFirstLesson(page);
  await expect(page.locator('.home-moment')).toHaveText('C’est l’heure de ton café : 10 minutes d’espagnol ?');
  await page.clock.setFixedTime(new Date('2026-11-20T14:00:00'));
  await page.reload();
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
  await expect(page.locator('.home-moment')).toHaveCount(0);
});

test('« Mes voyages » keeps several trips, even in one language, and Home follows the one in focus', async ({
  page,
}) => {
  await onboard(page);
  await leaveFirstLesson(page);
  const trips = page.getByRole('button', { name: /^Mes voyages/ });
  const sheet = page.locator('.sheet');
  await expect(trips).toContainText('Espagnol · Barcelone');
  await trips.click();
  const window = sheet.locator('.porthole');
  await expect(window.locator('.porthole-bubble')).toHaveText('¡Hola, Barcelona!');
  await expect(window).toHaveAttribute('data-playing', 'true');
  await expectAccessible(page, 'mes voyages');
  // Its clouds and boats keep moving: like anything moving that long, it can be paused (WCAG 2.2.2).
  await sheet.getByRole('button', { name: 'Mettre l’animation en pause' }).click();
  await expect(window).toHaveAttribute('data-playing', 'false');
  await sheet.getByRole('button', { name: 'Reprendre l’animation' }).click();
  await expect(window).toHaveAttribute('data-playing', 'true');

  await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
  await expect(page.getByRole('radio', { name: /^Espagnol/ })).toBeFocused();
  await page.getByText('Italien', { exact: true }).click();
  await page.getByRole('button', { name: 'Venise' }).click();
  await expect(window.locator('.porthole-bubble')).toHaveText('Ciao, Venezia!');
  await page.getByLabel('Date de départ').fill('2027-04-02');
  await expectAccessible(page, 'nouveau voyage');
  await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByRole('heading', { name: 'Ciao, Adrien!' })).toBeVisible();
  await expect(page.locator('.postcard-place')).toHaveText('Venezia');

  // Two trips in one language, then one of them removed.
  await trips.click();
  await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
  await page.getByText('Espagnol', { exact: true }).click();
  await page.getByRole('button', { name: 'Andalousie' }).click();
  await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await trips.click();
  await expect(sheet.getByRole('radio')).toHaveCount(3);
  await page.getByRole('button', { name: 'Modifier le voyage : Espagnol · Andalousie' }).click();
  await page.getByRole('button', { name: 'Supprimer ce voyage' }).click();
  await page.getByRole('button', { name: 'Supprimer', exact: true }).click();
  await expect(sheet.getByRole('radio')).toHaveCount(2);
  await sheet.locator('label').filter({ hasText: 'Espagnol · Barcelone' }).click();
  await expect(window.locator('.porthole-bubble')).toHaveText('¡Hola, Barcelona!');
  await page.getByRole('button', { name: 'C’est noté' }).click();
  await expect(page.locator('.postcard-place')).toHaveText('Barcelona');
  await page.reload();
  await expect(trips).toContainText('Espagnol · Barcelone');

  // Lexicons and translation stay at hand in every language of the trips.
  await page.getByRole('link', { name: 'Phrases' }).click();
  await expect(page.getByRole('button', { name: 'Espagnol' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Italien' }).click();
  await expect(page.locator('.fold .phrase-t').first()).toHaveAttribute('lang', 'it-IT');
  await page.getByLabel('Phrase en français').fill('Je voudrais un café');
  await expect(page.getByRole('button', { name: 'Traduire en italien' })).toBeVisible();
});

test('a trip wears its destination’s country: Ireland for Dublin, not the United Kingdom', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  const accent = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
  const addTrip = async (place: string) => {
    await page.getByRole('button', { name: /^Mes voyages/ }).click();
    await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
    await page.getByText('Anglais', { exact: true }).click();
    await page.getByRole('button', { name: place }).click();
    await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
    await page.getByRole('button', { name: 'Fermer' }).click();
  };
  await addTrip('Dublin');
  await expect.poll(accent).toBe('#1FA36A');
  await addTrip('Londres');
  await expect.poll(accent).toBe('#012169');
});

test('prices by ear pay in the destination’s money: dollars in New York', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  await page.getByRole('button', { name: /^Mes voyages/ }).click();
  await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
  await page.getByText('Anglais', { exact: true }).click();
  await page.getByRole('button', { name: 'New York' }).click();
  await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('link', { name: 'Entraînement' }).click();
  await page.getByRole('button', { name: /Prix à l’oreille/ }).click();
  const prices = page.locator('.price-grid .choice');
  await expect(prices).toHaveCount(4);
  for (const price of await prices.allTextContents()) expect(price).toMatch(/^\d+,\d\d \$$/);
});

test('regional packs open on their introduction and speak in their own voice; the destination’s tip leads Phrases', async ({
  page,
}) => {
  await onboard(page);
  await leaveFirstLesson(page);
  await page.getByRole('button', { name: /Le catalan/ }).click();
  const sheet = page.locator('.sheet');
  await expect(page.locator('.sheet-dialog')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sheet.getByRole('button', { name: 'Fermer' })).toBeFocused();
  await expect(sheet).toContainText('un « Bon dia » fait toujours plaisir');
  await expect(sheet.locator('.preview-t').first()).toHaveAttribute('lang', 'ca');
  await expectAccessible(page, 'pack sheet');
  await sheet.getByRole('button', { name: 'Commencer' }).click();
  await expect(page.getByRole('button', { name: 'Quitter la session' })).toBeVisible();
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();

  await page.getByRole('button', { name: /^Mes voyages/ }).click();
  await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
  await page.getByText('Anglais', { exact: true }).click();
  await page.getByRole('button', { name: 'New York' }).click();
  await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('button', { name: /L’anglais américain/ }).click();
  await expect(sheet).toContainText('les mots du quotidien changent');
  await expect(sheet.locator('.preview-t').first()).toHaveAttribute('lang', 'en-US');
  await sheet.getByRole('button', { name: 'Écouter' }).first().click();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __speakers: string[] }).__speakers.at(-1)))
    .toBe('Samantha');
  await sheet.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('link', { name: 'Phrases' }).click();
  await expect(page.locator('.tips .tip h3').first()).toHaveText('Aux États-Unis');
});

test('the next trip is offered once the one in focus has begun', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-12-22T09:00:00'));
  await onboard(page);
  await leaveFirstLesson(page);
  await expect(page.locator('.postcard-when')).toHaveText('Sur place : à toi de parler');
  await expect(page.getByRole('region', { name: 'Voyage suivant' })).toHaveCount(0);
  await page.getByRole('button', { name: /^Mes voyages/ }).click();
  await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
  await page.getByText('Italien', { exact: true }).click();
  await page.getByRole('button', { name: 'Rome' }).click();
  await page.getByLabel('Date de départ').fill('2027-01-10');
  await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await page.getByRole('button', { name: /^Mes voyages/ }).click();
  await page.locator('.sheet label').filter({ hasText: 'Espagnol · Barcelone' }).click();
  await page.getByRole('button', { name: 'C’est noté' }).click();
  const next = page.getByRole('region', { name: 'Voyage suivant' });
  await expect(next).toContainText('Prochain voyage : Italien · Rome');
  await expect(next).toContainText('Départ dans 19 jours');
  await expectAccessible(page, 'next trip');
  await next.getByRole('button', { name: 'Préparer ce voyage' }).click();
  await expect(page.getByRole('heading', { name: 'Ciao, Adrien!' })).toBeVisible();
  await expect(next).toHaveCount(0);
});

test('each trip keeps its own hotel on the card, and Moi lists and switches trips', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  const hotel = page.getByText('À l’hôtel Sol, s’il vous plaît.');
  await page.getByRole('link', { name: 'Carte' }).click();
  await page.getByRole('button', { name: 'Modifier' }).click();
  await page.getByLabel('Mon hôtel à Barcelone').fill('Sol');
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(hotel).toBeVisible();

  await page.getByRole('link', { name: 'Moi' }).click();
  await expect(page.getByText('Apprend l’espagnol pour un voyage à Barcelone')).toBeVisible();
  await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
  await page.getByText('Portugais', { exact: true }).click();
  await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
  await page.getByRole('button', { name: 'Fermer' }).click();
  await expect(page.getByText('Apprend le portugais et l’espagnol pour 2 voyages')).toBeVisible();
  await page.getByRole('link', { name: 'Carte' }).click();
  await expect(page.getByRole('heading', { name: 'Ma carte' })).toBeVisible();
  await expect(hotel).toHaveCount(0);
  await page.getByRole('link', { name: 'Moi' }).click();
  await page.locator('label').filter({ hasText: 'Espagnol · Barcelone' }).click();
  await page.getByRole('link', { name: 'Carte' }).click();
  await expect(hotel).toBeVisible();
});

test('Portuguese and English each play a first lesson to the end', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  for (const [language, hello] of [
    ['Portugais', 'Olá, Adrien!'],
    ['Anglais', 'Hello, Adrien!'],
  ] as const) {
    await page.getByRole('button', { name: /^Mes voyages/ }).click();
    await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
    await page.getByText(language, { exact: true }).click();
    await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
    await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
    await playSession(page);
    await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
    await expect(page.getByRole('heading', { name: hello })).toBeVisible();
  }
});

test('a tab opens at its top, wherever the last one was scrolled', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  await page.getByRole('link', { name: 'Moi' }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.getByRole('link', { name: 'Phrases' }).click();
  await expect(page.getByRole('heading', { name: 'Phrases', level: 1 })).toBeVisible();
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Adrien', level: 1 })).toBeVisible();
});

test.describe('on an iPhone, in Safari', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1',
  });

  test('asks the browser to keep data, and asks to install once there is progress to lose', async ({ page }) => {
    await page.addInitScript(() => {
      const asked: number[] = [];
      Object.assign(window, { __persist: asked });
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        value: { persist: async () => asked.push(1) > 0 && false, persisted: async () => false },
      });
    });
    await onboard(page);
    await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
    await playSession(page);
    await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
    await expect(page.getByRole('heading', { name: 'Garde ta progression' })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __persist: number[] }).__persist.length)).toBeGreaterThan(
      0,
    );
  });
});

test('quiet mode: nothing speaks on its own, the listening drills wait, the sound comes back', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  const quiet = page.getByRole('button', { name: 'Mode discret' });
  await expect(quiet).toHaveAttribute('aria-pressed', 'false');
  await quiet.click();
  await expect(quiet).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('status')).toContainText('Mode discret jusqu’à');
  const spoken = () => page.evaluate(() => (window as unknown as { __spoken: string[] }).__spoken.length);
  const before = await spoken();
  await playSession(page);
  expect(await spoken()).toBe(before);
  await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('link', { name: 'Entraînement' }).click();
  await expect(page.locator('.quiet-note')).toContainText('Mode discret jusqu’à');
  await expect(page.getByRole('button', { name: /^Écoute/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Remettre le son' }).click();
  await expect(page.locator('.quiet-note')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Écoute/ })).toBeEnabled();
});

test('« Je ne peux pas écouter maintenant » swaps the listening exercise and goes quiet', async ({ page }) => {
  // A fixed clock makes the session's random choices repeatable.
  await page.clock.setFixedTime(new Date('2026-11-18T09:00:00'));
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  const cant = page.getByRole('button', { name: 'Je ne peux pas écouter maintenant' });
  for (let i = 0; i < 40 && !(await cant.isVisible()); i++) await playStep(page);
  await cant.click();
  await expect(page.getByRole('status')).toContainText('Mode discret jusqu’à');
  await expect(cant).toHaveCount(0);
  await expect(page.locator('#dictation, .say-row.center')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mode discret' })).toHaveAttribute('aria-pressed', 'true');
});

test('the pronunciation check asks first, marks the words it heard, and a retry shows progress', async ({ page }) => {
  await page.addInitScript(FAKE_RECOGNITION, false);
  await toSpeakingDrill(page);
  const mic = page.getByRole('button', { name: 'Dire la phrase' });
  await mic.click();
  await expect(page.locator('.speak-ask')).toContainText('sinon par son service en ligne');
  await expectAccessible(page, 'asking');
  await hearNext(page, { error: 'no-speech' });
  await page.getByRole('button', { name: 'Vérifier ma prononciation' }).click();
  await expect(page.getByText('Je n’ai rien entendu.')).toBeVisible();
  await hearNext(page, { transcripts: ['mmm'] });
  await mic.click();
  const panel = page.locator('.feedback');
  await expect(panel.locator('.feedback-title')).toHaveText('Pas encore compris');
  await expect(panel).toHaveClass(/\bko\b/);
  await expect(panel).toContainText('J’ai entendu : « mmm »');
  await expect(panel.locator('.word-heard')).toHaveCount(0);
  await expectAccessible(page, 'missed words');
  const phrase = await panel.locator('.feedback-answer').evaluate(el => {
    const copy = el.cloneNode(true) as HTMLElement;
    for (const hidden of copy.querySelectorAll('.sr-only')) hidden.remove();
    return copy.textContent ?? '';
  });
  // The best of the recogniser's guesses counts.
  await hearNext(page, { transcripts: ['euh', phrase] });
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(panel.locator('.feedback-title')).toHaveText('Je t’ai compris');
  await expect(panel).toHaveClass(/\bok\b/);
  await expect(panel.locator('.word-missed')).toHaveCount(0);
  await panel.getByRole('button', { name: 'Continuer' }).click();
  // Asked once: the next phrase goes straight to listening.
  await hearNext(page, { transcripts: ['mmm'] });
  await page.getByRole('button', { name: 'Dire la phrase' }).click();
  await expect(panel.locator('.feedback-title')).toHaveText('Pas encore compris');
  await expect(page.locator('.speak-ask')).toHaveCount(0);
  const runs = await started(page);
  expect(runs).toHaveLength(4);
  expect(runs.every(r => r.lang === 'es-ES' && !r.processLocally)).toBe(true);
});

test('on the device, the check says so; declined, the learner records; deaf, it gives way', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(FAKE_RECOGNITION, true);
  await toSpeakingDrill(page);
  await page.getByRole('button', { name: 'Dire la phrase' }).click();
  await expect(page.locator('.speak-ask')).toContainText('ta voix n’en sort pas');
  await page.getByRole('button', { name: 'Juste m’enregistrer' }).click();
  // Headless Chrome has no microphone: the answer shows, to be judged by ear.
  await page.getByRole('button', { name: 'Je l’ai bien dit' }).click();
  await page.locator('.feedback').getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('button', { name: 'Enregistrer ma voix' })).toBeVisible();
  await page.getByRole('button', { name: 'Quitter la session' }).click();
  await page.getByRole('button', { name: 'Quitter', exact: true }).click();
  await page.getByRole('link', { name: 'Moi' }).click();
  const toggle = page.getByRole('switch', { name: 'Vérifier ma prononciation' });
  await expect(toggle).toHaveAttribute('aria-checked', 'false');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('link', { name: 'Entraînement' }).click();
  await page.getByRole('button', { name: /^Prononciation/ }).click();
  await hearNext(page, 'deaf');
  await page.getByRole('button', { name: 'Dire la phrase' }).click();
  await expect(page.getByText('Je t’écoute…')).toBeVisible();
  await page.clock.runFor(11_000);
  await expect(page.getByText('La reconnaissance vocale ne répond pas.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enregistrer ma voix' })).toBeVisible();
  expect(await started(page)).toEqual([{ lang: 'es-ES', processLocally: true }]);
});

test('the update notice fits the screen, and « Plus tard » sets it aside', async ({ page }) => {
  // A real update: the service worker file changes, the browser installs the new one, which waits.
  const sw = resolve('.e2e-dist/sw.js');
  const original = await readFile(sw, 'utf8');
  try {
    await page.goto('./');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await writeFile(sw, `${original}\n// next version`);
    await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    const notice = page.locator('.toast').filter({ hasText: 'Une nouvelle version est prête.' });
    await expect(notice).toBeVisible();
    await settle(page);
    const box = (await notice.boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    // It once shrank to half the screen on phones.
    if (width < 720) expect(box.width).toBeGreaterThan(width * 0.75);
    await expect(notice.getByRole('button', { name: 'Mettre à jour' })).toBeVisible();
    await notice.getByRole('button', { name: 'Plus tard' }).click();
    await expect(notice).toHaveCount(0);
  } finally {
    await writeFile(sw, original);
  }
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

test('a situation page answers in the language, speaks its phrases, and opens its lesson in the app', async ({
  page,
}) => {
  const counted: string[] = [];
  await page.route(`${TRANSLATE_URL}/count`, async route => {
    for (const c of route.request().postDataJSON().counts) counted.push(`${c.name} ${c.value} ${c.source}`);
    await route.fulfill({ status: 204 });
  });
  await page.goto('./italien/commander-un-cafe/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comment commander un café en italien ?');
  // Bernard by the name, in the course's flag, as in the app; the drawing moves until paused.
  await expect(page.getByRole('link', { name: 'bagage', exact: true }).locator('svg.mascot')).toBeVisible();
  const drawing = page.locator('.page-scenery');
  await expect(drawing).toHaveAttribute('data-playing', 'true');
  await page.getByRole('button', { name: 'Mettre l’animation en pause' }).click();
  await expect(drawing).toHaveAttribute('data-playing', 'false');
  await expect(page.locator('.page-t').first()).toHaveAttribute('lang', 'it-IT');
  await page.getByRole('button', { name: 'Écouter' }).first().click();
  expect(await page.evaluate(() => (window as unknown as { __speakers: string[] }).__speakers)).toEqual(['Alice']);
  await expectAccessible(page, 'page de situation');

  await page.getByRole('link', { name: 'Apprendre ces phrases' }).click();
  await expect(page).toHaveURL(/\/\?utm_source=page#\/apprendre\/it\/bar$/);
  // The link chose the language and the page introduced Bagage: the app starts at the destination.
  await expect(page.getByRole('heading', { name: 'Où vas-tu ?' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'Étape 2 sur 6' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page.getByRole('radio', { name: /^Italien/ })).toBeChecked();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Rome' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Je ne sais pas encore' }).click();
  await page.getByLabel('Ton prénom').fill('Léa');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await expect(page.locator('.ex').first()).toContainText(/caffè|expresso/);
  // The steps reached, going back to the language included: the welcome was never shown.
  const steps = ['destination', 'language', 'date', 'travellers', 'rhythm', 'imagine', 'lesson'];
  await expect.poll(() => [...counted].sort()).toEqual(['new  page', ...steps.map(s => `step ${s} page`)].sort());
});

test('a situation page’s lesson opens in the traveller’s trip in that language, or home without one', async ({
  page,
}) => {
  await onboard(page);
  await leaveFirstLesson(page);
  await page.goto('./#/apprendre/es/bar');
  await expect(page).toHaveURL(/#\/session$/);
  await expect(page.locator('.ex').first()).toContainText('café');
  await page.goto('./#/apprendre/it/bar');
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
  await page.goto('./#/apprendre/es');
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('heading', { name: '¡Hola, Adrien!' })).toBeVisible();
});

test('a language page leads to its situations and back, and into its course in the app', async ({ page }) => {
  await page.goto('./portugais/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Portugais : les phrases pour voyager');
  await expectAccessible(page, 'page de langue');
  await page.getByRole('link', { name: /^Commander un café/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comment commander un café en portugais ?');
  await page.getByRole('navigation', { name: 'Fil d’Ariane' }).getByRole('link', { name: 'Portugais' }).click();
  await page.getByRole('link', { name: 'Apprendre le portugais' }).click();
  await expect(page).toHaveURL(/\/\?utm_source=page#\/apprendre\/pt$/);
  await expect(page.getByRole('heading', { name: 'Où vas-tu ?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Lisbonne' })).toBeVisible();
  await page.getByRole('button', { name: 'Retour' }).click();
  await expect(page.getByRole('radio', { name: /^Portugais/ })).toBeChecked();
});

test('search engines find every page, its picture for shared links, and the proof the pages are ours', async ({
  page,
  request,
}) => {
  const sitemap = await (await request.get('./sitemap.xml')).text();
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url!.slice(BRAND.url.length));
  expect(listed).toContain('');
  expect(listed).toContain('anglais/');
  expect(listed).toContain('italien/arriver-a-l-hotel/');
  for (const path of listed.slice(1)) expect((await request.get(`./${path}`)).ok(), path).toBe(true);
  expect(await (await request.get('./robots.txt')).text()).toContain(`Sitemap: ${BRAND.url}sitemap.xml`);
  expect(await (await request.get('./llms.txt')).text()).toMatch(/^# Bagage\n/);
  expect(await (await request.get(`./${INDEXNOW_KEY}.txt`)).text()).toBe(INDEXNOW_KEY);
  expect((await request.get('./og.png')).headers()['content-type']).toBe('image/png');
  await page.goto('./');
  await expect(page).toHaveTitle('Bagage : les phrases de survie pour voyager');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', BRAND.url);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', `${BRAND.url}og.png`);
});

test('the app, once installed, leaves the situation pages to the network', async ({ page }) => {
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await page.goto('./espagnol/demander-de-l-aide/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comment demander de l’aide en espagnol ?');
});

test('the app and its pages run their own scripts only', async ({ page }) => {
  for (const path of ['./', './espagnol/']) {
    await page.goto(path);
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
      'content',
      new RegExp(`script-src 'self';.*connect-src 'self' ${TRANSLATE_URL}`),
    );
    const ran = await page.evaluate(async () => {
      const script = document.createElement('script');
      script.textContent = 'window.__injected = true';
      document.head.append(script);
      await new Promise(resolve => setTimeout(resolve, 50));
      return (window as unknown as { __injected?: boolean }).__injected === true;
    });
    expect(ran, path).toBe(false);
  }
  expect(refused).toEqual([expect.stringMatching(/inline script/), expect.stringMatching(/inline script/)]);
  refused = [];
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

test('the first goal starts with the answers of onboarding, and its last XP count in phrases', async ({ page }) => {
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page);
  await expect(page.locator('.ticket-goal')).toContainText('Dont 8 XP pour tes réponses à l’accueil.');
  await page.getByRole('button', { name: 'Continuer' }).click();

  // Three XP short of today's goal. The app's own pending save must not overwrite this one.
  await page.evaluate(() => {
    const save = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {};
    const db = JSON.parse(localStorage.getItem('db-v4')!);
    db.data[db.active].days[new Date().toLocaleDateString('sv')] = { xp: 37, sessions: 1 };
    save.call(localStorage, 'db-v4', JSON.stringify(db));
  });
  await page.reload();
  await expect(page.locator('.daily-title').first()).toHaveText('Plus que 3 phrases pour ton objectif du jour');
});

test('two travellers on one phone play as a team', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'C’est parti' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByRole('button', { name: 'Barcelone' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel('Date de départ').fill('2026-12-20');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByLabel('Ton prénom').fill('Léa');
  await page.getByRole('button', { name: 'On part à deux' }).click();
  await page.getByLabel('Prénom du second voyageur').fill('Sam');
  await page.getByRole('button', { name: 'Continuer' }).click();
  await page.getByText('Régulier').click();
  await page.getByRole('button', { name: 'Avec mon café du matin' }).click();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await leaveFirstLesson(page);
  const team = page.getByRole('region', { name: 'Votre équipe' }).first();
  await expect(team).toContainText('16/400 XP');
  await expect(team.locator('.team-name')).toHaveText(['Léa', 'Sam']);
  await expect(team).toContainText('Encore 384 XP ensemble cette semaine');
  await expectAccessible(page, 'équipe');
});

test('desktop sessions work from the keyboard', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'keyboard flow is a desktop concern');
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await playSession(page, true);
  await expect(page.locator('.ticket')).toBeVisible();
});

test('counts each first step and a new traveller without saying who, and nothing more once switched off in « Moi »', async ({
  page,
}) => {
  const counted: unknown[] = [];
  await page.route(`${TRANSLATE_URL}/count`, async route => {
    counted.push(...route.request().postDataJSON().counts);
    await route.fulfill({ status: 204 });
  });
  await onboard(page);
  await leaveFirstLesson(page);
  const today = await page.evaluate(() => new Date().toLocaleDateString('sv'));
  const steps = ['welcome', 'language', 'destination', 'date', 'travellers', 'rhythm', 'imagine', 'lesson'];
  await expect
    .poll(() => counted)
    .toEqual([
      ...steps.map(value => ({ name: 'step', day: today, value, source: '' })),
      { name: 'new', day: today, value: '', source: '' },
    ]);

  await page.getByRole('link', { name: 'Moi' }).click();
  const share = page.getByRole('switch', { name: 'Statistiques anonymes' });
  await expect(share).toHaveAttribute('aria-checked', 'true');
  await share.click();
  await expect(share).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Ajouter un voyageur' }).click();
  await page.getByLabel('Prénom').fill('Sam');
  await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(3500);
  expect(counted).toHaveLength(steps.length + 1);
});

test('the welcome offers to switch the anonymous statistics off before onboarding is counted', async ({ page }) => {
  const counted: { name: string; value: string }[] = [];
  await page.route(`${TRANSLATE_URL}/count`, async route => {
    counted.push(...route.request().postDataJSON().counts);
    await route.fulfill({ status: 204 });
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Statistiques anonymes' }).click();
  const share = page.getByRole('switch', { name: 'Statistiques anonymes' });
  await expect(share).toHaveAttribute('aria-checked', 'true');
  await expectAccessible(page, 'statistiques anonymes');
  await share.click();
  await expect(share).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'C’est noté' }).click();
  await onboard(page);
  await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(3500);
  // The welcome may have been counted while it was read: nothing after the switch.
  expect(counted.filter(c => c.value !== 'welcome')).toEqual([]);
});

test('a traveller sends their card as a picture, and the counts say a card brought them and that they shared', async ({
  page,
}) => {
  const counted: { name: string; source: string }[] = [];
  await page.route(`${TRANSLATE_URL}/count`, async route => {
    counted.push(...route.request().postDataJSON().counts);
    await route.fulfill({ status: 204 });
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'canShare', { value: undefined, configurable: true });
    // As in Safari, where decode() never settles for an SVG image (WebKit bug 198527).
    HTMLImageElement.prototype.decode = () => new Promise(() => {});
  });
  await onboard(page, 'Adrien', undefined, './?utm_source=carte');
  await leaveFirstLesson(page);
  await page.getByRole('link', { name: 'Carte' }).click();

  // Where the browser cannot share a file, the picture is saved instead.
  await page.getByRole('button', { name: 'Partager ma carte' }).click();
  const save = page.getByRole('link', { name: 'Enregistrer l’image' });
  await expect(save).toHaveAttribute('download', 'bagage-ma-carte.png');
  const preview = page.locator('.share-preview');
  expect(await preview.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1080);
  await expectAccessible(page, 'partager ma carte');
  await Promise.all([page.waitForEvent('download'), save.click()]);
  await expect(page.getByRole('status')).toHaveText('Image enregistrée : joins-la à un message.');
  await page.getByRole('button', { name: 'Fermer' }).click();

  await page.evaluate(() => {
    const sent: { type: string; text: string }[] = [];
    Object.assign(window, { __sent: sent });
    Object.defineProperty(navigator, 'canShare', { value: (d: { files?: File[] }) => !!d.files?.length });
    Object.defineProperty(navigator, 'share', {
      value: async (d: { files: File[]; text: string }) => sent.push({ type: d.files[0]!.type, text: d.text }),
    });
  });
  await page.getByRole('button', { name: 'Partager ma carte' }).click();
  await page.getByRole('button', { name: 'Partager', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Carte envoyée.');
  expect(await page.evaluate(() => (window as unknown as { __sent: unknown[] }).__sent)).toEqual([
    {
      type: 'image/png',
      text: expect.stringMatching(
        /^Ma carte pour voyager à Barcelone, faite avec Bagage\s: https:.+\?utm_source=carte$/,
      ),
    },
  ]);
  await expect
    .poll(() => counted.filter(c => c.name !== 'step').map(c => `${c.name} ${c.source}`))
    .toEqual(['new carte', 'shared carte']);
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

const pupils = (page: Page) =>
  page.locator('.porthole-bernard .mascot').evaluate(el => {
    const style = (el as SVGElement).style;
    return { x: Number(style.getPropertyValue('--px')), y: Number(style.getPropertyValue('--py')) };
  });

const countBlinks = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __blinks: number };
    w.__blinks = 0;
    new MutationObserver(records => {
      for (const r of records) if ((r.target as Element).classList.contains('blink')) w.__blinks++;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
  });
const blinks = (page: Page) => page.evaluate(() => (window as unknown as { __blinks: number }).__blinks);

test('Bernard’s greeting leaves the view clear, and comes back when he is tapped', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Mettre le voyage en pause' }).click();
  const opacity = () => page.locator('.porthole-bubble').evaluate(b => Number(getComputedStyle(b).opacity));
  await expect.poll(opacity).toBeGreaterThan(0.9);
  await expect.poll(opacity, { timeout: 8000 }).toBe(0);
  await page.locator('.porthole-bernard').click();
  await expect.poll(opacity).toBeGreaterThan(0.9);
});

test('Bernard’s bubble leaves his eyes visible', async ({ page }) => {
  for (const viewport of [page.viewportSize()!, { width: 320, height: 568 }]) {
    await page.setViewportSize(viewport);
    await page.goto('./');
    await expect(page.locator('.porthole-bubble')).toBeVisible();
    await settle(page);
    const covered = await page.evaluate(() => {
      const b = document.querySelector('.porthole-bubble')!.getBoundingClientRect();
      const tail = 8; // the point of the bubble, drawn under its box
      return [...document.querySelectorAll('.porthole-bernard .mascot-eye > circle:first-child')].some(eye => {
        const e = eye.getBoundingClientRect();
        return e.left < b.right && e.right > b.left && e.top < b.bottom + tail && e.bottom > b.top;
      });
    });
    expect(covered, `${viewport.width}px`).toBe(false);
  }
});

test('Bernard’s eyes follow the mouse and a finger', async ({ page }, info) => {
  await page.goto('./');
  await settle(page);
  const box = (await page.locator('.porthole-bernard .mascot').boundingBox())!;
  const { width, height } = page.viewportSize()!;
  const eyes = { x: box.x + box.width * 0.33, y: box.y + box.height * 0.31 };
  await page.mouse.move(2, eyes.y);
  await expect.poll(async () => (await pupils(page)).x).toBeLessThan(-2);
  await page.mouse.move(width - 2, eyes.y);
  await expect.poll(async () => (await pupils(page)).x).toBeGreaterThan(2);
  await page.mouse.move(eyes.x, height - 2);
  await expect.poll(async () => (await pupils(page)).y).toBeGreaterThan(2);
  if (info.project.name === 'iphone') {
    // A tap above and to the left of him, away from any button.
    await page.touchscreen.tap(4, 4);
    await expect.poll(async () => (await pupils(page)).y).toBeLessThan(-1);
  }
});

test('Bernard blinks while the journey plays, and not once it is paused', async ({ page }) => {
  await page.clock.install();
  await page.goto('./');
  await countBlinks(page);
  await page.clock.runFor(8000);
  expect(await blinks(page)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Mettre le voyage en pause' }).click();
  await countBlinks(page);
  await page.clock.runFor(8000);
  expect(await blinks(page)).toBe(0);
});

test('the welcome window stays still for people who ask for less motion', async ({ page }) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./');
  await expect(page.locator('.porthole-bubble')).toHaveText('¡Hola, Barcelona!');
  const rest = await pupils(page);
  await countBlinks(page);
  await page.mouse.move(2, 2);
  await page.clock.runFor(8000);
  expect(await pupils(page)).toEqual(rest);
  expect(await blinks(page)).toBe(0);
  await expect(page.locator('.porthole')).toHaveAttribute('data-playing', 'false');
  await expect(page.getByRole('button', { name: 'Mettre le voyage en pause' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Voler vers la destination suivante' }).click();
  await expect(page.locator('.porthole-bubble')).toHaveText('Ciao, Roma!');
});

const SCREENS = ['#/', '#/entrainement', '#/phrases', '#/carte', '#/moi'];

test('nothing is too small to tap, too close, cut, or wider than the screen', async ({ page }, info) => {
  test.slow(info.project.name === 'iphone', 'the phone run walks three layouts: phone, small phone, tablet');
  const audit = async (where: string) => {
    await settle(page);
    const problems = await page.evaluate(() => {
      // The body clips sideways overflow as a safety net; lift it to see the real layout.
      document.body.style.overflowX = 'visible';
      const out: string[] = [];
      const extra = document.documentElement.scrollWidth - window.innerWidth;
      if (extra > 1) {
        const wide = [...document.querySelectorAll('body *')]
          .filter(el => el.getBoundingClientRect().right > window.innerWidth + 1 && !el.closest('.porthole'))
          .slice(0, 3)
          .map(el => el.outerHTML.slice(0, 80));
        out.push(`${extra}px wider than the screen: ${wide.join(' | ')}`);
      }
      document.body.style.overflowX = '';
      const sel = 'button, a[href], input:not(.sr-only), select, textarea, label.choice, summary';
      const visible = (el: Element) => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        return (
          r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight && r.left >= 0
        );
      };
      const els = [...document.querySelectorAll(sel)].filter(el => visible(el) && !el.closest('.gloss-word, .skip'));
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (Math.min(r.width, r.height) < 44)
          out.push(`small ${Math.round(r.width)}x${Math.round(r.height)}: ${el.outerHTML.slice(0, 80)}`);
      }
      // A label running out of its box, such as a tab name into the next one.
      for (const el of document.querySelectorAll('button, a[href], .nav-item, h1, h2, h3')) {
        if (!visible(el) || el.closest('.porthole, .skip')) continue;
        if (el.scrollWidth > el.clientWidth + 1)
          out.push(`cut ${el.scrollWidth}>${el.clientWidth}: ${el.outerHTML.slice(0, 80)}`);
      }
      // A single word broken over two lines, as « Barcelon / a » once was on a small phone.
      for (const el of document.querySelectorAll('h1, h2, .postcard-place')) {
        const text = el.textContent?.trim() ?? '';
        // A hyphenated name may wrap after its hyphen; a plain word may not wrap at all.
        if (!text || /[\s-]/.test(text) || !visible(el)) continue;
        const range = document.createRange();
        range.selectNodeContents(el);
        const lines = new Set([...range.getClientRects()].map(r => Math.round(r.top)));
        if (lines.size > 1) out.push(`« ${text} » split over ${lines.size} lines`);
      }
      // Bernard and the stamps never sit on text, whatever the length of a name or a title. The
      // drawing leaves the corners of its box empty, hence the inset.
      const marks = [...document.querySelectorAll('.mascot, .stamp')].filter(
        el => visible(el) && !el.closest('.porthole'),
      );
      if (marks.length) {
        const lines: { box: DOMRect; text: string }[] = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          const text = node.textContent?.trim() ?? '';
          const parent = node.parentElement;
          if (!text || !parent || parent.closest('.mascot, .stamp, .porthole, .sr-only') || !visible(parent)) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const box of range.getClientRects()) if (box.width && box.height) lines.push({ box, text });
        }
        for (const mark of marks) {
          const m = mark.getBoundingClientRect();
          const inset = m.width * 0.1;
          const was = (mark as HTMLElement).style.pointerEvents;
          (mark as HTMLElement).style.pointerEvents = 'auto';
          for (const { box, text } of lines) {
            const [left, right] = [Math.max(box.left, m.left + inset), Math.min(box.right, m.right - inset)];
            const [top, bottom] = [Math.max(box.top, m.top + inset), Math.min(box.bottom, m.bottom - inset)];
            if (left >= right || top >= bottom) continue;
            // Covered only if the mark is the one on top there (a fixed bar may pass over a stamp).
            const onTop = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
            if (onTop?.closest('.mascot, .stamp') === mark)
              out.push(`${mark.classList[0]} covers « ${text.slice(0, 30)} »`);
          }
          (mark as HTMLElement).style.pointerEvents = was;
        }
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
  const run = async (size: string) => {
    await page.goto('./anglais/commander-au-restaurant/');
    await audit(`${size}: page de situation`);
    await page.goto('./espagnol/');
    await audit(`${size}: page de langue`);
    await page.goto('./');
    // Back to a first launch. The app saves pending changes when the page goes away, so that save
    // is switched off before the data is cleared.
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {};
      localStorage.clear();
    });
    await page.goto('./');
    await audit(`${size}: welcome`);
    await page.getByRole('button', { name: 'Statistiques anonymes' }).click();
    await expect(page.locator('.sheet')).toBeVisible();
    await audit(`${size}: statistiques anonymes`);
    await page.getByRole('button', { name: 'C’est noté' }).click();
    // The longest first name the form accepts is 24 characters: layouts are checked near it.
    await onboard(page, 'Marie-Charlotte-Eugénie', step => audit(`${size}: ${step}`));
    await audit(`${size}: onboarding`);
    await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
    await audit(`${size}: session`);
    await page.getByRole('button', { name: 'Quitter la session' }).click();
    await expect(page.locator('.sheet')).toBeVisible();
    await audit(`${size}: quit dialog`);
    await page.getByRole('button', { name: 'Quitter', exact: true }).click();
    await page.getByRole('button', { name: /^Mes voyages/ }).click();
    await audit(`${size}: mes voyages`);
    await page.getByRole('button', { name: 'Ajouter un voyage', exact: true }).click();
    await audit(`${size}: nouveau voyage`);
    await page.getByText('Italien', { exact: true }).click();
    // The photo's slow arrival only delays the check: it is skipped, the layout is the same.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: 'Ajouter ce voyage' }).click();
    await audit(`${size}: landing`);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: 'Plus tard' }).click();
    // A second traveller brings the team card to the home screen and the day column.
    await page.goto('./#/moi');
    await page.getByRole('button', { name: 'Ajouter un voyageur' }).click();
    await page.getByLabel('Prénom').fill('Jean-Baptiste-Alexandre');
    await page.getByRole('button', { name: 'Ajouter', exact: true }).click();
    for (const hash of SCREENS) {
      await page.goto(`./${hash}`);
      await audit(`${size}: ${hash}`);
    }
    await page.goto('./#/carte');
    await page.getByRole('button', { name: 'Partager ma carte' }).click();
    await expect(page.locator('.share-preview')).toBeVisible();
    await audit(`${size}: partager ma carte`);
  };
  await run(`${page.viewportSize()!.width}px`);
  // The phone run also covers a small phone (iPhone SE, first model) and a tablet.
  if (info.project.name === 'iphone')
    for (const viewport of [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
    ]) {
      await page.setViewportSize(viewport);
      await run(`${viewport.width}px`);
    }
});

test('no serious accessibility issue on the main screens', async ({ page }) => {
  const check = (where: string) => expectAccessible(page, where);
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
