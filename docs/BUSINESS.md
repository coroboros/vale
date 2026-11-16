# Business model: proposal

Status: a proposal to decide on, not a plan. Every figure below is an outside benchmark or an
estimate; ours will only be known once step 6 of the runbook (measurement) is live.

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
- **Payments:** Stripe Checkout on the web (the app is a web app, outside app-store billing), a
  webhook on the Worker records the entitlement. VAT and refunds through Stripe Tax and a clear
  refund rule for passes.
- **What a purchase unlocks:** the Worker checks the entitlement before serving premium lessons
  and before each translation or conversation turn, with a monthly cap per user. Whatever ships
  inside the free app bundle is free in practice, so premium content is downloaded after
  purchase (and kept offline).

## Open questions (for you)

- Prices for the pass (per week of trip? flat?) and the subscription.
- How many free translations a day; how long the reverse trial lasts.
- Commercial use of AI: the Claude Max monthly credits suit the private beta; check Anthropic's
  terms before serving paying customers with them, and budget a regular API account for launch.
- Legal: terms of sale, privacy policy (GDPR), company and invoicing setup.
