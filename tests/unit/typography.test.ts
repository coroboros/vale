import { describe, expect, it } from 'vitest';
import { frenchProse, frenchSpaces } from '../../build/french-spaces';
import { COURSES } from '../../src/content';

describe('French spaces', () => {
  it('bind « », : ; ? ! and % to their words in strings, templates and JSX', () => {
    const code = [
      "const plan = 'Ton plan : 10 minutes ?';",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: the template is the code under test
      'const part = `${n} % de « ${word} » !`;',
      'const view = <p title="Où ?">Mémoire à l’arrivée : {x}</p>;',
    ].join('\n');
    expect(frenchSpaces(code, 'view.tsx')).toBe(
      [
        "const plan = 'Ton plan\u00a0: 10 minutes\u00a0?';",
        // biome-ignore lint/suspicious/noTemplateCurlyInString: the template is the code under test
        'const part = `${n}\u00a0% de «\u00a0${word}\u00a0»\u00a0!`;',
        'const view = <p title="Où\u00a0?">Mémoire à l’arrivée\u00a0: {x}</p>;',
      ].join('\n'),
    );
  });

  it('leaves the TypeScript around them alone', () => {
    const code = 'const pick = (a: boolean, b?: string) => (a ? b : null);\nconst any = / ?/;';
    expect(frenchSpaces(code, 'pick.ts')).toBe(code);
  });

  it('leaves no breakable space in the courses', () => {
    for (const course of COURSES) expect(JSON.stringify(course), course.id).not.toMatch(/ [:;?!%»]|« |\d [\p{L}€]/u);
  });

  it('keeps a number with its unit or noun in prose, and only there', () => {
    expect(frenchProse('Dîner vers 21 h 30, 1 à 3 € : 12 phrases.')).toBe(
      'Dîner vers 21\u00a0h\u00a030, 1\u00a0à 3\u00a0€\u00a0: 12\u00a0phrases.',
    );
    const path = 'const d = <path d="M96 318 m-50 0 a50 50 0 1 0 50 -50" />;';
    expect(frenchSpaces(path, 'shell.tsx')).toBe(path);
  });
});
