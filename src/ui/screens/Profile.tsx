import { Download, Upload, UserPlus } from 'lucide-preact';
import { useRef, useState } from 'preact/hooks';
import {
  clock,
  createProfiles,
  editProfile,
  resetProgress,
  restoreBackup,
  setQuiet,
  setSpeechCheck,
  switchProfile,
} from '../../actions';
import { COURSES } from '../../content';
import type { Gender } from '../../content/types';
import { dayKey, stamps, streak } from '../../engine/progress';
import { exportBackup, readBackup } from '../../platform/backup';
import { offlineReady } from '../../platform/pwa';
import { canHear } from '../../platform/recognition';
import { CUES, GOALS, PROFILE_COLORS, type Settings } from '../../state/schema';
import { course, db, isQuiet, pdata, profile, settings, update } from '../../state/store';
import { InstallButton } from '../Install';
import { ChoiceGroup, Sheet, showToast, Toggle } from '../kit';
import { Stamp } from '../Stamp';

type Flag = { [K in keyof Settings]: Settings[K] extends boolean ? K : never }[keyof Settings];

const VOICE: { key: Exclude<Flag, 'quiet'>; label: string; sub: string }[] = [
  { key: 'autoplay', label: 'Lecture automatique', sub: 'Chaque nouvelle phrase est prononcée' },
  { key: 'slow', label: 'Voix lente', sub: 'Plus facile au début' },
  { key: 'variedVoices', label: 'Voix variées', sub: 'Les exercices d’écoute changent de voix' },
  { key: 'phonetics', label: 'Prononciation écrite', sub: 'Les aides « à la française »' },
  { key: 'sfx', label: 'Sons', sub: 'Petits sons de réussite' },
];

function setSetting(key: Flag, value: boolean) {
  update(d => {
    d.settings[key] = value;
  });
}

function AddProfile({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('f');
  const p = profile.value!;
  return (
    <Sheet title="Ajouter un voyageur" onClose={onClose}>
      <form
        class="form"
        onSubmit={e => {
          e.preventDefault();
          if (!name.trim()) return;
          createProfiles([
            {
              ...p,
              name: name.trim(),
              gender,
              color: PROFILE_COLORS[db.value.profiles.length % PROFILE_COLORS.length]!,
              cue: '',
            },
          ]);
          onClose();
        }}
      >
        <label class="field">
          <span>Prénom</span>
          <input
            class="input"
            value={name}
            onInput={e => setName(e.currentTarget.value)}
            maxLength={24}
            autocomplete="given-name"
          />
        </label>
        <fieldset class="field">
          <legend>Pour accorder les phrases</legend>
          <div class="chips">
            {(['f', 'm'] as const).map(g => (
              <button key={g} type="button" class="chip" aria-pressed={gender === g} onClick={() => setGender(g)}>
                {g === 'f' ? 'Au féminin' : 'Au masculin'}
              </button>
            ))}
          </div>
        </fieldset>
        <button type="submit" class="btn btn-primary btn-block" disabled={!name.trim()}>
          Ajouter
        </button>
      </form>
    </Sheet>
  );
}

export function Profile() {
  const p = profile.value!;
  const c = course.value;
  const data = pdata.value;
  const s = settings.value;
  const [adding, setAdding] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const today = dayKey(Date.now());
  const xp = Object.values(data.days).reduce((sum, d) => sum + d.xp, 0);
  const minutes = Math.round(Object.values(data.days).reduce((sum, d) => sum + d.ms, 0) / 60000);
  const learned = Object.keys(data.mem).length;
  const region = c.regions.find(r => r.id === p.region);

  return (
    <>
      <header class="me-head">
        <span class="avatar" style={{ background: p.color }} aria-hidden="true">
          {p.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1>{p.name}</h1>
          <p class="muted">
            Apprend l’{c.name.toLowerCase()}
            {region && region.id !== 'autre' ? ` pour ${region.name}` : ''}
          </p>
        </div>
      </header>

      <section class="stats" aria-label="Statistiques">
        <div class="stat">
          <strong class="num">{streak(data, today).days}</strong>
          <span>jours de série</span>
        </div>
        <div class="stat">
          <strong class="num">{xp}</strong>
          <span>XP au total</span>
        </div>
        <div class="stat">
          <strong class="num">{learned}</strong>
          <span>phrases en mémoire</span>
        </div>
        <div class="stat">
          <strong class="num">{minutes}</strong>
          <span>minutes de pratique</span>
        </div>
      </section>

      <section class="section" aria-label="Passeport">
        <h2>Passeport</h2>
        <div class="passport">
          {stamps(c).map(st => (
            <div key={st.id} class="passport-cell" title={st.desc}>
              <Stamp id={st.id} label={st.label} date={data.stamps[st.id]} locked={!data.stamps[st.id]} size={92} />
              <span class="small muted">{st.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section class="section card" aria-label="Voyage">
        <h2>Voyage</h2>
        <fieldset class="field">
          <legend>Langue</legend>
          <div class="chips">
            {COURSES.map(x => (
              <button
                key={x.id}
                type="button"
                class="chip"
                aria-pressed={p.course === x.id}
                onClick={() => editProfile({ course: x.id, region: 'autre' })}
              >
                {x.name}
              </button>
            ))}
          </div>
        </fieldset>
        <label class="field">
          <span>Destination</span>
          <select class="input" value={p.region} onChange={e => editProfile({ region: e.currentTarget.value })}>
            {c.regions.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label class="field">
          <span>Date de départ</span>
          <input
            class="input"
            type="date"
            value={p.trip}
            min={today}
            onChange={e => editProfile({ trip: e.currentTarget.value })}
          />
        </label>
      </section>

      <section class="section card" aria-label="Rythme">
        <h2>Rythme</h2>
        <ChoiceGroup
          name="goal"
          label="Objectif quotidien"
          value={p.goal}
          options={GOALS.map(g => ({ value: g.xp, title: g.label, sub: `${g.minutes} min par jour, ${g.xp} XP` }))}
          onChange={goal => editProfile({ goal })}
        />
        <fieldset class="field">
          <legend>Mon moment pour pratiquer</legend>
          <div class="chips">
            {CUES.map(cue => (
              <button
                key={cue.id}
                type="button"
                class="chip"
                aria-pressed={p.cue === cue.id}
                onClick={() => editProfile({ cue: cue.id })}
              >
                {cue.label}
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      <section class="section card" aria-label="Voix et affichage">
        <h2>Voix et affichage</h2>
        <div class="row">
          <div class="row-main">
            <p class="row-title">Mode discret</p>
            <p class="row-sub">
              {isQuiet() && !s.quiet
                ? `Jusqu’à ${clock(s.quietUntil)} : pas d’écoute, pas de son`
                : 'Pas d’exercice d’écoute, pas de son automatique'}
            </p>
          </div>
          <Toggle checked={isQuiet()} onChange={on => setQuiet(on)} label="Mode discret" />
        </div>
        {VOICE.map(v => (
          <div key={v.key} class="row">
            <div class="row-main">
              <p class="row-title">{v.label}</p>
              <p class="row-sub">{v.sub}</p>
            </div>
            <Toggle checked={s[v.key]} onChange={val => setSetting(v.key, val)} label={v.label} />
          </div>
        ))}
        {canHear() && (
          <div class="row">
            <div class="row-main">
              <p class="row-title">Vérifier ma prononciation</p>
              <p class="row-sub">Ton navigateur reconnaît ta voix, sur l’appareil quand il le peut</p>
            </div>
            <Toggle checked={s.speechCheck === 'on'} onChange={setSpeechCheck} label="Vérifier ma prononciation" />
          </div>
        )}
      </section>

      <section class="section card" aria-label="Application">
        <h2>Application</h2>
        <p class="muted">
          {offlineReady.value
            ? 'Prête hors ligne : tout est enregistré sur cet appareil.'
            : 'Tout reste sur cet appareil, sans compte.'}
        </p>
        <InstallButton block />
        <div class="judge">
          <button type="button" class="btn btn-block" onClick={() => void exportBackup(db.value)}>
            <Download size={18} aria-hidden="true" /> Sauvegarder
          </button>
          <button type="button" class="btn btn-block" onClick={() => file.current?.click()}>
            <Upload size={18} aria-hidden="true" /> Restaurer
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="application/json,.json"
          class="sr-only"
          tabIndex={-1}
          aria-label="Fichier de sauvegarde"
          onChange={async e => {
            const f = e.currentTarget.files?.[0];
            e.currentTarget.value = '';
            if (!f) return;
            try {
              restoreBackup(await readBackup(f));
            } catch (err) {
              showToast((err as Error).message);
            }
          }}
        />
      </section>

      <section class="section card" aria-label="Voyageurs">
        <h2>Voyageurs</h2>
        {db.value.profiles.map(x => (
          <button key={x.id} type="button" class="row" aria-current={x.id === p.id} onClick={() => switchProfile(x.id)}>
            <span class="avatar small" style={{ background: x.color }} aria-hidden="true">
              {x.name.charAt(0).toUpperCase()}
            </span>
            <span class="row-main">
              <span class="row-title">{x.name}</span>
              <span class="row-sub">{x.id === p.id ? 'Profil actif' : 'Passer à ce profil'}</span>
            </span>
          </button>
        ))}
        <button type="button" class="btn btn-block" onClick={() => setAdding(true)}>
          <UserPlus size={18} aria-hidden="true" /> Ajouter un voyageur
        </button>
      </section>

      <section class="section" aria-label="Réinitialiser">
        {confirmReset ? (
          <div class="card danger">
            <p>Effacer la progression de {p.name} ? Cette action est définitive.</p>
            <div class="judge">
              <button type="button" class="btn btn-block" onClick={() => setConfirmReset(false)}>
                Annuler
              </button>
              <button
                type="button"
                class="btn btn-ko btn-block"
                onClick={() => {
                  resetProgress();
                  setConfirmReset(false);
                  showToast('Progression effacée.');
                }}
              >
                Effacer
              </button>
            </div>
          </div>
        ) : (
          <button type="button" class="btn btn-ghost" onClick={() => setConfirmReset(true)}>
            Réinitialiser ma progression
          </button>
        )}
      </section>
      {adding && <AddProfile onClose={() => setAdding(false)} />}
    </>
  );
}
