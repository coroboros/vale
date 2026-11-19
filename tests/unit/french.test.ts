import { describe, expect, it } from 'vitest';
import { andList, frenchDay, ofLanguage, theLanguage } from '../../src/ui/french';

describe('French wording', () => {
  it('writes days the French way, the first of the month « 1er », in every style', () => {
    expect(frenchDay('2027-02-01', 'weekday')).toBe('lundi 1er\u00a0février');
    expect(frenchDay('2027-02-01')).toBe('1er\u00a0février');
    expect(frenchDay('2026-11-15', 'dayYear')).toBe('15\u00a0novembre 2026');
    expect(frenchDay('2026-12-01', 'short')).toBe('1er\u00a0déc.');
  });

  it('puts the right article before a language’s name', () => {
    expect([theLanguage('Espagnol'), theLanguage('Portugais')]).toEqual(['l’espagnol', 'le portugais']);
    expect([ofLanguage('Anglais'), ofLanguage('Portugais')]).toEqual(['d’anglais', 'de portugais']);
  });

  it('lists names with a final « et »', () => {
    expect(andList(['Adrien', 'Léa', 'Sam'])).toBe('Adrien, Léa et Sam');
  });
});
