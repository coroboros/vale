/** Practice hub: reviews chosen by the memory model, ear and voice drills, scenes and games. */
import { Check, Ear, Euro, Headphones, Mic, Repeat, Swords, Timer, TriangleAlert, Umbrella } from 'lucide-preact';
import type { ComponentChildren } from 'preact';
import { startSession } from '../../actions';
import { isDue } from '../../engine/memory';
import { arrivalTime, lessonKey, readiness } from '../../engine/progress';
import { canSpeak, voicesFor } from '../../platform/speech';
import { cindex, course, pdata, profile } from '../../state/store';
import { go } from '../router';

function Tile({
  icon,
  title,
  sub,
  onClick,
  disabled,
}: {
  icon: ComponentChildren;
  title: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" class="tile-card" onClick={onClick} disabled={disabled}>
      <span class="tile-icon" aria-hidden="true">
        {icon}
      </span>
      <span class="tile-title">{title}</span>
      <span class="tile-sub">{sub}</span>
    </button>
  );
}

export function Practice() {
  const p = profile.value!;
  const c = course.value;
  const data = pdata.value;
  const now = Date.now();
  const audio = canSpeak(c.lang);
  const voices = voicesFor(c.lang).length;
  const prefix = `${c.id}:`;
  const due = Object.entries(data.mem).filter(([k, m]) => k.startsWith(prefix) && isDue(m, now)).length;
  const learned = Object.keys(data.mem).filter(k => k.startsWith(prefix)).length;
  const mistakes = Object.entries(data.mistakes).filter(([k, n]) => k.startsWith(prefix) && n > 0).length;
  const fragile = readiness(cindex.value, data, arrivalTime(p.trip, now)).fragile.length;
  const none = learned === 0;

  return (
    <>
      <header class="page-head">
        <h1>Entraînement</h1>
        <p class="muted">
          {none ? 'Fais une première leçon : tes révisions apparaîtront ici.' : `${learned} phrases en mémoire.`}
        </p>
      </header>

      <section class="section" aria-label="Réviser">
        <h2>Réviser</h2>
        <div class="tile-grid">
          <Tile
            icon={<Repeat size={26} />}
            title="Révision du jour"
            sub={due ? `${due} phrase${due > 1 ? 's' : ''} à revoir` : 'Rien d’urgent'}
            disabled={none}
            onClick={() => startSession({ kind: 'review', unitId: null }, 'Révision du jour')}
          />
          <Tile
            icon={<TriangleAlert size={26} />}
            title="Mes erreurs"
            sub={mistakes ? `${mistakes} phrase${mistakes > 1 ? 's' : ''}` : 'Aucune pour l’instant'}
            disabled={!mistakes}
            onClick={() => startSession({ kind: 'practice', focus: 'mistakes' }, 'Mes erreurs')}
          />
          <Tile
            icon={<Umbrella size={26} />}
            title="Avant le départ"
            sub={
              fragile ? `${fragile} phrase${fragile > 1 ? 's' : ''} fragile${fragile > 1 ? 's' : ''}` : 'Tout tient bon'
            }
            disabled={none}
            onClick={() => startSession({ kind: 'practice', focus: 'fragile' }, 'Avant le départ')}
          />
        </div>
      </section>

      <section class="section" aria-label="Oreille et voix">
        <h2>Oreille et voix</h2>
        <div class="tile-grid">
          <Tile
            icon={<Ear size={26} />}
            title="Écoute"
            sub={!audio ? 'Aucune voix sur cet appareil' : voices > 1 ? `${voices} voix différentes` : 'Une voix'}
            disabled={none || !audio}
            onClick={() => startSession({ kind: 'practice', focus: 'listening' }, 'Écoute')}
          />
          <Tile
            icon={<Mic size={26} />}
            title="Prononciation"
            sub="Dis, réécoute, compare"
            disabled={none}
            onClick={() => startSession({ kind: 'practice', focus: 'speaking' }, 'Prononciation')}
          />
          <Tile
            icon={<Headphones size={26} />}
            title="Mains libres"
            sub="En marchant, écouteurs"
            disabled={none || !audio}
            onClick={() => go({ name: 'activity', kind: 'audio' })}
          />
        </div>
      </section>

      <section class="section" aria-label="Scènes">
        <h2>Scènes</h2>
        <div class="scene-list">
          {c.scenes.map(s => {
            const done = !!data.scenes[lessonKey(c.id, s.id)];
            return (
              <button key={s.id} type="button" class="row" onClick={() => go({ name: 'scene', id: s.id })}>
                <span class={`scene-dot${done ? ' done' : ''}`} aria-hidden="true">
                  {done ? <Check size={18} /> : null}
                </span>
                <span class="row-main">
                  <span class="row-title">{s.title}</span>
                  <span class="row-sub">{s.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section class="section" aria-label="Jeux">
        <h2>Jeux</h2>
        <div class="tile-grid">
          <Tile
            icon={<Euro size={26} />}
            title="Prix à l’oreille"
            sub="10 prix à comprendre"
            disabled={!audio}
            onClick={() => go({ name: 'activity', kind: 'prices' })}
          />
          <Tile
            icon={<Timer size={26} />}
            title="Paires express"
            sub="60 secondes"
            disabled={learned < 4}
            onClick={() => go({ name: 'activity', kind: 'pairs' })}
          />
          <Tile
            icon={<Swords size={26} />}
            title="Duel à deux"
            sub="Sur le même téléphone"
            disabled={learned < 4}
            onClick={() => go({ name: 'activity', kind: 'duel' })}
          />
        </div>
      </section>
    </>
  );
}
