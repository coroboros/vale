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
  the fix; the automated check runs in Chromium only), a lesson's sheet opening without a ring on
  its close button, the American and Irish voices (en-US, en-IE) in their packs.
- The welcome flight on an older iPhone (smoothness, battery), with *Réduire les animations* on,
  and in Safari with its toolbars (short screen).
- Translation: one sentence per language once deployed, a cache hit, a 429 after 20 calls a
  minute, the Claude spend counted in KV against the Console usage page.
- Translation quality: the eval grades, then a native speaker on twenty phrases per language,
  and the French-reader pronunciation of Italian stress (often unpredictable from spelling).
- Lighthouse on a real phone. Local runs: performance 96, accessibility 100, best practices 100.
- Quiet mode on the iPhone, with the ring switch on silent too; the new icon in Safari's tab
  overview and on the home screen.
- Bernard's eyes following a finger on the iPhone, and his blinking.
- The « Imagine » photo on an older iPhone: the slow zoom under the frosted card (smoothness), and
  how fast the photo appears on a slow connection (it loads one step ahead, about 250 KB).
- « Garde ta progression » on the iPhone: shown in Safari once a lesson is done, gone in the
  installed app.
- Bernard everywhere on the iPhone: his eyes following a finger and blinking in lessons, on the
  home card and in « Imagine », without slowing the screen; the flag on his shell at small sizes.
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
  clip sent to the Worker. On Chrome for computers, offer the on-device language pack
  (`SpeechRecognition.install()`) instead of the online service. Stress and intonation need more
  than word recognition.
- **Photos that make you want to go.** One sunny, iconic photo per destination and per practice
  moment (morning coffee, commute, lunch, evening golden hour), from Unsplash: RUNBOOK.md, step C3.
- **« Imagine », the sound of the place.** Once recorded voices exist, the phrase plays by itself as
  the photo appears, over a soft sound of the place (a café, a tram bell); silent in quiet mode.
- **A game worth coming back to, from the evidence** (docs/LEARNING.md, game layer). Game fiction:
  Bernard's trip as a story that advances with each lesson. Travellers on one phone as a team:
  a shared weekly goal (collaboration) with a friendly ranking (competition). Endowed progress:
  count onboarding towards the first daily goal (Nunes & Drèze, 2006). Goal gradient: « plus que
  deux phrases » near the goal, where effort speeds up (Kivetz, Urminsky & Zheng, 2006). Rewards
  stay informative, never paid per task (Deci, Koestner & Ryan, 1999).
- **Understand what you hear and read.** Translation the other way (any course language into
  French), from typed text first, then from a photo of a menu or a sign.
- **Measure before claiming.** Anonymous counts, nothing personal, nothing about the sentences
  translated: the decision figures are in RUNBOOK.md (A2); answer accuracy per exercise kind
  then checks the hypotheses in docs/LEARNING.md.
- **Reminders.** Web Push at the practice moment the learner chose (iOS 16.4+ for installed apps),
  sent by the Worker with VAPID keys.
- **Business model.** Accounts, the « Pass voyage », a subscription, quotas: docs/BUSINESS.md.
- More languages: Brazilian Portuguese (its own pronunciation and words), Greek, German; one
  flag per country (theme colours and Bernard's shell).
- **French as a language to learn.** Everything is written for French speakers (the interface,
  the French-reader pronunciation, the notes), so teaching French needs an interface in another
  language, English first, and content written for its speakers: a project of its own.
- **Cloud backup and sync, paid.** Encrypted on the phone, kept on Cloudflare R2, sold alone or
  inside the pass and the subscription; it costs us almost nothing (docs/BUSINESS.md, costs
  checked 18 November 2026). Profiles shared across phones come with it.
- **Trips, next.** A return date (the pass needs one: docs/BUSINESS.md), so home moves to the next
  trip on its own and a trip's stamps carry its dates.
- Turnstile on the translation service if abuse ever shows up in the Worker logs.

## Watch

- **Anthropic.** Monthly credit use in the Console; prices in `worker/src/claude.ts` (they feed
  the budget); API version 2026-10-21; Claude Sonnet 5.5 retires no sooner than September 2027.
- **Cloudflare.** Workers AI catalogue (DeepSeek V4.1 Flash and Gemma 4 ids can change), Neuron
  prices and the daily free allocation; Workers static assets limits.
- **GitHub Actions.** `ubuntu-latest` moves to Ubuntu 26 (warning in the CI logs); action majors
  (checkout and setup-node v7, upload-artifact v7); minutes once the repository is private.
- **Dependencies.** Monthly `npm outdated` here and in `worker/`, then `npm run check`.
- **Flaky end-to-end tests.** Two only failed on GitHub's runners (the first key of the keyboard
  flow, an accessibility check during an entrance animation). Both are fixed; note any new one
  here with its cause.

## Later

- **Infrastructure as code.** `worker/wrangler.jsonc` describes the Worker, its assets, KV and
  rate limit, and CI deploys it. Consider Pulumi when DNS, a custom domain and several
  environments arrive.
- A custom domain for the app (then its address no longer depends on Cloudflare's subdomain).
- Lighthouse in CI with budgets (performance, accessibility, best practices).
