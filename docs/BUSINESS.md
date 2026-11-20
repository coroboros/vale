# Business model: proposal

Status: a proposal to decide on, not a plan. Every figure below is an outside benchmark or an
estimate; ours will only be known once measurement (RUNBOOK.md, C1 and « Decision figures ») is live.

## Principles

- **Free keeps the promise.** Someone leaving next week can learn the survival phrases of every
  theme, hear them, keep the survival card and translate a few sentences, without paying and
  without an account. Trust first; it is also what people recommend.
- **Pay for what costs money or goes deeper:** translations and AI conversation (each one has a
  real cost), the full lessons and scenes, every destination.
- **No ads, no dark patterns.** Cancelling takes two taps, no fake countdowns, prices shown before
  any card is asked. The brand promises « Sans pub »; the rest follows from it.

## The offer to test

| | Free | Pass voyage | Subscription |
| --- | --- | --- | --- |
| For | trying, a last-minute trip | one trip | frequent travellers, several languages |
| Lessons | first lesson of every theme, sounds, survival card | everything for the trip's language | everything, every language |
| Translation | a few new sentences a day (history stays free) | generous, fair use | generous, fair use |
| AI conversation | a short taste | included, monthly cap | included, monthly cap |
| Billing | none | one payment, until the return date, no renewal | monthly or yearly |

The **Pass voyage** fits how people use the app: they learn before a trip, with a date. Paying
once until the return date avoids subscription fatigue and can be priced from the trip length.
Profiles on one phone (a couple sharing a device) share the pass.

The flip side (external review, 18 November 2026): one payment per trip is little revenue per
person and none in between trips. It only works if acquiring a traveller costs close to nothing,
and buying again for the next trip becomes the figure to watch. Test that people pay at all,
with the simplest payment link, before building accounts and entitlements (RUNBOOK.md, D3).

## Where travellers come from

Two channels cost nothing, and the counts already say which link brought each traveller
(`utm_source`, RUNBOOK.md, D1): the pages per situation (docs/SEARCH.md) and the survival card,
sent as a picture to whoever travels with you. People who join through someone they know tend to
be worth more: at a German bank, customers brought by a referral were worth at least 16 % more and
left about 18 % more slowly, over some 10,000 customers followed for almost three years ([Schmitt,
Skiera & Van den Bulte, 2011](https://doi.org/10.1509/jmkg.75.1.46)). Medium for Bagage: the bank
rewarded each referral and the card carries no reward, and the study speaks of who comes, not of
how many.

## How people move from free to paid

Graded by evidence, strongest first:

1. **Ask at the moment of value.** The pass is offered when someone opens a locked scene or wants
   one more translation, with their own trip date (« Départ dans 12 jours : pass jusqu'au
   retour »). Benchmark: subscription apps report much higher conversion with an early paywall
   than with freemium, at the cost of fewer users (RevenueCat, State of Subscription Apps 2026).
2. **Reverse trial.** New learners get everything for their first days, then fall back to free.
   Industry reports put reverse trials at 4–6 % conversion as good and 8–12 % as great for
   self-serve products (ChartMogul, The Conversion Report); not academic evidence.
3. **Foot in the door.** Small steps first (choose a destination, learn a first phrase, keep a
   translation), the bigger ask later. The effect is real but small: three meta-analyses agree it
   beats chance, with small correlations (Burger, 1999,
   [doi:10.1207/s15327957pspr0304_2](https://doi.org/10.1207/s15327957pspr0304_2)). The
   onboarding already works this way; do not expect much from it alone.
4. **Endowment.** Progress the learner sees (memory forecast for landing day, stamps, history)
   makes the pass about keeping momentum, not unlocking a feature.

## Accounts and payments (technical outline)

- **Local first.** No account to learn. An account appears only to buy or to sync devices.
- **Sign-in:** passkeys, with an email link as the fallback. Users and entitlements in Cloudflare
  D1, read by the same Worker.
- **Payments:** Stripe Checkout on the web, a webhook on the Worker records the entitlement. This
  holds only outside the stores: in a store app, digital purchases follow the store's rules and
  commissions (RUNBOOK.md, D2). VAT and refunds through Stripe Tax and a clear
  refund rule for passes.
- **What a purchase unlocks:** the Worker checks the entitlement before serving premium lessons
  and before each translation or conversation turn, with a monthly cap per user. Whatever ships
  inside the free app bundle is free in practice, so premium content is downloaded after
  purchase (and kept offline).

## Cloud backup: an option to study

Today the only copy of someone's progress is on their phone. Safari deletes it after seven days
of Safari use without a visit, unless the app is on the home screen ([WebKit,
2020](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)); a lost or
replaced phone loses it, and a second device cannot share it. *Moi* offers a manual export, and
that stays free.

**The offer.** Automatic backup and the same progress on every device, sold alone at a small yearly
price or included in the subscription and in the pass until the return date. Fixed card fees take
a large share of very small payments (an inference, not checked against a processor's rates), so
the bundle is the main road and the standalone price a test.

**What it costs us.** Cloudflare R2, Standard storage, from its
[pricing page](https://developers.cloudflare.com/r2/pricing/) (updated 30 October 2026):

| | Price | Free every month |
| --- | --- | --- |
| Storage | $0.015 per GB-month | 10 GB-month |
| Writes (Class A) | $4.50 per million | 1 million |
| Reads (Class B) | $0.36 per million | 10 million |
| Egress | free | |

Our estimate, computed from the shape of the stored record and not measured on real learners: a
heavy learner (600 phrases in two languages, 200 days of practice, 150 translations) stores about
160 KB, 25 KB compressed. With one backup per day of practice and seven kept, 10,000 subscribers
fit in the free allowance, and 100,000 cost about $9 a month, mostly writes. Storage is not the
cost; accounts, payments and the privacy work are.

**What it needs.** Accounts and payments (below), and a privacy design that keeps the promise
« nothing readable leaves the phone »: encryption on the device, the server only keeps
ciphertext. The hard part is recovery when every device is lost; a key derived from the
traveller's passkey is one route (to check against browser support when building it). Then the
GDPR side: privacy policy, deletion and export on request.

## Rewards beyond the app (studied 20 November 2026)

The idea: shells unlock real things at set levels, such as a 1 GB eSIM from a partner, a compass,
binoculars. Not now, for three reasons.

- Expected, tangible rewards for doing an activity lower the wish to do it once they stop. Across
  128 experiments, rewards for taking part, finishing or reaching a level all reduced free-choice
  intrinsic motivation (d = −0.40, −0.36 and −0.28), while positive feedback raised it (d = 0.33)
  ([Deci, Koestner & Ryan, 1999](https://doi.org/10.1037/0033-2909.125.6.627), meta-analysis,
  abstract read). [Cameron, Banko & Pierce (2001)](https://doi.org/10.1007/BF03392017) disagree:
  rewards tied to a level of performance did no harm, and rewards for dull tasks helped. Shells
  pay for practising, the case both sides treat as the riskiest, and practising for one's own trip
  is not a dull task.
- A reward needs someone to send it to: an account and an address, which Bagage does not keep,
  and a guard against shells farmed on easy exercises.
- It costs money before « The offer to test » has said anything.

What fits instead: an eSIM partner's offer as the trip draws near, a service at the moment of
need rather than a prize, through an affiliate link that earns instead of costing (your decision,
after a privacy check of the partner's link); and rewards inside the story. A hermit crab moves to
a bigger shell as it grows, so a level could give Bernard a new shell from the trip's country
(TODO.md).

## Open questions (for you)

- Prices for the pass (per week of trip? flat?) and the subscription.
- How many free translations a day; how long the reverse trial lasts.
- Commercial use of AI: the Claude Max monthly credits suit the private beta; check Anthropic's
  terms before serving paying customers with them, and budget a regular API account for launch.
- Legal: terms of sale, privacy policy (GDPR), company and invoicing setup.
- Stores or web, or both: where the pass sells, with the commission inside the price (RUNBOOK.md,
  D2, for the rules checked on 18 November 2026).
- The name: INPI and EUIPO searches (classes 9 and 41), domain, store names.
