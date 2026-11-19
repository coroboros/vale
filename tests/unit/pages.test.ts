import { describe, expect, it } from 'vitest';
import { pageHtml } from '../../build/pages';
import { COURSES, courseById } from '../../src/content';
import { pagePath, questionOf, SITUATIONS, sceneAfter } from '../../src/content/pages';

const ASSETS = { script: 'assets/page-1.js', styles: ['assets/page-1.css'] };

describe('situation pages', () => {
  it('answer every situation from a lesson of every course, with the scene that follows it', () => {
    const paths = new Set<string>();
    for (const course of COURSES)
      for (const situation of SITUATIONS) {
        const lesson = course.lessons.find(l => l.id === situation.lesson);
        expect(lesson?.items.length, `${course.id}:${situation.lesson}`).toBeGreaterThan(5);
        expect(questionOf(course, situation)).not.toMatch(/[{}]/);
        paths.add(pagePath(course, situation));
        if (situation.lesson !== 'base') expect(sceneAfter(course, situation.lesson), situation.lesson).toBeDefined();
      }
    expect(paths.size).toBe(COURSES.length * SITUATIONS.length);
  });

  it('read as a page of their own: the question, the phrases in their language, and the way into the lesson', () => {
    const html = pageHtml(courseById('es'), SITUATIONS.find(s => s.lesson === 'bar')!, ASSETS);
    expect(html).toContain('<h1>Comment commander un café en espagnol ?</h1>');
    expect(html).toContain(
      '<link rel="canonical" href="https://coroboros.github.io/vale/espagnol/commander-un-cafe/" />',
    );
    expect(html).toContain('<p class="page-t" lang="es-ES">Un café con leche</p>');
    expect(html).toContain('href="../../?utm_source=page#/apprendre/es/bar"');
    expect(html).toContain('<h2 id="page-scene">En situation : au café</h2>');
    expect(html).toContain('href="../../italien/commander-un-cafe/"');
    expect(html).toContain('<link rel="stylesheet" href="../../assets/page-1.css" />');
    expect(html).toContain('style="--accent: #F1BF00;');
    expect(html).not.toMatch(/ [?!:;»]|« /);
  });
});
