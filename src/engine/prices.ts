/**
 * "Prices by ear": hear an amount, pick it among confusable ones (doce/dos, sessanta/settanta…).
 */
import type { Course } from '../content/types';
import { pick, type Rng, shuffle } from './random';

const CENTS = [0, 0, 10, 20, 20, 30, 40, 50, 50, 60, 70, 80, 90, 95, 99];

const formatPrice = (euros: number, cents: number) => `${euros},${String(cents).padStart(2, '0')} €`;

export interface PricePuzzle {
  spoken: string;
  answer: string;
  options: string[];
}

export function pricePuzzle(course: Course, rng: Rng): PricePuzzle {
  const euros = 1 + Math.floor(rng() * 49);
  const cents = pick(rng, CENTS);
  const answer = formatPrice(euros, cents);
  const seen = new Set([answer]);
  const candidates: [number, number][] = [
    ...course.numbers.confusable(euros).map(e => [e, cents] as [number, number]),
    ...(cents ? course.numbers.confusable(cents).map(c => [euros, c] as [number, number]) : []),
    [euros + 10, cents],
    [euros - 10, cents],
    [euros + 1, cents],
    [euros, (cents + 50) % 100],
  ];
  const options = [answer];
  for (const [e, c] of shuffle(rng, candidates)) {
    const text = formatPrice(e, c);
    if (options.length >= 4) break;
    if (e < 1 || e > 99 || c < 0 || c > 99 || seen.has(text)) continue;
    seen.add(text);
    options.push(text);
  }
  return { spoken: course.numbers.sayPrice(euros, cents, rng() < 0.4), answer, options: shuffle(rng, options) };
}
