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
shell takes the colours and pattern of the country being learned. He jumps when a session goes
well, makes a sorry face when an answer is wrong, and never scolds. On the welcome screen his
eyes follow the mouse or the finger and he blinks; both stop for people who ask for less motion,
and the blinking stops when the journey is paused.

## App icon

`brand/icon.svg` is the only source; `sh brand/make-icons.sh` writes the favicon, the iOS and
manifest PNGs and the maskable copy. Bernard fills the frame, without scenery or fine detail, so he
still reads at tab size (32 px on a computer, about 84 px in Safari's tab overview on an iPhone).
The maskable copy shrinks him to 80 %, inside the circle of radius 40 % that Android may crop to
(Web Application Manifest, icon masks and safe zone).

## Colours and type

Each language has a theme (`src/ui/themes.ts`), applied to primary actions, progress and the shell:

| Theme | Language | Accent | Shell motif |
| --- | --- | --- | --- |
| Sol | Spanish | sun yellow `#FFB21E` | blue tiles |
| Laguna | Italian | lagoon teal `#0B7C8C` | yellow waves |

- Warm paper background `#FFFAF3`, ink `#16213E`.
- Red and green are kept for right and wrong answers only, so no theme uses them.
- Every text and background pair meets WCAG 2.2 AA; a unit test checks the tokens.
- Type: Bricolage Grotesque for titles, Atkinson Hyperlegible Next for text (drawn for legibility,
  with distinct letter shapes and a slashed zero).

## Voice

French, *tu*, short sentences, concrete situations. Errors are explained, never apologised for.
