import { pictureOf } from '../content';
import { tripOf } from '../state/schema';
import { course, profile } from '../state/store';
import { Scenery } from './scenery/Scenery';

/** Bernard's latest postcard, on the drawing of the destination. */
export function FromBernard({ text }: { text: string }) {
  const trip = tripOf(profile.value!);
  return (
    <figure class="from-bernard">
      <div class="from-bernard-view" aria-hidden="true">
        <Scenery place={pictureOf(course.value, trip.region)} />
      </div>
      <figcaption>
        <span class="small muted">Une carte de Bernard</span>
        <span>« {text} »</span>
      </figcaption>
    </figure>
  );
}
