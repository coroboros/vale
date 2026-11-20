import { describe, expect, it } from 'vitest';
import { legalOf, legalPages } from '../../build/legal';

const DEPLOY = {
  LEGAL_PUBLISHER: 'Exemple LLP, 1 rue de l’Exemple, Londres',
  LEGAL_CONTACT: 'bonjour@example.com',
  LEGAL_DIRECTOR: 'Jeanne Exemple',
};

const page = (env: Record<string, string>, counts: boolean, path: string) =>
  legalPages(legalOf(env, counts)).find(p => p.path === path)!.main;
const text = (html: string) => html.replace(/<[^>]+>/g, '');

describe('the legal pages', () => {
  it('name the publisher the deploy gives, and the host the build is served from', () => {
    const notice = page({ ...DEPLOY, SITE_HOST: 'cloudflare' }, false, 'mentions-legales/');
    expect(notice).toContain('Exemple LLP');
    expect(notice).toContain('mailto:bonjour@example.com');
    expect(notice).toContain('Jeanne Exemple');
    expect(notice).toContain('Cloudflare, Inc.');
    expect(page(DEPLOY, false, 'mentions-legales/')).toContain('GitHub, Inc.');
  });

  it('say the publisher comes before launch when the deploy does not name all of it', () => {
    const notice = page({ LEGAL_PUBLISHER: 'Exemple LLP' }, false, 'mentions-legales/');
    expect(notice).not.toContain('Exemple LLP');
    expect(notice).toContain('avant le lancement');
    expect(text(page({}, false, 'confidentialite/'))).toContain('Tu peux adresser une réclamation à la CNIL');
    expect(text(page(DEPLOY, false, 'confidentialite/'))).toContain('Tu peux aussi adresser une réclamation');
  });

  it('describe the anonymous statistics only in a build that sends them', () => {
    expect(page(DEPLOY, true, 'confidentialite/')).toContain('Les statistiques anonymes.');
    expect(page(DEPLOY, false, 'confidentialite/')).not.toContain('statistiques');
  });
});
