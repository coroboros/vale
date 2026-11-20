# Name and identity

## Bagage

**Parle dès l’atterrissage.** (“Speak as soon as you land.”)

- A French word every French speaker knows, tied to travel, and neutral about the destination: it
  works for Spanish, Italian and any language added later.
- Short, easy to say, no pun to explain.
- The promise is concrete: what you pack before you leave, ready on arrival.

### Names set aside

| Name | Why not |
| --- | --- |
| ¡Vale! (the first version) | Spanish only; a large company already uses the name (Vale S.A.). |
| Bagou | “Avoir du bagou” leans pejorative (glib talker); an app named Bagoo exists. |
| Papote | Close to an existing app (papo). |
| Escale | An app named Escales exists. |
| Parla, Alo | Crowded: many language and calling apps use them. |
| Dilo | Already used by a journaling app. |

Still to check before any public launch: trademark classes 9 and 41 (INPI, EUIPO), a domain name,
and the name on the app stores.

## Bernard

A hermit crab, *bernard-l’ermite* in French, who carries his home on his back like luggage. His
shell wears the flag of the country being learned. He jumps when a session goes well, makes a
sorry face when an answer is wrong, and never scolds. Wherever he appears, his eyes follow the
mouse or the finger and he blinks, as on the welcome screen; both stop for people who ask for
less motion, and the blinking stops when the welcome journey is paused.

## Shells

What the code stores as XP, travellers see as *coquillages*, Bernard's shells: « XP » is
video-game shorthand that confused the owner, a French traveller like the ones Bagage is for
(20 November 2026). Only the word changed: a right answer still earns at least one shell, and the
stored data keeps its `xp` keys. `shells()` in `src/engine/progress.ts` writes the word, singular
for 0 and 1 as French does; the verb is *ramasser*, what one does with shells on a beach. In the
session summary the count wears Lucide's spiral shell, the shape of Bernard's own.

## Icons

Lucide everywhere, plus four drawn on its grid in `src/ui/icons.tsx`, where Bernard's beach can
carry the meaning: the itinerary as a treasure map with its dotted trail, the survival card as a
luggage tag (the brand's own object), « Moi » as a traveller in a sun hat, and the daily chest as
a treasure chest (it was a gift box). Every tab keeps its label: people predicted what a labelled
icon does 88 % of the time, against 60 % unlabelled and 34 % for unlabelled icons unique to one app
(UserTesting, reported in [Smashing Magazine, 2016](https://www.smashingmagazine.com/2016/10/icons-as-part-of-a-great-user-experience));
few icons are universal and navigation icons need visible labels
([NN/g, Icon Usability](https://www.nngroup.com/articles/icon-usability/)); both read from
excerpts. With labels, a themed icon costs little meaning; what it can cost is telling the tabs
apart at a glance.

So we measured that: each set of five rendered at 96 px, reduced to 12 × 12 and compared pair by
pair (cosine similarity, lower is more distinct; a one-off script, the numbers kept here).
The previous set: 0.44 on average, closest pair 0.56. All five themed, with a beach volleyball for
« Entraînement » and a scroll for « Phrases »: 0.50, closest 0.69, as a ball and a scroll are both
full shapes. Keeping the dumbbell, the practice icon learners know from other apps, with a speech
bubble for the phrases one says: 0.41, closest 0.57, the most distinct of the three, so that is
the set. A message in a bottle read as a beer bottle at 24 px and was dropped. Not measured:
whether travellers recognise them. The tabs keep their places.

## App icon

`brand/icon.svg` is the only source; `sh brand/make-icons.sh` writes the favicon, the iOS and
manifest PNGs and the maskable copy. Bernard fills the frame, without scenery or fine detail, so he
still reads at tab size (32 px on a computer, about 84 px in Safari's tab overview on an iPhone).
The maskable copy shrinks him to 80 %, inside the circle of radius 40 % that Android may crop to
(Web Application Manifest, icon masks and safe zone).

## Colours and type

Each trip wears its country's colours (`src/ui/themes.ts`, from `flagOf`: the destination's flag
when it is in another country than the course's, else the course's): the accent goes on primary
actions and progress, the whole flag on Bernard's shell.

| Country | Course | Accent | Shell |
| --- | --- | --- | --- |
| Spain | Spanish | flag gold `#F1BF00` | red and gold bands |
| Italy | Italian | flag green `#007A3D` | green, white and red |
| Portugal | Portuguese | azulejo blue `#1D5FBF` | green and red, the armillary sphere |
| United Kingdom | English | Union Jack navy `#012169` | the Union Jack |
| Ireland | English, in Dublin | emerald `#1FA36A`, ink text | green, white and orange |
| United States | English, in New York | canton blue `#3C3B6E` | stripes and a starred canton |

- Warm paper background `#FFFAF3`, ink `#16213E`.
- Red is kept for wrong answers, so it appears only inside flags. Portugal's flag is mostly red,
  hence the blue of its azulejos. Italy's green sits close to the right-answer green, which is
  why right and wrong answers always come with an icon and words, never colour alone.
- Every text and background pair meets WCAG 2.2 AA; a unit test checks the tokens.
- Type: Bricolage Grotesque for titles, Atkinson Hyperlegible Next for text (drawn for legibility,
  with distinct letter shapes and a slashed zero).

## Motion

Two families, one rule each, defined once in `src/styles/kit.css`. Raised controls (buttons,
answer choices, tiles, the play and microphone buttons) behave like keys: they rise by 2 px under
a mouse and sink when pressed. Flat controls (icon buttons, chips, navigation) take a tint under
a mouse and give a little when pressed. Hover effects only exist on devices that can hover, and
all of it stops for people who ask for less motion. Drawings that keep moving, the welcome
journey, a trip's window in « Mes voyages » and the pages' drawing, carry the same pause button
(`MotionToggle`): anything that moves for more than five seconds must offer one (WCAG 2.2.2).

The porthole flies (20 November 2026). Its clouds, land and boats are drawn three times, one width
apart, and slide by that width in a loop, the nearer the faster (a turn takes 140 s for the
clouds, 120 s far off, 72 s in the middle, 44 s up close), as from a plane window: the place's
landmarks come round one after the other, New York's statue included. So a scene's continuous
lines end at x = 360 where they start at x = 0: all 23 scenes were checked on their unrolled
strips, and the cliffs, quays and beaches that met an edge now slope into the sea past it. The
sky carries one traveller per scene, from seven kinds in `scenery/parts.tsx` sharing three
movements: birds, gulls or storks fly past, a balloon or a paraglider drifts, a plane with its
banner or a helicopter crosses the whole window. Pausing stops all of it on the composed picture,
and reduced motion never starts it.

New York is its statue, on her island with the skyline behind and the orange ferry in front;
Brooklyn Bridge went, as its deck could not loop. Weak scenes got a landmark or contrast: Palma's
cathedral across the Balearic bay, the statue on Monte Urgull and a larger Santa Clara in La
Concha, Santana houses on Madeira's cliff, warmer stone for Madrid's gate, a bluer sky and a
golden Madonnina for Milan.

## Photos

The last step of onboarding (« Imagine ») shows the chosen destination in a photo: the landmark
seen from where a traveller would stand, a café terrace or a street rather than an aerial view, in
daylight. It is the one place where Bagage uses photography; everywhere else the scenery is drawn.

- Every photo comes from Wikimedia Commons under a license that allows reuse: public domain,
  CC0, CC BY or CC BY-SA. `brand/photos.py` refuses anything else.
- The credit under each photo names the author, links the license and the Commons file page,
  and says the photo was cropped, as the CC licenses ask. The script copies author and license
  from Commons into `src/ui/photos.json`, so the credit cannot drift from the file page.
- On a phone or any upright screen, the photo fills the top of the screen untouched and the words
  sit on the page below it, rising over its lower edge, with Bernard standing on that edge. Asking
  people to imagine works when the picture is vivid and can backfire when it is not ([Petrova &
  Cialdini, 2005](https://doi.org/10.1086/497556)); text over a photo either hides it or fails
  contrast ([NN/g, Harley, 2015](https://www.nngroup.com/articles/text-over-images/)), and
  viewing time falls off below the first screen
  ([NN/g, 2018](https://www.nngroup.com/articles/scrolling-and-attention/)). The photo gives way
  first when the words need room, so nothing scrolls from 375 × 667 up.
- On a wide screen there is room for both: the whole photo, and the words on a card tinted at 62 %
  near-black, where white text keeps 5.4:1 even over a white sky.
- Measured on screenshots of the same step (Andalusia, a short and a 23-letter first name), share of
  the screen where the photo shows untouched, before and after 19 Nov 2026: 375 × 667, 7 % → 30 to
  37 %, and no more scrolling (42 to 175 px before); 390 × 844, 9 to 20 % → 28 to 36 %; 768 × 1024,
  51 to 54 % → 55 to 59 %; 1440 × 900, 57 to 59 % → 81 to 82 %. Only 320 × 568 still scrolls a
  little (73 px at most, 341 before). Not measured yet: whether it changes who starts the first
  lesson or comes back.
- To add or change a destination: edit its entry in `src/ui/photos.json` (Commons file, focus,
  alt text), then run `python3 brand/photos.py fetch render` from a machine that reaches Commons.
  A unit test fails while a destination has no photo or a file is missing.

## Voice

French, *tu*, short sentences, concrete situations. Errors are explained, never apologised for.
