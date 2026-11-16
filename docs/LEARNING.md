# Why the app teaches the way it does

Each choice below names the evidence behind it and how strong that evidence is for this use.
Where the app goes beyond what the research shows, it says so.

| Choice in the app | Evidence | Strength for this app |
| --- | --- | --- |
| Phrases come back for review just before they would be forgotten, each on its own schedule (FSRS-7, target recall 90 %). | Spacing beats massed study ([Cepeda et al., 2006](https://doi.org/10.1037/0033-2909.132.3.354)); recalling beats re-reading ([Rowland, 2014](https://doi.org/10.1037/a0037559)). FSRS predicts recall better than older schedulers on public review data ([srs-benchmark](https://github.com/open-spaced-repetition/srs-benchmark)). | Strong and general. |
| Exercises get harder as a phrase strengthens (recognise, then recall with help, then produce), aiming at about 85 % right answers. | Learning is fastest at roughly 85 % accuracy for a broad class of learning models ([Wilson et al., 2019](https://doi.org/10.1038/s41467-019-12552-4)). | Theoretical result for simple decision tasks. Applying it to phrase drills is our extrapolation. |
| A new phrase often opens with a guess before it is taught. | Answering before studying improves later memory when the answer follows ([Pan & Carpenter, 2023](https://doi.org/10.1007/s10648-023-09814-5); meta-analysis: [St. Hilaire et al., 2024](https://doi.org/10.3758/s13423-023-02353-8)). | Good. |
| Listening drills rotate between the voices available on the device. | High-variability phonetic training, many speakers rather than one, improves L2 perception ([Uchihara, Karas & Thomson, 2025](https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6), 79 studies). | Good for perception; the extra benefit of several voices over one is small. Depends on the voices installed. |
| Mistakes never block a lesson; there are no hearts or energy. | Errors made while guessing or retrieving are part of learning (rows above). Duolingo itself dropped “one mistake costs a heart” as not the most effective way to support learning ([Duolingo, 2025](https://blog.duolingo.com/duolingo-energy/)). | Design judgement, consistent with the evidence. |
| The streak survives a missed day thanks to jokers, earned by practising and spent automatically. | Showing an intact streak increases the next engagement; a broken one lowers it, unless it can be repaired ([Silverman & Barasch, 2023](https://doi.org/10.1093/jcr/ucac029)). | Good, from consumer behaviour studies, not language learning. |
| Onboarding asks *when* you will practise (“with my morning coffee”). | Forming an if-then plan helps people act on their goals ([Gollwitzer & Sheeran, 2006](https://doi.org/10.1016/S0065-2601(06)38002-1), meta-analysis). | Good. Reminders at that moment are still to come (TODO.md). |
| The trip frames everything: destination, departure date, “imagine” screen, memory forecast for landing day. | Learners’ image of their future self using the language goes with more intended effort ([Al-Hoorie, 2018](https://doi.org/10.14746/ssllt.2018.8.4.2), meta-analysis); its link with actual achievement is weak. | Motivation only. The forecast itself is a direct readout of the memory model. |
| Bernard the mascot reacts to answers. | Animated pedagogical agents have a small positive effect on learning ([Castro-Alonso et al., 2021](https://doi.org/10.1007/s10648-020-09587-1), meta-analysis). | Small effect; mostly for warmth. |
| Daily challenges, chest, passport stamps, XP. | Common game mechanics; no specific causal evidence that they improve learning. | Unproven. Kept light so they never replace review. |

## Not proven yet

- That this combination keeps people practising longer than other apps. It needs measurement
  (TODO.md, *Measure before claiming*).
- That pronunciation written “the French way” does not slow down accurate pronunciation in the long
  run. It helps on day one, which is the app’s promise; it can be turned off in *Moi*.
- The quality of translations from the translation service has not been evaluated on a test set.
