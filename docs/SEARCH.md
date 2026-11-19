# Search

How people should find Bagage from a search engine or an AI answer: what the sources say, what
was built (RUNBOOK A5), what was measured, and what waits for the owner. Each source is graded
for Bagage: **strong** (primary documentation or a large measured study), **medium** (secondary
reports, or a study far from our case), **weak** (opinion). *Inference* marks our own reading.

## Where Bagage stands (19 November 2026)

- The app and its pages live at `https://coroboros.github.io/vale/`, a folder on a shared GitHub
  host, until Bagage has a domain (RUNBOOK B2).
- 29 addresses for search engines: the app, a page per language (4) and a page per situation and
  language (24), all in `sitemap.xml`.
- Not yet: a domain, Search Console, Bing Webmaster Tools (owner, B2 and B7).

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
  this workspace. Search Console will give the real queries per page after B7; until then the six
  situations follow the lessons that already exist.

## What was built (A5, 19 November 2026)

- **Situation pages** (from A4): titles in the words people type (« Commander un café en espagnol :
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
- **For crawlers**: `sitemap.xml` with the 29 addresses; `robots.txt`, which counts once at the root
  of the domain.
- **IndexNow** (`build/indexnow.ts`): the key file sits beside the app; the deploy job keeps the
  live pages, publishes, waits for the new version to be online, then sends only the addresses
  that changed or disappeared. The key is public by design: it only proves the addresses are ours.
- **French typography**: in the courses and on the pages, a number keeps its unit on its line
  (« 21 h 30 », « 3 € »).

## Measured

Lighthouse 12.8, mobile settings, median of three runs on a local preview of each build (before:
the previous commit; after: this change).

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
- Speed did not move: the pages add no weight to the app, which still reaches its largest paint in
  about 2.7 s on Lighthouse's slow phone network. Laboratory figures: real visitors' Core Web
  Vitals need traffic, then show in Search Console.

## Considered, not done

- **Links from the app's welcome screen to the language pages.** Links from the most-linked page
  would help crawlers find and weigh the pages, but a link there competes with « C’est parti »,
  and a traveller sent by a card who detoured through a page would come back counted as arriving
  from a page (A4). Revisit if Search Console reports the pages as « Détectée, actuellement non
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
  tag), so do B3 (private repository, which stops GitHub Pages) after search engines have moved.
  The IndexNow step then reports the old addresses as gone.
- **B7, Search Console**, then Bing Webmaster Tools (it imports the Search Console site in a click):
  submit `sitemap.xml`, watch the indexing report, and keep the site in AI features.

## How we will know

- Per page: impressions, clicks and queries in Search Console; its generative AI report.
- Per link: new travellers arriving through `utm_source=page` and their day-7 return, against the
  thresholds of A2 (`npm run figures`). Scale the pages and situations the numbers back.
