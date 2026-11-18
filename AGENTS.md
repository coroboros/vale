# AGENTS.md

Bagage is a web app (PWA) that teaches French speakers the phrases they need for a trip to Spain,
Italy, Portugal or an English-speaking country, plus the Cloudflare Worker in `worker/` that serves
the app and translates sentences.

What to do next, in order: RUNBOOK.md. Backlog and watch list: TODO.md. Why things are the way
they are: docs/ (learning evidence, brand, business, market, voice).

## Rules

- Talk to the owner in French. Code, comments, commit messages and docs in English; app text in
  French.
- Run `npm run check` before calling work done, and keep CI green. A behaviour change comes with
  a test.
- One source of truth: no duplicated logic or data, no dead code. Prefer deleting to adding.
- Accessibility is part of done: WCAG 2.2 AA contrast, tap targets of 44 px or more, keyboard
  use, reduced motion, no sideways scrolling on phones.
- Evidence before claims: cite sources for learning and product claims, measure before saying
  something works (tests, Lighthouse, `npm run eval`), and say what is not measured.
- Never commit secrets: they live in GitHub Actions secrets and in Cloudflare.
- Ask before adding a production dependency.

## Commands

| Command | What it does |
| --- | --- |
| `npm ci && (cd worker && npm ci)` | Install |
| `npm run dev` | App on http://localhost:5173 |
| `npm run check` | Typecheck, lint (Biome, knip for dead code), unit tests (Vitest), build, end-to-end tests (Playwright) |
| `npm run format` | Format and fix lint findings |
| `npm run test:e2e` | End-to-end tests only; `CHROME_PATH=/path/to/chrome` uses an installed Chrome |
| `cd worker && npx wrangler dev` | The Worker locally, after `npm run build` at the root |
| `cd worker && npm run eval` | Compare Workers AI models; needs `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` |
| `python3 brand/photos.py fetch render` | Download the destination photos from Wikimedia Commons and render `public/photos/`; needs Pillow and access to Commons |

## Map

- `src/content/`: one data file and one rules file per language. Item ids key the learner's
  progress: never rename them.
- `src/engine/`: FSRS memory model, exercise choice, sessions, progress.
- `src/platform/`: what the browser offers: voices, speech recognition, recording, sounds,
  install, backup.
- `src/state/`: stored data. `sanitize` gives a new field its default on every load; a change it
  cannot repair needs a migration in `migrate.ts`. Either way, with a test. A profile has a list
  of trips and the one in focus (`tripOf`); progress is keyed by language, so trips in one
  language share it.
- `src/ui/`: screens, components, `Porthole.tsx` and `scenery/` (the welcome flight),
  `themes.ts` (colours per country, from the course's `flag`, contrast checked by a test), `photos.json` (one photo per
  destination with its credit, written by `brand/photos.py`; files in `public/photos/`).
- `src/translation-api.ts`: the request and answer shared with the Worker. The Worker also
  imports `src/content/`, so both stay free of browser APIs.
- `worker/src/`: `index.ts` (routing, cache, rate limit, Claude budget), `claude.ts`,
  `workers-ai.ts`, `prompt.ts`.
- `tests/unit/` (Vitest) and `tests/e2e/` (Playwright on iPhone and desktop viewports).

## Conventions

- TypeScript strict, Preact with signals, plain CSS in cascade layers (tokens, base, kit,
  screens). No CSS framework.
- Comments say why (evidence, a constraint, a workaround), never what the code already says;
  prefer a clearer name to a comment.
- Commit messages: a short imperative summary, then a bulleted body.
- When an agent gets something wrong about this repository, fix this file in the same change.
