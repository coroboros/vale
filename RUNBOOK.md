# Runbook

What to do next, in order, and how. A step done moves to « Done » at the end, with its date; its
details stay in that day's commit and in docs/. The backlog and the watch list live in TODO.md,
the reasons behind product choices in docs/.

Owner: **you** (needs your accounts or your phone) or **Claude** (code, in a Claude Code session).

Every step that changes code starts with the rules in AGENTS.md, « Rules » (their one place;
coding agents read that file on their own): each step below says so.

Rule since the external review of 18 November 2026: **measure before widening**. No new language
and no live conversation before the decision figures (C) say people come back. Quality work on
what exists (voices, photos) waits only for its keys.

## A. Now: Claude, without you

Nothing left that needs no one: the next steps wait for your accounts (B) or for live figures (C).

## B. You, when you can

### B0. Now, in two minutes

Delete the `photos-fetch` branch: repository → *Branches* → the bin next to `photos-fetch`. It
only ran the photo download; the photos are in `main`.

### B1. Connect Cloudflare and the Claude credits (about 15 minutes)

1. **Claim the Max API credits.** On claude.ai in a browser: *Settings → Billing → API credits →
   Link organization* (create a Console organisation if asked). The plan must be active for at
   least seven days.
2. **Lock them to zero overspending.** In that Console organisation: buy no credits, leave
   auto-reload off. Then create an API key (*API keys*).
3. **Cloudflare token.** Dashboard → *My Profile → API Tokens → Create token*, template *Edit
   Cloudflare Workers*, scoped to your account, then add *Account → D1 → Edit*: the template lacks
   it, and the anonymous counts (C1) need it. Note the **account ID** (*Workers & Pages*, right
   column).
4. **GitHub secrets.** Repository → *Settings → Secrets and variables → Actions → New repository
   secret*: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ANTHROPIC_API_KEY`.
5. **Deploy.** *Actions → CI → Run workflow*. The *deploy* job builds the app and deploys one
   Worker serving the app and its translation API. Its address is in the job log:
   `https://bagage.<your-subdomain>.workers.dev`.
6. **Check.** Open the address, go to *Phrases*, translate « Je voudrais un late checkout ».
   In the Cloudflare dashboard, the Worker's logs show the model used.

### B2. An address of our own (15 minutes, early: search builds on it)

1. Check the name first (D4): INPI and EUIPO searches for « Bagage » in classes 9 and 41.
2. Buy the domain where the Worker runs: Cloudflare dashboard → *Domain Registration → Register
   Domains*. Tell Claude which one; docs/SEARCH.md lists candidates (not checked: domain
   registries cannot be queried from here).

### B3. Move to the address (Claude)

*Rules first: AGENTS.md.*

- `BRAND.url` (`src/brand.ts`) and the README link: the domain from B2, or the Cloudflare address
  until then. The pages' canonical addresses, `sitemap.xml`, `robots.txt`, `llms.txt` and
  IndexNow follow it; the Worker gets the domain.
- A last GitHub Pages build whose pages point to their new addresses (with the canonical tag), so
  search engines move what they have indexed; then the *deploy* job loses its GitHub Pages branch.
- `ALLOWED_ORIGINS` in `worker/wrangler.jsonc`: keep only the local dev servers.
- Delete the `TRANSLATE_URL` variable if it was ever set.

### B4. Search Console (10 minutes, once Bagage has its domain)

Search engines find the pages through links and the sitemap; this makes it sooner and gives the
figures per page (docs/SEARCH.md, « How we will know »). Google Search Console → *Add property →
Domain* → the domain from B2 → verify through DNS (Search Console walks you through Cloudflare).
Then *Sitemaps* → `sitemap.xml` → *Submit*, and leave the site in the generative AI features.
Then Bing Webmaster Tools → *Import* from Google Search Console: Bing also feeds ChatGPT search.
Last, isitagentready.com and Lighthouse's « Agentic browsing » on the domain (docs/SEARCH.md,
« Agents »).

### B5. Make the repository private, then rename it (5 minutes, a few weeks after B4)

Once Search Console shows the pages at their new addresses: GitHub Pages stops serving a private
repository on the free plan, and with it the pointers of B3. docs/BUSINESS.md and docs/MARKET.md
are public until then.

1. Repository → *Settings → General → Danger Zone → Change visibility → Private*.
2. Same page, *Repository name*: `bagage` → *Rename*.
3. *Settings → Pages*: unpublish, then delete the `gh-pages` branch.
4. On any clone: `git remote set-url origin https://github.com/coroboros/bagage.git`.

### B6. Pick the Workers AI models with data (you run it, Claude reads it)

The fallback models are chosen from general evidence, not measured on our sentences yet.

```sh
cd worker
npm install
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run eval
```

The token needs the *Workers AI* permission (add it to the deploy token or create one just for
this). Paste the suggested `MODELS` into the `vars` of `worker/wrangler.jsonc`, commit, push.

### B7. Install and test on your iPhones (Claude fixes)

Safari → the Cloudflare address → *Partager → Sur l'écran d'accueil*. Then go through *Test for
real* in TODO.md and report what fails, with a screenshot.

### B8. Keys, when you have them

- **Unsplash** for the « Imagine » photos: step C3.
- **Fish Audio** for the voices: a key with a few dollars of credit as the `FISH_API_KEY` GitHub
  secret, and a native speaker to approve the voices (docs/VOICE.md).

## C. After going live: measure first (Claude)

1. **Switch measurement on.** *Rules first: AGENTS.md.* Uncomment `d1_databases` in
   `worker/wrangler.jsonc` and set `VITE_COUNTS_URL: .` in the Cloudflare build of
   `.github/workflows/ci.yml` (the token may edit D1 since B1); the next deploy creates the
   database, and the first count its table. Check that a new traveller is counted. Compare the
   translation cost with the Console's usage page: about 0.3 cent a sentence is an estimate, not a
   measurement. No consent is needed when counts only serve the publisher's audience measurement,
   produce anonymous statistics, are neither combined with other processing nor passed on, and
   people are told and can easily say no ([CNIL, 4 July
   2025](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)): the
   first screen and *Moi* tell them and have the switch, on by default as you chose. Before
   selling anything, a lawyer reads this with the privacy policy (D4; docs/UX.md, « Who stops
   before the first lesson »).
2. **Two weeks later, read the figures** (`cd worker && npm run figures`, and Search Console per
   page) against the decision figures below, and choose what comes next from them: widening only
   once all three are met, more pages where search brings travellers who come back, and the
   screen where most newcomers stop before the first lesson (docs/UX.md).
3. **Photos from Unsplash for « Imagine ».** *Rules first: AGENTS.md.* `brand/photos.py` searches
   Unsplash per destination and per practice moment (morning coffee: morning light; commute: a
   lively street; lunch: a sunny terrace; evening: golden hour), picks from contact sheets, triggers
   each photo's download endpoint once and records the photographer. As the API terms require, the
   app shows Unsplash's own image URLs (sized and encoded by their CDN, so the 15 MB in
   `public/photos/` leave the repository) and credits « Photo : name sur Unsplash » with links.
   `images.unsplash.com` joins `build/csp.ts`, and README says it is the only site the app then
   loads anything from.
4. **AI voices for every phrase** (docs/VOICE.md), with the Fish Audio key. *Rules first: AGENTS.md.*
5. **Translation the other way**: understand a menu or a reply. *Rules first: AGENTS.md.*

### Decision figures

Set by you on 19 Nov 2026. Widen (a new language, live conversation) only when, over weeks of
first use whose travellers have all passed day 7:

- day-1 return reaches 30 %, day-7 return 15 %, and installs on the home screen by day 7 20 %;
- with at least 100 travellers read (my proposal): a 15 % rate is then known within about 7
  points either way.

A return is a session finished on that exact day: stricter than the app opens behind the
benchmarks (an average iOS app keeps 24 % on day 1 and 8 % on day 7, AppsFlyer 2024). Sessions
finished before the first departure are read alongside, with no threshold yet; the pass (offers
seen, then taps) comes with the pass. The phone works the counts out from its own day log and
sends each once (`src/engine/counts.ts`, `src/counts.ts`): a name, the first day, the link that
brought the traveller and, for a departure, a session range. No identifier, nothing about
sentences; the Worker adds each to a total per day (`/count`, D1) and keeps no row per request.

## D. Before selling anything (you decide, Claude prepares)

1. **Where the first 100 travellers come from.** One experiment per channel, each with its cost,
   installs and day-7 return: search pages per situation, the shared survival card, short travel
   videos, the stores. The demand exists: 12.9 million French tourists visited Spain in 2024, 10.3 %
   more than in 2023 ([Turespaña,
   Frontur](https://www.mintur.gob.es/es-es/gabineteprensa/notasprensa/2025/documents/20250203%20ndp%20frontur%20egatur%20diciembre%20y%20anual.pdf)).
   A pass paid once per trip brings little per person: acquisition must cost close to nothing, and
   buying again for the next trip becomes the figure that matters.
2. **Stores or the web.** In a store app, digital purchases follow the store's rules, which
   rewrites docs/BUSINESS.md's « Stripe on the web ». Checked 18 Nov 2026:
   - Apple, EU, from 1 Oct 2026: 26 % through Apple's in-app purchase, alternatives allowed
     alongside, and the chosen setup kept 12 months
     ([Apple](https://developer.apple.com/support/apps-in-the-eu/)); secondary sources give 20 % for
     other processors and 15 % for a link to the web.
   - Google Play, US, UK and EEA, from 30 Jun 2026: 10 % on the first million dollars a year
     whatever the billing, plus 5 % only with Google's billing; links to a web checkout allowed
     ([Android Developers
     Blog](https://android-developers.googleblog.com/2026/06/play-expanded-billing.html)).
   - Apple reviews apps that wrap a website against its minimum functionality rule (4.2); check
     inside the wrapper: offline and the service worker, speech recognition and synthesis, the
     microphone, persistent storage.
   Put the commission in the price, and decide where the pass sells: app, web, or both.
3. **Test willingness to pay with the simplest thing** (a payment link for the pass, offered to
   real travellers) before building accounts, D1, passkeys and entitlements.
4. **Legal and the name.** Terms of sale, privacy policy (GDPR), the company that invoices,
   Anthropic's terms for serving paying customers; the name checked at INPI and EUIPO (classes 9
   and 41), the domain and the store names.

## E. The business model (Claude, once D says go)

Proposal and open questions: docs/BUSINESS.md. In this order:

1. Accounts (only when buying or syncing; the app stays usable without one). *Rules first:
   AGENTS.md.*
2. Payments (the pass, then a subscription), following the D2 decision, and entitlements
   checked by the Worker, which then sends the Content Security Policy as a header, with
   `frame-ancestors 'none'` on those pages (a `<meta>` cannot carry it). The pass asks for the
   return date when bought, not before (docs/UX.md, « The return date »). *Rules first:
   AGENTS.md.*
3. Premium content served by the Worker after purchase (what ships in the app bundle is free by
   nature), and per-user quotas on translation and AI conversation. *Rules first: AGENTS.md.*
4. Cloud backup and sync, encrypted on the phone, kept on R2: alone or inside the pass and the
   subscription (docs/BUSINESS.md). *Rules first: AGENTS.md.*
5. The live conversation partner, light on data (docs/VOICE.md), if the figures justify it. *Rules
   first: AGENTS.md.*

## Done

- 18 Nov 2026. **Keep progress on iPhones.** Home asks iPhone users in Safari to install once they
  have progress to lose: Safari deletes a site's data after seven days of use without a visit,
  apps on the home screen keep theirs ([WebKit,
  2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). Export in
  *Moi* remains the backup.
- 18 Nov 2026. **Several trips at once**: two in a row, several languages, two in one language,
  each with its hotel and address on the card; home follows the trip in focus and offers the next
  one once a trip has begun; *Phrases* switches between the traveller's languages.
- 19 Nov 2026. **Measurement, ready to switch on** (C1, « Decision figures »).
- 19 Nov 2026. **The game layer, from the evidence** (docs/LEARNING.md): onboarding's answers count
  toward the first goal; « Votre équipe » for travellers sharing a phone; Bernard's postcards,
  four per leg.
- 19 Nov 2026. **Acquisition experiments that need no account**: the card sent as a picture
  (`utm_source=carte`) and pages per situation (`utm_source=page`); the counts say which link
  brought each traveller (`npm run figures`).
- 19 Nov 2026. **« Imagine » for every new trip**, the practice moment brought back at its hour,
  and on phones the photo in plain view, measured against the previous design (docs/BRAND.md,
  Photos).
- 19 Nov 2026. **After your iPhone screenshots**: Dublin and New York in their own flags;
  destination and pack tips shown; money per destination; every destination drawn and animated;
  American and Irish words with their voices; sheets that open without a ring on their close
  button; hotel and shopping in every language; French spaces that never break.
- 19 Nov 2026. **Search, all that needs no domain** (docs/SEARCH.md): pages per situation and per
  language with their trail, titles in the words people type, a sharing picture, the sitemap,
  `robots.txt` with your content signals (AI training allowed), `llms.txt`, IndexNow told at each
  deploy.
- 19 Nov 2026. **A Content Security Policy** (`build/csp.ts`), tested end to end: only the app's own
  scripts run; in a `<meta>` tag, since GitHub Pages ignores headers.
- 19 Nov 2026. **Bernard and a moving drawing on the pages**, and a pause on every moving drawing
  (docs/BRAND.md, Motion).
- 19 Nov 2026. **The first screen, measured with a slow phone's network and processor**: the
  welcome's largest paint comes at 1.6 s, under the 2.5 s of a good page, so nothing changes;
  real visitors' figures will tell (docs/SEARCH.md, « Measured »).
- 19 Nov 2026. **The way to the first lesson, measured** (docs/UX.md): seven screens and one
  required answer from the app; five from a page's link, which now opens at the destination; a
  first lesson of 18 exercises, about three to four minutes. The return date was studied and waits
  for the pass.
- 19 Nov 2026. **Where newcomers stop, counted once measurement is on** (docs/UX.md): each
  onboarding screen a phone reaches, then its first lesson begun and finished, with no identifier;
  the switch is on the first screen as well as in *Moi*, as the CNIL asks.
- 19 Nov 2026. **A page's lesson in a new language**: a traveller with no trip in it gets
  « Nouveau voyage » in that language, then that lesson (docs/UX.md, « Changed »).
- 19 Nov 2026. **A pronunciation check that stays on the computer**: where Chrome would hear the
  voice online, the check offers to download the language once
  ([`SpeechRecognition.install()`](https://developer.mozilla.org/docs/Web/API/SpeechRecognition/install_static),
  Chrome 139 and later), then listens on the device; a download that fails or never ends (Brave)
  leaves the online check on offer.

## Working with Claude Code on your Mac

Clone the repository, open the folder in Claude Code and say which step of this runbook to
continue. AGENTS.md gives any coding agent the project's rules, commands and map: Codex reads it
itself, and Claude Code through `CLAUDE.md`, which imports it, whatever its version and settings.
`npm run check` runs every test. Now and then, run `/doctor prompt-audit` in Claude Code (v2.1.283
or later): it lists stale paths, stale commands and instructions that contradict each other.
