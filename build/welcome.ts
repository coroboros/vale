/**
 * The welcome page, written into the app's own index.html: what a newcomer in a browser reads before
 * the app, readable by search engines and AI crawlers that run no scripts. The app's components
 * settle on it once the script runs (ui/welcome-page.tsx); the installed app, a traveller who has
 * already set off and a link into the app skip it before the first paint (build/boot.ts).
 */
import type { Plugin } from 'vite';
import { BRAND, WELCOME } from '../src/brand.ts';
import { COURSES, flagOf, pictureOf, regionOf, WELCOME_TRIP } from '../src/content/index.ts';
import { languageOf, pagePath, SITUATIONS } from '../src/content/pages.ts';
import type { Course } from '../src/content/types';
import { countsEndpoint } from '../src/counts-api.ts';
import { type Photo, photoFiles, photoOf } from '../src/ui/photos.ts';
import { BOOT_SCRIPT } from './boot.ts';
import { esc, t, themeStyle } from './html.ts';
import { legalLinks } from './legal.ts';

const SLOT = '<!--welcome-->';

function hero(counts: boolean): string {
  return `
      <section class="wp-hero ob-welcome" aria-label="${t(BRAND.name)}">
        <div class="wp-clouds" data-island="clouds" aria-hidden="true"></div>
        <div class="welcome-art">
          <div class="porthole-slot" data-island="journey"></div>
          <p class="porthole-hint">
            <span class="on-touch">${t(WELCOME.touch)}</span>
            <span class="on-mouse">${t(WELCOME.mouse)}</span>
          </p>
        </div>
        <div class="welcome-text">
          <h1 class="wordmark big-mark">${esc(BRAND.name.toLowerCase())}</h1>
          <p class="lead">${t(BRAND.tagline)}</p>
          <p class="wp-what">${t(`${BRAND.headline} : ${BRAND.languages}.`)}</p>
          <ul class="promise">${BRAND.promise.map(p => `<li>${t(p)}</li>`).join('')}</ul>
          ${counts ? '<div data-island="counts"></div>' : ''}
        </div>
        ${actions('welcome-actions')}
      </section>`;
}

/** Without a script nothing would answer the button: the page says so in its place (styles/welcome.css). */
const actions = (kind: string) => `<div class="${kind}">
          <button type="button" class="btn btn-primary btn-block" data-start>${t(WELCOME.start)}</button>
          <div data-island="install"></div>
          <noscript><p class="wp-note">${t(`Active JavaScript pour utiliser ${BRAND.name}.`)}</p></noscript>
        </div>`;

const link = (href: string, text: string) => `<a href="${esc(href)}" target="_blank" rel="noreferrer">${esc(text)}</a>`;

/** The same credit as « Imagine »'s (ui/Imagine.tsx): the licenses ask for the author and the license. */
export const credit = (photo: Photo) =>
  `<figcaption class="photo-credit">${t('Photo :')} ${link(photo.source, photo.author)}, ${photo.licenseUrl ? link(photo.licenseUrl, photo.license) : esc(photo.license)}${t(', recadrée')}</figcaption>`;

/** A postcard from a language's first destination: its photo, and the first phrase of its café lesson. */
function postcard(course: Course, regionId: string): string {
  const region = regionOf(course, regionId);
  const photo = photoOf(course.id, regionId)!;
  const files = photoFiles(photo.id, '');
  const cafe = SITUATIONS.find(s => s.lesson === 'bar')!;
  const item = course.lessons.find(l => l.id === cafe.lesson)!.items[0]!;
  return `
          <li class="postcard wp-card" style="${themeStyle(flagOf(course, regionId))}">
            <figure class="wp-photo">
              <div class="wp-frame"><img src="${files.fallback}" srcset="${files.srcset}" sizes="(min-width: 1100px) 270px, (min-width: 640px) 46vw, 92vw" alt="${t(photo.alt)}" loading="lazy" decoding="async" style="--focus: ${photo.focus * 100}%" /></div>
              ${credit(photo)}
              <span class="wp-stamp" data-island="stamp" data-id="${pictureOf(course, regionId)}" data-label="${esc(course.name)}"></span>
            </figure>
            <div class="postcard-text">
              <p class="postcard-place">${t(region.name)}</p>
              <div class="phrase">
                <span data-island="say" data-say="${esc(item.t)}" data-lang="${course.lang}"></span>
                <div class="phrase-main">
                  <p class="phrase-t" lang="${course.lang}">${t(item.t)}</p>
                  <p class="ph">${t(item.ph)}</p>
                  <p class="muted">${t(item.fr)}</p>
                </div>
              </div>
              <a class="wp-more" href="${pagePath(course, cafe)}">${t(`${cafe.title} en ${languageOf(course)}`)}</a>
            </div>
          </li>`;
}

function postcards(): string {
  const cards = COURSES.map(course => {
    const [, regionId] = WELCOME_TRIP.find(([id]) => id === course.id)!;
    return postcard(course, regionId);
  }).join('');
  return `
      <section class="wp-section wp-postcards" aria-labelledby="wp-cafe">
        <h2 id="wp-cafe">${t('Ta première phrase au café')}</h2>
        <p class="wp-lead">${t('Écoute-la, et lis sa prononciation écrite à la française.')}</p>
        <ul class="wp-cards">${cards}
        </ul>
      </section>`;
}

/** Each step wears the icon of the tab where the app keeps it (ui/App.tsx). */
const STEPS: [tab: string, title: string, text: string][] = [
  [
    'home',
    'Ton voyage',
    `Choisis ta destination et ta date de départ : ${BRAND.name} prépare les phrases de ce voyage.`,
  ],
  ['practice', 'Quelques minutes par jour', 'Des exercices courts, qui reviennent juste avant que tu oublies.'],
  [
    'card',
    'Sur place',
    'Ta carte de survie s’affiche même sans réseau : tes allergies et l’adresse de ton hôtel, dans la langue du pays.',
  ],
];

const steps = () => `
      <section class="wp-section wp-how" aria-labelledby="wp-how">
        <div class="wp-route" data-island="route" aria-hidden="true"></div>
        <h2 id="wp-how">${t('Comment ça marche')}</h2>
        <ol class="wp-steps">${STEPS.map(
          ([tab, title, text]) => `
          <li>
            <span class="wp-icon" data-island="icon" data-tab="${tab}"></span>
            <h3>${t(title)}</h3>
            <p>${t(text)}</p>
          </li>`,
        ).join('')}
        </ol>
      </section>`;

const boarding = () => `
      <section class="wp-section wp-go" aria-labelledby="wp-go">
        <div class="wp-bernard" data-island="bernard"></div>
        <h2 id="wp-go">${t('Embarquement immédiat')}</h2>
        <p class="wp-lead">${t('Bernard, un bernard-l’ermite, t’envoie une carte postale à chaque étape de ton voyage.')}</p>
        ${actions('wp-go-actions')}
        <p class="wp-note">${t('Sans compte : ce que tu apprends reste sur ton téléphone.')}</p>
      </section>`;

function footer(): string {
  const languages = COURSES.map(c => `<li><a class="chip" href="${languageOf(c)}/">${t(c.name)}</a></li>`).join('');
  return `
      <footer class="wp-foot">
        <nav aria-label="${t('Les langues')}">
          <ul class="wp-links">${languages}</ul>
        </nav>
        <p>${t(`${BRAND.name}. ${BRAND.tagline}`)}</p>
        ${legalLinks('')}
      </footer>`;
}

/** `counts`: the build counts, so the page holds the place of the statistics link. */
export const welcomeHtml = ({
  counts,
}: {
  counts: boolean;
}) => `<div id="welcome" class="welcome-page" style="${themeStyle(COURSES[0]!.flag)}">
      <main class="wp-main">${hero(counts)}${postcards()}${steps()}${boarding()}
      </main>
      <div class="wp-shore" data-island="shore" aria-hidden="true"></div>${footer()}
    </div>`;

export function welcomePage(): Plugin {
  let counts = false;
  return {
    name: 'welcome-page',
    configResolved(config) {
      counts = countsEndpoint(config.env.VITE_COUNTS_URL) !== '';
    },
    // After Vite's own pass, which would take the photos' relative addresses for files to bundle.
    transformIndexHtml: {
      order: 'post',
      handler: html => ({
        html: html.replace(SLOT, welcomeHtml({ counts })),
        tags: [{ tag: 'script', children: BOOT_SCRIPT, injectTo: 'head' }],
      }),
    },
  };
}
