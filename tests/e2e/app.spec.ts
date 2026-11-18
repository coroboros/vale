import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';
import { TRANSLATE_URL } from '../../playwright.config';

/** Headless browsers have no voices. */
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

async function onboard(page: Page, name = 'Adrien', check: (step: string) => Promise<void> = async () => {}) {
  await page.goto('./');
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
  await expect(page.getByRole('heading', { name: 'Imagine.' })).toBeVisible();
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

test('« Imagine » shows the destination photo with its credit, and the mascot without it', async ({ page }) => {
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

  await page.route('**/photos/**', route => route.abort());
  await onboard(page);
  await expect(page.locator('.onboarding')).not.toHaveClass(/has-photo/);
  await expect(page.locator('.ob-imagine .mascot')).toBeVisible();
});

test('« Mon voyage » switches language and destination from Home, and each language keeps its trip', async ({
  page,
}) => {
  await onboard(page);
  await leaveFirstLesson(page);
  const trip = page.getByRole('button', { name: /^Mon voyage/ });
  await expect(trip).toContainText('Espagnol · Barcelone');
  await trip.click();
  await page.getByText('Italien', { exact: true }).click();
  await page.getByRole('button', { name: 'Venise' }).click();
  await page.getByLabel('Date de départ').fill('2027-04-02');
  await page.getByRole('button', { name: 'C’est noté' }).click();
  await expect(page.getByRole('heading', { name: 'Ciao, Adrien!' })).toBeVisible();
  await expect(page.locator('.postcard-place')).toHaveText('Venezia');
  await trip.click();
  await page.getByText('Espagnol', { exact: true }).click();
  await expect(page.getByLabel('Date de départ')).toHaveValue('2026-12-20');
  await page.getByRole('button', { name: 'C’est noté' }).click();
  await expect(page.locator('.postcard-place')).toHaveText('Barcelona');
  await page.reload();
  await expect(trip).toContainText('Espagnol · Barcelone');
});

test('Portuguese and English each play a first lesson to the end', async ({ page }) => {
  await onboard(page);
  await leaveFirstLesson(page);
  for (const [language, hello] of [
    ['Portugais', 'Olá, Adrien!'],
    ['Anglais', 'Hello, Adrien!'],
  ] as const) {
    await page.getByRole('button', { name: /^Mon voyage/ }).click();
    await page.getByText(language, { exact: true }).click();
    await page.getByRole('button', { name: 'C’est noté' }).click();
    await expect(page.getByRole('heading', { name: hello })).toBeVisible();
    await page.getByRole('button', { name: /^Les essentiels/ }).click();
    await page.getByRole('button', { name: 'Commencer', exact: true }).click();
    await playSession(page);
    await page.locator('.ticket-wrap').getByRole('button', { name: 'Continuer' }).click();
  }
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
        if (!text || /\s/.test(text) || !visible(el)) continue;
        const range = document.createRange();
        range.selectNodeContents(el);
        const lines = new Set([...range.getClientRects()].map(r => Math.round(r.top)));
        if (lines.size > 1) out.push(`« ${text} » split over ${lines.size} lines`);
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
    await page.goto('./');
    // Back to a first launch. The app saves pending changes when the page goes away, so that save
    // is switched off before the data is cleared.
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {};
      localStorage.clear();
    });
    await page.goto('./');
    await audit(`${size}: welcome`);
    await onboard(page, 'Léa', step => audit(`${size}: ${step}`));
    await audit(`${size}: onboarding`);
    await page.getByRole('button', { name: 'Apprendre ma première phrase' }).click();
    await audit(`${size}: session`);
    await page.getByRole('button', { name: 'Quitter la session' }).click();
    await expect(page.locator('.sheet')).toBeVisible();
    await audit(`${size}: quit dialog`);
    await page.getByRole('button', { name: 'Quitter', exact: true }).click();
    for (const hash of SCREENS) {
      await page.goto(`./${hash}`);
      await audit(`${size}: ${hash}`);
    }
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
