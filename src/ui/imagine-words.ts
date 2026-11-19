/**
 * The words of « Imagine ». The learner sees themselves there, by name, on their real departure
 * day, in a scene that matches the moment they chose to practise: material tied to oneself is
 * better remembered (self-reference effect, Symons & Johnson, 1997). The dream ends on their plan,
 * because positive fantasies alone lower the energy to act (Kappes & Oettingen, 2011). Sources in
 * docs/LEARNING.md.
 */
import { type Cue, cueOf } from '../content/cues';
import type { ArrivalPlace, Course } from '../content/types';
import { andList, frenchDay } from './french';

const HOUR: Partial<Record<Cue, { on: string; some: string }>> = {
  coffee: { on: 'au petit matin', some: 'Un matin' },
  lunch: { on: 'à midi', some: 'Un midi' },
  evening: { on: 'au coucher du soleil', some: 'Un soir, au coucher du soleil' },
};

const PLACE: Record<ArrivalPlace, { tu: string; vous: string }> = {
  cafe: { tu: 'Tu pousses la porte d’un café et tu dis :', vous: 'Vous poussez la porte d’un café et vous dites :' },
  terrace: { tu: 'Tu t’installes en terrasse et tu dis :', vous: 'Vous vous installez en terrasse et vous dites :' },
  pub: { tu: 'Tu entres dans un pub et tu dis :', vous: 'Vous entrez dans un pub et vous dites :' },
  taxi: { tu: 'Tu montes dans un taxi et tu dis :', vous: 'Vous montez dans un taxi et vous dites :' },
  station: { tu: 'À la gare, tu demandes :', vous: 'À la gare, vous demandez :' },
  hotel: {
    tu: 'Tu poses ta valise à la réception et tu dis :',
    vous: 'Vous posez vos valises à la réception et vous dites :',
  },
};

const asSentence = (words: string) => (/[.!?…]$/.test(words) ? words : `${words}.`);

export function imagineWords({
  course,
  travellers,
  at,
  date,
  cue,
  minutes,
}: {
  course: Course;
  travellers: readonly [string, ...string[]];
  /** « à Rome », « aux Açores ». */
  at: string;
  /** YYYY-MM-DD, or empty when not chosen yet. */
  date: string;
  cue: string;
  /** Practice a day, from the goal. */
  minutes: number;
}): { title: string; lead: string; sentence: string; plan: string } {
  const many = travellers.length > 1;
  const on = date ? `Le ${frenchDay(date, 'weekday')}` : '';
  const moment = cueOf(cue);
  const hour = moment && HOUR[moment.id];
  // Commuters picture the end of the journey; the others, their own hour of the day.
  const arrival =
    moment?.id === 'commute'
      ? `${on || 'Un jour'}, ${many ? 'vous posez' : 'tu poses'} enfin le pied ${at}.`
      : `${hour ? (on ? `${on} ${hour.on}` : hour.some) : on || 'Un jour'}, ${many ? 'vous arrivez' : 'tu arrives'} ${at}.`;
  const scene = course.arrival[moment?.id ?? 'coffee'];
  return {
    title: `${many ? 'Imaginez' : 'Imagine'}, ${andList(travellers)}.`,
    lead: `${arrival} ${PLACE[scene.place][many ? 'vous' : 'tu']}`,
    sentence: asSentence(scene.say(travellers[0])),
    plan: `${many ? 'Votre' : 'Ton'} plan : ${minutes} minutes par jour${moment ? ` ${moment.when}` : ''}${
      date ? `, jusqu’au ${frenchDay(date)}` : ''
    }.`,
  };
}
