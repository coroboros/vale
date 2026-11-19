/**
 * "Prices by ear": hear an amount, pick it among confusable ones (doce/dos, sessanta/settanta…).
 */
import type { Course, Currency } from '../content/types';
import { pick, type Rng, shuffle } from './random';

const CENTS = [0, 0, 10, 20, 20, 30, 40, 50, 50, 60, 70, 80, 90, 95, 99];

const formatPrice = (units: number, cents: number, sign: string) =>
  `${units},${String(cents).padStart(2, '0')} ${sign}`;

export interface PricePuzzle {
  spoken: string;
  answer: string;
  options: string[];
}

export function pricePuzzle(course: Course, currency: Currency, rng: Rng): PricePuzzle {
  const units = 1 + Math.floor(rng() * 49);
  const cents = pick(rng, CENTS);
  const answer = formatPrice(units, cents, currency);
  const seen = new Set([answer]);
  const candidates: [number, number][] = [
    ...course.numbers.confusable(units).map(u => [u, cents] as [number, number]),
    ...(cents ? course.numbers.confusable(cents).map(c => [units, c] as [number, number]) : []),
    [units + 10, cents],
    [units - 10, cents],
    [units + 1, cents],
    [units, (cents + 50) % 100],
  ];
  const options = [answer];
  for (const [e, c] of shuffle(rng, candidates)) {
    const text = formatPrice(e, c, currency);
    if (options.length >= 4) break;
    if (e < 1 || e > 99 || c < 0 || c > 99 || seen.has(text)) continue;
    seen.add(text);
    options.push(text);
  }
  return {
    spoken: course.numbers.sayPrice(units, cents, rng() < 0.4, currency),
    answer,
    options: shuffle(rng, options),
  };
}
