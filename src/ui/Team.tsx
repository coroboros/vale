import { Crown } from 'lucide-preact';
import { dayKey, teamWeek } from '../engine/progress';
import { db } from '../state/store';
import { Bar } from './kit';

/** Shown once a second traveller shares the phone. */
export function Team() {
  const { profiles, data } = db.value;
  if (profiles.length < 2) return null;
  const { goal, xp, members } = teamWeek(profiles, data, dayKey(Date.now()));
  const [first, second] = members;
  const leader = first && second && first.xp > second.xp ? first.id : '';
  return (
    <section class="card team" aria-label="Votre équipe">
      <div class="section-head">
        <h3>Votre équipe</h3>
        <span class="muted num">
          {xp}/{goal} XP
        </span>
      </div>
      <Bar
        value={xp / goal}
        label={`Équipe : ${xp} XP sur ${goal} cette semaine`}
        tone={xp >= goal ? 'ok' : undefined}
      />
      <p class="small muted">
        {xp >= goal ? 'Objectif de la semaine atteint, ensemble.' : `Encore ${goal - xp} XP ensemble cette semaine`}
      </p>
      <ol class="team-list">
        {members.map(m => (
          <li key={m.id}>
            <span class="team-dot" style={{ background: m.color }} aria-hidden="true" />
            <span class="team-name">{m.name}</span>
            {m.id === leader && <Crown size={18} class="team-crown" aria-label="En tête" />}
            <strong class="num">{m.xp} XP</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}
