# Search

How people should find Bagage from a search engine or an AI answer: what the sources say, what
was built, what was measured, and what waits for the owner. Each source is graded
for Bagage: **strong** (primary documentation or a large measured study), **medium** (secondary
reports, or a study far from our case), **weak** (opinion). *Inference* marks our own reading.

## Where Bagage stands (19 November 2026)

- The app and its pages live at `https://coroboros.github.io/vale/`, a folder on a shared GitHub
  host, until Bagage has a domain (RUNBOOK B2).
- 29 addresses for search engines: the app, a page per language (4) and a page per situation and
  language (24), all in `sitemap.xml`.
- Not yet: a domain, Search Console, Bing Webmaster Tools (owner, B2 and B4).

## What the sources say

| Finding | Source | Strength |
| --- | --- | --- |
| Google's AI answers (AI Overviews, AI Mode) run on its usual crawling, index and ranking. Optimising for them is SEO: unique, useful, non-commodity content counts most; no `llms.txt`, Markdown copies, special markup or "chunking" is needed. | Google, [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) (May 2026) and [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) | Strong |
| AI Overviews reach over 2.5 billion people a month and AI Mode over 1 billion. Search Console reports how pages appear in these features and has a switch to leave them. | Google, [New opportunities, control and insights for website owners](https://blog.google/products-and-platforms/products/search/new-opportunities-control-and-insights-for-website-owners/) (2026) | Strong |
| With an AI summary on the page, people clicked a result in 8 % of visits, against 15 % without; links inside the summary got 1 %. Questions and longer searches bring summaries more often; only 8 % of one- or two-word searches did. | Pew Research Center, [March 2025 browsing of 900 US adults, 68,879 searches](https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/) | Strong on the direction, medium for French searches (US panel) |
| Pages made at scale to catch query variants, by any means, are spam ("scaled content abuse"); so is hosting low-value pages on a bought expired domain. | Google, [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | Strong |
| People-first content: say who made it, how and why; trust comes first among experience, expertise and authority. | Google, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) | Strong (guidance, not a formula) |
| Several rich results are gone, among them Course Info and Learning Video (June 2025) and practice problems (January 2026). Breadcrumb markup is still supported; breadcrumbs show on desktop results only since January 2025. | Google, [June 2025](https://developers.google.com/search/blog/2025/06/simplifying-search-results), [November 2025](https://developers.google.com/search/blog/2025/11/update-on-our-efforts), [January 2025](https://developers.google.com/search/blog/2025/01/simplifying-breadcrumbs) | Strong |
| A home page in a folder, such as `github.io/vale/`, cannot get a site name in results: results show the host instead of « Bagage ». | Google, [Site names](https://developers.google.com/search/docs/appearance/site-names) | Strong |
| `robots.txt` only counts at the root of a host. | Google, [Introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro) | Strong |
| IndexNow: one request tells the participating engines (Bing, Yandex, Naver, Seznam…) which addresses changed, proven by a key file on the site; send changed addresses only. Google is not among them. | [IndexNow documentation](https://www.indexnow.org/documentation) | Strong |
| ChatGPT search draws on third-party providers; OpenAI's vice-president of engineering called Bing "an important one" (November 2024). An analysis of 118,931 of its queries suggests Google results are among its sources too. | [Search Engine Roundtable](https://www.seroundtable.com/bing-powers-chatgpt-search-38345.html), [Ahrefs](https://ahrefs.com/blog/is-chatgpt-really-powered-by-google/) | Medium (secondary, and it changes) |
| Pages ranking for « phrases espagnol voyage » (one read, 19 November 2026): lists and tables of 50 to 250 phrases ([Generation Voyage](https://generationvoyage.fr/?p=24589), [Les Sherpas](https://sherpas.com/blog/apprendre-espagnol-voyage/), [Larousse](https://www.larousse.fr/dictionnaires/guide/espagnol), [Evaneos](https://www.evaneos.fr/espagne/voyage/vocabulaire-de-survie/)), one with audio ([Univext](https://univext.com/fr/blog/408/phrases-espagnol-essentielles-voyage)). Most give pronunciation as a paragraph of rules or a recording; few give a reading for each phrase that a French speaker can follow. | The pages themselves | Medium (results vary by place and day) |
| « Bagage » alone is a luggage query: searches for the name return luggage shops. | Search for « bagage.fr », 19 November 2026 | Medium |

## Our reading

- *Inference.* A one-line answer (« Comment dire merci en portugais ? ») is now given by the
  results page itself, so it brings few visits. Bagage wins where a page gives more than the
  answer: every phrase of a situation, a pronunciation a French speaker can read, the voice, a
  dialogue, the tips of the place, then a way to keep it all for the trip. The situation pages and
  the language pages are built for that.
- *Inference.* Being cited in AI answers still shows the name to people who do not click; staying
  in them (the Search Console switch) is worth more to a new brand than the clicks it may cost.
- *Inference.* Bing matters beyond its share of French searches because ChatGPT search and Copilot
  draw on it; IndexNow gets pages there within minutes, without an account.
- *Inference.* Since the name alone means luggage, people will find Bagage by what it does
  (« phrases espagnol voyage ») long before they search for it by name; a domain where the name
  stands with « app » or a French extension helps those who do.
- No figures on what French travellers type: Google Trends and autocomplete cannot be read from
  this workspace. Search Console will give the real queries per page after B4; until then the six
  situations follow the lessons that already exist.

## What was built (19 November 2026)

- **Situation pages** (first built that day to test acquisition): titles in the words people type (« Commander un café en espagnol :
  12 phrases avec la prononciation »), descriptions quoting the first phrases, the « Bon à savoir »
  tips of that situation (each course tip now names its lesson), a visible trail and its
  `BreadcrumbList` data, a footer saying who wrote the phrases and that natives will review them.
- **A page per language** (`espagnol/`, `italien/`, `portugais/`, `anglais/`): the six situations
  with a first phrase each, all the tips, how to read the pronunciation, and « Apprendre
  l’espagnol » into the app (`#/apprendre/es`: onboarding in that language, or home on the trip in
  it).
- **The app's own page**: a title that says what it is (« Bagage : les phrases de survie pour
  voyager »), its canonical address, sharing tags with a picture, and `WebSite` data so the name
  shows once there is a domain. One description, from `src/brand.ts`, for the page, its sharing
  tags and the manifest.
- **The sharing picture** (`public/og.png`, drawn by `node brand/og.ts`): Bernard on the blue of the
  app icon, the promise and the four languages, so a link reads as the app people install.
- **For crawlers**: `sitemap.xml` with the 29 addresses; `robots.txt` with the owner's content
  signals, which counts once at the root of the domain; `llms.txt`, every page for language models.
- **IndexNow** (`build/indexnow.ts`): the key file sits beside the app; the deploy job keeps the
  live pages, publishes, waits for the new version to be online, then sends only the addresses
  that changed or disappeared. The key is public by design: it only proves the addresses are ours.
- **French typography**: in the courses and on the pages, a number keeps its unit on its line
  (« 21 h 30 », « 3 € »).

## Measured

Median of three runs on a local preview of each build, Lighthouse's mobile settings (slow 4G, a
CPU four times slower). Before: the commit before this pass; after: the pass, with the content
signals and `llms.txt` of the same day. With Lighthouse 13.6, the current version:

| Page | Performance | Accessibility | Best practices | SEO | Agentic browsing | Largest paint | Layout shift |
| --- | --- | --- | --- | --- | --- | --- | --- |
| The app, before | 100 | 100 | 100 | 91 | 50 | 0.9 s | 0 |
| The app, after | 100 | 100 | 100 | 100 | 75 | 0.9 s | 0 |
| `espagnol/commander-un-cafe/`, before | 100 | 100 | 100 | 92 | 50 | 0.9 s | 0 |
| `espagnol/commander-un-cafe/`, after | 100 | 100 | 100 | 100 | 75 | 0.9 s | 0 |
| `espagnol/` (new) | 100 | 100 | 100 | 100 | 75 | 0.9 s | 0 |

The only audit still failing is the ARD manifest, by choice (« Agents » below). The same pages
under Lighthouse 12.8, first measured:

| Page | Performance | Accessibility | Best practices | SEO | Largest paint | Layout shift |
| --- | --- | --- | --- | --- | --- | --- |
| The app, before | 94 | 100 | 100 | 91 | 2.6 s | 0 |
| The app, after | 94 | 100 | 100 | 100 | 2.7 s | 0 |
| `espagnol/commander-un-cafe/`, before | 99 | 100 | 100 | 92 | 1.7 s | 0 |
| `espagnol/commander-un-cafe/`, after | 99 | 100 | 100 | 100 | 1.7 s | 0 |
| `espagnol/` (new) | 99 | 100 | 100 | 100 | 1.7 s | 0 |

- The only SEO check that failed before was `robots.txt` (the preview answered with the app's
  page). On github.io the file at the host's root is not ours, so that gain shows on the domain
  only (B2).
- Speed did not move. The two versions, with the same settings, disagree on the app's largest
  paint (2.7 s for 12.8, 0.9 s for 13.6): they simulate the slow phone rather than slow the page
  down. Slowed for real in Chrome instead (the same network figures and processor factor, five
  cold loads each), the welcome paints its largest element at 1.6 s (1.5 to 1.9 s) and a page at
  0.5 s: under the 2.5 s of a good page, so nothing changes. This machine's processor, even slowed,
  is quicker than many phones': real visitors' Core Web Vitals settle it once there is traffic
  (Search Console).

### The courses in the first load (20 November 2026)

The review of 20 November 2026 read a blocking time of 420 ms on the app and blamed the four
courses that every visitor loads, proposing to load only the trip's course. To check, the same Lighthouse 13.6 mobile settings
ran on the production build as it is and on a throwaway build with only the Spanish course, the
largest, alternating, on an idle machine.

| Build | Main script (gzip) | Performance | Blocking time | First paint | Ready (TTI) | Unused JavaScript |
| --- | --- | --- | --- | --- | --- | --- |
| Four courses, six runs | 106 KB | 97 to 100 | 76 to 198 ms | 0.91 s | 2.72 s | 45.8 KiB |
| One course, three runs | 80 KB | 97 to 98 | 156 to 210 ms | 0.92 s | 2.62 s | 45.7 KiB |

Paint and TTI are medians. The 420 ms was a single run, probably taken while the machine was busy.
The courses count as used code, since their data is built when the script starts: the unused
46 KiB is screens and features the welcome does not run. Splitting the courses would save 27 KB
on a first visit (the service worker then stores every file anyway) and about 100 ms before the
app answers, nothing on the first paint: not worth an app that waits for its course. Not
measured: a slow phone's own processor (B7), and visitors' Core Web Vitals once there is traffic.

## Agents: Cloudflare's Agent Readiness score

[isitagentready.com](https://blog.cloudflare.com/agent-readiness/) (Cloudflare, April 2026) scores
a site on four dimensions: discoverability (`robots.txt`, sitemap, `Link` headers), content
(Markdown when an agent asks with `Accept: text/markdown`; `llms.txt` optional and not scored),
bot access control (Content Signals and AI crawler rules in `robots.txt`, Web Bot Auth) and
capabilities (Agent Skills, API catalog, OAuth discovery, MCP server card, WebMCP); commerce checks
are shown but not scored. Cloudflare publishes neither the weights nor the formula, several of the
standards are drafts, and among the 200,000 most visited domains 78 % have a `robots.txt`, about
4 % Content Signals and 3.9 % Markdown on request. Strength: medium (the vendor's own tool and
figures).

| Check | Bagage | Decision |
| --- | --- | --- |
| `robots.txt`, sitemap | Built; `robots.txt` counts at the root of a domain only | Scan once the domain serves the app (B2): on github.io the host's root is not ours |
| Content readable without scripts | Yes: every phrase is in the page's HTML | None |
| Markdown on request | Not offered | Cloudflare converts pages for paid plans only (Pro and up, [docs](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents)); our Worker could build it from the courses once it serves the site. The agents that ask for it today are mostly coding tools, not travellers' assistants: it waits |
| Content Signals | `search=yes, ai-input=yes, ai-train=yes` | The owner's choice (19 Nov 2026): being read, cited and learnt by AI models helps a new name. Measured with Lighthouse 13.6, the current version: the `robots.txt` audit passes and SEO stays at 100 (version 12.8 called the line an unknown directive). [Google](https://developers.google.com/search/reference/robots_txt) supports four fields and skips invalid lines, so search is untouched; the signals speak to the crawlers that read them ([Cloudflare's policy](https://blog.cloudflare.com/content-signals-policy/)) |
| AI crawler rules | Every crawler allowed by `User-agent: *` | No group per crawler: a crawler follows only the group naming it ([RFC 9309](https://www.rfc-editor.org/rfc/rfc9309)), so a group of its own would hide the general one, signals included, and allow nothing more |
| Web Bot Auth, API catalog, OAuth, MCP, Agent Skills, commerce | Not applicable | Bagage calls no other site, opens no public API (translation runs on our credits) and has no accounts yet |

Lighthouse 13 adds an « Agentic browsing » category, still in development by its own account,
which weighs four audits: a well-formed accessibility tree, layout stability, an `llms.txt` with a
title and links ([llmstxt.org](https://llmstxt.org/)), and an Agentic Resource Discovery manifest
(`/.well-known/ard.json`); WebMCP audits are listed without weight. Bagage passes the first two
(its accessibility is tested end to end) and now writes `llms.txt` from the courses: every page with
its summary, under the name and what Bagage is. Google Search does not read it (the AI guide
above); Lighthouse's audit does. No ARD manifest: it lists resources offered to agents, and Bagage
offers none yet.

## IndexNow and privacy

The deploy job, on GitHub's servers, sends `api.indexnow.org` the host, the key and the addresses
of the pages that changed: public addresses only. The app itself sends search engines nothing,
and nothing about travellers. The first run (19 November 2026) sent 29 addresses, answered 202
(received, key being checked). Before that day IndexNow appears nowhere in the repository's history.

## Considered, not done

- **Links from the app's welcome screen to the language pages.** Links from the most-linked page
  would help crawlers find and weigh the pages, but a link there competes with « C’est parti »,
  and a traveller sent by a card who detoured through a page would come back counted as arriving
  from a page (the counts by link). Revisit if Search Console reports the pages as « Détectée, actuellement non
  indexée ».
- **More pages per wording** (« commander une bière en espagnol »…): scaled content abuse. A page
  is added when it carries something of its own: a lesson and its scene.
- **Course, practice problem or FAQ markup**: retired or not shown for a site like ours.
- **`llms.txt`, Markdown copies**: not used by Google (the AI guide above).

## What waits for the owner

- **B2, the domain.** Brings the site name in results, `robots.txt` at the root, and a reputation of
  our own rather than a shared host's. Buy a new name, not an expired one with a past (spam
  policies above). Candidates, not checked (domain registries cannot be queried from here): check
  them in Cloudflare's *Domain Registration* and the name at INPI and EUIPO (D4) first.
  - `bagage.app`: short, says what it is; the `.app` extension only works over HTTPS, which
    Cloudflare serves.
  - `bagage.fr`: the French extension, for a holder living or registered in the European Union,
    Norway, Iceland, Liechtenstein or Switzerland ([Afnic](https://www.afnic.fr/en/resources/faq/general-faq/));
    if Cloudflare does not sell it, buy it elsewhere and point it to Cloudflare.
  - `monbagage.app`, `bagage-app.fr`: if the first two are taken.
- **Moving the addresses.** Once the domain serves the app, the github.io addresses should say
  where the pages went for a few weeks (pages that point to the new address, with their canonical
  tag), so B5 (private repository, which stops GitHub Pages) waits until search engines have moved.
  The IndexNow step then reports the old addresses as gone.
- **B4, Search Console**, then Bing Webmaster Tools (it imports the Search Console site in a click):
  submit `sitemap.xml`, watch the indexing report, and keep the site in AI features.

## How we will know

- Per page: impressions, clicks and queries in Search Console; its generative AI report.
- Per link: new travellers arriving through `utm_source=page` and their day-7 return, against the
  decision figures (RUNBOOK.md; `npm run figures`). Scale the pages and situations the numbers back.
