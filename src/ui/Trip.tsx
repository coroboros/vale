/** Trips: the language, destination and date controls (onboarding uses them too) and « Mes voyages ». */
import { Pencil, Plus, Trash2 } from 'lucide-preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { addTrip, editTrip, focusTrip, removeTrip } from '../actions';
import { COURSES, courseById, regionOf } from '../content';
import type { Course } from '../content/types';
import { dayKey, daysBetween, learntIn } from '../engine/progress';
import { blankTrip, orderTrips, type Trip, tripOf } from '../state/schema';
import { pdata, profile } from '../state/store';
import { frenchDay } from './french';
import { ChoiceGroup, Sheet } from './kit';
import { FlagDot } from './Mascot';
import { Porthole, stopOf } from './Porthole';
import { photoOf, preload } from './photos';
import { go } from './router';

export function LanguageChoice({
  value,
  onChange,
  showLabel,
  seen,
}: {
  value: string;
  onChange: (id: string) => void;
  showLabel?: boolean;
  /** Phrases already met, by course. */
  seen?: (courseId: string) => number;
}) {
  return (
    <ChoiceGroup
      name="course"
      label="Langue"
      showLabel={showLabel}
      value={value}
      options={COURSES.map(c => {
        const n = seen?.(c.id) ?? 0;
        return {
          value: c.id,
          icon: <FlagDot flag={c.flag} />,
          title: c.name,
          sub: (
            <>
              <span lang={c.lang}>{c.hello}</span>
              {n > 0 && ` · ${n} phrase${n > 1 ? 's' : ''} vue${n > 1 ? 's' : ''}`}
            </>
          ),
        };
      })}
      onChange={onChange}
    />
  );
}

export function PlaceChoice({
  course: c,
  value,
  onChange,
  showLabel,
}: {
  course: Course;
  value: string;
  onChange: (id: string) => void;
  showLabel?: boolean;
}) {
  return (
    <fieldset class="field">
      <legend class={showLabel ? undefined : 'sr-only'}>Destination</legend>
      <div class="chips">
        {c.regions.map(r => (
          <button key={r.id} type="button" class="chip" aria-pressed={value === r.id} onClick={() => onChange(r.id)}>
            {r.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function DateField({ value, onChange }: { value: string; onChange: (day: string) => void }) {
  return (
    <label class="field">
      <span>Date de départ</span>
      <input
        class="input"
        type="date"
        value={value}
        min={dayKey(Date.now())}
        onChange={e => onChange(e.currentTarget.value)}
      />
    </label>
  );
}

/** The language, and the destination once one is chosen. */
export function tripName(trip: Pick<Trip, 'course' | 'region'>): string {
  const c = courseById(trip.course);
  const place = regionOf(c, trip.region);
  return place.id === 'autre' ? c.name : `${c.name} · ${place.name}`;
}

/** Days left count down toward the trip; a day already gone is told as a date. */
export function departure(date: string, today: string): string {
  if (!date) return 'Date de départ à choisir';
  const left = daysBetween(today, date);
  if (left > 1) return `Départ dans ${left} jours`;
  if (left === 1) return 'Départ demain';
  if (left === 0) return 'Départ aujourd’hui';
  return `Départ le ${frenchDay(date, 'dayYear')}`;
}

/** Picking a trip puts it in focus: home, lessons and the memory forecast follow it. */
export function TripList({ onEdit, onAdd }: { onEdit: (id: string) => void; onAdd: () => void }) {
  const p = profile.value!;
  const today = dayKey(Date.now());
  return (
    <>
      <ChoiceGroup
        name="trip"
        label="Le voyage que tu prépares"
        showLabel
        value={p.trip}
        options={orderTrips(p.trips, today).map(t => ({
          value: t.id,
          icon: <FlagDot flag={courseById(t.course).flag} />,
          title: tripName(t),
          sub: departure(t.date, today),
          aside: (
            <button
              type="button"
              class="icon-btn"
              aria-label={`Modifier le voyage : ${tripName(t)}`}
              onClick={() => onEdit(t.id)}
            >
              <Pencil size={20} aria-hidden="true" />
            </button>
          ),
        }))}
        onChange={focusTrip}
      />
      <button type="button" class="btn btn-block" onClick={onAdd}>
        <Plus size={20} aria-hidden="true" />
        Ajouter un voyage
      </button>
    </>
  );
}

function TripFields({ trip, onChange }: { trip: Trip; onChange: (patch: Partial<Omit<Trip, 'id'>>) => void }) {
  return (
    <>
      <LanguageChoice
        showLabel
        value={trip.course}
        // Another language's destinations: the choice starts again at « Ailleurs ».
        onChange={id => id !== trip.course && onChange({ course: id, region: 'autre' })}
        seen={id => learntIn(pdata.value, id)}
      />
      <PlaceChoice
        showLabel
        course={courseById(trip.course)}
        value={trip.region}
        onChange={region => onChange({ region })}
      />
      <DateField value={trip.date} onChange={date => onChange({ date })} />
    </>
  );
}

function RemoveTrip({ trip, onRemoved }: { trip: Trip; onRemoved: () => void }) {
  const [asking, setAsking] = useState(false);
  if (!asking)
    return (
      <button type="button" class="btn btn-ghost btn-block" onClick={() => setAsking(true)}>
        <Trash2 size={20} aria-hidden="true" />
        Supprimer ce voyage
      </button>
    );
  return (
    <div class="card danger">
      <p>
        Supprimer le voyage {tripName(trip)} ? Les phrases apprises en {courseById(trip.course).name.toLowerCase()}{' '}
        restent.
      </p>
      <div class="judge">
        <button type="button" class="btn btn-block" onClick={() => setAsking(false)}>
          Garder
        </button>
        <button
          type="button"
          class="btn btn-ko btn-block"
          onClick={() => {
            removeTrip(trip.id);
            onRemoved();
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

export type TripView = { kind: 'list' } | { kind: 'add' } | { kind: 'edit'; id: string };

const TITLES: Record<TripView['kind'], string> = {
  list: 'Mes voyages',
  add: 'Nouveau voyage',
  edit: 'Modifier le voyage',
};

/**
 * The welcome window comes back here: it flies to the trip in focus, to the one being edited or to
 * the one being added, and Bernard says hello in its language.
 */
export function TripSheet({ start = { kind: 'list' }, onClose }: { start?: TripView; onClose: () => void }) {
  const p = profile.value!;
  const [view, setView] = useState<TripView>(start);
  const [draft, setDraft] = useState(() => blankTrip(tripOf(p).course));
  const body = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  // The landing photo, fetched once the destination stops changing: about 250 KB each.
  useEffect(() => {
    const photo = view.kind === 'add' ? photoOf(draft.course, draft.region) : undefined;
    if (!photo) return;
    const timer = setTimeout(() => preload(photo), 600);
    return () => clearTimeout(timer);
  }, [view.kind, draft.course, draft.region]);
  // The button that changed the view is gone: focus goes to the view's first choice, not to the page.
  useEffect(() => {
    if (opened.current) body.current?.querySelector<HTMLElement>('input:checked')?.focus();
    opened.current = true;
  }, [view.kind]);
  const editing = view.kind === 'edit' ? p.trips.find(t => t.id === view.id) : undefined;
  const shown = view.kind === 'add' ? draft : (editing ?? tripOf(p));
  const c = courseById(shown.course);
  const place = regionOf(c, shown.region);
  // Opened on one trip, from Moi, the sheet closes once that trip is done with.
  const done = start.kind === 'list' ? () => setView({ kind: 'list' }) : onClose;
  return (
    <Sheet title={TITLES[view.kind]} onClose={onClose}>
      <div class="trip-view">
        <Porthole stops={[stopOf(c, place)]} />
      </div>
      <div class="form" ref={body}>
        {view.kind === 'list' && (
          <>
            <TripList
              onEdit={id => setView({ kind: 'edit', id })}
              onAdd={() => {
                setDraft(blankTrip(tripOf(p).course));
                setView({ kind: 'add' });
              }}
            />
            <button type="button" class="btn btn-primary btn-block" onClick={onClose}>
              C’est noté
            </button>
          </>
        )}
        {view.kind === 'add' && (
          <>
            <TripFields trip={draft} onChange={patch => setDraft(d => ({ ...d, ...patch }))} />
            <button
              type="button"
              class="btn btn-primary btn-block"
              onClick={() => {
                addTrip(draft);
                onClose();
                go({ name: 'landing' });
              }}
            >
              Ajouter ce voyage
            </button>
            <button type="button" class="btn btn-ghost btn-block" onClick={done}>
              Annuler
            </button>
          </>
        )}
        {editing && (
          <>
            <TripFields trip={editing} onChange={patch => editTrip(patch, editing.id)} />
            <button type="button" class="btn btn-primary btn-block" onClick={done}>
              C’est noté
            </button>
            {p.trips.length > 1 && <RemoveTrip key={editing.id} trip={editing} onRemoved={done} />}
          </>
        )}
      </div>
    </Sheet>
  );
}
