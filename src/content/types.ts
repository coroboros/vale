/** One course = one target language taught from French. */

export type Gender = 'f' | 'm';

/** `t` target text, `p` French-readable phonetics, `fr` meaning. */
interface Phrase {
  t: string;
  ph: string;
  fr: string;
}

export interface Item extends Phrase {
  /** Stable id, unique within the course. Progress is keyed on it: never rename. */
  id: string;
  note?: string;
  /** Items sharing a synonym group are never used as distractors for each other. */
  syn?: string;
  /** Items of the same kind are preferred as distractors (numbers with numbers…). */
  kind?: string;
  /** Id used by the v3 app ("lesson.index"), kept to migrate existing progress. */
  legacy?: string;
}

export interface Lesson {
  id: string;
  title: string;
  native: string;
  desc: string;
  items: Item[];
}

type SceneLine =
  | { who: 'them'; t: string; fr: string }
  /** The first option is the right answer; options are shuffled at display time. */
  | { who: 'you'; task: string; options: string[] };

export interface Scene {
  id: string;
  title: string;
  native: string;
  desc: string;
  lines: SceneLine[];
}

export interface Sound {
  key: string;
  title: string;
  desc: string;
  /** Word, phonetics and, for minimal pairs, its French meaning. */
  examples: [word: string, ph: string, fr?: string][];
}

export interface Tip {
  title: string;
  desc: string;
}

export interface Extra {
  id: string;
  title: string;
  desc: string;
  items: Phrase[];
}

interface Note {
  title: string;
  desc: string;
}

/** A regional language taught as a bonus lesson (Catalan in Barcelona…). */
export interface Pack {
  id: string;
  title: string;
  native: string;
  /** BCP 47: picks the voice. */
  lang: string;
  tip: Note;
  items: Item[];
}

export interface Region {
  id: string;
  name: string;
  native: string;
  pack?: string;
  tip?: Note;
}

export interface SurvivalCard {
  help: { t: string; fr: string };
  sos: { t: string; fr: string };
  allergens: { id: string; t: string; fr: string }[];
  /** `t` may contain `{g}`, replaced by the speaker's gender ending. */
  diets: { id: string; t: string; fr: string }[];
}

export type Step =
  | { kind: 'sounds' }
  | { kind: 'lesson'; id: string }
  | { kind: 'scene'; id: string }
  | { kind: 'pack' }
  | { kind: 'review' };

export interface Unit {
  id: string;
  title: string;
  steps: Step[];
}

interface CardPhrases {
  toHotel(hotel: string): string;
  /** `allergens` are the target-language names, article included ("el marisco"). */
  allergy(allergens: string[], g: Gender): string;
  myName(name: string): string;
}

interface Numbers {
  /** Shown with prices. */
  currency: '€' | '£';
  /** Number words up to 100: speech recognisers write "2" where a phrase says "dos". */
  spell(n: number): string;
  /** Spoken form of a price: "Son cuatro euros con veinte." or, short, "Cuatro con veinte." */
  sayPrice(euros: number, cents: number, short: boolean): string;
  /** Numbers learners confuse with `n` (doce/dos…), used as distractors. */
  confusable(n: number): number[];
}

export interface Course {
  id: string;
  /** BCP 47, for speech and `lang` attributes. */
  lang: string;
  name: string;
  native: string;
  hello: string;
  /** Greeting with the learner's name, punctuated the way the language does it. */
  greet(name: string): string;
  theme: string;
  phonetics: string;
  /**
   * Ids of phrases that show every phonetic convention at work (they teach it to the translator).
   */
  phoneticExamples: string[];
  gender(text: string, g: Gender): string;
  units: Unit[];
  lessons: Lesson[];
  scenes: Scene[];
  sounds: Sound[];
  tips: Tip[];
  extras: Extra[];
  gloss: Record<string, string>;
  regions: Region[];
  packs: Pack[];
  card: SurvivalCard;
  say: CardPhrases;
  numbers: Numbers;
}
