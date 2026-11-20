import { describe, expect, it } from 'vitest';
import { COURSES } from '../../src/content';
import { photoOf, WIDTHS } from '../../src/ui/photos';
import list from '../../src/ui/photos.json';

const VARIANTS = ['portrait', ...WIDTHS.map(String)];

describe('destination photos', () => {
  it('picture every destination, « Ailleurs » included', () => {
    for (const course of COURSES) {
      for (const region of course.regions)
        expect(photoOf(course.id, region.id), `${course.id} ${region.id}`).toBeDefined();
    }
  });

  it('credit each photo under a license that allows reuse, with its Commons page', () => {
    for (const [id, photo] of Object.entries(list)) {
      expect(photo.author, id).not.toBe('');
      expect(photo.alt, id).not.toBe('');
      expect(photo.license, id).toMatch(/^(CC0|Public domain|CC BY(-SA)? \d\.\d)/i);
      expect(photo.source, id).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
      expect(photo.focus, id).toBeGreaterThanOrEqual(0);
      expect(photo.focus, id).toBeLessThanOrEqual(1);
    }
  });

  it('ship exactly the files the step asks for', () => {
    const regions = new Set(COURSES.flatMap(c => c.regions.map(r => r.id)));
    const expected = Object.keys(list).flatMap(id => VARIANTS.map(v => `${id}-${v}.webp`));
    for (const id of Object.keys(list)) expect(regions.has(id), id).toBe(true);
    const shipped = Object.keys(import.meta.glob('../../public/photos/*')).map(path => path.split('/').pop());
    expect(shipped.sort()).toEqual(expected.sort());
  });
});
