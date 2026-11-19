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
of Safari use without a visit, unless the app is on the home screen (RUNBOOK.md, « Done »); a lost or
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

## Open questions (for you)

- Prices for the pass (per week of trip? flat?) and the subscription.
- How many free translations a day; how long the reverse trial lasts.
- Commercial use of AI: the Claude Max monthly credits suit the private beta; check Anthropic's
  terms before serving paying customers with them, and budget a regular API account for launch.
- Legal: terms of sale, privacy policy (GDPR), company and invoicing setup.
- Stores or web, or both: where the pass sells, with the commission inside the price (RUNBOOK.md,
  D2, for the rules checked on 18 November 2026).
- The name: INPI and EUIPO searches (classes 9 and 41), domain, store names.
