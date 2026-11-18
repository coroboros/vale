import { describe, expect, it } from 'vitest';
import { COURSES, indexOf } from '../../src/content';
import { build, canBuild, cardOf, GRADED } from '../../src/engine/exercises';
import { normalize } from '../../src/engine/grade';
import { seeded } from '../../src/engine/random';
import { THEMES } from '../../src/ui/themes';

describe.each(COURSES.map(c => [c.id, c] as const))('course %s', (_id, course) => {
  const index = indexOf(course);
  const items = [...course.lessons.flatMap(l => l.items), ...course.packs.flatMap(p => p.items)];

  it('has unique, non-empty item ids and complete phrases', () => {
    expect(new Set(items.map(i => i.id)).size).toBe(items.length);
    for (const i of items) {
      expect(i.id).toMatch(/^[a-z0-9-]+$/);
      expect(i.t.trim(), i.id).not.toBe('');
      expect(i.fr.trim(), i.id).not.toBe('');
      expect(i.ph.trim(), i.id).not.toBe('');
    }
  });

  it('references only existing lessons, scenes and packs in its itinerary', () => {
    for (const unit of course.units) {
      for (const step of unit.steps) {
        if (step.kind === 'lesson') expect(index.lessons.has(step.id), step.id).toBe(true);
        if (step.kind === 'scene') expect(index.scenes.has(step.id), step.id).toBe(true);
        if (step.kind === 'pack') expect(course.packs.length).toBeGreaterThan(0);
      }
    }
    for (const r of course.regions) if (r.pack) expect(course.packs.some(p => p.id === r.pack)).toBe(true);
    expect(course.regions.some(r => r.id === 'autre')).toBe(true);
    for (const id of course.phoneticExamples) expect(index.entries.has(id), id).toBe(true);
  });

  it('gives every scene turn several distinct options', () => {
    for (const scene of course.scenes) {
      for (const line of scene.lines) {
        if (line.who !== 'you') continue;
        expect(line.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(line.options).size).toBe(line.options.length);
      }
    }
  });

  it('builds survival card sentences for both genders without placeholders', () => {
    for (const g of ['f', 'm'] as const) {
      for (const d of course.card.diets) expect(course.gender(d.t, g)).not.toContain('{g}');
      const all = course.say.allergy(
        course.card.allergens.map(a => a.t),
        g,
      );
      expect(all).not.toMatch(/undefined|\{g\}/);
    }
    expect(course.say.toHotel('Sol')).toContain('Sol');
    expect(course.greet('Léa')).toContain('Léa');
  });

  it('speaks prices and lists confusable numbers', () => {
    for (let e = 1; e < 50; e++) {
      for (const c of [0, 20, 95]) expect(course.numbers.sayPrice(e, c, e % 2 === 0)).not.toMatch(/undefined/);
      expect(course.numbers.confusable(e)).not.toContain(e);
    }
  });

  it('keeps its glossary in normalized form', () => {
    for (const word of Object.keys(course.gloss)) expect(normalize(word)).toBe(word);
  });

  it('builds every exercise an item allows, with distinct options that include the answer', () => {
    const rng = seeded(5);
    for (const item of items) {
      const card = cardOf(index, item);
      for (const kind of GRADED) {
        if (!canBuild(kind, card)) continue;
        const ex = build(kind, card, index, rng);
        if ('options' in ex) {
          expect(new Set(ex.options).size, `${item.id} ${kind}`).toBe(ex.options.length);
          expect(ex.options.length, `${item.id} ${kind}`).toBeGreaterThanOrEqual(3);
          expect(ex.options).toContain(ex.answer);
        }
        if ('tiles' in ex) for (const word of ex.answer) expect(ex.tiles).toContain(word);
      }
    }
  });

  it('uses an existing theme', () => {
    expect(THEMES[course.theme]).toBeDefined();
  });
});

describe('legacy ids', () => {
  it('map every v3 Spanish item exactly once', () => {
    const es = COURSES.find(c => c.id === 'es')!;
    const legacy = [...es.lessons, ...es.packs].flatMap(l => l.items.map(i => i.legacy));
    expect(legacy.every(Boolean)).toBe(true);
    expect(new Set(legacy).size).toBe(legacy.length);
  });
});
