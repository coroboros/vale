/**
 * When the traveller plans to practise. Choosing a precise moment is an if-then plan (docs/LEARNING.md):
 * onboarding asks for it, « Imagine » and home bring it back.
 */
export const CUES = [
  {
    id: 'coffee',
    label: 'Avec mon café du matin',
    when: 'au café du matin',
    now: 'C’est l’heure de ton café',
    hours: [[5, 11]],
  },
  {
    id: 'commute',
    label: 'Dans les transports',
    when: 'dans les transports',
    now: 'Dans les transports',
    hours: [
      [7, 10],
      [17, 20],
    ],
  },
  {
    id: 'lunch',
    label: 'À la pause déjeuner',
    when: 'à la pause déjeuner',
    now: 'C’est la pause déjeuner',
    hours: [[11, 15]],
  },
  {
    id: 'evening',
    label: 'Le soir, avant de dormir',
    when: 'le soir, avant de dormir',
    now: 'Avant de dormir',
    hours: [[19, 24]],
  },
] as const satisfies readonly {
  id: string;
  label: string;
  when: string;
  now: string;
  /** Local hours, start included, end excluded. */
  hours: readonly (readonly [number, number])[];
}[];

export type Cue = (typeof CUES)[number]['id'];

export const cueOf = (id: string) => CUES.find(c => c.id === id);

/** Whether a local hour falls in that moment. */
export const duringCue = (cue: (typeof CUES)[number], hour: number) =>
  cue.hours.some(([from, to]) => hour >= from && hour < to);
