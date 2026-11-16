# Bagage: notes for Claude

A web app (PWA) that teaches French speakers the phrases they need for a trip to Spain or Italy,
plus a Cloudflare Worker (`worker/`) that serves the app and translates sentences.

Start with **RUNBOOK.md** (what to do next, in order). TODO.md holds the backlog and the watch
list; docs/ the reasons behind learning, brand and business choices.

## Working agreements

- Talk to the owner in French. Code, comments, commit messages and docs in English. App text in
  French.
- One source of truth, no duplication, no dead code. Prefer removing to adding.
- Evidence before claims: cite sources for learning and product claims, and measure (tests,
  Lighthouse, `npm run eval`) before saying something works. Say what is not measured.
- Accessibility is part of done: WCAG 2.2 AA contrast, 44 px tap targets, keyboard, reduced
  motion, no sideways scrolling on phones.
- Secrets live in GitHub Actions secrets and Cloudflare, never in the repository.
- Keep CI green; a change that touches behaviour comes with a test.

## Commands

```sh
npm run dev          # http://localhost:5173
npm run check        # typecheck, lint, unit tests, build, end-to-end tests
CHROME_PATH=/path/to/chrome npm run test:e2e   # to use an installed Chrome
cd worker && npm run eval                      # compare Workers AI models (needs Cloudflare credentials)
```

## Map

- `src/content/`: courses (data and rules per language), shared types.
- `src/engine/`: FSRS memory model, exercise choice, sessions, progress.
- `src/state/`: schema, migrations from earlier versions, store (localStorage).
- `src/ui/`: screens, components, `Porthole.tsx` and `scenery/` (the welcome flight), themes.
- `src/translate.ts` and `src/translation-api.ts`: translation client and the contract shared
  with the Worker.
- `worker/src/`: `index.ts` (HTTP, cache, rate limit, Claude budget), `claude.ts`,
  `workers-ai.ts`, `prompt.ts`; `worker/eval/` for model comparison.
- `tests/unit/` (Vitest) and `tests/e2e/` (Playwright, iPhone and desktop viewports).
