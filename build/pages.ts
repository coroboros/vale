/**
 * Writes the situation pages (src/content/pages.ts) as static HTML next to the app, with a sitemap:
 * a search engine reads them without running the app, and each one opens its lesson in the app.
 * Their script and styles are the `page` entry of the build (src/page.tsx).
 */
import type { Plugin, Rolldown } from 'vite';
import { BRAND, COLORS } from '../src/brand.ts';
import { COURSES, pictureOf } from '../src/content/index.ts';
import { languageOf, pagePath, questionOf, SITUATIONS, type Situation, sceneAfter } from '../src/content/pages.ts';
import type { Course } from '../src/content/types.ts';
import { THEMES, themeVars } from '../src/ui/themes.ts';
import { frenchText } from './french-spaces.ts';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const esc = (s: string) => s.replace(/[&<>"]/g, c => ESCAPES[c]!);
/** The build's French spacing never reaches this file's strings or the content it reads: done here. */
const t = (s: string) => esc(frenchText(s));
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

interface Assets {
  script: string;
  styles: string[];
}

export function pageHtml(course: Course, situation: Situation, assets: Assets): string {
  const lesson = course.lessons.find(l => l.id === situation.lesson)!;
  const scene = sceneAfter(course, lesson.id);
  const root = '../../';
  const lang = course.lang;
  const language = languageOf(course);
  const question = questionOf(course, situation);
  const lead = `${lesson.items.length} phrases, avec leur prononciation écrite à la française : ${lowerFirst(lesson.desc)}.`;
  const url = new URL(pagePath(course, situation), BRAND.url).href;
  const promise = BRAND.promise.map((p, i) => (i ? p.toLowerCase() : p)).join(', ');
  const theme = Object.entries(themeVars(THEMES[course.flag]))
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');
  const phrases = lesson.items
    .map(
      item => `
      <li class="page-phrase">
        <div class="page-phrase-text">
          <p class="page-t" lang="${lang}">${t(item.t)}</p>
          <p class="page-ph">${t(item.ph)}</p>
          <p class="page-fr">${t(item.fr)}</p>${item.note ? `\n          <p class="page-note">${t(item.note)}</p>` : ''}
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
  const others = SITUATIONS.filter(s => s !== situation)
    .map(s => `<li><a class="chip" href="../${s.slug}/">${t(s.title)}</a></li>`)
    .join('');
  const elsewhere = COURSES.filter(c => c !== course)
    .map(c => `<li><a class="chip" href="${root}${pagePath(c, situation)}">${t(`En ${languageOf(c)}`)}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="fr" style="${theme}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${t(`${question} Les phrases et leur prononciation – ${BRAND.name}`)}</title>
    <meta name="description" content="${t(lead)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${t(question)}" />
    <meta property="og:description" content="${t(lead)}" />
    <meta property="og:url" content="${url}" />
    <meta name="theme-color" content="${COLORS.page}" />
    <link rel="icon" href="${root}icons/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="${root}icons/apple-touch-icon.png" />
    ${assets.styles.map(href => `<link rel="stylesheet" href="${root}${href}" />`).join('\n    ')}
    <script type="module" src="${root}${assets.script}"></script>
  </head>
  <body>
    <header class="page-top">
      <a class="page-brand" href="${root}"><img src="${root}icons/favicon.svg" alt="" width="36" height="36" />${esc(BRAND.name.toLowerCase())}</a>
    </header>
    <main class="page">
      <div class="page-view" data-scenery="${pictureOf(course, 'autre')}" aria-hidden="true"></div>
      <h1>${t(question)}</h1>
      <p class="page-lead">${t(lead)}</p>
      <ul class="page-phrases">${phrases}
      </ul>
      <p class="page-how"><strong>${t('Lire la prononciation :')}</strong> ${t(course.phonetics)}</p>${dialogue}
      <section class="page-cta" aria-labelledby="page-cta">
        <h2 id="page-cta">Retiens-les pour ton voyage</h2>
        <p>${t(`${BRAND.name} te fait réviser chaque phrase juste avant que tu l’oublies, quelques minutes par jour. ${promise}.`)}</p>
        <a class="btn btn-primary btn-block" href="${root}?utm_source=page#/apprendre/${course.id}/${lesson.id}">Apprendre ces phrases</a>
      </section>
      <nav class="page-more" aria-label="${t('Autres situations')}">
        <h2>${t(`Aussi en ${language}`)}</h2>
        <ul>${others}</ul>
        <h2>${t(`${situation.title}, dans une autre langue`)}</h2>
        <ul>${elsewhere}</ul>
      </nav>
    </main>
    <footer class="page-foot">
      <p>${t(`${BRAND.name}. ${BRAND.tagline} ${promise}.`)}</p>
    </footer>
  </body>
</html>
`;
}

function sitemap(paths: string[]): string {
  const urls = ['', ...paths].map(path => `  <url><loc>${new URL(path, BRAND.url).href}</loc></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

export function situationPages(): Plugin {
  return {
    name: 'situation-pages',
    apply: 'build',
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
      const assets = { script: entry.fileName, styles: [...styles] };
      const paths: string[] = [];
      for (const course of COURSES)
        for (const situation of SITUATIONS) {
          const path = pagePath(course, situation);
          paths.push(path);
          this.emitFile({ type: 'asset', fileName: `${path}index.html`, source: pageHtml(course, situation, assets) });
        }
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap(paths) });
    },
  };
}
