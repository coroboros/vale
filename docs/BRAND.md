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
all of it stops for people who ask for less motion.

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
