import { describe, expect, it } from 'vitest';
import { imagineWords } from '../../src/ui/imagine';

describe('the words of « Imagine »', () => {
  it('names the traveller, the day and the hour they practise', () => {
    expect(imagineWords({ travellers: ['Adrien'], at: 'à Rome', date: '2026-12-19', cue: 'coffee' })).toEqual({
      title: 'Imagine, Adrien.',
      lead: 'Le samedi 19 décembre au petit matin, tu arrives à Rome. Tu pousses la porte d’un café et tu dis :',
    });
  });

  it('speaks to a group with « vous » and lists the names the French way', () => {
    const words = imagineWords({ travellers: ['Adrien', 'Léa', 'Sam'], at: 'aux Açores', date: '', cue: 'evening' });
    expect(words.title).toBe('Imaginez, Adrien, Léa et Sam.');
    expect(words.lead).toBe(
      'Un soir, au coucher du soleil, vous arrivez aux Açores. Vous poussez la porte d’un café et vous dites :',
    );
  });

  it('pictures commuters at the end of the journey, and writes the first of the month as « 1er »', () => {
    expect(imagineWords({ travellers: ['Léa'], at: 'à Londres', date: '2027-02-01', cue: 'commute' }).lead).toBe(
      'Le lundi 1er février, tu poses enfin le pied à Londres. Tu pousses la porte d’un café et tu dis :',
    );
  });

  it('still reads well with no date and no practice time', () => {
    expect(imagineWords({ travellers: ['Léa'], at: 'en Andalousie', date: '', cue: '' }).lead).toBe(
      'Un jour, tu arrives en Andalousie. Tu pousses la porte d’un café et tu dis :',
    );
  });
});
