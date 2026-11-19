/**
 * The flight lands: a trip just added ends the way onboarding does, on « Imagine » for that trip,
 * which is the one in focus.
 */
import { X } from 'lucide-preact';
import { startFirstLesson } from '../../actions';
import { learntIn } from '../../engine/progress';
import { tripOf } from '../../state/schema';
import { course, pdata, profile } from '../../state/store';
import { Imagine } from '../Imagine';
import { back, go, route } from '../router';

export function Landing() {
  const p = profile.value!;
  const trip = tripOf(p);
  const c = course.value;
  const fresh = learntIn(pdata.value, c.id) === 0;
  const r = route.value;
  const lessonId = r.name === 'landing' ? r.lesson : undefined;
  return (
    <div class="stage">
      <header class="stage-top">
        <button type="button" class="icon-btn" aria-label="Fermer" onClick={() => back()}>
          <X size={24} aria-hidden="true" />
        </button>
      </header>
      <main class="stage-body">
        <Imagine course={c} region={trip.region} date={trip.date} travellers={[p.name]} cue={p.cue} goal={p.goal} />
      </main>
      <footer class="stage-foot">
        {fresh ? (
          <>
            <button
              type="button"
              class="btn btn-primary btn-block"
              onClick={() => startFirstLesson({ replace: true, lessonId })}
            >
              Apprendre ma première phrase
            </button>
            <button type="button" class="btn btn-ghost btn-block" onClick={() => back()}>
              Plus tard
            </button>
          </>
        ) : (
          <button
            type="button"
            class="btn btn-primary btn-block"
            onClick={() => go({ name: 'home' }, { replace: true })}
          >
            Voir mon itinéraire
          </button>
        )}
      </footer>
    </div>
  );
}
