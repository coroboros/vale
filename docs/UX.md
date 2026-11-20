# User experience

How a newcomer gets from the first screen to the end of the first lesson: what was measured, what
the sources say, what changed and what waits. Each source is graded for Bagage as in
docs/SEARCH.md: **strong** (primary documentation or a large measured study), **medium**
(secondary reports, or a study far from our case), **weak** (opinion). *Inference* marks our own
reading. The teaching choices met on the way (a guess before a new phrase, about 85 % right
answers, the practice moment) have their evidence in docs/LEARNING.md.

## Measured (19 November 2026)

A Playwright walk on a 390 × 844 screen counted each screen's words and controls, answering only
what is required. The first lesson was played by the app's own session code
(`src/engine/session.ts`) in every course, all answers right, then with mistakes. Two end-to-end
tests keep the screen counts (`tests/e2e/app.spec.ts`): a new screen before the first exercise
updates this page.

| Before the first exercise | Screens | Words to read | Taps | Typing |
| --- | --- | --- | --- | --- |
| From the app's address | 7: welcome, language, destination, date, travellers, rhythm, « Imagine » | 176 | 8 | the first name |
| From a page's link, until 19 November | 7, the same | 176 | 8 | the first name |
| From a page's link, now | 5: destination onward | 140 | 6 | the first name |

Only the first name is required: every other screen has a default or « Je ne sais pas encore ».
The heaviest screen is « Ton rythme », 49 words and two questions.

| The first lesson | Measured |
| --- | --- |
| Exercises | 18 in every course: the session's cap, so mistakes do not lengthen it |
| Phrases | 5 of the lesson's 13 or 14 met, 2 of them produced |
| Kinds, all answers right | 3 guesses, 5 new phrases, 4 « Qu’est-ce que tu entends ? », 4 « Comment dit-on… », 1 to say aloud, 1 dictation; in Portuguese, words to order instead of saying aloud |
| On screen | 11 to 21 words per exercise, 4 answers to choose from, then 6 to 21 words of feedback |
| Taps | 3 per answered exercise (choose, check, continue), 1 per new phrase |

*Inference.* With every answer right, the first lesson takes about **2.5 minutes for a brisk
reader and 4.4 for an unhurried one**, from the assumptions below. The model they come from
predicts an expert's time without errors: a newcomer is slower, so these are low estimates.

| Assumption | Brisk | Unhurried | Source |
| --- | --- | --- | --- |
| Reading | 238 words a minute | 150 | Adults read English non-fiction silently at 238 words a minute on average, most between 175 and 300 ([Brysbaert, 2019](https://doi.org/10.1016/j.jml.2019.104047), 190 studies; abstract read). The unhurried reader stays below that range on screens with a foreign phrase. |
| Choosing an answer | 1.35 s | 1.35 s | The mental operator of the keystroke-level model ([Card, Moran & Newell, 1980](https://doi.org/10.1145/358886.358895); its values read in course notes) |
| A tap | 0.5 s | 1.1 s | Same model: 1.1 s to point with a mouse; a thumb on a wide button is quicker (*inference*) |
| The dictation's 16 characters | 2 a second | 1 | On phones, people type 36 words a minute on average, about 3 characters a second, in their own language ([Palin et al., 2019](https://doi.org/10.1145/3338286.3340120), 37,370 volunteers; abstract and talk read) |
| Feedback | half read | all read | Assumption |
| The voice | about 2.3 words a second | the same | Speed 0.92 (`src/platform/voices.ts`) |

The app's own goals agree: the first lesson earns 17 XP (10 right answers, 2 phrases produced, 5
for a perfect session) and « Régulier » counts 40 XP as 10 minutes, so 4.25 minutes. Real
durations are on the phone only: the session ticket shows the minutes and the day log keeps them
(`ms`); the anonymous counts do not carry them.

## What the sources say

| Finding | Source | Strength |
| --- | --- | --- |
| Know why you ask every question and only ask for what you really need; ask for each piece of information once in a journey; make clear why you ask; let people answer « I do not know »; start with one question per page. | GOV.UK Design System, [Question pages](https://design-system.service.gov.uk/patterns/question-pages); Service Manual, [Structuring forms](https://www.gov.uk/service-manual/design/form-structure) | Strong as practice, built on their user research; not a controlled trial |
| Told a web questionnaire would take 10, 20 or 30 minutes, fewer people started and finished it the longer the stated time; later questions got faster, shorter, more uniform answers. | [Galesic & Bosnjak, 2009](https://doi.org/10.1093/poq/nfp031) (abstract read) | Medium: surveys, not apps |
| Against it: a longer and a shorter questionnaire drew the same web response (11.1 % and 11.0 %) and the same break-offs, and studies that did not tell people the length found no effect on taking part. | [Sandelin, 2022](https://www.gu.se/sites/default/files/2022-11/2022-1%20Effects%20of%20questionnaire%20length%20%28Sandelin%202022%29%20v2_1.pdf), SOM Institute, University of Gothenburg | Medium: surveys, one experiment |
| Duolingo let people do a lesson before signing up: moving the sign-up screen back a few steps raised daily active users by about 20 %. | Its growth lead in First Round Review, quoted by [Taplytics](https://taplytics.com/blog/duolingo-ab-test-onboarding) | Medium: a company's own test, read second-hand |
| Avoid onboarding whenever possible: it costs effort, and tutorials did not improve task performance in their study. Set-up questions belong at launch when the app needs the answer to start (a language and a level, say), kept brief and explained; what cannot be justified at launch « should be gathered later ». | Nielsen Norman Group, [Mobile-app onboarding](https://www.nngroup.com/articles/mobile-app-onboarding/) (June 2020) | Medium for tutorials (their study); weak for set-up questions (example apps, no study) |
| Long set-ups are common: 25 screens on average over 986 apps, 29 in education; Duolingo's runs to 76, its first lesson around screen 12. An app that needs to know you first should not let people skip that part. No outcome was measured. | Mobbin, [The long onboarding](https://mobbin.com/blog/the-long-onboarding-a-study-of-1-460-flows) | Medium for the counts, weak for the advice |
| Duolingo shortened lessons hoping people would finish more of them: its measure of time spent learning went down; new content always raised it. | Duolingo, [Time spent learning well](https://blog.duolingo.com/time-spent-learning-well) (June 2024) | Medium: a company's own figures, not published |

## Our reading

- *Inference.* The set-up is already short: seven screens, one required answer, about a minute of
  reading, where Duolingo's first lesson comes around screen 12. Whether each extra question loses
  people is disputed (the two survey rows); asking what is already known has no defender.
- *Inference.* Each question feeds what follows: the trip and its date feed « Imagine » and the
  memory forecast, the moment is the if-then plan (docs/LEARNING.md), the first name makes
  « Imagine » personal. « Ton rythme » holds two questions against the one-per-page advice; both
  have defaults, so it stays until real figures say otherwise.
- *Inference.* Eighteen exercises, about three to four minutes, is no reason to shorten the first
  lesson: Duolingo found shorter lessons did worse. Time it first.

## Changed (19 November 2026)

- From a situation or language page, the app opens at « Où vas-tu ? »: the link chose the
  language and the page introduced Bagage, so the welcome and the language screens asked what was
  known. The back arrow still reaches both, and the dots start at 2 of 6. Five screens instead of
  seven, 140 words instead of 176, six taps instead of eight.
- A traveller who opens a page's lesson in a language none of their trips speaks gets « Nouveau
  voyage » in that language, then that lesson; home used to open without a word.

## The return date (studied 19 November 2026)

The idea: each trip gets a return date, so that home moves to the next trip on its own, the
trip's stamps carry its dates and the pass knows when it ends.

| It would bring | What exists |
| --- | --- |
| Home moving to the next trip | Once a trip has begun, home shows « Prochain voyage » and « Préparer ce voyage »: one tap, once per trip, for the travellers who planned two (`src/ui/screens/Home.tsx`) |
| Dates on the trip's stamps | Each stamp carries the day it was earned |
| The pass's last day | Needed only by those who buy; the payment-link test (RUNBOOK D3) needs no date |

What it costs: a question for everyone with a date picker (several gestures on an iPhone), its
checks (a return before the departure, a return without a departure), a field to edit, a change to
stored data, and a wrong move when plans change (a stay extended, a date never corrected).

Decision: no return date now, and never in onboarding: it would ask everyone, before the first
exercise, for a gain that comes after the trip and to a few, which is the information Nielsen
Norman Group says to gather later. The pass asks for it when bought, where it sets the price and
the reason is plain (GOV.UK, above). RUNBOOK E2; TODO.md, « Trips, next ».

## Who stops before the first lesson (decided 19 November 2026)

The owner asked for it, the legal question decided here. Not legal advice: a lawyer reads it with
the privacy policy before anything is sold (RUNBOOK D4).

| Finding | Source | Strength |
| --- | --- | --- |
| Audience measurement needs no consent when it only serves the publisher, produces anonymous statistics only, allows no tracking across sites or apps and no matching or sharing with others; the publisher must be able to show it. | CNIL, [Questions-réponses](https://cnil.fr/questions-reponses-lignes-directrices-modificatives-et-recommandation-cookies-traceurs), question 9 (29 April 2026) | Strong: the authority for users in France |
| Its purposes include « détection de problèmes de navigation » and the site's or app's ergonomics; people should be told, in the privacy policy for instance; collected data is kept 25 months at most. | CNIL, [Solutions pour les outils de mesure d'audience](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience) (4 July 2025) | Strong |
| Such measurement usually involves personal data, so people keep the right to object, through a mechanism that is « aisément accessible ». | CNIL, Questions-réponses, question 10 | Strong |
| Tracking links and pixels and other techniques that make a device send information fall under the same rule as cookies. | EDPB, [Guidelines 2/2023 on the technical scope of Art. 5(3) ePrivacy](https://www.edpb.europa.eu/system/files/2024-10/edpb_guidelines_202302_technical_scope_art_53_eprivacydirective_v2_en_0.pdf) (October 2024; summary read) | Strong |
| The EU's Digital Omnibus, still being negotiated, keeps a consent-free exemption for a service's own aggregated audience measurement, in the Commission's proposal and in the Council's mandate of 21 October 2026. | [PPC Land](https://ppc.land/eu-council-agrees-4-month-cookie-re-ask-wait-for-digital-omnibus-talks/), [Taylor Wessing](https://www.taylorwessing.com/de/global-data-hub/2026/the-digital-omnibus-proposal/gdh---the-digital-omnibus---cookies) | Medium: secondary, not law yet |

Decision: counted, within that exemption. Each onboarding screen a phone reaches, then its first
lesson begun and finished, is one count, once per phone: its name, the first day and the link
that brought it (`FIRST_STEPS` in `src/counts-api.ts`); the Worker keeps totals per day and
nothing per request. The gap this closed was already there: the new traveller's count left three
seconds after onboarding, while the switch lived only in *Moi*. The first screen now has
« Statistiques anonymes », which opens what is counted and the switch (`ui/CountsChoice.tsx`);
switched off, nothing more leaves, steps included. A page's link opens at the destination, which
carries the same link. Like everything counted, it stays off until RUNBOOK C1.

## Home's top (20 November 2026)

The owner found the block from the trip button to the practice moment heavy, with nothing to cut.
Three bold elements sat 6 px apart: the trip button at weight 750 in a white bordered pill, the
greeting, and the moment line in bold accent colour. Hierarchy comes from contrast, scale and
grouping, and one element should lead ([NN/g, Visual Hierarchy in UX](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/),
read from an excerpt). Now the greeting leads: the trip button is the shared chip (it was a near
copy of it, without the flat controls' motion) and the moment line is regular weight in ink-soft,
7.0:1 on the page. Ink in the block, summed against the background on a 390 px screenshot: 12,614
before, 11,122 after (−12 %). A transparent button saved 2 % more but would have been a copy of
the chip, and a card around the moment line saved nothing.

## Naming the survival card (20 November 2026)

The owner did not understand the tab « Carte ». Counted in the app's own text, « carte » means
six things: the menu (« La carte, s'il vous plaît »), a bank card, a transport card, a hotel key
card, Bernard's postcards and the survival card; a travel app's « Carte » also reads as a map.
« Survie » appears nowhere else, and it is already the brand's promise, « Les phrases de survie
pour voyager »; French travel and language sites say « vocabulaire de survie », « guide de survie
linguistique », « trousse de survie de la conversation » for the same few phrases (Les Sherpas,
The Wom Travel, Sky-Scribe, read from search excerpts). One thing, one name: so the tab is
« Survie » and the screen « Ma carte de survie ». The full name appears wherever the card is met
without its screen around it (the title, the picture sent, its text, the file's name, the star in
« Phrases », the statistics); inside its screen « ma carte » is enough, so people are not told
« de survie » five times. The phrases a star adds were listed in « Phrases » as « Mes favoris »:
the same action under a second name, so a star never told anyone it filled the card. The list is
now « Sur ma carte de survie ». Bernard's « Une carte » became « Une carte postale ». A lifebuoy
icon would match « Survie », but it made the tabs more alike (0.49 against 0.41, docs/BRAND.md,
« Icons »), so the luggage tag stays. At 390 px the longer title puts « Modifier » under it, and
at 320 px it takes two lines. Not measured: whether travellers now find the card sooner.

## A switch for the streak (20 November 2026)

The Digital Fairness Act the European Commission proposed on 11 November 2026 would ban dark
patterns and let every user turn off addictive features such as streaks and autoplay ([ghacks](https://www.ghacks.net/2026/11/11/eu-proposes-digital-fairness-act-to-ban-dark-patterns-and-let-users-turn-off-streaks-and-autoplay/),
[Euronews](https://www.euronews.com/2026/11/11/eu-targets-subscription-traps-addictive-design-and-hidden-fees-with-new-digital-rules)).
A proposal, not law yet, but cheap to meet now. « Série de jours », in « Moi », is on by default;
off, the flame, the jokers, the catch-up offer and the streak in « Moi » and in a session's
summary all go. The days keep being counted underneath, so switching back shows the true streak.
Not measured: how many travellers switch it off.

## The daily challenges on phones (20 November 2026)

Since the rebuild, the three daily challenges, the chest they open and the jokers line lived only
in the side panel of screens 1120 px wide or more: phones and tablets never showed them. So the
chest, one of the two ways to earn a joker, was out of reach there, and a phone's streak was
easier to lose than a computer's (`openChest` gives a joker half the time).

Measured on the home screen (Playwright, 20 November 2026): where the itinerary starts.

| Phone | Today | Full challenges card | One line in the goal card |
| --- | --- | --- | --- |
| 390 × 844 | 718 px | 1070 px (+352) | 776 px (+58) |
| 375 × 667 | 736 px | 1087 px (+351) | 794 px (+58) |
| 320 × 568 | 758 px | 1155 px (+397) | 816 px (+58) |

The full card would cost 42 % of a 390 × 844 screen and 70 % of a 320 × 568 one, undoing the
lighter home of « Home's top ». Keeping them out of sight, or dropping them, goes against what the
products that ship them do. Duolingo built its Quests tab after A/B testing every part of it,
the difficulty and type of each quest included, to give "a variable set of recommended tasks"
([Q2 2022 shareholder letter](https://www.sec.gov/Archives/edgar/data/1562088/000156208822000133/duolingo_q2-2022xshareho.htm));
it publishes no effect size. On phones they get a tab of their own ([Duolingo](https://blog.duolingo.com/new-duolingo-home-screen-design));
daily.dev shows them in the sidebar of large screens and behind one button on mobile
([daily.dev](https://docs.daily.dev/quests/)), the split Bagage now has. Bagage's bar already
has five tabs, so no sixth.

Decided: one line, « Défis du jour » with the count, at the foot of the goal card on screens
narrower than 1120 px; it opens the same challenges, chest and jokers line in a sheet, and says
when the chest is ready. Five of the eight challenges ask for something the daily goal does not
(saying phrases aloud, a scene, reviews, new phrases, a session without a mistake). Saying words
aloud helps memory over reading them silently, though between learners the gain is small and
shows in recognition, not recall ([Fawcett and colleagues' updated meta-analysis](https://doi.org/10.1037/cep0000302),
abstract read). Not measured: whether travellers open the line, or practise more for it.

## Reminders (decided 20 November 2026)

Measured without reminders, a « no » from the decision figures could be false. Duolingo optimises
millions of daily reminders, and choosing their wording alone, with a bandit algorithm, added
0.5 % to daily active users and 2 % to new-user retention ([Yancey and Settles, KDD
2020](https://research.duolingo.com/papers/yancey.kdd20.pdf)). So reminders come before the first
figures (RUNBOOK, C0): asked for by the traveller, at the practice moment they chose, one a day at
most, without guilt, and off in « Moi ». Not measured: how many travellers ask for them.

## The welcome page (20 November 2026)

The owner asked for a page that presents Bagage before the app, in the app's own voice and
drawings, while the installed app keeps opening on the app.

| Finding | Source | Strength |
| --- | --- | --- |
| An installed app's `start_url` should open the app itself, not a product landing page; the manifest's `id` keeps the app's identity if `start_url` changes. | web.dev, [Add a web app manifest](https://web.dev/articles/add-manifest) | Strong: the platform's guidance |
| On a landing page, say what the site is worth first, then what installing brings; offer to install only once the browser allows it (`beforeinstallprompt`). | web.dev, [Patterns for promoting PWA installation](https://web.dev/articles/promote-install) | Medium: guidance, no figures |
| The `display-mode` media query tells the installed app from a tab; on iOS and iPadOS each icon added to the home screen has its own storage, apart from Safari's. | web.dev, [Detection](https://web.dev/learn/pwa/detection) | Strong |
| Pre-rendering is still worth it: it is faster, and not every bot runs JavaScript. | Google Search Central, [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) | Strong |
| None of the major AI crawlers (GPTBot, ChatGPT-User, ClaudeBot, Meta's, ByteDance's) rendered JavaScript on Vercel's network. | Vercel and MERJ, [The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler) (December 2024) | Medium: one vendor's network |
| A home page says at a glance who you are and what you do, with a one-sentence tagline; failing to, it loses visitors. | Nielsen Norman Group, [Top 10 guidelines for homepage usability](https://www.nngroup.com/articles/top-ten-guidelines-for-homepage-usability/) and [Homepage design principles](https://www.nngroup.com/articles/homepage-design-principles/) | Medium: expert guidance |

Decision: one address, two doors. The build writes the welcome page into `index.html`
(`build/welcome.ts`), so crawlers that run no script read it, in a newcomer's colours from the
first paint; then the app's own pieces settle on it: the flying window, the install button, the
statistics link (`ui/welcome-page.tsx`). Before anything is painted, a few inline lines
(`build/boot.ts`, allowed by their hash in the Content Security Policy) send to the app the
installed app, a traveller who has already set off and any link into the app (`#/…`); `start_url`
stays the app. The installed app's first launch keeps the short welcome: on an iPhone, its storage
starts empty even for someone who set off in Safari. « C’est parti » opens onboarding at its first
question, since the page already says what the welcome said: the first exercise stays seven
screens away, the page counted as the first. « Retour » there brings the page back where it was
left; the page leaves the document while the app shows, so there is only ever one to read.

Measured with Lighthouse 13.6, mobile settings, the median of three runs alternating on an idle
machine; before is the app's own welcome (4aa67e0):

| Build | Performance | Accessibility | Best practices | SEO | Largest paint | Layout shift | Blocking time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Before | 98 | 100 | 100 | 100 | 0.91 s | 0.002 | 153 ms |
| The welcome page, first screen only | 100 | 100 | 100 | 100 | 0.91 s | 0.004 | 44 ms |
| The welcome page, whole | 100 | 100 | 100 | 100 | 0.90 s | 0.004 | 69 ms |

The first build shifted by 0.031: the install button and the statistics link arrived with the
script and pushed the window up 34 px. Their places are held now (`styles/welcome.css`, only where
the build counts for the link); what is left is the fonts replacing the fallback on one line. A
newcomer's first load no longer builds onboarding, hence the shorter blocking time. The whole page
weighed 694 KiB: under slow 4G the browser fetches the four photos early, though lazy, and
Lighthouse estimated 339 KiB to save on them. Not measured: real phones.

The photos' weight, measured on the four postcard photos, each resized from its 1920 px file and
compared by structural similarity with the same resize kept lossless:

| Width | WebP, quality 56 (as rendered) | AVIF at the same similarity |
| --- | --- | --- |
| 480 px | 77 KiB | 65 KiB (16 % less) |
| 800 px | 187 KiB | 162 KiB (14 % less) |
| 1280 px (served until now) | 430 KiB | 374 KiB (13 % less) |

The width does most of it: 800 px weighs 57 % less than 1280 px, AVIF 13 to 16 % less on top (the
references are already WebP, which flatters WebP; with the originals AVIF may gain more). The
photos now come in 480, 800, 1280 and 1920 px, rendered with the rest by `brand/photos.py`, and
the browser picks with `srcset`. Measured after (Lighthouse 13.6, median of three): the page weighs
439 KiB instead of 694, the four photos 189 KiB instead of 443; LCP 0.92 s, blocking time 54 ms,
CLS 0.004, all four scores 100. Lighthouse still sees 69 KiB: the 800 px files against the 609
device pixels a postcard covers on its emulated phone, the price of fixed widths. Cloudflare Images would give any width and AVIF on the fly:
5,000 unique transformations a month free, then $0.50 per 1,000
([pricing](https://developers.cloudflare.com/images/pricing/)), through a Worker on any zone,
workers.dev included ([Transform via Workers](https://developers.cloudflare.com/images/worker)).
For 23 photos the gain over fixed widths is AVIF's share, at the cost of a Worker route, of the
GitHub Pages preview and of a vendor between the page and its photos: worth it once photos
multiply, such as with Unsplash (RUNBOOK C3).

Below the first screen, the page goes on with what the app already has, nothing drawn for it alone.
A postcard from each language's first destination of the welcome flight, so the drawing of the
first screen becomes a photo: the app's postcard (Home) in that country's colours, the photo with
its credit, a passport stamp, the first phrase of the café lesson with its pronunciation and a
voice of the device, and a link to its situation page. Then how it works, three stops on the
itinerary's dotted path, each with the icon of the tab that keeps it in the app. Then the boarding
call: Bernard, « C’est parti » again and the install button, now that the page has said what Bagage
is worth (web.dev, above). The motion stays the app's: the window's flight, Bernard's eyes, the
buttons' lift; no section fades in, as the motion rule in AGENTS.md asks. The Bernard of the
boarding call neither bobs nor blinks, only follows the pointer: moving on for more than five
seconds, he would need a pause button (WCAG 2.2.2), and the first check counted his blinks with the
window's. As an overlay, as in « Imagine », a credit covered 7 to 18 % of a photo on a 390 px phone
and 24 % on each of the four desktop cards: it goes under the photo. The photos load only near the
screen, and their frames are sized before they arrive. On a computer, the first screen ends on the
next title, so the page reads as going on.

## The welcome page's day (20 November 2026)

The owner asked for life on the welcome page (sun, travel, luggage, sea, sand), worlds that change
as one scrolls, and effects of 2026 rather than 2016, the amount and the style decided by
measures. AGENTS.md had ruled out one-off animation.

| Finding | Source | Strength |
| --- | --- | --- |
| Parallax raised engagement through two routes: seeming cool and vivid, and the natural mapping of scrolling to motion, which felt easy to use; engagement went with better attitudes and intentions. 2 × 2 online experiment, N = 295, product sites. | Wang & Sundar, [How does parallax scrolling influence user experience?](https://doi.org/10.1080/10447318.2017.1373457), IJHCI 34(6), 2018 | Medium; read from the abstract |
| The parallax site was judged more fun and more professionally designed, but usability, satisfaction and the overall experience did not improve; two of 86 participants got motion sickness. | Frederick, Mohler, Vorvoreanu & Glotzbach, [The effects of parallax scrolling on user experience in web design](https://uxpajournal.org/wp-content/uploads/sites/7/pdf/JUS_Frederick_Feb2015.pdf), JUS 10(2), 2015 | Medium; abstract and summary |
| A shop telling its story with parallax beat the same shop in text on explicit and implicit experience, attractiveness, brand attitudes and the price people would pay; N = 266. | [Storytelling in online shops](https://doi.org/10.1108/INTR-09-2019-0377), Internet Research 32(7), 2022 | Medium; abstract |
| Parallax raised attractiveness on a storytelling site (N = 40); on text-heavy pages some readers scroll faster and stop more sharply, others never notice it (N = 25). | Mahardika et al., [IJASEIT 8(4)](https://core.ac.uk/download/325990502.pdf), 2018; Wu, [Purdue thesis](https://docs.lib.purdue.edu/open_access_theses/1616) | Weak: small samples |
| Most testers were indifferent; moving text hurt reading and could make people dizzy. Keep it subtle and peripheral, never body text, respect motion preferences, do not hide or rush content, weigh the cost. | Sherwin, [What Parallax Lacks](https://www.nngroup.com/articles/parallax-usability/), NN/g, 2019 | Medium: usability testing by practitioners |
| Parallax is a common trigger of vestibular disorders; motion set off by interaction should be possible to turn off (AAA, technique C39: reduced motion), while 2.2.2 covers motion that starts by itself. The working group's draft once counted as significant an animation tied to a user action and covering more than a third of the viewport. | W3C, [Understanding 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html); [draft](https://www.w3.org/wai/gl/wiki/animation_caused_by_user_interaction) | Strong; the third is a draft, our bar by inference |
| Scroll-driven animations are Baseline since Firefox 159 (Chrome 115, Safari 26) and use few main-thread resources; scroll-triggered animations arrived in Chrome 145. | web.dev, [New to the web platform in October 2026](https://web.dev/blog/web-platform-10-2026); Chrome, [performance case study](https://developer.chrome.com/blog/scroll-animation-performance-case-study), [scroll-triggered animations](https://developer.chrome.com/blog/scroll-triggered-animations) | Strong: the browser makers |

Decision: the page tells one story, a day of travel, and the scroll is its clock. Each block wears
its hour's sky, painted rather than animated, so the world changes as one scrolls at no cost:
dawn round the window, daylight on the postcards, golden hour at boarding, sunset on the beach the
footer stands on. Then what moves, and only with the scroll: clouds round the window, a plane
flying the route above « Comment ça marche », and on the beach the sun setting, a boat, gulls, the
foam, and Bernard's suitcase rolling up to the parasol (docs/BRAND.md, « Motion »). The rules
come from the table: the words never move; motion follows the scroll, which gives the natural
mapping and starts nothing by itself, so nothing needs a pause; each drawing is small and
peripheral, together under a tenth of the screen against the draft's third; transform and opacity
only, off the main thread; still for reduced motion and in browsers without scroll timelines.
2026's platform does the rest: view timelines with named ranges, `atan2()` over container units
so the plane keeps to its curve at any width, an oklch dawn, a scroll trigger for Bernard's one
jump (Chrome; elsewhere he simply stays put), and a view transition from the page into the app
(not back: inside one, Chrome 159 left the page at its foot instead of where the traveller was,
seen in CI).
Set aside: parallax backgrounds and full-screen layers (vestibular triggers, and a full-screen
layer costs a phone about 12 MB of graphics memory at three pixels per point, our arithmetic),
content that slides in (it hides and rushes content), loops on the clock (they would need a pause),
canvas or WebGL (weight).

Measured, Chrome 153 on a phone-size and a desktop screen:

- **Off the main thread.** Chrome's layer tree gives each of the eleven moving drawings a layer of
  its own for its animation. Two traps, found that way and fixed: a negative z-index, and opacity
  on an SVG, each kept the clouds on the main thread.
- **Main thread while scrolling the whole page**, CPU slowed four times, the window's flight held,
  median of three: 4,376 ms before the day, 4,602 ms after (+5 %), style 838 ms then 850 ms.
- **Screen in motion.** The moving drawings cover at most 8.7 % of a phone's screen and 4.9 % of a
  desktop's; between two positions 48 px apart, at most 2.9 % and 1.4 % of the pixels change, none
  with reduced motion (the window hidden and the phone's buttons unstuck for the count).
- **Contrast.** Soft ink and every accent ink reach AA on each sky and on the sand (unit test); on
  the page as drawn, outside the beach, soft ink's lowest contrast is 5.53:1, on the sand.
- **Lighthouse 13.6**, median of three: 100, 100, 100, 100; LCP 0.91 s, CLS 0.004, blocking time
  58 ms; 442 KiB, 3 more.
- **Bernard's jump** plays once, when the boarding call is fully in view, and not again on the
  way back up.

Not measured: smoothness on a real phone (headless Chrome draws without a graphics card, so its
frame counts say nothing), Safari 26 and Firefox 159, which this machine cannot run (TODO.md), and
what travellers make of it.

## The legal pages (20 November 2026)

The owner asked for the legal pages in the welcome page's footer, as right as the current official
texts allow. They are not legal advice: a lawyer reads them before anything is sold (RUNBOOK D4).

| Finding | Source | Strength |
| --- | --- | --- |
| A publisher that is a legal person shows its name, registered office and telephone, and if registered in France its RCS number and share capital; a person shows name, address and telephone; every site names its director of publication and its host's name, address and telephone. | LCEN, article 1-1, as written by the SREN law: [Légifrance, loi n° 2024-449, article 48](https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000049563632) | Strong: the law |
| The same duties as the administration explains them; formerly article 6, III, now 1-1 (anonymity of a non-professional publisher in 1-1, II; penalty in 1-2). | [Entreprendre Service Public](https://entreprendre.service-public.gouv.fr/vosdroits/F37351) (checked 13 October 2026); [Simonnet avocat](https://www.simonnetavocat.fr/mentions-legales-dun-site-internet-obligations-sanctions-et-modele/) (22 April 2026) | Strong; medium |
| A UK company or LLP shows on its website the part of the UK where it is registered, its registered number and its registered office address. | [SI 2015/17, regulation 25](https://www.legislation.gov.uk/uksi/2015/17/regulation/25), applied to LLPs by [SI 2009/1804, regulation 14](https://www.legislation.gov.uk/uksi/2009/1804/regulation/14) | Strong: the law |
| An online service established in the UK shows its name, geographic address, an email address to reach it quickly, its register and number, and its VAT number if it charges VAT. | [Electronic Commerce Regulations 2002, regulation 6](https://www.legislation.gov.uk/uksi/2002/2013/regulation/6) | Strong: the law |
| A privacy notice gives the controller's identity and contact, the purposes and legal bases, the recipients, transfers outside and their safeguards, retention, the rights, and the right to complain to a supervisory authority. | GDPR, article 13; [ICO checklist](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/checklists) | Strong |
| A controller outside the EU whose service targets people in it names a representative in the EU, unless its processing is occasional and unlikely to put people at risk. | [GDPR, article 27](https://www.legislation.gov.uk/eur/2016/679/article/27/2020-01-31) | Strong |
| Anthropic's data processing terms bring in the Commission's standard contractual clauses (modules two and three), the UK addendum and the Swiss one; Cloudflare's bring in the clauses and the UK addendum, and Cloudflare is certified to the EU–US Data Privacy Framework. A privacy notice says where the safeguards can be read, hence the link to [Decision 2021/914](https://eur-lex.europa.eu/eli/dec_impl/2021/914/oj?locale=fr). | [Anthropic DPA](https://www.anthropic.com/legal/data-processing-addendum); [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/), clauses 6.2 and 6.4; GDPR, article 13(1)(f) | Strong: their own terms |
| A UK controller pays the ICO a yearly data protection fee unless exempt (tier 1, £52 since 2025). | [ICO fee checker](https://ico.org.uk/fee-checker); [GOV.UK](https://www.gov.uk/government/consultations/data-protection-fee-regime-proposed-changes/outcome/data-protection-fee-regime-government-response) | Strong |
| Cloudflare, Inc.: 101 Townsend St, San Francisco, CA 94107; +1 (650) 319-8930. GitHub, Inc.: 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107; GitHub publishes no telephone, +1 877 448 4820 is its sales line. | [Cloudflare](https://www.cloudflare.com/fr-gender-equality-index); [datarequests.org](https://datarequests.org/company/github) | Strong; medium for GitHub's telephone |

Decision: the build writes « Mentions légales » and « Confidentialité » beside the app
(`build/legal.ts`), linked from the welcome page, every page beside the app and « Moi ». The
publisher and the hosts live in the central configuration, `src/brand.ts`, as the owner asked:
the identity is the same on every deploy and public by law, so a variable per deploy hid nothing
and only scattered it. `PUBLISHER` holds what both laws ask, for a French or a UK publisher; while
its name is empty, the pages say the publisher is named before launch. The host is Cloudflare, the
target, unless the GitHub Pages build says otherwise. The privacy page says what the code does,
checked in it: everything stays in the browser; a sentence to translate goes to the Worker, which
asks Claude or Workers AI and keeps the answer 90 days in KV without anything about who asked, and
counts requests per IP address for a minute (`worker/wrangler.jsonc`); without the Worker, the
DeepL link carries the sentence; the anonymous counts appear only in a build that sends them, with
their legal basis and the switch to object; speech and voices may go through the browser's own
services; no cookie. Left to the lawyer and the owner (D4): whether the publisher, if it is the UK
LLP, needs a representative in the EU (the translation service processes IP addresses and
sentences every day, which is hardly occasional) and pays the ICO fee.

## How we will know

- The owner times the first lesson on an iPhone: the ticket shows its minutes (RUNBOOK B7).
- Once measurement is on (RUNBOOK C1): the screen where most newcomers stop, per link
  (`npm run figures`), and the returns on day 1 and day 7 against the thresholds (RUNBOOK C).
