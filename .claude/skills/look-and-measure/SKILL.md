---
name: look-and-measure
description: Screenshots of Bagage at 390 px, 320 px and desktop, contact sheets, frames of the moving drawings, and the measures behind design choices (visual weight, contrast, icon distinctness, porthole speed and seams). Use before committing a visual change, or to prove one design over another.
---

# Look and measure

AGENTS.md asks that every visual change is looked at on a phone (390 and 320 px) and a desktop,
and that design choices are measured, with the numbers kept in docs/. These are the recipes used
so far. The scripts sit next to this file; run them from the repository root.

## Screenshots of any screen

1. Copy `look.spec.ts` to `tests/e2e/zz-look.spec.ts`. Git ignores `tests/e2e/zz-*`, but delete
   it when done: `npm run check` would run it too.
2. Edit the `shots` test. `toHome(page)` onboards a traveller (Andalousie, Adrien, the morning
   moment) and leaves the first lesson; navigate from there and call `shoot(page, name)`, which
   saves `tests/shots/<name>-<width>.png` at 390, 320 and 1280 px (that folder is ignored too).
3. Run `npx playwright test zz-look -g shots --project=iphone`. It builds the app and serves it
   on port 4174, so it cannot run while `npm run check` does.
4. Tile them and read the sheet:
   `python3 .claude/skills/look-and-measure/sheet.py tests/shots/home-*.png -o tests/shots/sheet.png`.

Good to know:

- `page.emulateMedia({ reducedMotion: 'reduce' })` keeps the drawings still;
  `page.clock.install({ time: new Date('2026-11-20T09:07:00') })` fixes the hour, which picks the
  practice moment on home.
- Sheets are modal `<dialog>`s in the top layer: anything injected over them must itself be a
  `<dialog>` opened with `showModal()` (the `strips` test does this).
- Visually hidden radios need `check({ force: true })`.

## Moving drawings

- **Frames at given times** (`frames` test): pause every animation of the element and set its
  time, `a.pause(); a.currentTime = ms`, then take the screenshot. That is how the porthole's
  direction and speed were checked.
- **Seams of the porthole loop**: the `strips` test unrolls each destination's scene (sky and
  ground widened, the three copies visible) into `tests/shots/strip-*.png`. Run it with
  `--project=desktop`: the iPhone project shoots at 3 pixels per CSS pixel, and the crop around
  x = 360 (pixel 800) assumes 1. Then
  `sheet.py tests/shots/strip-*.png -o tests/shots/seams.png --crop 680 120 920 680 --width 120 --cols 8`
  and look for steps at the middle of each tile. `measure.py seams` finds the usual culprits in the code:
  lines whose height at x = 360 differs from x = 0, and shapes above the horizon that touch one
  edge only. It also lists what is fine on a look: a building's wall at the edge, a piece drawn in
  its own coordinates inside a `translate`, a far hill hidden behind a nearer one.
- **Porthole speed**: the window shows 228 of a scene's 360 units at every width (measured from
  the boxes of `.porthole-view` and `.porthole .scenery`, scale = max(width / 360, height / 340));
  the speeds and their reasons are in docs/BRAND.md, « Motion ».

## Measures

- **Visual weight** of a block: `python3 .claude/skills/look-and-measure/measure.py ink a.png b.png`
  sums how much darker each pixel is than the background (dark-pixel equivalents); crop both
  shots to the same block first. Used for home's top (docs/UX.md).
- **Contrast**: `measure.py contrast '#4b5675' '#fffaf3'` prints the WCAG ratio.
- **Icon sets**: write each icon as a 24 px SVG, render them with
  `node .claude/skills/look-and-measure/render.mjs icons/*.svg` (96 px PNGs next to them), then
  `measure.py similar a.png b.png …`: the mean and the closest pair of their similarity at 12 × 12
  pixels; lower is easier to tell apart (docs/BRAND.md, « Icons »).

## In a cloud session

- The network reaches npm, PyPI and GitHub only. Wikimedia Commons is out of reach, so
  `brand/photos.py` runs on the Mac; research goes through the web search and fetch tools.
- A headless Chromium is needed for `render.mjs`: Playwright's own (`npx playwright install
  chromium`) or the one in `CHROME_PATH`.
- `npm run check` takes about 14 minutes: run it in the background and only edit docs meanwhile.
  CI: `gh run list --limit 3`.
- To split unrelated changes into commits, `git stash push -- <paths>`; never `git checkout` a
  file that holds changes you want to keep.
