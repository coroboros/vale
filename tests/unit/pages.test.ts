import { describe, expect, it } from 'vitest';
import { languageHtml, situationHtml } from '../../build/pages';
import { BRAND, INDEXNOW_KEY } from '../../src/brand';
import { COURSES, courseById } from '../../src/content';
import { pagePath, questionOf, SITUATIONS, sceneAfter } from '../../src/content/pages';

const ASSETS = { script: 'assets/page-1.js', styles: ['assets/page-1.css'], policy: "script-src 'self'" };
const situation = (lesson: string) => SITUATIONS.find(s => s.lesson === lesson)!;

/** The structured data a page gives search engines, as they would read it. */
function crumbs(html: string) {
  const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)?.[1];
  const data = JSON.parse(json ?? 'null') as {
    '@type': string;
    itemListElement: { position: number; name: string; item?: string }[];
  };
  expect(data['@type']).toBe('BreadcrumbList');
  return data.itemListElement.map(({ position, name, item }) => [position, name, item]);
}

describe('situation pages', () => {
  it('answer every situation from a lesson of every course, with the scene that follows it', () => {
    const paths = new Set<string>();
    for (const course of COURSES)
      for (const s of SITUATIONS) {
        const lesson = course.lessons.find(l => l.id === s.lesson);
        expect(lesson?.items.length, `${course.id}:${s.lesson}`).toBeGreaterThan(5);
        expect(questionOf(course, s)).not.toMatch(/[{}]/);
        paths.add(pagePath(course, s));
        if (s.lesson !== 'base') expect(sceneAfter(course, s.lesson), s.lesson).toBeDefined();
      }
    expect(paths.size).toBe(COURSES.length * SITUATIONS.length);
  });

  it('read as a page of their own: the question, the phrases in their language, and the way into the lesson', () => {
    const html = situationHtml(courseById('es'), situation('bar'), ASSETS);
    expect(html).toContain('<title>Commander un café en espagnol\u00a0: 12\u00a0phrases avec la prononciation</title>');
    expect(html).toContain('<h1>Comment commander un café en espagnol\u00a0?</h1>');
    expect(html).toContain(
      '<link rel="canonical" href="https://coroboros.github.io/vale/espagnol/commander-un-cafe/" />',
    );
    expect(html).toContain('content="«\u00a0Un café con leche\u00a0», «\u00a0Un café solo\u00a0»… 12\u00a0phrases');
    expect(html).toContain('<meta property="og:image" content="https://coroboros.github.io/vale/og.png" />');
    expect(html).toContain(
      '<a class="page-brand" href="../../"><span class="page-bernard" data-flag="es"></span>bagage</a>',
    );
    expect(html).toContain('<p class="page-t" lang="es-ES">Un café con leche</p>');
    expect(html).toContain('href="../../?utm_source=page#/apprendre/es/bar"');
    expect(html).toContain('<h2 id="page-scene">En situation\u00a0: au café</h2>');
    expect(html).toContain('href="../../italien/commander-un-cafe/"');
    expect(html).toContain('<link rel="stylesheet" href="../../assets/page-1.css" />');
    expect(html).toContain('style="--accent: #F1BF00;');
    expect(html).toContain(`<meta http-equiv="Content-Security-Policy" content="script-src 'self'" />`);
    expect(html).not.toContain('Bon à savoir');
    expect(html).not.toMatch(/ [?!:;»]|« /);
  });

  it('show the trail back to their language, for readers and for search engines', () => {
    const html = situationHtml(courseById('pt'), situation('resto'), ASSETS);
    expect(html).toContain(
      '<li><a href="../../">Bagage</a></li><li><a href="../../portugais/">Portugais</a></li><li aria-current="page">Commander au restaurant</li>',
    );
    expect(crumbs(html)).toEqual([
      [1, 'Bagage', 'https://coroboros.github.io/vale/'],
      [2, 'Portugais', 'https://coroboros.github.io/vale/portugais/'],
      [3, 'Commander au restaurant', undefined],
    ]);
  });

  it('give the tips that go with their situation, and only those', () => {
    const html = situationHtml(courseById('it'), situation('resto'), ASSETS);
    expect(html).toContain('<h2 id="page-tips">Bon à savoir</h2>');
    expect(html).toContain('<strong>Le coperto</strong>');
    expect(html).not.toContain('<strong>Le comptoir</strong>');
    for (const course of COURSES)
      for (const tip of course.tips)
        expect(
          SITUATIONS.map(s => s.lesson),
          `${course.id}: ${tip.title}`,
        ).toContain(tip.lesson);
  });
});

describe('language pages', () => {
  it('gather the situations of a language, its tips, and the way into its course', () => {
    const html = languageHtml(courseById('es'), ASSETS);
    expect(html).toContain('<h1>Espagnol\u00a0: les phrases pour voyager</h1>');
    expect(html).toContain('<link rel="canonical" href="https://coroboros.github.io/vale/espagnol/" />');
    for (const s of SITUATIONS) expect(html).toContain(`href="${s.slug}/"`);
    expect(html).toContain('<span class="page-card-eg" lang="es-ES">Un café con leche</span>');
    expect(html).toContain('<strong>Vale</strong>');
    expect(html).toContain('href="../?utm_source=page#/apprendre/es"');
    expect(html).toContain('>Apprendre l’espagnol</a>');
    expect(html).toContain('href="../anglais/"');
    expect(crumbs(html)).toEqual([
      [1, 'Bagage', 'https://coroboros.github.io/vale/'],
      [2, 'Espagnol', undefined],
    ]);
    expect(html).not.toMatch(/ [?!:;»]|« /);
  });
});

it('describes Bagage with every language it teaches', () => {
  // The brand module stays free of the courses (scripts read it without the build): checked here.
  expect(BRAND.languages).toBe(COURSES.map(c => c.name.toLowerCase()).join(', '));
});

it('proves the addresses are ours to IndexNow with a key it accepts', () => {
  // 8 to 128 characters among letters, digits and dashes: https://www.indexnow.org/documentation
  expect(INDEXNOW_KEY).toMatch(/^[A-Za-z0-9-]{8,128}$/);
});
