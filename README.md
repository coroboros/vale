# Bagage

**Parle dès l’atterrissage.** Survival phrases for French-speaking travellers, in Spanish and Italian
for now. Bagage is an installable web app (PWA): it works fully offline, needs no account and shows no ads.

Live: <https://coroboros.github.io/vale/>

## What it does

- **A flight to begin.** The welcome screen is a cabin window flying to Barcelona, Rome, Seville
  and Venice. The view follows your finger or your mouse, a tap flies on, and Bernard says hello
  in the local language.
- **A trip, not a course.** You pick a destination and a departure date. The home screen shows how
  much of what you learned you will still remember on landing day, from your own memory model.
- **Spaced retrieval that adapts.** Every phrase has its own forgetting curve (FSRS-7). Exercises
  move from recognising to producing as memory strengthens, aiming at about 85 % success.
- **Real situations.** Café, restaurant, hotel, transport, shopping, pharmacy, emergencies, plus
  role-play scenes, prices said aloud, a sounds lesson and regional packs (Catalan in Barcelona).
- **Translate anything, keep it offline.** Type what you want to say; an AI model translates it the
  way a local would say it, with pronunciation written for French readers. Every translation stays in a
  searchable history on the phone and can join your reviews.
- **A survival card** to show in a restaurant: allergies and diet, in the local language.
- **Light game layer.** Daily goal, streak with jokers, three daily challenges, passport stamps, and
  Bernard, a hermit crab whose shell changes with the country. Mistakes never block a lesson.
- **Shared phone friendly.** Several profiles on one device, backup export and import.

Why each of these choices: [docs/LEARNING.md](docs/LEARNING.md). Name and identity:
[docs/BRAND.md](docs/BRAND.md). What comes next: [TODO.md](TODO.md).

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
  content/      courses (one file of data and one of rules per language), shared types
  engine/       memory model, exercise choice, sessions, progress, prices
  state/        schema, migrations from earlier versions, store
  platform/     speech, recording, sound effects, install, backups, service worker client
  ui/           screens, components, themes per language
  translate.ts  phrase search and the translation client
  translation-api.ts  contract shared with the Worker
  sw.ts         service worker: precache, offline navigation
worker/         translation service (Cloudflare Worker)
tests/          unit/ (Vitest) and e2e/ (Playwright)
```

## Translation service

`worker/` is a Cloudflare Worker. Claude Sonnet 5.5 translates first when a key is set, paid by the
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

The next push to `main` deploys the Worker (creating its KV namespace), stores the Anthropic key
as a Worker secret, and builds the app with the Worker's address. Without the Cloudflare secrets
the app offers DeepL and a field to keep your own translation.

**Or deploy by hand:** in `worker/`, `npm install`, `npx wrangler login`, `npx wrangler deploy`,
`npx wrangler secret put ANTHROPIC_API_KEY`, then set the `TRANSLATE_URL` repository variable.

**Choosing the Workers AI models.** `npm run eval` (in `worker/`, with `CLOUDFLARE_ACCOUNT_ID` and
an API token allowed to use Workers AI) runs each candidate model on twelve travel sentences per
language, has a stronger model grade the answers, and prints the `MODELS` setting it suggests for
each language. Put it in the `vars` of `worker/wrangler.jsonc`.

Cost, estimated and not measured: with Sonnet 5.5 about 0.3 US cents per new sentence, so a few
thousand sentences a month stay well within the default ceiling; with DeepSeek V4.1 Flash about
40 Neurons, so about 240 new sentences a day within the free allocation. Repeated sentences come
from the cache. Sentences go to Anthropic or Cloudflare through the Worker; nothing else about the
learner leaves the phone.

## Deploy the app

The *CI* workflow (`.github/workflows/ci.yml`) checks every push; on `main` it deploys the Worker
(once Cloudflare is connected) and publishes the app to the `gh-pages` branch, which GitHub Pages
serves.
