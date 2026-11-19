import { describe, expect, it } from 'vitest';
import { courseById } from '../../src/content';
import { imagineWords } from '../../src/ui/imagine-words';

const [es, italian, pt, en] = [courseById('es'), courseById('it'), courseById('pt'), courseById('en')];

describe('the words of « Imagine »', () => {
  it('names the traveller and the day, sets the scene at their practice moment, and ends on their plan', () => {
    expect(
      imagineWords({
        course: es,
        travellers: ['Adrien'],
        at: 'à Rome',
        date: '2026-12-19',
        cue: 'coffee',
        minutes: 10,
      }),
    ).toEqual({
      title: 'Imagine, Adrien.',
      lead: 'Le samedi 19\u00a0décembre au petit matin, tu arrives à Rome. Tu pousses la porte d’un café et tu dis :',
      sentence: 'Un café con leche, por favor.',
      plan: 'Ton plan : 10 minutes par jour au café du matin, jusqu’au 19\u00a0décembre.',
    });
  });

  it('speaks to a group with « vous », lists the names the French way, and books the hotel in the first name', () => {
    const words = imagineWords({
      course: pt,
      travellers: ['Adrien', 'Léa', 'Sam'],
      at: 'aux Açores',
      date: '',
      cue: 'evening',
      minutes: 5,
    });
    expect(words.title).toBe('Imaginez, Adrien, Léa et Sam.');
    expect(words.lead).toBe(
      'Un soir, au coucher du soleil, vous arrivez aux Açores. Vous posez vos valises à la réception et vous dites :',
    );
    expect(words.sentence).toBe('Tenho uma reserva em nome de Adrien.');
    expect(words.plan).toBe('Votre plan : 5 minutes par jour le soir, avant de dormir.');
  });

  it('pictures commuters at the end of the journey, and writes the first of the month « 1er »', () => {
    const words = imagineWords({
      course: en,
      travellers: ['Léa'],
      at: 'à Londres',
      date: '2027-02-01',
      cue: 'commute',
      minutes: 15,
    });
    expect(words.lead).toBe('Le lundi 1er\u00a0février, tu poses enfin le pied à Londres. À la gare, tu demandes :');
    expect(words.sentence).toBe('Which platform?');
    expect(words.plan).toBe('Ton plan : 15 minutes par jour dans les transports, jusqu’au 1er\u00a0février.');
  });

  it('seats a lunch-break learner on a terrace, with a full stop after a bare phrase', () => {
    const words = imagineWords({
      course: italian,
      travellers: ['Léa'],
      at: 'à Rome',
      date: '',
      cue: 'lunch',
      minutes: 10,
    });
    expect(words.lead).toBe('Un midi, tu arrives à Rome. Tu t’installes en terrasse et tu dis :');
    expect(words.sentence).toBe('Il menù, per favore.');
  });

  it('still reads well with no date and no practice moment', () => {
    const words = imagineWords({
      course: es,
      travellers: ['Léa'],
      at: 'en Andalousie',
      date: '',
      cue: '',
      minutes: 10,
    });
    expect(words.lead).toBe('Un jour, tu arrives en Andalousie. Tu pousses la porte d’un café et tu dis :');
    expect(words.plan).toBe('Ton plan : 10 minutes par jour.');
  });
});
