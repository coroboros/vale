# AGENTS.md

Bagage is a web app (PWA) that teaches French speakers the phrases they need for a trip to Spain,
Italy, Portugal or an English-speaking country, plus the Cloudflare Worker in `worker/` that serves
the app and translates sentences.

What to do next, in order: RUNBOOK.md. Backlog and watch list: TODO.md. Why things are the way
they are: docs/ (learning evidence, brand, business, market, voice, search, user experience). How
to look at and measure the app (screenshots, contact sheets, frames of the moving drawings, design
measures): the skill in `.claude/skills/look-and-measure/`, which Claude Code loads when needed.
`CLAUDE.md` only imports this file, so Claude Code reads the same rules.

## Rules

The one place for them: read this section before writing code for any step.

### Working with the owner

- Talk to the owner in French. Code, comments, commit messages and docs in English; app text in
  French.

### Code

- One source of truth. Each fact, rule or piece of data lives in one module and everything else
  imports it: lessons and phrases in `src/content/`, the practice moments in `content/cues.ts`,
  colours in `tokens.css` and `themes.ts`, photos in `photos.json`, goals in `schema.ts`, French
  dates, lists and articles in `ui/french.ts`. No duplicated logic, no
  copied data, no dead code; knip finds unused code, not unused data fields, so check those by
  hand. Prefer deleting to adding.
- Reuse before writing. Look in `src/ui/kit.tsx` and the screens first; extend a shared component
  with an optional prop or a slot rather than writing a near copy. A helper needed twice moves to
  the module that owns its subject.
- Comments only for a crucial why the code cannot say: evidence, a constraint, a workaround.
  Never what the code does; a clearer name beats a comment.
- TypeScript strict, Preact with signals, plain CSS in cascade layers (tokens, base, kit,
  screens). No CSS framework.
- Files: components in PascalCase, modules in lower case (kebab-case for several words). Never two
  names that differ only by case: macOS file systems ignore case, so the import would pick the
  wrong one.
- Stored data: `sanitize` repairs every stored value on load, so a new field gets its default
  there, with a test; a migration in `migrate.ts` only when repair cannot do it. Item ids key the
  learner's progress: never rename them.
- `src/content/`, `src/translation-api.ts` and `src/counts-api.ts` stay free of browser APIs: the
  Worker imports them.

### Interface

- Accessibility is part of done: WCAG 2.2 AA contrast, tap targets of 44 px or more, keyboard
  use with visible focus, focus moved to the new content when a view changes, reduced motion, no
  sideways scrolling on phones, foreign text marked with its `lang`.
- One motion system: raised controls lift on hover and sink on press, flat controls tint and
  shrink; hover effects only under `@media (hover: hover)`; durations from the tokens. No one-off
  animation.
- Colours from the tokens and the trip's theme; red only for wrong answers.
- App text: plain French, sentence case, « tu » for one traveller and « vous » for a group, the
  same name for an action through a whole flow, French typography (« », ’). Type plain spaces
  before : ; ? ! % and inside « »: the build makes them non-breaking (`build/french-spaces.ts`),
  and in the courses keeps a number with its unit (« 21 h 30 »). Tests that compare built text
  write those spaces as `\u00a0`.

### Evidence and safety

- Evidence before claims: cite sources for learning and product claims (docs/LEARNING.md),
  measure before saying something works (tests, Lighthouse, `npm run eval`), and say what is not
  measured. Measure with a tool's current version (`npx lighthouse@latest`): an older Lighthouse
  once called a valid `robots.txt` line an error. Take the median of three runs on an idle
  machine: one run beside the tests once read 420 ms of blocking time for a true 92.
- Research in depth before deciding, never from a skim: read each source itself, in full where it
  is open (say so when only the abstract is), look for the studies that disagree, and weigh them
  with what the leading practitioners publish: learning science, cognitive psychology, game design,
  marketing and brand, product strategy. docs/ records each source, how strong it is for Bagage,
  and what is our inference. To choose between designs, measure them (screenshots, tests) and keep
  the numbers in docs/.
- Never commit secrets: they live in GitHub Actions secrets and in Cloudflare. The repository is
  public: no personal or company details in it, and commits never carry the owner's personal
  address.
- Ask before adding a production dependency.

### Done means

Before coding: read the step and these rules, search for what already exists (the subject, the
kit, the screens), and plan the smallest change. Then:

1. A behaviour change comes with a test: unit for logic, end to end for what a traveller does.
   New screens and sheets join the layout audit (long names, 320 px to desktop) and the
   accessibility check.
2. `npm run check` passes.
3. Looked at on a phone (390 and 320 px wide) and a desktop, from screenshots (the
   look-and-measure skill).
4. The docs move in the same commit: README for what travellers get, the map below, RUNBOOK.md
   (a step done leaves it), TODO.md, docs/ for evidence.
5. Commit (a short imperative summary, then a bulleted body) as `Claude <noreply@anthropic.com>`
   (`git -c user.name=Claude -c user.email=noreply@anthropic.com commit`), never with the
   machine's own git identity; push, CI green.
6. When an agent gets something wrong about this repository, fix this file in the same change.

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
| `node brand/og.ts` | Draw the picture shared links show (`public/og.png`); needs Chrome (`CHROME_PATH`) |

## Map

- `src/content/`: one data file and one rules file per language; `cues.ts`, the practice moments
  that « Imagine » and home bring back; `story.ts`, Bernard's postcards, four per leg; `pages.ts`,
  the pages for search engines, one per situation and language, one per language.
- `src/engine/`: FSRS memory model, exercise choice, sessions, progress.
- `src/platform/`: what the browser offers: the device's voices (`voices.ts`, free of the app's
  settings) and speaking with them, speech recognition, recording, sounds, install, backup, sharing
  a file.
- `src/state/`: stored data, repaired by `sanitize`. A profile has a list of trips and the one in
  focus (`tripOf`); progress is keyed by language, so trips in one language share it.
- `src/ui/`: screens, components (`kit.tsx`), `icons.tsx` (Bernard's beach drawn on Lucide's grid), `Mascot.tsx` (Bernard; the app gives him the screen's
  flag through `ScreenFlag`, so the pages can show him without the app's data), `MotionToggle.tsx`
  (the pause of every moving drawing), `Imagine.tsx` (closes onboarding and lands every new
  trip, `screens/Landing.tsx`), `Team.tsx` (travellers sharing a phone), `FromBernard.tsx` (his
  latest postcard), `card-image.ts` (the survival card as a picture to send), `Porthole.tsx` (the
  welcome flight and the trip being chosen), `scenery/` (a drawing per destination, one module per
  country, shared pieces and the sky's travellers in `parts.tsx`; a flying porthole loops each
  layer, so continuous lines end at x = 360 where they start; `pictureOf` in `content/` picks a trip's drawing and photo,
  « Ailleurs » its country's emblem), `themes.ts` (colours per country, from the trip's `flagOf`,
  contrast checked by a test), `photos.json` (one photo per destination with its credit, written by
  `brand/photos.py`; files in `public/photos/`).
- `src/translation-api.ts`: the request and answer shared with the Worker.
- `src/counts-api.ts`: the anonymous counts behind the decision figures, a newcomer's first
  steps (`FIRST_STEPS`, which also orders onboarding's screens) and the answers per exercise kind
  (`Tally`, against the 85 % aim), shared with the Worker;
  `src/engine/counts.ts` works out what is due, `src/counts.ts` sends it, `ui/CountsChoice.tsx`
  is their switch, on the first screen and in « Moi ».
- `build/french-spaces.ts`: the build step that keeps French punctuation on its word's line.
- `build/csp.ts`: the Content Security Policy of the app and its pages, as a `<meta>` tag; a new
  service or image host goes there, or the end-to-end tests fail.
- `build/pages.ts`: writes the pages for search engines next to the app (situations, languages),
  `sitemap.xml`, `robots.txt` with the owner's content signals, `llms.txt`, the IndexNow key file,
  and the app's canonical and sharing tags;
  the pages' script and styles are the build's `page` entry, `src/page.tsx` and `styles/page.css`.
  `build/indexnow.ts`: the deploy job's step that tells IndexNow which pages changed (docs/SEARCH.md).
- `worker/src/`: `index.ts` (routing, cache, rate limit, Claude budget, the counts' daily totals),
  `claude.ts`, `workers-ai.ts`, `prompt.ts`; `worker/figures.sql` reads the decision figures.
- `tests/unit/` (Vitest) and `tests/e2e/` (Playwright on iPhone and desktop viewports).
- `.claude/skills/look-and-measure/`: recipes and scripts for screenshots, contact sheets and the
  design measures; its temporary specs (`tests/e2e/zz-*`) and shots (`tests/shots/`) stay out of git.
