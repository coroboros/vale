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

## Found, not done

- A page's lesson in a language the traveller has no trip in opens home without a word
  (`openLesson` in `src/actions.ts`; the end-to-end test « … or home without one » holds it).
  Better: « Nouveau voyage » in that language, then that lesson (RUNBOOK A1).

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

## How we will know

- The owner times the first lesson on an iPhone: the ticket shows its minutes (RUNBOOK B7).
- Once measurement is on (RUNBOOK C1): the screen where most newcomers stop, per link
  (`npm run figures`), and the returns on day 1 and day 7 against the thresholds (RUNBOOK C).
