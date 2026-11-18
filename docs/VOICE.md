# Voices and live conversation

Plans for the two voice features in TODO.md. Facts carry their source; estimates say so.

## AI voices for every phrase

Today the app speaks with the phone's own voices: free and offline, but robotic on some devices.

- **Model.** Fish Audio S2.1 Pro, their current model: 83 languages (the published list of the
  previous model, S1, already had Spanish, Italian, Portuguese and English), WebSocket streaming
  available [1][2]. It costs $15 per million bytes of text; the free variant
  runs until 30 November 2026, with no service level, and is meant for testing [3][2].
- **Generated once, not at run time.** The four courses have 666 distinct phrases (249 Spanish,
  141 Italian, 139 Portuguese, 137 English: lessons, regional packs, menus and false friends, both
  sides of the scenes, the survival card), 10 KB of text in all, counted from `src/content/`. Two
  voices therefore cost about $0.30 per full run. A CI script writes one Opus file per phrase and voice, named by a hash of the
  text, voice and model, so a run only regenerates what changed.
- **Offline.** The files of the language being learnt go into the service worker's cache, about
  1.3 MB per language and 5 MB for all four (estimate: 1.3 s per phrase at 24 kbit/s). The phone's voices stay as the fallback.
- **Choice.** One female and one male voice per language, picked in *Moi*. Listening drills can
  still alternate both: hearing several speakers helps (see `src/platform/speech.ts`).
- **Rights.** Paid use carries commercial rights, but not for a voice you have no rights to: Fish
  Audio's terms forbid using a real person's voice without consent [4][5]. Use their Voice Design
  (original voices) or voices with proven rights, never a clone.
- **Quality check.** A native speaker per language approves the voices and twenty phrases
  (Castilian Spanish for Spain, Italian stress, European Portuguese, British English).

## Live conversation, light on data

Talk with Bernard by voice inside the course's situations (hotel desk, restaurant, pharmacy). He
answers in the language, corrects gently in French, and the phrases practised feed the memory
model. Audio only: Bernard is animated on the phone, as on the welcome screen, so no video crosses
the network.

Data matters on a small plan or a weak network. Inside the EU a French plan roams at home prices,
with a fair-use cap only on unlimited or very cheap data, and only 4.65 % of data roamers went
over it in Q3 2024 [6][7]. Outside the EU, and in a metro or a mountain village, that does not
hold.

- **Transport decides the data used.** Opus needs 16 to 20 kbit/s for wideband speech [8], about
  9 MB per hour each way. The raw 16-bit audio that the realtime APIs take over a WebSocket is far
  heavier: 16 kHz in and 24 kHz out for Gemini Live [9], 24 kHz by default for OpenAI Realtime
  [10], that is 256 to 384 kbit/s, about 115 to 175 MB per hour, before base64 adds a third.
- **So:** the phone sends Opus over WebRTC to Cloudflare's nearest location, where Realtime hands
  the audio to a Worker as PCM [11]. The heavy formats stay between Cloudflare and the models:
  speech-to-text (Workers AI Deepgram Nova 3 or Flux [11]), Claude for the reply (text; we found
  no realtime voice endpoint in Anthropic's API, and its cookbook pairs Claude with separate
  speech services [12]), and Fish Audio for the voice.
- **Data-saver mode:** recognition on the phone and the phone's voice, so only text travels.
- **Honesty:** show the megabytes and the minutes left after each conversation.
- It needs the network. Lessons, phrases and the survival card stay offline.

## Sources

1. Fish Audio, [Models overview](https://docs.fish.audio/developer-guide/models-pricing/models-overview)
2. Fish Audio, [Developers](https://fish.audio/developers/)
3. Fish Audio, [Pricing and rate limits](https://docs.fish.audio/developer-guide/models-pricing/pricing-and-rate-limits)
4. Fish Audio, [AI voice generator](https://fish.audio/ai-voice-generator/) (commercial use needs a paid plan and rights to the voice)
5. Fish Audio, [Voice ownership disputes](https://fish.audio/blog/voice-ownership-dispute-fish-audio/)
6. European Commission, [Roaming: questions and answers](https://digital-strategy.ec.europa.eu/en/faqs/roaming-questions-answers)
7. European Commission, [Staff working document SWD(2025) 164](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52025SC0164)
8. IETF, [RFC 7587, RTP payload format for Opus](https://datatracker.ietf.org/doc/html/rfc7587), section 3.1.1
9. Google, [Live API capabilities guide](https://ai.google.dev/gemini-api/docs/live-guide)
10. OpenAI, [Realtime client events](https://developers.openai.com/api/reference/resources/realtime/client-events)
11. Cloudflare, [Cloudflare is the best place to build realtime voice agents](https://blog.cloudflare.com/cloudflare-realtime-voice-ai/)
12. Anthropic, [Low latency voice assistant with ElevenLabs](https://platform.claude.com/cookbook/third-party-elevenlabs-low-latency-stt-claude-tts)
