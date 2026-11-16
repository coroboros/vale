# To do

Working notes for the next sessions: what is in flight, what still needs a real test, what can be
better, what to keep an eye on.

## In flight

- **Translation service: built, not deployed.** Unit tests and a run in the local Workers runtime
  (stub API) pass. It waits for the repository secrets (README, *Translation service*). Once
  live: one real translation per language, a cache hit, a 429 after 20 calls a minute, and the
  Claude spend counted in KV against the Console usage page.
- **Model choice per language.** Run `npm run eval` in `worker/` once deployed, then set `MODELS`.
- **Repository rename and move to Cloudflare hosting.** Same day, so the phones migrate once
  (see *Housekeeping*).

## Test for real

- Both iPhones: the update toast from 4.0, progress kept since v3, install on the home screen,
  offline after one visit, Spanish and Italian voices (*Réglages → Accessibilité → Contenu
  énoncé*), voice recording, Bernard speaking when tapped.
- The welcome flight on an older iPhone (smoothness, battery), with *Réduire les animations* on,
  and in Safari with its toolbars (short screen).
- Translation quality: the eval grades, then a native speaker on twenty phrases per language,
  and the French-reader pronunciation of Italian stress (often unpredictable from spelling).
- Lighthouse on a real phone. Local runs: performance 96, accessibility 100, best practices 100.

## Improve

- Show the learner's own destination in the home card, with the welcome scenery.
- Draw the other destinations (Madrid, Valencia, Florence, Naples, Milan, Sicily); the rest use
  the generic coast for now.
- **Live conversation partner.** Talk with an AI tutor in real time, by voice, inside the course's
  situations (hotel desk, restaurant, pharmacy). The learner picks an avatar style: realistic,
  cartoon or anime. It should reuse the scenes' goals, correct gently in French, and log the
  phrases it practised into the memory model. Technology to be chosen with the owner.
- **Understand what you hear and read.** Translation the other way (Spanish or Italian into
  French), from typed text first, then from a photo of a menu or a sign.
- **Measure before claiming.** Opt-in, anonymous counts (sessions finished, day-1 and day-7 return,
  answer accuracy per exercise kind) to check the engagement and difficulty hypotheses in
  docs/LEARNING.md. Nothing personal, nothing about the sentences translated.
- **Reminders.** Web Push at the practice moment the learner chose (iOS 16.4+ for installed apps),
  sent by a Cloudflare Worker with VAPID keys.
- More languages: Portuguese (Portugal and Brazil), Greek, German; one theme and shell pattern
  per country.
- Speech checking for the speaking exercise, on the device if possible (today the learner judges
  their own attempt after hearing the model).
- Sync between devices and profiles shared across phones, without accounts (passphrase,
  Durable Objects).
- Turnstile on the translation service if abuse ever shows up in the Worker logs.

## Watch

- **Anthropic.** Monthly credit use in the Console; prices in `worker/src/claude.ts` (they feed
  the budget); API version 2026-10-21; Claude Sonnet 5.5 retires no sooner than September 2027.
- **Cloudflare.** Workers AI catalogue (DeepSeek V4.1 Flash and Gemma 4 ids can change), Neuron
  prices and the daily free allocation.
- **GitHub Actions.** `ubuntu-latest` moves to Ubuntu 26 (warning in the CI logs); action majors
  (checkout and setup-node v7, upload-artifact v7).
- **Dependencies.** Monthly `npm outdated` here and in `worker/`, then `npm run check`.
- **Flaky end-to-end tests.** Two only failed on GitHub's runners (the first key of the keyboard
  flow, an accessibility check during an entrance animation). Both are fixed; note any new one
  here with its cause.

## Housekeeping

- **Rename the repository and move hosting, together.** The Pages address follows the repository
  name (`/vale/`) and GitHub does not redirect it after a rename. Browsers and installed apps keep
  their data and service worker per address, so a new address starts empty. Plan: serve the app
  from Cloudflare (Workers static assets, next to the translation Worker, ideally on a custom
  domain), rename the repository the same day, then on each phone export a backup from *Moi*,
  install from the new address and import it.
- **Close the code.** GitHub Pages on a private repository needs a paid plan; the Cloudflare move
  above removes that constraint. Stop publishing source maps at the same time.
- **Infrastructure as code.** `worker/wrangler.jsonc` describes the Worker, its KV and its rate
  limit, and CI deploys it. Consider Pulumi only when DNS, a custom domain and several
  environments arrive.
- Lighthouse in CI with budgets (performance, accessibility, best practices).
