/**
 * The welcome page, written into the app's own index.html: what a newcomer in a browser reads before
 * the app, readable by search engines and AI crawlers that run no scripts. The app's components
 * settle on it once the script runs (ui/welcome-page.tsx); the installed app, a traveller who has
 * already set off and a link into the app skip it before the first paint (build/boot.ts).
 */
import type { Plugin } from 'vite';
import { BRAND } from '../src/brand.ts';
import { COURSES } from '../src/content/index.ts';
import { languageOf } from '../src/content/pages.ts';
import { countsEndpoint } from '../src/counts-api.ts';
import { THEMES, themeVars } from '../src/ui/themes.ts';
import { BOOT_SCRIPT } from './boot.ts';
import { esc, t } from './pages.ts';

const SLOT = '<!--welcome-->';

function hero(counts: boolean): string {
  return `
      <section class="wp-hero ob-welcome" aria-label="${t(BRAND.name)}">
        <div class="welcome-art">
          <div class="porthole-slot" data-island="journey"></div>
          <p class="porthole-hint">
            <span class="on-touch">${t('Touche le hublot, ou Bernard.')}</span>
            <span class="on-mouse">${t('Clique sur le hublot, ou sur Bernard.')}</span>
          </p>
        </div>
        <div class="welcome-text">
          <h1 class="wordmark big-mark">${esc(BRAND.name.toLowerCase())}</h1>
          <p class="lead">${t(BRAND.tagline)}</p>
          <p class="wp-what">${t(`${BRAND.headline} : ${BRAND.languages}.`)}</p>
          <ul class="promise">${BRAND.promise.map(p => `<li>${t(p)}</li>`).join('')}</ul>
          ${counts ? '<div data-island="counts"></div>' : ''}
        </div>
        <div class="welcome-actions">
          <button type="button" class="btn btn-primary btn-block" data-start>${t('C’est parti')}</button>
          <div data-island="install"></div>
        </div>
      </section>`;
}

function footer(): string {
  const languages = COURSES.map(c => `<li><a class="chip" href="${languageOf(c)}/">${t(c.name)}</a></li>`).join('');
  return `
      <footer class="wp-foot">
        <nav aria-label="${t('Les langues')}">
          <ul class="wp-links">${languages}</ul>
        </nav>
        <p>${t(`${BRAND.name}. ${BRAND.tagline}`)}</p>
      </footer>`;
}

/** The colours a newcomer's app wears, there from the first paint, before the script applies them. */
const colours = () =>
  Object.entries(themeVars(THEMES[COURSES[0]!.flag]))
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');

/** `counts`: the build counts, so the page holds the place of the statistics link. */
export const welcomeHtml = ({
  counts,
}: {
  counts: boolean;
}) => `<div id="welcome" class="welcome-page" style="${colours()}">
      <main class="wp-main">${hero(counts)}
      </main>${footer()}
    </div>`;

export function welcomePage(): Plugin {
  let counts = false;
  return {
    name: 'welcome-page',
    configResolved(config) {
      counts = countsEndpoint(config.env.VITE_COUNTS_URL) !== '';
    },
    transformIndexHtml: {
      order: 'pre',
      handler: html => ({
        html: html.replace(SLOT, welcomeHtml({ counts })),
        tags: [{ tag: 'script', children: BOOT_SCRIPT, injectTo: 'head' }],
      }),
    },
  };
}
