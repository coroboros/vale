# Bagage

**Parle dès l’atterrissage.** Survival phrases for French-speaking travellers, in Spanish, Italian,
Portuguese and English. Bagage is an installable web app (PWA): it works fully offline, needs no
account and shows no ads.

Preview: <https://coroboros.github.io/vale/> (GitHub Pages, without translation). Once Cloudflare is
connected, the app and its translation service are served by one Worker; see RUNBOOK.md.

## What it does

- **A flight to begin.** The welcome screen is a cabin window flying to Barcelona, Rome, Lisbon,
  London, Andalusia and Venice. The view follows your finger or your mouse, a tap flies on, and
  Bernard says hello in the local language. Every destination has its own drawing, from the Puerta
  de Alcalá to the Brooklyn Bridge.
- **Trips, not a course.** You pick a destination and a departure date. Plan as many trips as you
  like, two in a row or several languages at once, even two in the same language: the home screen
  follows the one you are preparing, and offers the next one once a trip has begun. The welcome
  window comes back in « Mes voyages », flying to the trip you pick. Onboarding, and every trip you
  add, ends on « Imagine »: a photo of your destination in plain view, where you hear yourself say
  your first words in a scene that matches the moment you chose to practise (the café for the
  morning coffee, the hotel desk, booked in your name, for the evening), then your plan. At that
  moment of the day, the home screen reminds you. It also shows how much of what you learned you
  will still remember on landing day, from your own memory model.
- **Spaced retrieval that adapts.** Every phrase has its own forgetting curve (FSRS-7). Exercises
  move from recognising to producing as memory strengthens, aiming at about 85 % success.
- **Real situations.** Café, restaurant, transport, hotel, shopping, pharmacy and emergencies in
  every language, plus role-play scenes, prices said aloud, a sounds lesson and regional packs in
  their own voice: Catalan, Basque and Galician in Spain, American words in New York, California
  and Florida, Irish ones in Dublin.
- **Translate anything, keep it offline.** Type what you want to say; an AI model translates it the
  way a local would say it, with pronunciation written for French readers. Every translation stays
  in a searchable history on the phone and can join your reviews. Lexicons and translation stay at
  hand in every language you travel with or have learnt.
- **Say it, see what was understood.** In speaking exercises, the browser's speech recognition
  marks the words it heard and the ones it missed. The browser runs it on the phone when it can,
  otherwise online, so you are asked once first; Chrome on a computer can download the language
  once to keep your voice on the device, and Bagage offers it then. Without recognition, you record
  yourself and compare.
- **Pages per situation**, readable without the app: « Comment commander un café en espagnol ? »
  and five more questions in each language, with the phrases, how to say them, the tips for that
  moment and the scene that uses them. « Apprendre ces phrases » opens that lesson in the app,
  where a newcomer starts at the destination, the language already chosen, and a traveller with no
  trip in that language adds one first. A page per language gathers its six situations and opens
  its course.
- **A survival card** (« Survie » in the tab bar) to show in a restaurant: allergies and diet, in the local language, and each
  trip's hotel and address. It also goes out as a picture, to send to whoever travels with you.
- **Light game layer.** Daily goal, streak with jokers (it can be switched off), three daily challenges, passport stamps, and
  Bernard, a hermit crab whose shell wears the country's flag and who sends a postcard from the trip
  as each leg advances. The answers of onboarding already count towards the first goal, and its
  last few points are counted in phrases. Travellers sharing a phone play as a team: a weekly goal
  together, and who brought what. Mistakes never block a lesson.
- **Shared phone friendly.** Several profiles on one device, backup export and import.

Why each choice, with its sources: how it teaches, [docs/LEARNING.md](docs/LEARNING.md); the way
to the first lesson, [docs/UX.md](docs/UX.md); name and identity, [docs/BRAND.md](docs/BRAND.md);
voices, [docs/VOICE.md](docs/VOICE.md); search, [docs/SEARCH.md](docs/SEARCH.md); what others
ship, [docs/MARKET.md](docs/MARKET.md); business model, [docs/BUSINESS.md](docs/BUSINESS.md). What
to do next, in order: [RUNBOOK.md](RUNBOOK.md); backlog: [TODO.md](TODO.md); rules for coding
agents: [AGENTS.md](AGENTS.md).

## Install

- **iPhone (Safari):** Share → *Sur l’écran d’accueil*.
- **Android, desktop Chrome or Edge:** the *Installer l’app* button in the app.

## Develop

Node 22 or later.

```sh
npm install
npm run dev          # http://localhost:5173
npm run check        # typecheck, lint, unit tests, build, end-to-end tests
```

| Script              | What it does                                                           |
| ------------------- | ---------------------------------------------------------------------- |
| `npm run typecheck` | TypeScript, strict, for the app and for the Node-side config           |
| `npm run lint`      | Biome (format and lint, accessibility rules included)                  |
| `npm test`          | Vitest: memory model, sessions, content integrity, contrast, Worker    |
| `npm run build`     | Production build in `dist/`, service worker with precache              |
| `npm run test:e2e`  | Playwright on an iPhone-sized and a desktop viewport (axe, offline…)   |

The end-to-end tests use Playwright’s Chromium, or an installed Chrome with
`CHROME_PATH=/usr/bin/google-chrome`.

## How it is built

Vite, TypeScript, Preact with signals, Workbox for the service worker, ts-fsrs for the memory model.
No backend for the app itself: progress lives on the device (`localStorage`, persistent storage
requested).

```
src/
  content/      courses (one file of data and one of rules per language), situation pages, types
  engine/       memory model, exercise choice, sessions, progress, prices
  state/        schema, migrations from earlier versions, store
  platform/     speech, recording, sound effects, install, backups, service worker client
  ui/           screens, components, themes per language
  translate.ts  phrase search and the translation client
  translation-api.ts  contract shared with the Worker
  counts.ts     anonymous counts, sent once the build names a service
  counts-api.ts contract shared with the Worker
  sw.ts         service worker: precache, offline navigation
  page.tsx      the script of the pages for search engines: the destination's drawing, the voices
build/          build steps: French spacing, the pages for search engines and their sitemap,
                telling IndexNow what a deploy changed
worker/         Cloudflare Worker: serves the app, translates (/translate), counts (/count)
tests/          unit/ (Vitest) and e2e/ (Playwright)
```

## Translation service

`worker/` is a Cloudflare Worker: it serves the built app as static files and answers
`/translate` on the same origin. Claude Sonnet 5.5 translates first when a key is set, paid by the
monthly API credits of a Claude Max plan; open models on Workers AI take over beyond the monthly
budget or if Claude fails (DeepSeek V4.1 Flash, then Gemma 4, without a reasoning pass). Every
model gets the course's phonetic conventions and a JSON schema; answers are checked, then cached
in Workers KV, so a sentence is paid for once. Only the app's origins may call it, 20 times a
minute per IP.

**No overspending, three ceilings.** The Max credits stop at zero on Anthropic's side as long as
the linked Console organisation has no purchased credits and no auto-reload. The Worker keeps its
own, lower monthly ceiling for Claude (`CLAUDE_BUDGET_USD`, 10 USD by default, counted in KV from
each response's token usage), then switches to Workers AI. Workers AI draws on the Workers plan's
daily free Neurons first.

**Deploy with CI (recommended).** Add three repository secrets on GitHub, *Settings → Secrets and
variables → Actions*:

| Secret | Where to get it |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare dashboard, *My Profile → API Tokens*, template *Edit Cloudflare Workers* |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare dashboard, *Workers & Pages*, right-hand column |
| `ANTHROPIC_API_KEY` | Console of the organisation linked to the Max credits (*API keys*) |

The next push to `main` builds the app and deploys the Worker with it (creating its KV namespace),
and stores the Anthropic key as a Worker secret. Without the Cloudflare secrets the app goes to
GitHub Pages and offers DeepL and a field to keep your own translation.

**Or deploy by hand:** `VITE_TRANSLATE_URL=. npm run build` at the root, then in `worker/`:
`npm install`, `npx wrangler login`, `npx wrangler deploy`,
`npx wrangler secret put ANTHROPIC_API_KEY`.

**Choosing the Workers AI models.** `npm run eval` (in `worker/`, with `CLOUDFLARE_ACCOUNT_ID` and
an API token allowed to use Workers AI) runs each candidate model on twelve travel sentences per
language, has a stronger model grade the answers, and prints the `MODELS` setting it suggests for
each language. Put it in the `vars` of `worker/wrangler.jsonc`.

Cost, estimated and not measured: with Sonnet 5.5 about 0.3 US cents per new sentence, so a few
thousand sentences a month stay well within the default ceiling; with DeepSeek V4.1 Flash about
40 Neurons, so about 240 new sentences a day within the free allocation. Repeated sentences come
from the cache. Sentences go to Anthropic or Cloudflare through the Worker; apart from the anonymous
counts below, nothing else about the learner leaves the phone.

**Anonymous counts.** `/count` adds what the app reports (each onboarding screen a phone reaches
and its first lesson begun and finished, a new traveller, a return on day 1 or day 7, an install on
the home screen, a shared card, the sessions before a first departure as a range, each with the
link that brought the traveller; and, summed for a phone's travellers, the answers per exercise
kind, how many were right and how many the session expected right) to totals per day in D1, for
the decision figures (RUNBOOK.md), where newcomers stop (docs/UX.md), the links that bring
travellers and whether exercises hit their 85 % aim (docs/LEARNING.md). No identifier and nothing
about phrases or sentences; a traveller can switch them off from the first screen or in *Moi*. They stay off
until RUNBOOK C1 (`VITE_COUNTS_URL` and the `d1_databases` binding); `npm run figures` in `worker/`
reads them.

## Deploy the app

The *CI* workflow (`.github/workflows/ci.yml`) checks every push. On `main` it deploys the app
and its translation service to Cloudflare once connected, and to GitHub Pages until then.
