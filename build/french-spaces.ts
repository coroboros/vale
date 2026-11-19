/**
 * French typography without typing it: the build turns the space before : ; ? ! % and inside « »
 * into a non-breaking one, so a line never starts with « : » or ends on « ». Only the text of
 * string literals, templates and JSX changes: the TypeScript around it has its own « ? » and « : ».
 * In the courses, which are all prose, a number also keeps its unit or noun on its line.
 */
import { type Plugin, parseAst } from 'vite';

const BREAKABLE = / (?=[:;?!%»])|(?<=«) /g;

export const frenchText = (text: string) => text.replace(BREAKABLE, '\u00a0');

/** « 21 h 30 », « 3 € », « 12 phrases ». Prose only: SVG path data has numbers before letters too. */
const NUMBER = /(?<=\d) (?=[\p{L}€])|(?<=\d h) (?=\d)/gu;

export const frenchProse = (text: string) => frenchText(text).replace(NUMBER, '\u00a0');

interface Span {
  start: number;
  end: number;
}

function texts(node: unknown, found: Span[] = []): Span[] {
  if (Array.isArray(node)) for (const child of node) texts(child, found);
  else if (node && typeof node === 'object') {
    const n = node as Span & { type?: string; value?: unknown } & Record<string, unknown>;
    const text =
      (n.type === 'Literal' && typeof n.value === 'string') || n.type === 'TemplateElement' || n.type === 'JSXText';
    if (text) found.push(n);
    else for (const key in n) texts(n[key], found);
  }
  return found;
}

export function frenchSpaces(code: string, fileName: string, fix = frenchText): string {
  const spans = texts(parseAst(code, { lang: fileName.endsWith('.tsx') ? 'tsx' : 'ts' }));
  let out = '';
  let done = 0;
  for (const { start, end } of spans.sort((a, b) => a.start - b.start)) {
    out += code.slice(done, start) + fix(code.slice(start, end));
    done = end;
  }
  return out + code.slice(done);
}

/** Space for space, so every offset and source map stays as it was. */
export function frenchTypography(srcDir: string): Plugin {
  return {
    name: 'french-typography',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0]!;
      if (!file.startsWith(srcDir) || !/\.tsx?$/.test(file)) return null;
      const fixed = frenchSpaces(code, file, file.startsWith(`${srcDir}content/`) ? frenchProse : frenchText);
      return fixed === code ? null : { code: fixed, map: null };
    },
  };
}
