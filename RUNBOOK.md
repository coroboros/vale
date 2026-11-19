# Runbook

What to do next, in order, and how. Tick a step when it is done, with the date. The backlog and
the watch list live in TODO.md; the reasons behind product choices in docs/.

Owner: **you** (needs your accounts or your phone) or **Claude** (code, in a Claude Code session).

Every step that changes code starts with the rules in AGENTS.md, « Rules » (their one place;
coding agents read that file on their own): each step below says so.

Rule since the external review of 18 November 2026: **measure before widening**. No new language
and no live conversation before the numbers below say people come back. Quality work on what
exists (voices, photos) waits only for its keys.

## A. Now: Claude, without you

✅ 19 Nov 2026, at your request: **« Imagine » for every new trip, and the practice moment used
everywhere.** A trip added in « Mes voyages » lands on « Imagine » for it (`#/arrivee`), the
component onboarding ends on too. Each moment has its scene and sentence, taken from the course
where it teaches one: the café, a terrace (a pub in English), the taxi or the station, the hotel
desk booked in the learner's name; the dream ends on the plan (minutes, moment, date). Home brings
the moment back at that hour while the daily goal is open. The hotel sentences in Italian,
Portuguese and English are new and wait for the native review (TODO.md).

**Then, what does not match yet** (checked on 19 Nov 2026 after your iPhone screenshots), in this
order:

1. ✅ 19 Nov 2026. **Dublin and New York wear their own flags.** A destination in another country
   than its course's says so (`flag`), and `flagOf` dresses the trip: theme, Bernard's shell, the
   badges in « Mes voyages ». Ireland in emerald, the United States in canton blue, both
   contrast-tested; Edinburgh keeps the UK's.
2. ✅ 19 Nov 2026. **Destination and pack tips are shown.** *Phrases*, « Bon à savoir », opens on
   the tips of the traveller's destinations in that language; a regional pack opens a sheet like a
   lesson's, its tip as the introduction and its words in its own voice.
3. ✅ 19 Nov 2026. **Money per destination.** The currency follows the trip's country
   (`currencyOf`): price drills in Dublin are in euro (« four euro twenty », the Irish way), in New
   York in dollars (« four dollars and twenty cents »), and the game's icon follows.
4. ✅ 19 Nov 2026. **Every destination drawn, animated like the others.** The seventeen that
   showed a generic coast have their own scene, from the Puerta de Alcalá to the Brooklyn Bridge,
   in one module per country (`scenery/`). The window of the trip being chosen in « Mes voyages »
   now moves like the welcome flight: clouds drift, boats rock. « Ailleurs » shows its country's
   emblem, photo and drawing alike, from one field (`emblem`, read by `pictureOf`). A test fails
   when a destination has no drawing; the generic coast is gone.
5. ✅ 19 Nov 2026. **American and Irish words, with their voices.** New York's itinerary gains
   « L’anglais américain » (the check, the restroom, to go, the subway, uptown and downtown, the
   first floor…) in an American voice, Dublin's « L’anglais irlandais » (grand, the craic, your
   round…) in an Irish one when the phone has it, another English voice otherwise. « Bon à savoir »
   keeps the customs: the tip and the taxes; the euro and the Irish signs (Mná for women, Fir for
   men). A pack's sheet opens on its `intro`, which replaces a tip whose title nothing showed.
6. ✅ 19 Nov 2026. **A sheet no longer opens with a ring on its close button.** The sheet takes
   focus itself (`dialog.focus()` after `showModal()`: `autofocus` on a `<dialog>` does not behave
   the same in every browser), and Tab reaches the close button with its ring. Tested in
   Chromium; Safari on the iPhone is in TODO.md, « Test for real » (no WebKit here).
7. ✅ 19 Nov 2026. **Hotel and shopping in every language.** Italian, Portuguese and English gain
   the « Dormir et acheter » leg Spanish had: the hotel lesson and check-in scene, then shopping.
   Shaped by each country rather than copied: the tourist tax in Italy and Portugal, « Contribuinte? »
   at Portuguese tills, the receipt's silent p. Phrases already taught elsewhere (paying by card,
   open and closed) gave way to trying on and paying cash or card. Tests now hold every course to
   the README's list and every word a scene says to a gloss you can tap (the new scenes lacked
   them); the native review is in TODO.md.
8. ✅ 19 Nov 2026. **French typography: spaces that never break.** A build step
   (`build/french-spaces.ts`, on Vite's own parser) makes the space before : ; ? ! % and inside « »
   non-breaking in the text of string literals, templates and JSX, never in the code around it;
   writers keep typing plain spaces. Tests cover the transform and scan the courses for any
   breakable space left.

1. ✅ 18 Nov 2026. **Keep progress on iPhones.** Safari deletes a site's data after seven days of
   Safari use without a visit, while apps on the home screen keep their own counter ([WebKit,
   2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). Home now asks
   iPhone users in Safari to install once they have progress to lose; the app already asked the
   browser to keep its data at every start. Export from *Moi* remains the backup.
2. ✅ 19 Nov 2026. **Measurement, ready to switch on.** The decision figures, set by you on
   19 Nov 2026: widen (a new language, live conversation) only when day-1 return reaches 30 %,
   day-7 return 15 % and installs on the home screen by day 7 20 %, read over weeks of first use
   whose travellers have passed day 7. Sessions finished before the first departure are read
   alongside, with no threshold yet; the pass (offers seen, then taps) comes with the pass.
   - A return is a session finished on that exact day: stricter than the app opens behind the
     benchmarks (an average iOS app keeps 24 % on day 1 and 8 % on day 7, AppsFlyer 2024).
   - Read the figures with at least 100 travellers (my proposal): a 15 % rate is then known within
     about 7 points either way.
   - The phone works the counts out from its own day log and sends each once
     (`src/engine/counts.ts`, `src/counts.ts`): a name, the first day and, for a departure, a
     session range. No identifier, nothing about sentences. The Worker adds each to a total per
     day (`/count`, D1) and keeps no row per request.
   - CNIL: no consent needed when the counts only serve the publisher's audience measurement,
     produce anonymous statistics, are neither combined with other processing nor passed on, and
     people are told ([CNIL, 4 July
     2025](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)). *Moi*
     tells them and has the switch, on by default as you chose. Nothing is sent before C1.
3. ✅ 19 Nov 2026. **The game layer, from the evidence** (docs/LEARNING.md).
   - Onboarding's answers count for a fifth of the first goal, and the last five points are
     counted in phrases, with a short session on the ticket to finish.
   - Travellers sharing a phone see « Votre équipe »: a weekly goal of five daily goals each,
     reached together, and who brought what, a crown for the one ahead.
   - Bernard tells his trip in postcards, four per leg (`src/content/story.ts`): the new one on the
     session ticket and at the end of a scene, the latest under each leg on home. One line each:
     thin stories go with larger learning effects than deeper ones.
4. **Acquisition experiments that need no account** (hypotheses, untested). *Rules first:
   AGENTS.md.* a survival card worth sharing, pages answering « comment commander un café en
   espagnol » that open the right lesson.

Done at your request, outside this order: ✅ 18 Nov 2026, **several trips at once** (two in a row,
several languages, two in one language), each with its own hotel and address on the card; home
follows the trip in focus and offers the next one once a trip has begun; *Phrases* switches
between the traveller's languages.

## B. You, when you can

### B0. Now, in five minutes

1. **Delete the `photos-fetch` branch.** Repository → *Branches* → the bin next to
   `photos-fetch`. It only ran the photo download; the photos are in `main`.
2. **One check on your iPhone.** At https://coroboros.github.io/vale/, open a lesson's sheet from
   the itinerary: its close button should show no ring. If it does, send a screenshot (the fix of
   19 Nov 2026 could only be tested in Chromium).

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

### B2. Make the repository private, then rename it (5 minutes)

Right after B1 works (GitHub Pages stops serving a private repository on the free plan):
docs/BUSINESS.md and docs/MARKET.md are public until then.

1. Repository → *Settings → General → Danger Zone → Change visibility → Private*.
2. Same page, *Repository name*: `bagage` → *Rename*.
3. *Settings → Pages*: unpublish, then delete the `gh-pages` branch.
4. On any clone: `git remote set-url origin https://github.com/coroboros/bagage.git`.

### B3. Tidy up after the move (Claude)

*Rules first: AGENTS.md.*

- Remove the GitHub Pages branch of the *deploy* job in `.github/workflows/ci.yml`.
- `BRAND.url` (`src/brand.ts`) and the README link: the Cloudflare address.
- `ALLOWED_ORIGINS` in `worker/wrangler.jsonc`: keep only the local dev servers.
- Delete the `TRANSLATE_URL` variable if it was ever set.

### B4. Pick the Workers AI models with data (you run it, Claude reads it)

The fallback models are chosen from general evidence, not measured on our sentences yet.

```sh
cd worker
npm install
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run eval
```

The token needs the *Workers AI* permission (add it to the deploy token or create one just for
this). Paste the suggested `MODELS` into the `vars` of `worker/wrangler.jsonc`, commit, push.

### B5. Install and test on your iPhones (Claude fixes)

Safari → the Cloudflare address → *Partager → Sur l'écran d'accueil*. Then go through *Test for
real* in TODO.md and report what fails, with a screenshot.

### B6. Keys, when you have them

- **Unsplash** for the « Imagine » photos: step C3.
- **Fish Audio** for the voices: a key with a few dollars of credit as the `FISH_API_KEY` GitHub
  secret, and a native speaker to approve the voices (docs/VOICE.md).

## C. After going live: measure first (Claude)

1. Switch measurement on (A2). *Rules first: AGENTS.md.* Uncomment `d1_databases` in
   `worker/wrangler.jsonc` and set `VITE_COUNTS_URL: .` in the Cloudflare build of
   `.github/workflows/ci.yml` (the token may edit D1 since B1); the next deploy creates the
   database, and the first count its table. Check that a new traveller is counted.
   Compare the translation cost with the Console's usage page: about 0.3 cent a sentence is an
   estimate, not a measurement.
2. Two weeks later, read the figures (`cd worker && npm run figures`) and choose what comes next
   from them.
3. Photos from Unsplash for « Imagine ». *Rules first: AGENTS.md.* `brand/photos.py` searches
   Unsplash per destination and per practice moment (morning coffee: morning light; commute: a
   lively street; lunch: a sunny terrace; evening: golden hour), picks from contact sheets, triggers
   each photo's download endpoint once and records the photographer. As the API terms require, the
   app shows Unsplash's own image URLs (sized and encoded by their CDN, so the 15 MB in
   `public/photos/` leave the repository) and credits « Photo : name sur Unsplash » with links.
   README says that this step loads an image from images.unsplash.com, the only request the app
   makes to another site.
4. AI voices for every phrase (docs/VOICE.md), with the Fish Audio key. *Rules first: AGENTS.md.*
5. Translation the other way: understand a menu or a reply. *Rules first: AGENTS.md.*

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
5. **A Content Security Policy** in `public/_headers`, tested end to end, before accounts and
   payments.

## E. The business model (Claude, once D says go)

Proposal and open questions: docs/BUSINESS.md. In this order:

1. Accounts (only when buying or syncing; the app stays usable without one). *Rules first:
   AGENTS.md.*
2. Payments (the pass, then a subscription), following the D2 decision, and entitlements
   checked by the Worker. *Rules first: AGENTS.md.*
3. Premium content served by the Worker after purchase (what ships in the app bundle is free by
   nature), and per-user quotas on translation and AI conversation. *Rules first: AGENTS.md.*
4. Cloud backup and sync, encrypted on the phone, kept on R2: alone or inside the pass and the
   subscription (docs/BUSINESS.md). *Rules first: AGENTS.md.*
5. The live conversation partner, light on data (docs/VOICE.md), if the figures justify it. *Rules
   first: AGENTS.md.*

## Working with Claude Code on your Mac

Clone the repository, open the folder in Claude Code (v2.1.277 or later reads AGENTS.md on its
own), and say which step of this runbook to continue. AGENTS.md gives any coding agent, Claude
Code or Codex, the project's rules, commands and map; `npm run check` runs every test.
