import { describe, expect, it } from 'vitest';
import { legalOf, legalPages } from '../../build/legal';
import { PUBLISHER } from '../../src/brand';

const LLP = {
  ...PUBLISHER,
  name: 'Exemple LLP',
  registration: 'limited liability partnership immatriculée en Angleterre et au pays de Galles sous le n° OC000000',
  address: '1 Example Street, Londres',
  email: 'bonjour@example.com',
  phone: '+44 20 0000 0000',
  director: 'Jeanne Exemple',
};

const page = (legal: ReturnType<typeof legalOf>, path: string) => legalPages(legal).find(p => p.path === path)!.main;
const text = (html: string) => html.replace(/<[^>]+>/g, '');

describe('the legal pages', () => {
  it('name the publisher of the central configuration, and the host the deploy serves from', () => {
    const notice = page(legalOf({}, false, LLP), 'mentions-legales/');
    for (const part of ['Exemple LLP', 'OC000000', 'Example Street', '+44 20 0000 0000', 'Jeanne Exemple'])
      expect(notice).toContain(part);
    expect(notice).toContain('mailto:bonjour@example.com');
    expect(notice).toContain('Cloudflare, Inc.');
    expect(page(legalOf({ SITE_HOST: 'github-pages' }, false, LLP), 'mentions-legales/')).toContain('GitHub, Inc.');
    const privacy = text(page(legalOf({}, false, LLP), 'confidentialite/'));
    expect(privacy).toContain('Le responsable du traitement est l’éditeur de Bagage\u00a0: Exemple LLP');
    expect(privacy).toContain('Pour exercer ces droits\u00a0: bonjour@example.com');
  });

  it('say the publisher is named before launch while its name is empty', () => {
    const legal = legalOf({}, false, { ...LLP, name: ' ' });
    expect(page(legal, 'mentions-legales/')).not.toContain('Exemple LLP');
    expect(page(legal, 'mentions-legales/')).toContain('avant le lancement');
    expect(text(page(legal, 'confidentialite/'))).toContain('adresser une réclamation à la CNIL');
  });

  it('name an EU representative only when there is one', () => {
    expect(page(legalOf({}, false, LLP), 'confidentialite/')).not.toContain('représentant');
    expect(page(legalOf({}, false, { ...LLP, representative: 'Exemple SAS, Paris' }), 'confidentialite/')).toContain(
      'représentant dans l’Union européenne\u00a0: Exemple SAS, Paris',
    );
  });

  it('describe the anonymous statistics only in a build that sends them', () => {
    expect(page(legalOf({}, true, LLP), 'confidentialite/')).toContain('Les statistiques anonymes.');
    expect(page(legalOf({}, false, LLP), 'confidentialite/')).not.toContain('statistiques');
  });
});
