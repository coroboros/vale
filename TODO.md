# To do

The backlog and the watch list. What to do next, in order, is in RUNBOOK.md.

## Before launch

- **Native speakers or teachers check every course.** Each phrase, its French-reader
  pronunciation, its note, the scenes, sounds, tips and survival card, in all four languages. The
  Portuguese and English courses were written on 18 November 2026 and nobody has reviewed them
  yet; Spanish and Italian have not had a native review either. The American and Irish packs
  and the Italian, Portuguese and English hotel and shopping lessons (19 November) are newer
  still.

## Test for real

- Both iPhones: install on the home screen, offline after one visit, the update toast, the
  Spanish, Italian, Portuguese (Portugal) and English (UK) voices (*Réglages → Accessibilité →
  Contenu énoncé*), voice recording, Bernard
  speaking when tapped, the date fields of onboarding and *Moi* (they overflowed on iOS before
  the fix; the automated check runs in Chromium only), the American and Irish voices (en-US,
  en-IE) in their packs.
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
  until Tab reaches it (fixed on 19 Nov 2026, tested in Chromium only).
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

What Duolingo and the others ship that Bagage lacks: docs/MARKET.md.

- **AI voices for every phrase.** Fish Audio, a female or a male voice chosen in *Moi*, generated
  once in CI and cached for offline use, the phone's voices as the fallback: docs/VOICE.md.
- **Live conversation partner.** Talk with Bernard by voice in the course's situations, audio only
  and light on data (Opus over WebRTC, a data-saver mode, megabytes shown): docs/VOICE.md.
- **Pronunciation, the rest.** Where the browser has no recogniser (Firefox) or gives up, a short
  clip sent to the Worker. The language pack of Chrome for computers is offered when the check is
  first asked: a learner who chose the online service before is not offered it again. Stress and
  intonation need more than word recognition.
- **Photos that make you want to go.** One sunny, iconic photo per destination and per practice
  moment (morning coffee, commute, lunch, evening golden hour), from Unsplash: RUNBOOK.md, step C3.
- **« Imagine », the sound of the place.** Once recorded voices exist, the phrase plays by itself as
  the photo appears, over a soft sound of the place (a café, a tram bell); silent in quiet mode.
- **Understand what you hear and read.** Translation the other way (any course language into
  French), from typed text first, then from a photo of a menu or a sign.
- **Answer accuracy per exercise kind**, as anonymous as the counts (RUNBOOK.md, C), to check the
  hypotheses in docs/LEARNING.md.
- **Business model.** Accounts, the « Pass voyage », a subscription, quotas: docs/BUSINESS.md.
- More languages: Brazilian Portuguese (its own pronunciation and words), Greek, German; one
  flag per country (theme colours and Bernard's shell).
- Latin America for Spanish, after Brazil, country by country: a pack of each country's words and
  « Prices by ear » in its currency, where a coffee can cost thousands (docs/MARKET.md).
- **French as a language to learn.** Everything is written for French speakers (the interface,
  the French-reader pronunciation, the notes), so teaching French needs an interface in another
  language, English first, and content written for its speakers: a project of its own.
- **Cloud backup and sync, paid.** Encrypted on the phone, kept on Cloudflare R2, sold alone or
  inside the pass and the subscription; it costs us almost nothing (docs/BUSINESS.md, costs
  checked 18 November 2026). Profiles shared across phones come with it.
- **Trips, next.** No return date before the pass, which asks for one when bought (RUNBOOK.md,
  E2): studied and measured in docs/UX.md, « The return date ».
- Turnstile on the translation service if abuse ever shows up in the Worker logs.

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
- **GitHub Actions.** `ubuntu-latest` moves to Ubuntu 26 (warning in the CI logs); action majors
  (checkout and setup-node v7, upload-artifact v7); minutes once the repository is private.
- **Dependencies.** Monthly `npm outdated` here and in `worker/`, then `npm run check`.
- **Content Security Policy.** Unsplash photos (C3) or recorded voices served from elsewhere join
  `build/csp.ts` when they arrive.
- **First screen speed.** 1.6 s measured with a slow phone's network and processor in Chrome
  (docs/SEARCH.md, « Measured »). Once real visitors come, Search Console's Core Web Vitals: past
  2.5 s, load a course only when a trip needs it (the main script, 108 KB compressed, carries all
  four), or write the welcome into the page at build time.
- **Search.** Google's documentation changelog for structured data and AI features
  (docs/SEARCH.md); the IndexNow step's answer in the deploy log (200 or 202; a warning otherwise).
- **Flaky end-to-end tests.** Two only failed on GitHub's runners (the first key of the keyboard
  flow, an accessibility check during an entrance animation). Both are fixed; note any new one
  here with its cause.

- **Bernard's next shell.** Each level could give him a new shell from the trip's country, a
  reward inside the story rather than a prize (docs/BUSINESS.md, « Rewards beyond the app »).
- **An eSIM offer before departure.** A partner's offer when the trip is near, through an
  affiliate link: your decision, after a privacy check of the link.

## Later

- **Infrastructure as code.** `worker/wrangler.jsonc` describes the Worker, its assets, KV and
  rate limit, and CI deploys it. Consider Pulumi when DNS, a custom domain and several
  environments arrive.
- Lighthouse in CI with budgets (performance, accessibility, best practices).
