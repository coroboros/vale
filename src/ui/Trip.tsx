/** The language and the destination: the same controls in onboarding, in Moi and in the trip sheet. */
import { editProfile, editTrip } from '../actions';
import { COURSES } from '../content';
import type { Course } from '../content/types';
import { dayKey } from '../engine/progress';
import { tripOf } from '../state/schema';
import { course, pdata, profile } from '../state/store';
import { ChoiceGroup, Sheet } from './kit';

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

/** Changes apply at once: each language keeps its own destination and date. */
export function TripFields() {
  const p = profile.value!;
  const trip = tripOf(p);
  const keys = Object.keys(pdata.value.mem);
  return (
    <>
      <LanguageChoice
        showLabel
        value={p.course}
        onChange={id => editProfile({ course: id })}
        seen={id => keys.filter(k => k.startsWith(`${id}:`)).length}
      />
      <PlaceChoice showLabel course={course.value} value={trip.region} onChange={region => editTrip({ region })} />
      <DateField value={trip.date} onChange={date => editTrip({ date })} />
    </>
  );
}

export function TripSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Mon voyage" onClose={onClose}>
      <div class="form">
        <TripFields />
        <button type="button" class="btn btn-primary btn-block" onClick={onClose}>
          C’est noté
        </button>
      </div>
    </Sheet>
  );
}
