# To do

The backlog and the watch list. What to do next, in order, is in RUNBOOK.md.

## Before launch

- **Native speakers or teachers check every course.** Each phrase, its French-reader
  pronunciation, its note, the scenes, sounds, tips and survival card, in all four languages. No
  course has had a native review yet; the newest parts most need one: Portuguese, English, the
  American and Irish packs, and the hotel and shopping lessons.

## Test for real

- Both iPhones: install on the home screen, offline after one visit, the update toast, the
  Spanish, Italian, Portuguese (Portugal) and English (UK) voices (*Réglages → Accessibilité →
  Contenu énoncé*), voice recording, Bernard
  speaking when tapped, the date fields of onboarding and *Moi* (the automated check runs in
  Chromium only), the American and Irish voices (en-US, en-IE) in their packs.
- The welcome flight on an older iPhone (smoothness, battery), with *Réduire les animations* on,
  and in Safari with its toolbars (short screen).
- Translation: one sentence per language once deployed, a cache hit, a 429 after 20 calls a
  minute, the Claude spend counted in KV against the Console usage page.
- Translation quality: the eval grades, then a native speaker on twenty phrases per language,
  and the French-reader pronunciation of Italian stress (often unpredictable from spelling).
- Lighthouse on a real phone; the local measures are in docs/SEARCH.md, « Measured ».
- Quiet mode on the iPhone, with the ring switch on silent too; the new icon in Safari's tab
  overview and on the home screen.
- A lesson's sheet opened from the itinerary in Safari on the iPhone: no ring on its close button
  until Tab reaches it (tested in Chromium only).
- « Imagine » on the iPhone: the photo in plain view at the top, nothing to scroll on an iPhone SE,
  the slow zoom smooth on an older iPhone, and how fast the photo appears on a slow connection (it
  loads one step ahead, about 250 KB).
- « Garde ta progression » on the iPhone: shown in Safari once a lesson is done, gone in the
  installed app.
- Bernard everywhere on the iPhone: his eyes following a finger and blinking in lessons, on the
  home card and in « Imagine », without slowing the screen; the flag on his shell at small sizes.
- Sharing the card on the iPhone and on Android: the picture and its link arrive in Messages and
  WhatsApp, and the link opens Bagage.
- A situation page on the iPhone, in Safari and with the app installed: the phrases speak, and
  « Apprendre ces phrases » opens the lesson. A language page (`espagnol/`): its trail back, and
  « Apprendre l’espagnol » into onboarding, at « Où vas-tu ? ».
- The first lesson from a fresh start: the minutes on its ticket (docs/UX.md estimates three to
  four).
- A link to Bagage pasted in Messages and WhatsApp: the preview shows the title and the picture
  with Bernard (`og.png`).
- « Mes voyages » on the iPhone: adding a second trip, switching the one in focus from the home
  screen and from *Moi*, the next-trip card once a trip has begun, and *Phrases* switching
  language.
- The pronunciation check on the iPhone, in Safari and from the home screen: two tries in a row.
  On iOS 27, recognition goes deaf after the first session (WebKit bug 321436); Bagage then falls
  back to recording, after ten seconds. Reporters say a short synthesised phrase right before
  each session avoids it: worth adding if the second try fails. Also Chrome on Android (online)
  and Chrome on a computer, with and without the language pack.

## Improve

What Duolingo and the others ship that Bagage lacks: docs/MARKET.md. Steps already planned are
in RUNBOOK.md (voices, photos, translation the other way, the business model, backup, live
conversation).

- **Pronunciation, the rest.** Where the browser has no recogniser (Firefox) or gives up, a short
  clip sent to the Worker. The language pack of Chrome for computers is offered when the check is
  first asked: a learner who chose the online service before is not offered it again. Stress and
  intonation need more than word recognition.
- **« Imagine », the sound of the place.** Once recorded voices exist (RUNBOOK, C4), the phrase
  plays by itself as the photo appears, over a soft sound of the place (a café, a tram bell);
  silent in quiet mode.
- More languages: Brazilian Portuguese (its own pronunciation and words), Greek, German; one
  flag per country (theme colours and Bernard's shell).
- Latin America for Spanish, after Brazil, country by country: a pack of each country's words and
  « Prices by ear » in its currency, where a coffee can cost thousands (docs/MARKET.md).
- **French as a language to learn.** Everything is written for French speakers (the interface,
  the French-reader pronunciation, the notes), so teaching French needs an interface in another
  language, English first, and content written for its speakers: a project of its own.
- Turnstile on the translation service if abuse ever shows up in the Worker logs.
- **AVIF photos.** 13 to 16 % lighter than the WebP files at the same similarity, measured from
  the WebP files themselves; rendered from the originals by `brand/photos.py` on the Mac, the
  gain may be larger. Or Cloudflare Images once photos multiply (docs/UX.md, « The welcome page »).

## Watch

- **The build tools' advisories.** glob ([GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4))
  and minimatch ([GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)) under
  workbox-build, build time only, on our own files; none in what the app or the Worker runs.
  npm's only fix downgrades vite-plugin-pwa to 1.1.0. Update once workbox-build takes glob
  14.0.2 and minimatch 11.0.1 or later.
- **Anthropic.** Monthly credit use in the Console; prices in `worker/src/claude.ts` (they feed
  the budget); API version 2026-10-21; Claude Sonnet 5.5 retires no sooner than September 2027.
- **Cloudflare.** Workers AI catalogue (DeepSeek V4.1 Flash and Gemma 4 ids can change), Neuron
  prices and the daily free allocation; Workers static assets limits.
- **GitHub Actions.** New action majors; minutes once the repository is private.
- **Dependencies.** Monthly `npm outdated` here and in `worker/`, then `npm run check`.
- **Content Security Policy.** Unsplash photos (C3) or recorded voices served from elsewhere join
  `build/csp.ts` when they arrive.
- **First screen speed.** 1.6 s measured with a slow phone's network and processor in Chrome
  (docs/SEARCH.md, « Measured »), before the welcome page was written into the HTML at build time
  (docs/UX.md, « The welcome page »). Once real visitors come, Search Console's Core Web Vitals.
- **Search.** Google's documentation changelog for structured data and AI features
  (docs/SEARCH.md); the IndexNow step's answer in the deploy log (200 or 202; a warning otherwise).
- **Flaky end-to-end tests.** None known; note any here with its cause until it is fixed.

## Later

- **Infrastructure as code.** `worker/wrangler.jsonc` describes the Worker, its assets, KV and
  rate limit, and CI deploys it. Consider Pulumi when DNS, a custom domain and several
  environments arrive.
- Lighthouse in CI with budgets (performance, accessibility, best practices).
- **Bernard's next shell.** Each level could give him a new shell from the trip's country, a
  reward inside the story rather than a prize (docs/BUSINESS.md, « Rewards beyond the app »).
- **An eSIM offer before departure.** A partner's offer when the trip is near, through an
  affiliate link: your decision, after a privacy check of the link.
