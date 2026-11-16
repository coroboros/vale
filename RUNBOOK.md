# Runbook

What to do next, in order, and how. Tick a step when it is done, with the date. The backlog and
the watch list live in TODO.md; the reasons behind product choices in docs/.

Owner: **you** (needs your accounts or your phone) or **Claude** (code, in a Claude Code session).

## 1. Connect Cloudflare and the Claude credits (you, about 15 minutes)

1. **Claim the Max API credits.** On claude.ai in a browser: *Settings → Billing → API credits →
   Link organization* (create a Console organisation if asked). The plan must be active for at
   least seven days.
2. **Lock them to zero overspending.** In that Console organisation: buy no credits, leave
   auto-reload off. Then create an API key (*API keys*).
3. **Cloudflare token.** Dashboard → *My Profile → API Tokens → Create token*, template *Edit
   Cloudflare Workers*, scoped to your account. Note the **account ID** (*Workers & Pages*, right
   column).
4. **GitHub secrets.** Repository → *Settings → Secrets and variables → Actions → New repository
   secret*: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ANTHROPIC_API_KEY`.
5. **Deploy.** *Actions → CI → Run workflow*. The *deploy* job builds the app and deploys one
   Worker serving the app and its translation API. Its address is in the job log:
   `https://bagage.<your-subdomain>.workers.dev`.
6. **Check.** Open the address, go to *Phrases*, translate « Je voudrais un late checkout ».
   In the Cloudflare dashboard, the Worker's logs show the model used.

## 2. Make the repository private, then rename it (you, 5 minutes)

Only after step 1 works: GitHub Pages stops serving a private repository on the free plan.

1. Repository → *Settings → General → Danger Zone → Change visibility → Private*.
2. Same page, *Repository name*: `bagage` → *Rename*.
3. *Settings → Pages*: unpublish, then delete the `gh-pages` branch.
4. On any clone: `git remote set-url origin https://github.com/coroboros/bagage.git`.

## 3. Tidy up after the move (Claude)

- Remove the GitHub Pages branch of the *deploy* job in `.github/workflows/ci.yml`.
- `BRAND.url` (`src/brand.ts`) and the README link: the Cloudflare address.
- `ALLOWED_ORIGINS` in `worker/wrangler.jsonc`: keep only the local dev servers.
- Delete the `TRANSLATE_URL` variable if it was ever set.

## 4. Pick the Workers AI models with data (you run it, Claude reads it)

The fallback models are chosen from general evidence, not measured on our sentences yet.

```sh
cd worker
npm install
CLOUDFLARE_ACCOUNT_ID=… CLOUDFLARE_API_TOKEN=… npm run eval
```

The token needs the *Workers AI* permission (add it to the deploy token or create one just for
this). Paste the suggested `MODELS` into the `vars` of `worker/wrangler.jsonc`, commit, push.

## 5. Install and test on your iPhones (you, with Claude for fixes)

Safari → the Cloudflare address → *Partager → Sur l'écran d'accueil*. Then go through *Test for
real* in TODO.md and report what fails, with a screenshot.

## 6. Product, before any business (Claude)

In this order, each with its tests:

1. Privacy-friendly measurement of the funnel (sessions, return on day 1 and day 7, translations
   used, where people stop). Nothing about the content of translations. Needed to prove any of
   the claims in docs/LEARNING.md and to price anything.
2. The learner's own destination in the home card; more drawn destinations.
3. Translation the other way (understand a menu or a reply).

## 7. Business model (you decide, Claude builds)

Proposal and open questions: docs/BUSINESS.md. Order of work once decided:

1. Accounts (only when buying or syncing; the app stays usable without one).
2. Payments (Stripe Checkout, the « Pass voyage » and a subscription) and entitlements checked
   by the Worker.
3. Premium content served by the Worker after purchase (what ships in the app bundle is free by
   nature), and per-user quotas on translation and AI conversation.
4. The live conversation partner (TODO.md).

## Working with Claude Code on your Mac

Clone the repository, open the folder in Claude Code (v2.1.277 or later reads AGENTS.md on its
own), and say which step of this runbook to continue. AGENTS.md gives any coding agent, Claude
Code or Codex, the project's rules, commands and map; `npm run check` runs every test.
