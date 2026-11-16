# ¡Vale!

Survival Spanish (Spain) for French speakers. An installable web app that works 100 % offline once opened: no account, no ads, no tracking.

**App:** https://coroboros.github.io/vale/

## Install on iPhone

1. Open the link above in Safari.
2. Share → *Sur l'écran d'accueil* → *Ajouter*.
3. Launch it once from the home-screen icon while online. The whole app (one HTML file, ~280 KB) is then cached by the service worker; *Profil → Réglages* shows *Prête hors ligne*.
4. Check in airplane mode: force-quit, relaunch, it opens.

Progress is stored on the device (`localStorage`, key `vale-v3`). Home-screen web apps keep their storage; Safari tabs may not.

## What's inside

- Path of lessons (110+ phrases) with Duolingo-style exercises: learn, recognise, listen, word tiles, dictation, speak (record and compare with the model voice), matching rounds, test-out.
- Role-play scenes (café, tapas, taxi, hotel, street, pharmacy) with hints and translations.
- Practice: mistakes, spaced review, 60-second pairs, prices by ear, hands-free audio, two-player duel.
- Survival card (help phrase, hotel address, allergies, diet) shown full-screen to show a waiter or driver.
- Lexicon with strength meters, favourites and regional packs (Catalan, Basque, Galician).
- Profiles for two travellers on one phone, daily goal, streak, quests, badges.

Speech uses the device's built-in voices (Web Speech API). There is no speech recognition: installed iOS web apps don't expose it, and it would send audio off the device.

## Develop

```sh
node build.js                                    # src/ + fonts/ → docs/index.html, sw.js, manifest
python3 brand/make_icons.py brand/icon.svg docs/icons   # only when the icon changes
python3 tests/e2e.py                             # Playwright pass at iPhone size, incl. offline reload
```

`docs/` is what GitHub Pages serves. Every build gets a content-hash cache name, so installed apps pick up the new version and show an update prompt.

## Layout

```
src/        app.js (UI and engine), data.js (content), style.css (design system)
brand/      icon.svg and the PNG renderer
fonts/      Nunito 600–900, latin subset (SIL Open Font License, see OFL.txt)
tests/      end-to-end test
docs/       built app (GitHub Pages)
```
