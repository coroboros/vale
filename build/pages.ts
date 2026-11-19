/**
 * What search engines and shared links read, written as static HTML next to the app: a page per
 * situation (src/content/pages.ts) and per language, the sitemap, robots.txt, the IndexNow key, and
 * the app's own canonical and sharing tags. The pages' script and styles are the build's `page`
 * entry (src/page.tsx).
 */
import type { HtmlTagDescriptor, Plugin, Rolldown } from 'vite';
import { appTitle, BRAND, COLORS, description, INDEXNOW_KEY, promiseLine } from '../src/brand.ts';
import { COURSES, pictureOf } from '../src/content/index.ts';
import { languageOf, pagePath, questionOf, SITUATIONS, type Situation, sceneAfter } from '../src/content/pages.ts';
import type { Course, Tip } from '../src/content/types.ts';
import { ofLanguage, theLanguage } from '../src/ui/french.ts';
import { THEMES, themeVars } from '../src/ui/themes.ts';
import { securityPolicy } from './csp.ts';
import { frenchProse, frenchText } from './french-spaces.ts';

const SHARE_IMAGE = { path: 'og.png', width: 1200, height: 630 };

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESCAPES[c]!);
/** The build's French spacing never reaches this file's strings or the content it reads: done here. */
const t = (s: string) => esc(frenchProse(s));
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const absolute = (path: string) => new URL(path, BRAND.url).href;

interface Assets {
  script: string;
  styles: string[];
  /** The Content Security Policy (build/csp.ts). */
  policy: string;
}

interface Meta {
  title: string;
  description: string;
  /** Relative to the app's folder. */
  path: string;
  type: 'website' | 'article';
}

function shareTags(meta: Meta): [property: string, content: string][] {
  return [
    ['og:type', meta.type],
    ['og:site_name', BRAND.name],
    ['og:locale', 'fr_FR'],
    ['og:title', meta.title],
    ['og:description', meta.description],
    ['og:url', absolute(meta.path)],
    ['og:image', absolute(SHARE_IMAGE.path)],
    ['og:image:width', String(SHARE_IMAGE.width)],
    ['og:image:height', String(SHARE_IMAGE.height)],
    ['og:image:alt', `${BRAND.mascot}, le bernard-l’ermite de ${BRAND.name}, et « ${BRAND.headline} »`],
  ];
}

/** A trail of names, each with its address but the last: the page itself. */
type Crumbs = [name: string, path?: string][];

function crumbsData(crumbs: Crumbs): string {
  const itemListElement = crumbs.map(([name, path], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: frenchText(name),
    ...(path === undefined ? {} : { item: absolute(path) }),
  }));
  // Inside <script>, only a closing tag could end the data early.
  return JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement }).replace(
    /</g,
    '\\u003c',
  );
}

function crumbsNav(crumbs: Crumbs, root: string): string {
  const items = crumbs.map(([name, path]) =>
    path === undefined ? `<li aria-current="page">${t(name)}</li>` : `<li><a href="${root}${path}">${t(name)}</a></li>`,
  );
  return `<nav class="page-crumbs" aria-label="${t('Fil d’Ariane')}"><ol>${items.join('')}</ol></nav>`;
}

function document(
  meta: Meta,
  { assets, course, crumbs, main }: { assets: Assets; course: Course; crumbs: Crumbs; main: string },
): string {
  const root = '../'.repeat(meta.path.split('/').filter(Boolean).length);
  const theme = Object.entries(themeVars(THEMES[course.flag]))
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');
  const tags = shareTags(meta)
    .map(([property, content]) => `<meta property="${property}" content="${t(content)}" />`)
    .join('\n    ');
  return `<!doctype html>
<html lang="fr" style="${theme}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="${esc(assets.policy)}" />
    <title>${t(meta.title)}</title>
    <meta name="description" content="${t(meta.description)}" />
    <link rel="canonical" href="${absolute(meta.path)}" />
    ${tags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="${COLORS.page}" />
    <link rel="icon" href="${root}icons/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="${root}icons/apple-touch-icon.png" />
    ${assets.styles.map(href => `<link rel="stylesheet" href="${root}${href}" />`).join('\n    ')}
    <script type="module" src="${root}${assets.script}"></script>
    <script type="application/ld+json">${crumbsData(crumbs)}</script>
  </head>
  <body>
    <header class="page-top">
      <a class="page-brand" href="${root}"><span class="page-bernard" data-flag="${course.flag}"></span>${esc(BRAND.name.toLowerCase())}</a>
      ${crumbsNav(crumbs, root)}
    </header>
    <main class="page">
      <div class="page-view" data-scenery="${pictureOf(course, 'autre')}"></div>${main}
    </main>
    <footer class="page-foot">
      <p>${t(`Les phrases et leur prononciation viennent des leçons de ${BRAND.name}, écrites pour les voyageurs francophones ; une relecture par des locuteurs natifs est prévue.`)}</p>
      <p>${t(`${BRAND.name}. ${BRAND.tagline} ${promiseLine()}`)}</p>
    </footer>
  </body>
</html>
`;
}

function tipsSection(tips: Tip[]): string {
  if (!tips.length) return '';
  const items = tips.map(tip => `<li><strong>${t(tip.title)}</strong> ${t(tip.desc)}</li>`).join('');
  return `
      <section class="page-tips" aria-labelledby="page-tips">
        <h2 id="page-tips">Bon à savoir</h2>
        <ul>${items}</ul>
      </section>`;
}

function readingNote(course: Course): string {
  return `
      <p class="page-how"><strong>${t('Lire la prononciation :')}</strong> ${t(course.phonetics)}</p>`;
}

function learnSection(course: Course, root: string, lessonId?: string): string {
  const target = lessonId ? `${course.id}/${lessonId}` : course.id;
  const action = lessonId ? 'Apprendre ces phrases' : `Apprendre ${theLanguage(course.name)}`;
  return `
      <section class="page-cta" aria-labelledby="page-cta">
        <h2 id="page-cta">Retiens-les pour ton voyage</h2>
        <p>${t(`${BRAND.name} te fait réviser chaque phrase juste avant que tu l’oublies, quelques minutes par jour. ${promiseLine()}`)}</p>
        <a class="btn btn-primary btn-block" href="${root}?utm_source=page#/apprendre/${target}">${t(action)}</a>
      </section>`;
}

function moreLinks(label: string, groups: [heading: string, links: [name: string, href: string][]][]): string {
  const body = groups
    .map(
      ([heading, links]) =>
        `
        <h2>${t(heading)}</h2>
        <ul>${links.map(([name, href]) => `<li><a class="chip" href="${href}">${t(name)}</a></li>`).join('')}</ul>`,
    )
    .join('');
  return `
      <nav class="page-more" aria-label="${t(label)}">${body}
      </nav>`;
}

const lessonOf = (course: Course, situation: Situation) => course.lessons.find(l => l.id === situation.lesson)!;

export function situationHtml(course: Course, situation: Situation, assets: Assets): string {
  const lesson = lessonOf(course, situation);
  const scene = sceneAfter(course, lesson.id);
  const root = '../../';
  const lang = course.lang;
  const n = lesson.items.length;
  const phrases = lesson.items
    .map(
      item => `
        <li class="page-phrase">
          <div class="page-phrase-text">
            <p class="page-t" lang="${lang}">${t(item.t)}</p>
            <p class="page-ph">${t(item.ph)}</p>
            <p class="page-fr">${t(item.fr)}</p>${item.note ? `\n            <p class="page-note">${t(item.note)}</p>` : ''}
          </div>
          <span class="page-say" data-say="${esc(item.t)}" data-lang="${lang}"></span>
        </li>`,
    )
    .join('');
  const dialogue = scene
    ? `
      <section class="page-scene" aria-labelledby="page-scene">
        <h2 id="page-scene">${t(`En situation : ${lowerFirst(scene.title)}`)}</h2>
        <ol class="page-dialogue">${scene.lines
          .map(line =>
            line.who === 'them'
              ? `
          <li class="page-line"><span class="sr-only">${t('On te dit :')}</span>
            <p lang="${lang}">${t(line.t)}</p><p class="page-fr">${t(line.fr)}</p></li>`
              : `
          <li class="page-line is-you"><span class="sr-only">${t('Tu réponds :')}</span>
            <p lang="${lang}">${t(line.options[0]!)}</p><p class="page-fr">${t(line.task)}</p></li>`,
          )
          .join('')}
        </ol>
      </section>`
    : '';
  const main = `
      <h1>${t(questionOf(course, situation))}</h1>
      <p class="page-lead">${t(`${n} phrases, avec leur prononciation écrite à la française : ${lowerFirst(lesson.desc)}.`)}</p>
      <ul class="page-phrases">${phrases}
      </ul>${readingNote(course)}${tipsSection(course.tips.filter(tip => tip.lesson === situation.lesson))}${dialogue}${learnSection(course, root, lesson.id)}${moreLinks(
        'Autres situations',
        [
          [
            `Aussi en ${languageOf(course)}`,
            SITUATIONS.filter(s => s !== situation).map(s => [s.title, `../${s.slug}/`]),
          ],
          [
            `${situation.title}, dans une autre langue`,
            COURSES.filter(c => c !== course).map(c => [`En ${languageOf(c)}`, `${root}${pagePath(c, situation)}`]),
          ],
        ],
      )}`;
  const examples = lesson.items
    .slice(0, 2)
    .map(item => `« ${item.t} »`)
    .join(', ');
  return document(
    {
      title: `${situation.title} en ${languageOf(course)} : ${n} phrases avec la prononciation`,
      description: `${examples}… ${n} phrases avec leur prononciation écrite à la française${scene ? ', et un dialogue pour s’entraîner' : ''}.`,
      path: pagePath(course, situation),
      type: 'article',
    },
    {
      assets,
      course,
      crumbs: [[BRAND.name, ''], [course.name, `${languageOf(course)}/`], [situation.title]],
      main,
    },
  );
}

export function languageHtml(course: Course, assets: Assets): string {
  const root = '../';
  const total = SITUATIONS.reduce((n, s) => n + lessonOf(course, s).items.length, 0);
  const scenes = SITUATIONS.filter(s => sceneAfter(course, s.lesson)).length;
  const cards = SITUATIONS.map(situation => {
    const first = lessonOf(course, situation).items[0]!;
    return `
        <li><a class="tile-card page-card" href="${situation.slug}/"><span class="page-card-title">${t(situation.title)}</span><span class="page-card-eg" lang="${course.lang}">${t(first.t)}</span></a></li>`;
  }).join('');
  const main = `
      <h1>${t(`${course.name} : les phrases pour voyager`)}</h1>
      <p class="page-lead">${t(`${total} phrases ${ofLanguage(course.name)} pour ${SITUATIONS.length} moments du voyage, avec leur prononciation écrite à la française et ${scenes} dialogues pour s’entraîner.`)}</p>
      <ul class="page-cards">${cards}
      </ul>${tipsSection(course.tips)}${readingNote(course)}${learnSection(course, root)}${moreLinks('Autres langues', [
        ['Dans une autre langue', COURSES.filter(c => c !== course).map(c => [c.name, `${root}${languageOf(c)}/`])],
      ])}`;
  return document(
    {
      title: `${course.name} de voyage : ${total} phrases avec la prononciation`,
      description: `${total} phrases ${ofLanguage(course.name)} pour voyager, avec leur prononciation écrite à la française : ${SITUATIONS.map(s => lowerFirst(s.title)).join(', ')}.`,
      path: `${languageOf(course)}/`,
      type: 'website',
    },
    { assets, course, crumbs: [[BRAND.name, ''], [course.name]], main },
  );
}

function sitemap(paths: string[]): string {
  const urls = ['', ...paths].map(path => `  <url><loc>${absolute(path)}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

/** Search engines read it at the root of a domain only: it counts once the app has its own (RUNBOOK B2). */
const robots = () => `User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n`;

export function searchPages(): Plugin {
  let policy = '';
  return {
    name: 'search-pages',
    apply: 'build',
    configResolved(config) {
      policy = securityPolicy(config.env);
    },
    transformIndexHtml: () => {
      const meta: Meta = { title: appTitle(), description: description(), path: '', type: 'website' };
      // What Google reads for a site's name, once Bagage has a domain of its own (RUNBOOK B2).
      const site = { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND.name, url: BRAND.url };
      return [
        { tag: 'link', attrs: { rel: 'canonical', href: absolute('') }, injectTo: 'head' },
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(site), injectTo: 'head' },
        ...shareTags(meta).map(
          ([property, content]): HtmlTagDescriptor => ({
            tag: 'meta',
            attrs: { property, content: frenchText(content) },
            injectTo: 'head',
          }),
        ),
        { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
      ];
    },
    generateBundle(_, bundle) {
      const entry = Object.values(bundle).find(
        (file): file is Rolldown.OutputChunk => file.type === 'chunk' && file.isEntry && file.name === 'page',
      );
      if (!entry) return this.error('The build has no `page` entry for the situation pages.');
      const styles = new Set<string>();
      // Styles the page shares with the app sit in shared chunks: gather them through the imports.
      const gather = (chunk: Rolldown.OutputChunk) => {
        for (const name of chunk.imports) {
          const imported = bundle[name];
          if (imported?.type === 'chunk') gather(imported);
        }
        for (const css of chunk.viteMetadata?.importedCss ?? []) styles.add(css);
      };
      gather(entry);
      const assets = { script: entry.fileName, styles: [...styles], policy };
      const paths: string[] = [];
      const emit = (path: string, source: string) => {
        paths.push(path);
        this.emitFile({ type: 'asset', fileName: `${path}index.html`, source });
      };
      for (const course of COURSES) {
        emit(`${languageOf(course)}/`, languageHtml(course, assets));
        for (const situation of SITUATIONS) emit(pagePath(course, situation), situationHtml(course, situation, assets));
      }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(paths) });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() });
      this.emitFile({ type: 'asset', fileName: `${INDEXNOW_KEY}.txt`, source: INDEXNOW_KEY });
    },
  };
}
