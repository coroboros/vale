import { BookOpen, Check, ChevronDown, ChevronRight, Ear, MapPin, MessageCircle, Repeat } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { focusTrip, startSession, tripAsked } from '../../actions';
import { courseById, flagOf, itemKey, pictureOf, regionOf } from '../../content';
import { cueOf, duringCue } from '../../content/cues';
import type { Course, Step, Unit } from '../../content/types';
import {
  arrivalTime,
  dayKey,
  daysBetween,
  postcard,
  readiness,
  stepProgress,
  stepVisible,
} from '../../engine/progress';
import { goalOf, orderTrips, tripOf } from '../../state/schema';
import { cindex, course, pdata, profile } from '../../state/store';
import { Daily } from '../Daily';
import { ofLanguage } from '../french';
import { KeepProgress } from '../Install';
import { Bar, Phonetic, Say, Sheet } from '../kit';
import { FlagDot, Mascot } from '../Mascot';
import { go } from '../router';
import { Stamp } from '../Stamp';
import { Scenery } from '../scenery/Scenery';
import { departure, TripSheet, tripName } from '../Trip';

interface Stop {
  unit: Unit;
  step: Step;
  progress: number;
}

const ICONS = { sounds: Ear, lesson: BookOpen, scene: MessageCircle, pack: MapPin, review: Repeat };

function stepTitle(c: Course, step: Step, region: string): { title: string; sub: string } {
  switch (step.kind) {
    case 'sounds':
      return { title: 'Les sons', sub: 'Lire la prononciation' };
    case 'lesson': {
      const l = c.lessons.find(x => x.id === step.id);
      return { title: l?.title ?? '', sub: l?.native ?? '' };
    }
    case 'scene': {
      const s = c.scenes.find(x => x.id === step.id);
      return { title: s?.title ?? '', sub: s ? `Scène : ${s.desc}` : '' };
    }
    case 'pack': {
      const pack = c.packs.find(p => p.id === regionOf(c, region).pack);
      return { title: pack?.title ?? 'Langue régionale', sub: pack?.native ?? '' };
    }
    case 'review':
      return { title: 'Révision de l’escale', sub: 'Les phrases les plus fragiles' };
  }
}

function openStop(stop: Stop, setSheet: (s: Stop) => void) {
  const { step, unit } = stop;
  if (step.kind === 'sounds') return go({ name: 'sounds' });
  if (step.kind === 'scene') return go({ name: 'scene', id: step.id });
  if (step.kind === 'review') return startSession({ kind: 'review', unitId: unit.id }, `Révision : ${unit.title}`);
  setSheet(stop);
}

/** A lesson, or the regional pack of the destination with its tip, before starting it. */
function StepSheet({ stop, region, onClose }: { stop: Stop; region: string; onClose: () => void }) {
  const c = course.value;
  const { step } = stop;
  const lesson = step.kind === 'lesson' ? c.lessons.find(l => l.id === step.id) : undefined;
  const pack = step.kind === 'pack' ? c.packs.find(p => p.id === regionOf(c, region).pack) : undefined;
  const taught = lesson ?? pack;
  const data = pdata.value;
  if (!taught) return null;
  const lang = pack?.lang ?? c.lang;
  const done = stop.progress >= 1;
  const start = () =>
    pack
      ? startSession({ kind: 'pack', packId: pack.id }, pack.title)
      : startSession({ kind: 'lesson', lessonId: taught.id }, taught.title);
  return (
    <Sheet title={taught.title} onClose={onClose}>
      <p class="muted" lang={lang}>
        {taught.native}
      </p>
      <p>{lesson ? `${lesson.desc} (${lesson.items.length} phrases)` : pack?.intro}</p>
      <Bar value={stop.progress} label="Phrases découvertes" />
      <ul class="preview">
        {taught.items.slice(0, 6).map(item => (
          <li key={item.id}>
            <Say text={item.t} lang={lang} small soft />
            <div>
              <p class="preview-t" lang={lang}>
                {item.t}
                {data.mem[itemKey(c.id, item.id)] && <Check size={16} class="preview-ok" aria-label="déjà vue" />}
              </p>
              <Phonetic ph={item.ph} />
              <p class="muted">{item.fr}</p>
            </div>
          </li>
        ))}
      </ul>
      <div class="sheet-actions">
        <button type="button" class="btn btn-primary btn-block" onClick={start}>
          {done ? 'Réviser cette leçon' : stop.progress > 0 ? 'Continuer' : 'Commencer'}
        </button>
        {lesson && !done && (
          <button
            type="button"
            class="btn btn-block"
            onClick={() => startSession({ kind: 'test', lessonId: lesson.id }, `Test : ${lesson.title}`)}
          >
            Je connais déjà : passer le test
          </button>
        )}
      </div>
    </Sheet>
  );
}

export function Home() {
  const p = profile.value!;
  const c = course.value;
  const data = pdata.value;
  const now = Date.now();
  const [sheetStop, setSheetStop] = useState<Stop | null>(null);
  const [tripOpen, setTripOpen] = useState(false);

  const trip = tripOf(p);
  const region = regionOf(c, trip.region);
  const somewhere = region.id !== 'autre' ? region : null;
  const packItems = c.packs.find(x => x.id === region.pack)?.items ?? [];
  const ready = readiness(cindex.value, data, arrivalTime(trip.date, now), packItems);
  const today = dayKey(now);
  const away = !!trip.date && daysBetween(today, trip.date) < 0;
  // Trips in a row: once one has begun, the next one is a tap away.
  const next = away ? orderTrips(p.trips, today).find(t => t.date >= today) : undefined;
  const stops: Stop[] = c.units.flatMap(unit =>
    unit.steps
      .filter(s => stepVisible(c, s, trip.region))
      .map(step => ({ unit, step, progress: stepProgress(data, c, step, unit.id, trip.region) })),
  );
  const current = stops.find(s => s.progress < 1) ?? null;
  const pct = Math.round(ready.score * 100);
  const when = away ? 'Sur place : à toi de parler' : departure(trip.date, today);
  const cue = cueOf(p.cue);
  // Their own moment comes back while today's goal is still open: the cue of the plan they made.
  const moment =
    cue && duringCue(cue, new Date(now).getHours()) && (data.days[today]?.xp ?? 0) < p.goal ? cue : undefined;

  return (
    <>
      <header class="home-head">
        <button type="button" class="chip trip-pill" aria-haspopup="dialog" onClick={() => setTripOpen(true)}>
          <MapPin size={18} aria-hidden="true" />
          <span>
            <span class="sr-only">Mes voyages : </span>
            {tripName(trip)}
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        <h1 lang={c.lang}>{c.greet(p.name)}</h1>
        {moment && (
          <p class="home-moment">
            {moment.now} : {goalOf(p.goal).minutes} minutes {ofLanguage(c.name)} ?
          </p>
        )}
      </header>

      <section class="postcard" aria-label="Ton voyage">
        <div class="postcard-view" aria-hidden="true">
          <Scenery place={pictureOf(c, trip.region)} />
          <Mascot size={112} mood={pct >= 80 ? 'cheer' : 'idle'} decorative />
        </div>
        <div class="postcard-text">
          <p class="postcard-place" lang={c.lang}>
            {somewhere ? somewhere.native : c.native}
          </p>
          <p class="postcard-when">{when}</p>
          <div class="readiness">
            <p>
              Mémoire {away ? 'aujourd’hui' : 'à l’arrivée'} : <strong class="num">{pct} %</strong> des phrases
            </p>
            <Bar value={ready.score} label={`Phrases retenues ${away ? 'aujourd’hui' : 'à l’arrivée'}`} />
            <p class="small muted">
              {!away && 'Estimation si tu ne révises plus d’ici là. '}
              {ready.learned} phrases vues sur {ready.total}.
            </p>
          </div>
          <div class="postcard-actions">
            {current && (
              <button type="button" class="btn btn-primary" onClick={() => openStop(current, setSheetStop)}>
                {current.progress > 0 ? 'Continuer' : 'Commencer'} : {stepTitle(c, current.step, trip.region).title}
              </button>
            )}
            {ready.fragile.length > 0 && (
              <button
                type="button"
                class="btn"
                onClick={() => startSession({ kind: 'practice', focus: 'fragile' }, 'Phrases fragiles')}
              >
                Consolider {Math.min(10, ready.fragile.length)} phrases fragiles
              </button>
            )}
          </div>
        </div>
      </section>

      {next && (
        <section class="card next-trip" aria-label="Voyage suivant">
          <FlagDot flag={flagOf(courseById(next.course), next.region)} size={36} />
          <p>
            <strong>Prochain voyage : {tripName(next)}</strong>
            <span class="small muted">{departure(next.date, today)}</span>
          </p>
          <button type="button" class="btn" onClick={() => focusTrip(next.id)}>
            Préparer ce voyage
          </button>
        </section>
      )}

      {ready.learned > 0 && <KeepProgress />}

      <div class="only-narrow">
        <Daily compact />
      </div>

      <section class="itinerary" aria-label="Itinéraire">
        {c.units.map((unit, i) => {
          const unitStops = stops.filter(s => s.unit.id === unit.id);
          const stampId = `${c.id}:${unit.id}`;
          const card = postcard(c, unit, data, trip.region);
          return (
            <div key={unit.id} class="unit">
              <div class="unit-head">
                <div>
                  <p class="unit-kicker">Escale {i + 1}</p>
                  <h2>{unit.title}</h2>
                  {card && (
                    <p class="unit-postcard">
                      <strong>Bernard :</strong> « {card} »
                    </p>
                  )}
                </div>
                <Stamp
                  id={stampId}
                  label={unit.title}
                  date={data.stamps[stampId]}
                  locked={!data.stamps[stampId]}
                  size={64}
                />
              </div>
              <ol class="route">
                {unitStops.map(stop => {
                  const { title, sub } = stepTitle(c, stop.step, trip.region);
                  const Icon = ICONS[stop.step.kind];
                  const state =
                    stop.progress >= 1 ? 'done' : stop === current ? 'here' : stop.progress > 0 ? 'started' : 'todo';
                  return (
                    <li
                      key={`${unit.id}-${stop.step.kind}-${'id' in stop.step ? stop.step.id : ''}`}
                      class={`stop ${state}`}
                    >
                      <button type="button" class="stop-btn" onClick={() => openStop(stop, setSheetStop)}>
                        <span class="stop-mark" aria-hidden="true">
                          {state === 'done' ? <Check size={22} /> : <Icon size={22} />}
                        </span>
                        <span class="stop-text">
                          <span class="stop-title">{title}</span>
                          <span class="stop-sub">{state === 'here' ? 'Tu es ici' : sub}</span>
                          {stop.progress > 0 && stop.progress < 1 && (
                            <Bar value={stop.progress} label={`${title} : progression`} />
                          )}
                        </span>
                        <ChevronRight size={20} class="stop-chev" aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </section>

      {sheetStop && <StepSheet stop={sheetStop} region={trip.region} onClose={() => setSheetStop(null)} />}
      {(tripOpen || tripAsked.value) && (
        <TripSheet
          start={tripAsked.value ? { kind: 'add', ...tripAsked.value } : undefined}
          onClose={() => {
            setTripOpen(false);
            tripAsked.value = null;
          }}
        />
      )}
    </>
  );
}
