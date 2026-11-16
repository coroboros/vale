# To do

## Next

- **Live conversation partner.** Talk with an AI tutor in real time, by voice, inside the course’s
  situations (hotel desk, restaurant, pharmacy). The learner picks an avatar style: realistic,
  cartoon or anime. It should reuse the scenes’ goals, correct gently in French, and log the
  phrases it practised into the memory model. Technology to be chosen with the owner.
- **Understand what you hear and read.** Translation the other way (Spanish or Italian into
  French), from typed text first, then from a photo of a menu or a sign.
- **Measure before claiming.** Opt-in, anonymous counts (sessions finished, day-1 and day-7 return,
  answer accuracy per exercise kind) to check the engagement and difficulty hypotheses in
  docs/LEARNING.md. Nothing personal, nothing about the sentences translated.
- **Reminders.** Web Push at the practice moment the learner chose (iOS 16.4+ for installed apps),
  sent by a Cloudflare Worker with VAPID keys.

## Product

- More destinations: Portuguese (Portugal and Brazil), Greek, German; one theme and shell pattern
  per country.
- Speech checking for the speaking exercise, on the device if possible (today the learner judges
  their own attempt after hearing the model).
- Sync between devices and profiles shared across phones, without accounts (passphrase,
  Durable Objects).
- Turnstile on the translation service if abuse ever shows up in the Worker logs.

## Housekeeping

- **Rename the repository** once the name is final. The Pages address follows the repository name
  (`/vale/`), and the address is what browsers and installed apps use to find their data and
  service worker: a new address starts empty. Before renaming, either move to a custom domain, or
  export a backup from *Moi* on each phone and import it on the new address.
- **Close the code.** GitHub Pages on a private repository needs a paid plan; Cloudflare Workers
  static assets is the natural home then, next to the translation Worker. Stop publishing source
  maps at the same time.
- Lighthouse in CI with budgets (performance, accessibility, best practices).
