/** Content model shared by every course. One course = one target language taught from French. */

export type Gender = 'f' | 'm';

/** A phrase as shown to the learner: target text, French-readable phonetics, French meaning. */
export interface Phrase {
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

export type SceneLine =
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

export type TipIcon = 'clock' | 'check' | 'chat' | 'bell' | 'euro' | 'cross' | 'sun' | 'pin';

export interface Tip {
  icon: TipIcon;
  title: string;
  desc: string;
}

export interface Extra {
  id: string;
  title: string;
  desc: string;
  items: Phrase[];
}

export interface Note {
  title: string;
  desc: string;
}

/** A regional language taught as a bonus lesson (Catalan in Barcelona…). */
export interface Pack {
  id: string;
  title: string;
  native: string;
  /** BCP 47 tag used to pick a voice. */
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

/** Sentences built from the learner's own data for the survival card. */
export interface CardPhrases {
  toHotel(hotel: string): string;
  /** `allergens` are the target-language names, article included ("el marisco"). */
  allergy(allergens: string[], g: Gender): string;
  myName(name: string): string;
}

export interface Numbers {
  /** Spoken form of a price: "Son cuatro euros con veinte." or, short, "Cuatro con veinte." */
  sayPrice(euros: number, cents: number, short: boolean): string;
  /** Numbers learners confuse with `n` (doce/dos…), used as distractors. */
  confusable(n: number): number[];
}

export interface Course {
  id: string;
  /** BCP 47 tag of the target language, used for speech and `lang` attributes. */
  lang: string;
  name: string;
  native: string;
  hello: string;
  /** Greeting with the learner's name, punctuated the way the language does it. */
  greet(name: string): string;
  theme: string;
  /** How to read the phonetic hints, shown once in the sounds lesson. */
  phonetics: string;
  /** Ids of phrases that show every phonetic convention at work (they teach it to the translator). */
  phoneticExamples: string[];
  /** Replaces `{g}` gender placeholders in target-language text. */
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
