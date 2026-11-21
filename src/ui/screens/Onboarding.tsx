/**
 * The last step pictures the learner there, saying a first sentence: imagining one's future self
 * using the language feeds the motivation to learn it (the « ideal L2 self », docs/LEARNING.md).
 */
import { signal } from '@preact/signals';
import { ArrowLeft } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { createProfiles, reachStep, startFirstLesson } from '../../actions';
import { BRAND, WELCOME } from '../../brand';
import { COURSES, flagOf, regionOf } from '../../content';
import { CUES } from '../../content/cues';
import type { Gender } from '../../content/types';
import { arrivedFrom, firstArrivedFrom } from '../../counts';
import { FIRST_STEPS } from '../../counts-api';
import { blankTrip, GOALS, PROFILE_COLORS } from '../../state/schema';
import { CountsLink } from '../CountsChoice';
import { Imagine } from '../Imagine';
import { InstallButton } from '../Install';
import { ChoiceGroup } from '../kit';
import { JOURNEY, Porthole } from '../Porthole';
import { photoOf, preload } from '../photos';
import { route } from '../router';
import { DateField, LanguageChoice, PlaceChoice } from '../Trip';
import { THEMES, themeVars } from '../themes';

/** Set when the welcome page opened onboarding: its first question comes first, « Retour » goes back to the page. */
export const fromWelcomePage = signal<{ back: () => void } | null>(null);

interface Traveller {
  name: string;
  gender: Gender;
}

export function Onboarding() {
  const r = route.value;
  const asked = r.name === 'learn' && COURSES.some(c => c.id === r.course) ? r : null;
  // From a page, its link chose the language and the page introduced Bagage; the welcome page
  // introduced it too (docs/UX.md).
  const welcomePage = fromWelcomePage.value;
  const first = asked ? FIRST_STEPS.indexOf('destination') : welcomePage ? FIRST_STEPS.indexOf('language') : 0;
  const [step, setStep] = useState(first);
  const screen = FIRST_STEPS[step]!;
  const [courseId, setCourseId] = useState(asked?.course ?? COURSES[0]!.id);
  const [region, setRegion] = useState('autre');
  const [trip, setTrip] = useState('');
  const [people, setPeople] = useState<Traveller[]>([{ name: '', gender: 'f' }]);
  const [goal, setGoal] = useState(40);
  const [cue, setCue] = useState('');
  const c = COURSES.find(x => x.id === courseId)!;
  const theme = THEMES[flagOf(c, region)];
  const last = FIRST_STEPS.indexOf('imagine');
  const names = people.map(t => t.name.trim());
  const canGo = screen !== 'travellers' || names.every(Boolean);
  const photo = photoOf(c.id, region);
  useEffect(() => {
    if (step === last - 1 && photo) preload(photo);
  }, [step, photo?.id]);
  useEffect(() => reachStep(screen, arrivedFrom()), [screen]);

  const setPerson = (i: number, patch: Partial<Traveller>) =>
    setPeople(ps => ps.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const finish = () => {
    reachStep('lesson', arrivedFrom());
    createProfiles(
      people.map((t, i) => ({
        name: names[i]!,
        gender: t.gender,
        color: PROFILE_COLORS[i % PROFILE_COLORS.length]!,
        trips: [{ ...blankTrip(c.id, c.id), region, date: trip }],
        trip: c.id,
        goal,
        cue,
      })),
      { welcome: true, source: firstArrivedFrom() },
    );
    // The lesson takes the place of onboarding's history entry (ui/welcome-page.tsx).
    startFirstLesson({ replace: welcomePage !== null, lessonId: asked?.course === c.id ? asked.lesson : undefined });
  };

  return (
    <div class={`stage onboarding${screen === 'welcome' ? ' is-welcome' : ''}`} style={themeVars(theme)}>
      {step > 0 && (
        <header class="stage-top">
          <button
            type="button"
            class="icon-btn"
            aria-label="Retour"
            onClick={() => (welcomePage && step === first ? welcomePage.back() : setStep(step - 1))}
          >
            <ArrowLeft size={24} />
          </button>
          <ol class="ob-dots" aria-label={`Étape ${step} sur ${last}`}>
            {Array.from({ length: last }, (_, i) => (
              <li key={i} class={i < step ? 'on' : ''} />
            ))}
          </ol>
        </header>
      )}

      <main class="stage-body">
        {screen === 'welcome' && (
          <div class="ob-welcome">
            <div class="welcome-art">
              <Porthole stops={JOURNEY} />
              <p class="porthole-hint">
                <span class="on-touch">{WELCOME.touch}</span>
                <span class="on-mouse">{WELCOME.mouse}</span>
              </p>
            </div>
            <div class="welcome-text">
              <h1 class="wordmark big-mark">{BRAND.name.toLowerCase()}</h1>
              <p class="lead">{BRAND.tagline}</p>
              <ul class="promise">
                {BRAND.promise.map(x => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <CountsLink />
            </div>
            <div class="welcome-actions">
              <button type="button" class="btn btn-primary btn-block" onClick={() => setStep(1)}>
                {WELCOME.start}
              </button>
              <InstallButton block secondary />
            </div>
          </div>
        )}

        {screen === 'language' && (
          <section class="ob-step" aria-labelledby="ob-1">
            <h1 id="ob-1">Quelle langue pour ce voyage ?</h1>
            <LanguageChoice
              value={courseId}
              onChange={id => {
                setCourseId(id);
                setRegion('autre');
              }}
            />
          </section>
        )}

        {screen === 'destination' && (
          <section class="ob-step" aria-labelledby="ob-2">
            <h1 id="ob-2">Où vas-tu ?</h1>
            <PlaceChoice course={c} value={region} onChange={setRegion} />
            {regionOf(c, region).pack && (
              <p class="muted">Bonus : quelques mots de la région t’attendent dans ton itinéraire.</p>
            )}
          </section>
        )}

        {screen === 'date' && (
          <section class="ob-step" aria-labelledby="ob-3">
            <h1 id="ob-3">Quand pars-tu ?</h1>
            <p class="muted">Pour estimer ce que tu retiendras le jour J.</p>
            <DateField value={trip} onChange={setTrip} />
            <button
              type="button"
              class="btn btn-ghost"
              onClick={() => {
                setTrip('');
                setStep(step + 1);
              }}
            >
              Je ne sais pas encore
            </button>
          </section>
        )}

        {screen === 'travellers' && (
          <section class="ob-step" aria-labelledby="ob-4">
            <h1 id="ob-4">Qui voyage ?</h1>
            {people.map((t, i) => (
              <div key={i} class="traveller">
                <label class="field">
                  <span>{i === 0 ? 'Ton prénom' : 'Prénom du second voyageur'}</span>
                  <input
                    class="input"
                    value={t.name}
                    maxLength={24}
                    autocomplete={i === 0 ? 'given-name' : 'off'}
                    onInput={e => setPerson(i, { name: e.currentTarget.value })}
                  />
                </label>
                <fieldset class="field">
                  <legend>Pour accorder les phrases</legend>
                  <div class="chips">
                    {(['f', 'm'] as const).map(g => (
                      <button
                        key={g}
                        type="button"
                        class="chip"
                        aria-pressed={t.gender === g}
                        onClick={() => setPerson(i, { gender: g })}
                      >
                        {g === 'f' ? 'Au féminin' : 'Au masculin'}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>
            ))}
            {people.length === 1 ? (
              <button type="button" class="btn" onClick={() => setPeople([...people, { name: '', gender: 'm' }])}>
                On part à deux
              </button>
            ) : (
              <button type="button" class="btn btn-ghost" onClick={() => setPeople(people.slice(0, 1))}>
                Je pars seul·e
              </button>
            )}
          </section>
        )}

        {screen === 'rhythm' && (
          <section class="ob-step" aria-labelledby="ob-5">
            <h1 id="ob-5">Ton rythme</h1>
            <ChoiceGroup
              name="goal"
              label="Objectif quotidien"
              value={goal}
              options={GOALS.map(g => ({ value: g.xp, title: g.label, sub: `${g.minutes} minutes par jour` }))}
              onChange={setGoal}
            />
            <h2 class="ob-sub">Quand vas-tu pratiquer ?</h2>
            <p class="muted">Choisir un moment précis aide vraiment à s’y tenir.</p>
            <div class="chips">
              {CUES.map(x => (
                <button key={x.id} type="button" class="chip" aria-pressed={cue === x.id} onClick={() => setCue(x.id)}>
                  {x.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {screen === 'imagine' && (
          <Imagine
            course={c}
            region={region}
            date={trip}
            travellers={[names[0] ?? '', ...names.slice(1)]}
            cue={cue}
            goal={goal}
          />
        )}
      </main>

      {step > 0 && (
        <footer class="stage-foot">
          {step < last ? (
            <button type="button" class="btn btn-primary btn-block" disabled={!canGo} onClick={() => setStep(step + 1)}>
              Continuer
            </button>
          ) : (
            <button type="button" class="btn btn-primary btn-block" onClick={finish}>
              Apprendre ma première phrase
            </button>
          )}
          {step === first && asked && <CountsLink />}
        </footer>
      )}
    </div>
  );
}
