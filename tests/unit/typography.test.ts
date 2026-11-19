import { describe, expect, it } from 'vitest';
import { frenchSpaces } from '../../build/french-spaces';
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
    for (const course of COURSES) expect(JSON.stringify(course), course.id).not.toMatch(/ [:;?!%»]|« /);
  });
});
