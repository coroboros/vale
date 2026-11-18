import { BookOpen, Check, ChevronDown, ChevronRight, Ear, MapPin, MessageCircle, Repeat } from 'lucide-preact';
import { useState } from 'preact/hooks';
import { startSession } from '../../actions';
import { itemKey } from '../../content';
import type { Course, Step, Unit } from '../../content/types';
import { arrivalTime, dayKey, daysBetween, readiness, stepProgress, stepVisible } from '../../engine/progress';
import { tripOf } from '../../state/schema';
import { cindex, course, pdata, profile } from '../../state/store';
import { Daily } from '../Daily';
import { Bar, Phonetic, Say, Sheet } from '../kit';
import { Mascot } from '../Mascot';
import { go } from '../router';
import { Stamp } from '../Stamp';
import { Scenery } from '../scenery/Scenery';
import { TripSheet } from '../Trip';

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
      const pack = c.packs.find(p => p.id === c.regions.find(r => r.id === region)?.pack);
      return { title: pack?.title ?? 'Langue régionale', sub: pack?.native ?? '' };
    }
    case 'review':
      return { title: 'Révision de l’escale', sub: 'Les phrases les plus fragiles' };
  }
}

function openStop(stop: Stop, setLesson: (s: Stop) => void, c: Course, region: string) {
  const { step, unit } = stop;
  if (step.kind === 'sounds') return go({ name: 'sounds' });
  if (step.kind === 'scene') return go({ name: 'scene', id: step.id });
  if (step.kind === 'review') return startSession({ kind: 'review', unitId: unit.id }, `Révision : ${unit.title}`);
  if (step.kind === 'pack') {
    const pack = c.regions.find(r => r.id === region)?.pack;
    if (pack) startSession({ kind: 'pack', packId: pack }, stepTitle(c, step, region).title);
    return;
  }
  setLesson(stop);
}

function LessonSheet({ stop, onClose }: { stop: Stop; onClose: () => void }) {
  const c = course.value;
  const step = stop.step as { kind: 'lesson'; id: string };
  const lesson = c.lessons.find(l => l.id === step.id);
  const data = pdata.value;
  if (!lesson) return null;
  const done = stop.progress >= 1;
  return (
    <Sheet title={lesson.title} onClose={onClose}>
      <p class="muted" lang={c.lang}>
        {lesson.native}
      </p>
      <p>
        {lesson.desc} ({lesson.items.length} phrases)
      </p>
      <Bar value={stop.progress} label="Phrases découvertes" />
      <ul class="preview">
        {lesson.items.slice(0, 6).map(item => (
          <li key={item.id}>
            <Say text={item.t} lang={c.lang} small soft />
            <div>
              <p class="preview-t" lang={c.lang}>
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
        <button
          type="button"
          class="btn btn-primary btn-block"
          onClick={() => startSession({ kind: 'lesson', lessonId: lesson.id }, lesson.title)}
        >
          {done ? 'Réviser cette leçon' : stop.progress > 0 ? 'Continuer' : 'Commencer'}
        </button>
        {!done && (
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
  const [lessonStop, setLessonStop] = useState<Stop | null>(null);
  const [tripOpen, setTripOpen] = useState(false);

  const trip = tripOf(p);
  const region = c.regions.find(r => r.id === trip.region);
  const somewhere = region && region.id !== 'autre' ? region : null;
  const packItems = c.packs.find(x => x.id === region?.pack)?.items ?? [];
  const ready = readiness(cindex.value, data, arrivalTime(trip.date, now), packItems);
  const daysLeft = trip.date ? daysBetween(dayKey(now), trip.date) : null;
  const stops: Stop[] = c.units.flatMap(unit =>
    unit.steps
      .filter(s => stepVisible(c, s, trip.region))
      .map(step => ({ unit, step, progress: stepProgress(data, c, step, unit.id, trip.region) })),
  );
  const current = stops.find(s => s.progress < 1) ?? null;
  const pct = Math.round(ready.score * 100);
  const when =
    daysLeft === null
      ? 'Date de départ à choisir'
      : daysLeft > 1
        ? `Départ dans ${daysLeft} jours`
        : daysLeft === 1
          ? 'Départ demain'
          : daysLeft === 0
            ? 'Départ aujourd’hui'
            : 'Sur place : à toi de parler';

  return (
    <>
      <header class="home-head">
        <button type="button" class="trip-pill" aria-haspopup="dialog" onClick={() => setTripOpen(true)}>
          <MapPin size={18} aria-hidden="true" />
          <span>
            <span class="sr-only">Mon voyage : </span>
            {c.name}
            {somewhere && ` · ${somewhere.name}`}
          </span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
        <h1 lang={c.lang}>{c.greet(p.name)}</h1>
      </header>

      <section class="postcard" aria-label="Ton voyage">
        <div class="postcard-view" aria-hidden="true">
          <Scenery place={trip.region} />
          <Mascot size={112} mood={pct >= 80 ? 'cheer' : 'idle'} decorative />
        </div>
        <div class="postcard-text">
          <p class="postcard-place" lang={c.lang}>
            {somewhere ? somewhere.native : c.native}
          </p>
          <p class="postcard-when">{when}</p>
          <div class="readiness">
            <p>
              Mémoire à l’arrivée : <strong class="num">{pct} %</strong> des phrases
            </p>
            <Bar value={ready.score} label="Phrases retenues à l’arrivée" />
            <p class="small muted">
              Estimation si tu ne révises plus d’ici là. {ready.learned} phrases vues sur {ready.total}.
            </p>
          </div>
          <div class="postcard-actions">
            {current && (
              <button
                type="button"
                class="btn btn-primary"
                onClick={() => openStop(current, setLessonStop, c, trip.region)}
              >
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

      <div class="only-narrow">
        <Daily compact />
      </div>

      <section class="itinerary" aria-label="Itinéraire">
        {c.units.map((unit, i) => {
          const unitStops = stops.filter(s => s.unit.id === unit.id);
          const stampId = `${c.id}:${unit.id}`;
          return (
            <div key={unit.id} class="unit">
              <div class="unit-head">
                <div>
                  <p class="unit-kicker">Escale {i + 1}</p>
                  <h2>{unit.title}</h2>
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
                      <button
                        type="button"
                        class="stop-btn"
                        onClick={() => openStop(stop, setLessonStop, c, trip.region)}
                      >
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

      {lessonStop && <LessonSheet stop={lessonStop} onClose={() => setLessonStop(null)} />}
      {tripOpen && <TripSheet onClose={() => setTripOpen(false)} />}
    </>
  );
}
