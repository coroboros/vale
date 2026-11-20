# Runbook

What to do next, in order, and how. A step done leaves this file: its commit and docs/ keep the
details. The backlog and the watch list live in TODO.md, the reasons behind product choices in
docs/.

Owner: **you** (needs your accounts or your phone) or **Claude** (code, in a Claude Code session).

Every step that changes code starts with the rules in AGENTS.md, « Rules » (their one place;
coding agents read that file on their own): each step below says so.

Rule: **measure before widening**. No new language and no live conversation before the decision
figures (C) say people come back. Quality work on what exists (voices, photos) waits only for its
keys.

## First, on the Mac: the cloud and the Mac compared (you and Claude, about 30 minutes)

Right after `claude --teleport` (« Working with Claude Code on your Mac », at the end), before
anything else:

1. **Compare.** Claude lists what the cloud sessions had and what the Mac has, measures the
   differences and writes down what to change. What the cloud showed (20 November 2026):
   - Network: npm, PyPI and GitHub only. No Wikimedia Commons (the photos), no github.io (the live
     site, so no Lighthouse on it), no GitHub Actions variables or secrets through the API.
   - Machine: 2 CPUs. The end-to-end tests take 9.5 min with two Playwright workers (13.7 with
     one); more only help with `fullyParallel`: measure it on the Mac.
   - Browsers: a headless Chromium only; no Safari and no iPhone (B7).
   - Accounts: no Cloudflare login, no GitHub Actions settings; commits signed as Claude
     (AGENTS.md, « Done means »).
   - Claude Code: version, settings and permissions, the look-and-measure skill loading, hooks,
     MCP servers, model and effort, how context is kept; compared with the cloud's.
2. **Decide** the changes together (settings, workers, tools), apply them, and note them in
   AGENTS.md or the skill.
3. **Unblock B**, in order: B0, then B1 (Cloudflare and the Claude credits), and on.

## A. Now: Claude, without you

1. **California and Florida: their photos, on the Mac.** *Rules first: AGENTS.md.* The branch
   `california-florida` adds both destinations to the English course, drawn and with their tips
   (docs/MARKET.md, « Where French travellers go »); every test passes but the one that asks for
   their photos, which come from Wikimedia Commons, out of the cloud's reach. Choose one per
   destination from a contact sheet, as for the others (docs/BRAND.md, « Photos »). Candidates
   seen from here, not looked at: Commons' featured « Golden Gate Bridge as seen from Battery
   East.jpg » and « Golden Gate Bridge as seen from Marshall’s Beach, October 2017.jpg », and
   « Ocean Drive - Art Deco buildings in Miami (5410502514).jpg » (CC BY 2.0). Add the file, focus
   and alt to `src/ui/photos.json`, run `python3 brand/photos.py fetch render`, look at
   « Imagine », then `npm run check` and merge the branch into `main`.

Then nothing left that needs no one: the next steps wait for your accounts (B) or for live
figures (C).

## B. You, when you can

### B0. Now, in five minutes

1. Delete the `photos-fetch` branch: repository → *Branches* → the bin next to `photos-fetch`. It
   only ran the photo download; the photos are in `main`.
2. Name the publisher for « Mentions légales » and « Confidentialité »: fill `PUBLISHER` in
   `src/brand.ts`, or send Claude the values: the registered name; the legal form, register and
   number; the registered office; a telephone number (the LCEN asks for one); an email address
   that someone reads; the VAT number if there is one; the director of publication, a person.
   They are public on the site by law. Until then the pages say the publisher is named before
   launch (docs/UX.md, « The legal pages »).

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

0. **Reminders before the first figures** (why: docs/UX.md, « Reminders »). *Rules first:
   AGENTS.md.* Opt-in Web Push at the practice moment the traveller chose, sent by the Worker
   with VAPID keys kept as Worker secrets, subscriptions in D1, a daily cron; on iPhone, only once
   Bagage is on the Home Screen ([iOS 16.4+](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)).
   One a day at most, no guilt, off in « Moi » like the streak; the privacy notice names it (D4).
   Needs B1.
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

Set by you. Widen (a new language, live conversation) only when, over weeks of
first use whose travellers have all passed day 7:

- day-1 return reaches 30 %, day-7 return 15 %, and installs on the home screen by day 7 20 %;
- with at least 100 travellers read (my proposal): a 15 % rate is then known within about 7
  points either way.

A return is a session finished on that exact day: stricter than the app opens behind the
benchmarks (an average iOS app keeps 24 % on day 1 and 8 % on day 7, AppsFlyer 2024). Sessions
finished before the first departure are read alongside, with no threshold yet; the pass (offers
seen, then taps) comes with the pass. The phone works the counts out from its own day log and
sends each once (`src/engine/counts.ts`, `src/counts.ts`): a name, the first day, the link that
brought the traveller and, for a departure, a session range, for a first step its name. Beside
them go the answers per exercise kind, summed for the phone's travellers: how many, how many
right, how many the session expected right. No identifier, nothing about phrases or sentences;
the Worker adds each to a total per day (`/count`, D1) and keeps no row per request. The last
query of `npm run figures` reads the answers against the 85 % aim (docs/LEARNING.md).

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
4. **Legal and the name.** Terms of sale, the company that invoices, Anthropic's terms for serving
   paying customers; the name checked at INPI and EUIPO (classes 9 and 41), the domain and the
   store names. A lawyer reads « Mentions légales » and « Confidentialité » and settles what
   docs/UX.md, « The legal pages », leaves open: a representative in the EU if the publisher is
   outside it (GDPR, article 27), and the UK data protection fee if it is a UK company.

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

## Working with Claude Code on your Mac

1. Clone the repository; with Node 22 or later, `npm ci && (cd worker && npm ci)`, then
   `npx playwright install chromium` once for the end-to-end tests (or set `CHROME_PATH` to your
   Chrome).
2. Open the folder in Claude Code and run `/context`: `CLAUDE.md` must appear under « Memory
   files ». It imports AGENTS.md, the project's rules, commands and map, which Codex reads itself.
3. Say which step of this runbook to continue. `npm run check` runs every test, about ten
   minutes with the end-to-end ones. How screenshots and measures were made in the cloud
   sessions is in the look-and-measure skill (`.claude/skills/`), so nothing is lost on the Mac.
4. Now and then, `/doctor prompt-audit` (Claude Code v2.1.283 or later) lists stale paths, stale
   commands and instructions that contradict each other.
