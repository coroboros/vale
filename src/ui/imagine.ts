/**
 * The words of the « Imagine » step. The learner sees themselves there, by name, on their real
 * departure day and at the hour they chose to practise: material tied to oneself is better
 * remembered (self-reference effect, Symons & Johnson, 1997), and the hour echoes the plan they
 * just made (docs/LEARNING.md).
 */
import type { CUES } from '../state/schema';

type Cue = (typeof CUES)[number]['id'];

const names = new Intl.ListFormat('fr', { type: 'conjunction' });
const weekdayAndDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

/** « samedi 1er février »: French writes the first of the month as an ordinal. */
function day(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return weekdayAndDate
    .formatToParts(new Date(y, m - 1, d))
    .map(part => (part.type === 'day' && part.value === '1' ? '1er' : part.value))
    .join('');
}

const HOUR: Partial<Record<Cue, { on: string; some: string }>> = {
  coffee: { on: 'au petit matin', some: 'Un matin' },
  lunch: { on: 'à midi', some: 'Un midi' },
  evening: { on: 'au coucher du soleil', some: 'Un soir, au coucher du soleil' },
};

export function imagineWords({
  travellers,
  at,
  date,
  cue,
}: {
  travellers: string[];
  /** « à Rome », « aux Açores ». */
  at: string;
  /** YYYY-MM-DD, or empty when not chosen yet. */
  date: string;
  cue: string;
}): { title: string; lead: string } {
  const many = travellers.length > 1;
  const title = travellers.length ? `${many ? 'Imaginez' : 'Imagine'}, ${names.format(travellers)}.` : 'Imagine.';
  const on = date ? `Le ${day(date)}` : '';
  const hour = HOUR[cue as Cue];
  // Commuters picture the end of the journey; the others, their own hour of the day.
  const arrival =
    cue === 'commute'
      ? `${on || 'Un jour'}, ${many ? 'vous posez' : 'tu poses'} enfin le pied ${at}.`
      : `${hour ? (on ? `${on} ${hour.on}` : hour.some) : on || 'Un jour'}, ${many ? 'vous arrivez' : 'tu arrives'} ${at}.`;
  const door = many ? 'Vous poussez la porte d’un café et vous dites :' : 'Tu pousses la porte d’un café et tu dis :';
  return { title, lead: `${arrival} ${door}` };
}
