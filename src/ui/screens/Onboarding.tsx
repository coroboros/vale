/**
 * The last step pictures the learner there, saying a first sentence: imagining one's future self
 * using the language feeds the motivation to learn it (the « ideal L2 self », docs/LEARNING.md).
 */
import { ArrowLeft } from 'lucide-preact';
import { useEffect, useState } from 'preact/hooks';
import { createProfiles, startSession } from '../../actions';
import { BRAND } from '../../brand';
import { COURSES } from '../../content';
import type { Gender } from '../../content/types';
import { CUES, GOALS, PROFILE_COLORS } from '../../state/schema';
import { InstallButton } from '../Install';
import { ChoiceGroup, Say } from '../kit';
import { Mascot } from '../Mascot';
import { Porthole, type Stop } from '../Porthole';
import { type Photo, PORTRAIT, photoFiles, photoOf, preload } from '../photos';
import { hasScenery } from '../scenery/Scenery';
import { DateField, LanguageChoice, PlaceChoice } from '../Trip';
import { THEMES, themeVars } from '../themes';

const JOURNEY: Stop[] = (() => {
  const byCourse = COURSES.map(c =>
    c.regions
      .filter(r => hasScenery(r.id))
      .map(r => ({ place: r.id, greeting: c.greet(r.native), lang: c.lang, theme: THEMES[c.theme] ?? THEMES.sol! })),
  );
  const longest = Math.max(...byCourse.map(list => list.length));
  return Array.from({ length: longest }, (_, i) => byCourse.flatMap(list => list[i] ?? []));
})().flat();

function Backdrop({ photo, onError }: { photo: Photo; onError: () => void }) {
  const files = photoFiles(photo.id);
  return (
    <picture class="ob-photo">
      <source media={PORTRAIT} srcset={files.portrait} />
      <img
        src={files.fallback}
        srcset={files.srcset}
        sizes="100vw"
        alt={photo.alt}
        style={{ '--focus': `${photo.focus * 100}%` }}
        onError={onError}
      />
    </picture>
  );
}

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
  const theme = THEMES[c.theme] ?? THEMES.sol!;
  const place = c.regions.find(r => r.id === region);
  const firstLine = c.scenes[0]?.lines.find(l => l.who === 'you');
  const sentence = firstLine && firstLine.who === 'you' ? firstLine.options[0]! : c.hello;
  const last = 6;
  const canGo = step !== 4 || people.every(t => t.name.trim());
  const photo = photoOf(c.id, region);
  const [brokenPhoto, setBrokenPhoto] = useState('');
  const shownPhoto = step === last && photo && photo.id !== brokenPhoto ? photo : undefined;

  useEffect(() => {
    if (step === last - 1 && photo) preload(photo);
  }, [step, photo?.id]);

  const setPerson = (i: number, patch: Partial<Traveller>) =>
    setPeople(ps => ps.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const finish = () => {
    createProfiles(
      people.map((t, i) => ({
        name: t.name.trim(),
        gender: t.gender,
        color: PROFILE_COLORS[i % PROFILE_COLORS.length]!,
        course: c.id,
        trips: { [c.id]: { region, date: trip } },
        goal,
        cue,
      })),
    );
    const first = c.lessons[0];
    if (first) startSession({ kind: 'lesson', lessonId: first.id }, first.title);
  };

  return (
    <div
      class={`onboarding${step === 0 ? ' is-welcome' : ''}${shownPhoto ? ' has-photo' : ''}`}
      style={themeVars(theme)}
    >
      {step > 0 && (
        <header class="ob-top">
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

      <main class="ob-body">
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
              <p class="ob-lead">{BRAND.tagline}</p>
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
            {place?.pack && (
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
          <section class="ob-step ob-imagine" aria-labelledby="ob-6">
            <h1 id="ob-6">Imagine.</h1>
            {shownPhoto && <Mascot size={72} pattern={theme.pattern} mood="cheer" motion="bob" decorative />}
            <p class="ob-lead">
              Tu arrives {place && place.id !== 'autre' ? `à ${place.name}` : 'sur place'}. Tu pousses la porte d’un
              café et tu dis :
            </p>
            {shownPhoto && <Backdrop photo={shownPhoto} onError={() => setBrokenPhoto(shownPhoto.id)} />}
            <div class="imagine-line">
              <Say text={sentence} lang={c.lang} />
              <p class="big" lang={c.lang}>
                {sentence}
              </p>
            </div>
            {shownPhoto ? (
              <p class="photo-credit">
                Photo :{' '}
                <a href={shownPhoto.source} target="_blank" rel="noreferrer">
                  {shownPhoto.author}
                </a>
                ,{' '}
                {shownPhoto.licenseUrl ? (
                  <a href={shownPhoto.licenseUrl} target="_blank" rel="noreferrer">
                    {shownPhoto.license}
                  </a>
                ) : (
                  shownPhoto.license
                )}
                , recadrée
              </p>
            ) : (
              <Mascot size={130} pattern={theme.pattern} mood="cheer" motion="bob" />
            )}
          </section>
        )}
      </main>

      {step > 0 && (
        <footer class="ob-foot">
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
