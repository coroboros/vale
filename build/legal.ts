/**
 * The legal pages beside the app: who publishes Bagage and who hosts it (LCEN, article 1-1, since the
 * SREN law of 21 May 2024), and what leaves the phone (GDPR, article 13). The publisher's identity
 * comes from the deploy's variables, never from this public repository (RUNBOOK B0); sources in
 * docs/UX.md, « The legal pages ». Not legal advice: a lawyer reads them before anything is sold
 * (RUNBOOK D4).
 */
import { BRAND } from '../src/brand.ts';
import { LEGAL } from '../src/content/pages.ts';
import { COUNTED } from '../src/counts-api.ts';
import { esc, t } from './html.ts';

/** On every page beside the app and on the welcome page, as the law asks the notice to be easy to reach. */
export const legalLinks = (root: string) =>
  `<nav class="legal-links" aria-label="${t('Informations légales')}"><a href="${root}${LEGAL.notice}">${t('Mentions légales')}</a><a href="${root}${LEGAL.privacy}">${t('Confidentialité')}</a></nav>`;

interface Host {
  name: string;
  address: string;
  phone: string;
  privacy: string;
}

/** Where the build is served from, as the deploy says (SITE_HOST in .github/workflows/ci.yml). */
const HOSTS = {
  'github-pages': {
    name: 'GitHub, Inc.',
    address: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
    phone: '+1 877 448 4820',
    privacy: 'https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement',
  },
  cloudflare: {
    name: 'Cloudflare, Inc.',
    address: '101 Townsend Street, San Francisco, CA 94107, États-Unis',
    phone: '+1 650 319 8930',
    privacy: 'https://www.cloudflare.com/fr-fr/privacypolicy/',
  },
} satisfies Record<string, Host>;

export interface Legal {
  host: Host;
  /** None until the deploy names all three. */
  publisher?: { identity: string; contact: string; director: string };
  /** Whether this build sends the anonymous counts. */
  counts: boolean;
}

export function legalOf(env: Record<string, string | undefined>, counts: boolean): Legal {
  const [identity = '', contact = '', director = ''] = [env.LEGAL_PUBLISHER, env.LEGAL_CONTACT, env.LEGAL_DIRECTOR].map(
    value => value?.trim(),
  );
  return {
    host: HOSTS[env.SITE_HOST === 'cloudflare' ? 'cloudflare' : 'github-pages'],
    publisher: identity && contact && director ? { identity, contact, director } : undefined,
    counts,
  };
}

export interface LegalPage {
  path: string;
  title: string;
  description: string;
  main: string;
}

const mail = (address: string) => `<a href="mailto:${esc(address)}">${esc(address)}</a>`;
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function section(id: string, title: string, body: string): string {
  return `
      <section class="page-section" aria-labelledby="${id}">
        <h2 id="${id}">${t(title)}</h2>${body}
      </section>`;
}

function notice({ host, publisher }: Legal): LegalPage {
  const editor = publisher
    ? `
        <p>${t(publisher.identity)}</p>
        <p>${t('Contact :')} ${mail(publisher.contact)}</p>
        <p>${t(`Directeur de la publication : ${publisher.director}`)}</p>`
    : `
        <p>${t(`L’identité de l’éditeur de ${BRAND.name} sera publiée ici avant le lancement de l’app.`)}</p>`;
  return {
    path: LEGAL.notice,
    title: 'Mentions légales',
    description: `Qui édite ${BRAND.name} et qui l’héberge.`,
    main: `
      <h1>${t('Mentions légales')}</h1>${section('legal-editor', 'Éditeur', editor)}${section(
        'legal-host',
        'Hébergeur',
        `
        <p>${t(host.name)}</p>
        <p>${t(host.address)}</p>
        <p>${t(`Téléphone : ${host.phone}`)}</p>`,
      )}${section(
        'legal-credits',
        'Crédits',
        `
        <p>${t('Les photos des destinations viennent de Wikimedia Commons, sous licence libre : leur auteur et leur licence sont indiqués avec chacune.')}</p>
        <p>${t('Polices : Bricolage Grotesque et Atkinson Hyperlegible Next, sous licence SIL Open Font License. Icônes : Lucide, sous licence ISC.')}</p>`,
      )}`,
  };
}

function privacy({ host, publisher, counts }: Legal): LegalPage {
  const out = [
    `<strong>${t('Les traductions.')}</strong> ${t(`Une phrase que tu demandes à traduire en ligne part vers le service de traduction de ${BRAND.name}, qui la confie à Anthropic (Claude) ou à Cloudflare (Workers AI). Chaque réponse y est gardée 90 jours, sans rien qui la relie à toi, pour qu’une même phrase ne soit pas traduite deux fois ; ton adresse IP sert un instant à limiter le nombre de demandes par minute. Quand ce service n’est pas là, le bouton « Traduire dans DeepL » ouvre DeepL avec ta phrase. N’écris pas de données personnelles dans une phrase à traduire.`)}`,
    counts &&
      `<strong>${t('Les statistiques anonymes.')}</strong> ${t(`${BRAND.name} compte ${lowerFirst(COUNTED)}. Le service n’en garde que des totaux par jour. Tu peux les couper à tout moment, sur la page d’accueil ou dans « Moi ».`)}`,
    `<strong>${t('La voix et l’écoute.')}</strong> ${t('Les phrases sont lues par les voix de ton appareil ; quand il n’en a pas pour une langue, ton navigateur peut en prendre une en ligne. Dans les exercices à l’oral, c’est ton navigateur qui écoute : sur ton appareil quand il le peut, sinon en ligne, par le service de son éditeur (Google pour Chrome, Apple pour Safari) ; Bagage te le demande avant.')}`,
    `<strong>${t('L’hébergement.')}</strong> ${t(`${host.name} sert les pages de ${BRAND.name} et garde, comme tout hébergeur, des journaux techniques avec l’adresse IP des visiteurs :`)} <a href="${esc(host.privacy)}">${t('sa politique de confidentialité')}</a>.`,
  ].filter(Boolean);
  return {
    path: LEGAL.privacy,
    title: 'Confidentialité',
    description: `${BRAND.name} fonctionne sans compte : ce que tu apprends reste sur ton téléphone. Ce qui en sort, et pourquoi.`,
    main: `
      <h1>${t('Confidentialité')}</h1>
      <p class="page-lead">${t(`${BRAND.name} fonctionne sans compte et sans publicité : ce que tu apprends reste sur ton téléphone.`)}</p>${section(
        'privacy-phone',
        'Sur ton téléphone',
        `
        <p>${t(`Tes voyages, les prénoms des voyageurs, ta progression, ta carte de survie et tes traductions sont enregistrés par ton navigateur, sur ton appareil. ${BRAND.name} ne les envoie nulle part. Dans « Moi », tu peux les sauvegarder dans un fichier ou effacer ta progression ; effacer les données du site dans ton navigateur les supprime toutes.`)}</p>`,
      )}${section(
        'privacy-out',
        'Ce qui en sort',
        `
        <ul class="page-list">${out.map(item => `\n          <li>${item}</li>`).join('')}
        </ul>`,
      )}${section(
        'privacy-cookies',
        'Ni cookie ni traceur',
        `
        <p>${t(`${BRAND.name} ne dépose aucun cookie et n’embarque aucun traceur publicitaire ni outil de mesure d’un tiers.`)}</p>`,
      )}${section(
        'privacy-rights',
        'Tes droits',
        `
        <p>${publisher ? `${t('Pour toute question sur tes données, écris à')} ${mail(publisher.contact)}. ${t('Tu peux aussi')}` : t('Tu peux')} <a href="https://www.cnil.fr/fr/adresser-une-plainte">${t('adresser une réclamation à la CNIL')}</a>.</p>`,
      )}`,
  };
}

export const legalPages = (legal: Legal): LegalPage[] => [notice(legal), privacy(legal)];
