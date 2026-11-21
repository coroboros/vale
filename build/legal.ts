/**
 * The legal pages beside the app, from the central configuration (src/brand.ts): who publishes
 * Bagage and who hosts it (LCEN, article 1-1, since the SREN law of 21 May 2024; for a UK company
 * or LLP, its trading disclosures), and what leaves the phone (GDPR and UK GDPR, article 13).
 * Sources and the open questions for a lawyer: docs/UX.md, « The legal pages ».
 */
import { BRAND, HOSTS, PUBLISHER, type Publisher } from '../src/brand.ts';
import { LEGAL } from '../src/content/pages.ts';
import { COUNTED } from '../src/counts-api.ts';
import { esc, t } from './html.ts';

/** On every page beside the app and on the welcome page, as the law asks the notice to be easy to reach. */
export const legalLinks = (root: string) =>
  `<nav class="legal-links" aria-label="${t('Informations légales')}"><a href="${root}${LEGAL.notice}">${t('Mentions légales')}</a><a href="${root}${LEGAL.privacy}">${t('Confidentialité')}</a></nav>`;

type Host = (typeof HOSTS)[keyof typeof HOSTS];

export interface Legal {
  host: Host;
  publisher: Publisher;
  /** Whether this build sends the anonymous counts. */
  counts: boolean;
}

/** `env`: the deploy's SITE_HOST says when the build goes to GitHub Pages rather than Cloudflare. */
export function legalOf(env: Record<string, string | undefined>, counts: boolean, publisher = PUBLISHER): Legal {
  return { host: HOSTS[env.SITE_HOST === 'github-pages' ? 'github-pages' : 'cloudflare'], publisher, counts };
}

export interface LegalPage {
  path: string;
  title: string;
  description: string;
  main: string;
}

const mail = (address: string) => `<a href="mailto:${esc(address)}">${esc(address)}</a>`;
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
/** Said wherever the invented publisher appears, so nobody takes it for the real one. */
const INVENTED = `${BRAND.name} n’est pas encore lancé : cet éditeur est imaginaire, le vrai sera nommé avant le lancement.`;

function section(id: string, title: string, body: string): string {
  return `
      <section class="page-section" aria-labelledby="${id}">
        <h2 id="${id}">${t(title)}</h2>${body}
      </section>`;
}

const paragraphs = (...lines: (string | false)[]) =>
  lines
    .filter(line => line !== false && line !== '')
    .map(line => `\n        <p>${line}</p>`)
    .join('');

function notice({ host, publisher: p }: Legal): LegalPage {
  const editor = paragraphs(
    p.placeholder && `<strong>${t(INVENTED)}</strong>`,
    t(p.name),
    p.registration && t(p.registration),
    p.address && t(`Siège : ${p.address}`),
    p.phone && t(`Téléphone : ${p.phone}`),
    p.email && `${t('E-mail :')} ${mail(p.email)}`,
    p.vat && t(`Numéro de TVA : ${p.vat}`),
    p.director && t(`Directeur de la publication : ${p.director}`),
  );
  return {
    path: LEGAL.notice,
    title: 'Mentions légales',
    description: `Qui édite ${BRAND.name} et qui l’héberge.`,
    main: `
      <h1>${t('Mentions légales')}</h1>${section('legal-editor', 'Éditeur', editor)}${section(
        'legal-host',
        'Hébergeur',
        paragraphs(t(host.name), t(host.address), t(`Téléphone : ${host.phone}`)),
      )}${section(
        'legal-credits',
        'Crédits',
        paragraphs(
          t(
            'Les photos des destinations viennent de Wikimedia Commons, sous licence libre : leur auteur et leur licence sont indiqués avec chacune.',
          ),
          t(
            'Polices : Bricolage Grotesque et Atkinson Hyperlegible Next, sous licence SIL Open Font License. Icônes : Lucide, sous licence ISC.',
          ),
        ),
      )}`,
  };
}

function privacy({ host, publisher: p, counts }: Legal): LegalPage {
  const contact = p.email ? mail(p.email) : '';
  const out = [
    `<strong>${t('Les traductions.')}</strong> ${t(`Une phrase que tu demandes à traduire en ligne part vers le service de traduction de ${BRAND.name}, qui la confie à Anthropic (Claude) ou à Cloudflare (Workers AI). Chaque réponse y est gardée 90 jours, sans rien qui la relie à toi, pour qu’une même phrase ne soit pas traduite deux fois ; ton adresse IP sert une minute à compter tes demandes, pour protéger le service des abus. Le but : te rendre le service que tu demandes, ce qui est l’intérêt légitime de l’éditeur. Quand ce service n’est pas là, le bouton « Traduire dans DeepL » ouvre DeepL avec ta phrase, selon ses propres règles. N’écris pas de données personnelles dans une phrase à traduire.`)}`,
    counts &&
      `<strong>${t('Les statistiques anonymes.')}</strong> ${t(`${BRAND.name} compte ${lowerFirst(COUNTED)}. Le service n’en garde que des totaux par jour. C’est une mesure d’audience pour améliorer l’app, l’intérêt légitime de l’éditeur, que la CNIL dispense de consentement à ces conditions ; tu peux t’y opposer à tout moment en les coupant, sur la page d’accueil ou dans « Moi ».`)}`,
    `<strong>${t('La voix et l’écoute.')}</strong> ${t(`Les phrases sont lues par les voix de ton appareil ; quand il n’en a pas pour une langue, ton navigateur peut en prendre une en ligne. Dans les exercices à l’oral, c’est ton navigateur qui écoute : sur ton appareil quand il le peut, sinon en ligne, par le service de son éditeur (Google pour Chrome, Apple pour Safari), selon ses propres règles ; ${BRAND.name} te le demande avant.`)}`,
    `<strong>${t('L’hébergement.')}</strong> ${t(`${host.name} sert les pages de ${BRAND.name} et garde, comme tout hébergeur, des journaux techniques avec l’adresse IP des visiteurs :`)} <a href="${esc(host.privacy)}">${t('sa politique de confidentialité')}</a>.`,
  ].filter(Boolean);
  const controller = paragraphs(
    p.placeholder && `<strong>${t(INVENTED)}</strong>`,
    `${t(`Le responsable du traitement est l’éditeur de ${BRAND.name} : ${p.name}${p.address ? `, ${p.address}` : ''}.`)}${contact ? ` ${t('Pour toute question sur tes données :')} ${contact}.` : ''}`,
    p.representative && t(`Son représentant dans l’Union européenne : ${p.representative}.`),
  );
  return {
    path: LEGAL.privacy,
    title: 'Confidentialité',
    description: `${BRAND.name} fonctionne sans compte : ce que tu apprends reste sur ton téléphone. Ce qui en sort, pourquoi, et tes droits.`,
    main: `
      <h1>${t('Confidentialité')}</h1>
      <p class="page-lead">${t(`${BRAND.name} fonctionne sans compte et sans publicité : ce que tu apprends reste sur ton téléphone.`)}</p>${section(
        'privacy-controller',
        'Qui en répond',
        controller,
      )}${section(
        'privacy-phone',
        'Sur ton téléphone',
        paragraphs(
          t(
            `Tes voyages, les prénoms des voyageurs, ta progression, ta carte de survie et tes traductions sont enregistrés par ton navigateur, sur ton appareil. ${BRAND.name} ne les envoie nulle part. Dans « Moi », tu peux les sauvegarder dans un fichier ou effacer ta progression ; effacer les données du site dans ton navigateur les supprime toutes.`,
          ),
        ),
      )}${section(
        'privacy-out',
        'Ce qui en sort',
        `
        <ul class="page-list">${out.map(item => `\n          <li>${item}</li>`).join('')}
        </ul>${paragraphs(t('Rien de tout cela n’est obligatoire : sans ces services, l’app marche, sans traduction ni écoute en ligne.'))}`,
      )}${section(
        'privacy-where',
        'Qui le reçoit',
        paragraphs(
          `${t(`Cloudflare (le service de traduction${counts ? ' et les statistiques' : ''}) et Anthropic (la traduction) traitent ces données pour le compte de l’éditeur, qui leur interdit de s’en servir pour eux-mêmes. Ces prestataires sont établis aux États-Unis : les transferts y reposent sur les`)} <a href="https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj?locale=fr">${t('clauses contractuelles types de la Commission européenne')}</a>${t(', avec l’avenant britannique pour le Royaume-Uni, que prévoient leurs conditions de traitement des données ; Cloudflare est en outre certifiée au cadre de protection des données UE–États-Unis.')}`,
        ),
      )}${section(
        'privacy-cookies',
        'Ni cookie ni traceur',
        paragraphs(
          t(
            `${BRAND.name} ne dépose aucun cookie et n’embarque aucun traceur publicitaire ni outil de mesure d’un tiers. Ce que ton navigateur garde pour l’app ne sert qu’à la faire fonctionner pour toi. Aucune décision ayant des effets juridiques n’est prise automatiquement à ton sujet.`,
          ),
        ),
      )}${section(
        'privacy-rights',
        'Tes droits',
        paragraphs(
          `${t('Tu peux accéder à tes données, les faire rectifier ou effacer, en limiter l’usage, t’y opposer et les récupérer. L’éditeur ne garde rien qui permette de te reconnaître : le plus souvent, il ne pourra retrouver aucune donnée à ton sujet, puisque ce que tu apprends n’est que sur ton téléphone.')}${contact ? ` ${t('Pour exercer ces droits :')} ${contact}.` : ''}`,
          `${t('Tu peux aussi')} <a href="https://www.cnil.fr/fr/adresser-une-plainte">${t('adresser une réclamation à la CNIL')}</a>${t(', ou à l’autorité de protection des données de ton pays, comme')} <a href="https://ico.org.uk/make-a-complaint/data-protection-complaints/">${t('l’ICO au Royaume-Uni')}</a>.`,
        ),
      )}`,
  };
}

export const legalPages = (legal: Legal): LegalPage[] => [notice(legal), privacy(legal)];
