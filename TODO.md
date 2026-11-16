# To do

The backlog and the watch list. What to do next, in order, is in RUNBOOK.md.

## Test for real

- Both iPhones: install on the home screen, offline after one visit, the update toast, Spanish
  and Italian voices (*Réglages → Accessibilité → Contenu énoncé*), voice recording, Bernard
  speaking when tapped, the date fields of onboarding and *Moi* (they overflowed on iOS before
  the fix; the automated check runs in Chromium only).
- The welcome flight on an older iPhone (smoothness, battery), with *Réduire les animations* on,
  and in Safari with its toolbars (short screen).
- Translation: one sentence per language once deployed, a cache hit, a 429 after 20 calls a
  minute, the Claude spend counted in KV against the Console usage page.
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
  answer accuracy per exercise kind) to check the hypotheses in docs/LEARNING.md and to price.
  Nothing personal, nothing about the sentences translated.
- **Reminders.** Web Push at the practice moment the learner chose (iOS 16.4+ for installed apps),
  sent by the Worker with VAPID keys.
- **Business model.** Accounts, the « Pass voyage », a subscription, quotas: docs/BUSINESS.md.
- More languages: Portuguese (Portugal and Brazil), Greek, German; one theme and shell pattern
  per country.
- Speech checking for the speaking exercise, on the device if possible (today the learner judges
  their own attempt after hearing the model).
- Sync between devices and profiles shared across phones (with accounts).
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
- A Content Security Policy in `public/_headers`, tested end to end before shipping.
- Lighthouse in CI with budgets (performance, accessibility, best practices).
