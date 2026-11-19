import { CircleCheck, Flame, Gift, Shield } from 'lucide-preact';
import { openChest } from '../actions';
import { dailyQuests, dayKey, goalTitle, questValue, repairOffer, streak } from '../engine/progress';
import { pdata, profile } from '../state/store';
import { InstallButton } from './Install';
import { Bar, Ring } from './kit';
import { Team } from './Team';

export function Daily({ compact }: { compact?: boolean }) {
  const p = profile.value;
  if (!p) return null;
  const data = pdata.value;
  const today = dayKey(Date.now());
  const log = data.days[today];
  const xp = log?.xp ?? 0;
  const s = streak(data, today);
  const quests = dailyQuests(p.id, today, p.goal);
  const done = quests.filter(q => questValue(q, log) >= q.target).length;
  const offer = repairOffer(data, today, p.goal);

  return (
    <div class="daily">
      <section class="card daily-goal" aria-label="Objectif du jour">
        <Ring value={xp / p.goal} size={68} label={`Objectif du jour : ${xp} XP sur ${p.goal}`}>
          <strong class="num">{xp}</strong>
        </Ring>
        <div class="daily-text">
          <p class="daily-title">{goalTitle(xp, p.goal)}</p>
          <p class="muted">Objectif : {p.goal} XP</p>
        </div>
        <div
          class={`streak${s.today ? ' lit' : ''}`}
          role="img"
          aria-label={`Série de ${s.days} jour${s.days > 1 ? 's' : ''}`}
        >
          <Flame size={26} aria-hidden="true" />
          <strong class="num">{s.days}</strong>
        </div>
      </section>

      {offer && (
        <p class="card note-card">
          Ta série de {offer.streak} jours peut encore être sauvée : gagne {p.goal * 2} XP aujourd’hui.
        </p>
      )}

      <Team />

      {!compact && (
        <section class="card" aria-label="Défis du jour">
          <div class="section-head">
            <h3>Défis du jour</h3>
            <span class="muted num">{done}/3</span>
          </div>
          <ul class="quests">
            {quests.map(q => {
              const v = questValue(q, log);
              const ok = v >= q.target;
              return (
                <li key={q.id} class={ok ? 'done' : ''}>
                  {ok ? (
                    <CircleCheck size={22} class="quest-ok" aria-hidden="true" />
                  ) : (
                    <span class="quest-dot" aria-hidden="true" />
                  )}
                  <div class="quest-main">
                    <span>{q.label}</span>
                    <Bar value={v / q.target} label={q.label} tone={ok ? 'ok' : undefined} />
                  </div>
                </li>
              );
            })}
          </ul>
          {done === 3 && !log?.chest && (
            <button type="button" class="btn btn-primary btn-block" onClick={() => openChest()}>
              <Gift size={20} aria-hidden="true" />
              Ouvrir le coffre
            </button>
          )}
          <p class="muted jokers">
            <Shield size={18} aria-hidden="true" />
            {data.jokers
              ? `${data.jokers} joker${data.jokers > 1 ? 's' : ''} : ta série survit à un jour sans pratique.`
              : 'Un joker de série tous les 7 jours d’affilée.'}
          </p>
        </section>
      )}

      {!compact && <InstallButton block />}
    </div>
  );
}
