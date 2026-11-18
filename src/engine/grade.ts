/** Forgiving on form (accents, small typos), strict on meaning. */

export type Verdict = 'exact' | 'accents' | 'typo' | 'wrong';

const PUNCTUATION = /[¿?¡!.,…:;"“”«»()[\]—–]/g;
const APOSTROPHES = /[’‘`´]/g;

export const normalize = (text: string) =>
  text.toLowerCase().replace(APOSTROPHES, "'").replace(PUNCTUATION, ' ').replace(/\s+/g, ' ').trim();

export const stripAccents = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '');

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = current;
    }
  }
  return row[b.length]!;
}

export function grade(answer: string, accepted: readonly string[]): { verdict: Verdict; expected: string } {
  const given = normalize(answer);
  let best: { verdict: Verdict; expected: string } = { verdict: 'wrong', expected: accepted[0] ?? '' };
  const rank: Record<Verdict, number> = { exact: 3, accents: 2, typo: 1, wrong: 0 };
  for (const form of accepted) {
    const target = normalize(form);
    let verdict: Verdict = 'wrong';
    if (given === target) verdict = 'exact';
    else if (stripAccents(given) === stripAccents(target)) verdict = 'accents';
    else {
      const bare = stripAccents(target);
      const allowed = bare.length >= 12 ? 2 : bare.length >= 5 ? 1 : 0;
      if (allowed && levenshtein(stripAccents(given), bare) <= allowed) verdict = 'typo';
    }
    if (rank[verdict] > rank[best.verdict]) best = { verdict, expected: form };
  }
  return best;
}

export const tokens = (text: string) =>
  text.replace(APOSTROPHES, "'").replace(PUNCTUATION, ' ').split(/\s+/).filter(Boolean);
