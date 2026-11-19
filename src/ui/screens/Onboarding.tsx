/**
 * The last step pictures the learner there, saying a first sentence: imagining one's future self
 * using the language feeds the motivation to learn it (the « ideal L2 self », docs/LEARNING.md).
 */
import { ArrowLeft } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { createProfiles, startFirstLesson } from '../../actions';
import { BRAND } from '../../brand';
import { COURSES, courseById, flagOf, regionOf } from '../../content';
import { CUES } from '../../content/cues';
import type { Gender } from '../../content/types';
import { blankTrip, GOALS, PROFILE_COLORS } from '../../state/schema';
import { Imagine } from '../Imagine';
import { InstallButton } from '../Install';
import { ChoiceGroup } from '../kit';
import { Porthole, type Stop, stopOf } from '../Porthole';
import { photoOf, preload } from '../photos';
import { DateField, LanguageChoice, PlaceChoice } from '../Trip';
import { THEMES, themeVars } from '../themes';

/** The welcome flight: a short loop over the four languages, rather than every destination. */
const JOURNEY: Stop[] = (
  [
    ['es', 'barcelone'],
    ['it', 'roma'],
    ['pt', 'lisbonne'],
    ['en', 'londres'],
    ['es', 'andalousie'],
    ['it', 'venezia'],
  ] as const
).map(([courseId, regionId]) => {
  const c = courseById(courseId);
  return stopOf(c, regionOf(c, regionId));
});

interface Traveller {
  name: string;
  gender: Gender;
}

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [courseId, setCourseId] = useState(COURSES[0]!.id);
  const [region, setRegion] = useState('autre');
  const [trip, setTrip] = useState('');
  const [people, setPeople] = useState<Traveller[]>([{ name: '', gender: 'f' }]);
  const [goal, setGoal] = useState(40);
  const [cue, setCue] = useState('');
  const c = COURSES.find(x => x.id === courseId)!;
  const theme = THEMES[flagOf(c, region)];
  const last = 6;
  const names = people.map(t => t.name.trim());
  const canGo = step !== 4 || names.every(Boolean);
  const photo = photoOf(c.id, region);
  useEffect(() => {
    if (step === last - 1 && photo) preload(photo);
  }, [step, photo?.id]);

  const setPerson = (i: number, patch: Partial<Traveller>) =>
    setPeople(ps => ps.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const finish = () => {
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
    );
    startFirstLesson();
  };

  return (
    <div class={`stage onboarding${step === 0 ? ' is-welcome' : ''}`} style={themeVars(theme)}>
      {step > 0 && (
        <header class="stage-top">
          <button type="button" class="icon-btn" aria-label="Retour" onClick={() => setStep(step - 1)}>
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
        {step === 0 && (
          <div class="ob-welcome">
            <div class="welcome-art">
              <Porthole stops={JOURNEY} />
              <p class="porthole-hint">
                <span class="on-touch">Touche le hublot, ou Bernard.</span>
                <span class="on-mouse">Clique sur le hublot, ou sur Bernard.</span>
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
            </div>
            <div class="welcome-actions">
              <button type="button" class="btn btn-primary btn-block" onClick={() => setStep(1)}>
                C’est parti
              </button>
              <InstallButton block secondary />
            </div>
          </div>
        )}

        {step === 1 && (
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

        {step === 2 && (
          <section class="ob-step" aria-labelledby="ob-2">
            <h1 id="ob-2">Où vas-tu ?</h1>
            <PlaceChoice course={c} value={region} onChange={setRegion} />
            {regionOf(c, region).pack && (
              <p class="muted">Bonus : quelques mots de la langue de la région t’attendent dans ton itinéraire.</p>
            )}
          </section>
        )}

        {step === 3 && (
          <section class="ob-step" aria-labelledby="ob-3">
            <h1 id="ob-3">Quand pars-tu ?</h1>
            <p class="muted">Pour estimer ce que tu retiendras le jour J.</p>
            <DateField value={trip} onChange={setTrip} />
            <button
              type="button"
              class="btn btn-ghost"
              onClick={() => {
                setTrip('');
                setStep(4);
              }}
            >
              Je ne sais pas encore
            </button>
          </section>
        )}

        {step === 4 && (
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

        {step === 5 && (
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

        {step === 6 && (
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
        </footer>
      )}
    </div>
  );
}
