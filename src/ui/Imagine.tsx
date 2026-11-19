/** « Imagine »: the traveller pictured at their destination, closing onboarding and every new trip. */
import { useId, useState } from 'preact/hooks';
import { regionOf } from '../content';
import type { Course } from '../content/types';
import { goalOf } from '../state/schema';
import { imagineWords } from './imagine-words';
import { Say } from './kit';
import { Mascot } from './Mascot';
import { type Photo, PORTRAIT, photoFiles, photoOf } from './photos';

function Backdrop({ photo, onError }: { photo: Photo; onError: () => void }) {
  const files = photoFiles(photo.id);
  return (
    <picture class="imagine-photo">
      <source media={PORTRAIT} srcset={files.portrait} />
      <img
        src={files.fallback}
        srcset={files.srcset}
        sizes="100vw"
        alt={photo.alt}
        style={{ '--focus': `${photo.focus * 100}%` }}
        onError={onError}
      />
    </picture>
  );
}

function Credit({ photo }: { photo: Photo }) {
  return (
    <p class="photo-credit">
      Photo :{' '}
      <a href={photo.source} target="_blank" rel="noreferrer">
        {photo.author}
      </a>
      ,{' '}
      {photo.licenseUrl ? (
        <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
          {photo.license}
        </a>
      ) : (
        photo.license
      )}
      , recadrée
    </p>
  );
}

/** Over the destination's photo when it loads; without it, Bernard stands in. */
export function Imagine({
  course: c,
  region,
  date,
  travellers,
  cue,
  goal,
}: {
  course: Course;
  region: string;
  date: string;
  travellers: readonly [string, ...string[]];
  cue: string;
  goal: number;
}) {
  const heading = useId();
  const photo = photoOf(c.id, region);
  const [broken, setBroken] = useState('');
  const shown = photo && photo.id !== broken ? photo : undefined;
  const words = imagineWords({
    course: c,
    travellers,
    at: regionOf(c, region).at,
    date,
    cue,
    minutes: goalOf(goal).minutes,
  });
  return (
    <section class="imagine" aria-labelledby={heading}>
      <h1 id={heading}>{words.title}</h1>
      {shown && <Mascot size={72} flag={c.flag} mood="cheer" motion="bob" decorative />}
      <p class="lead">{words.lead}</p>
      {shown && <Backdrop photo={shown} onError={() => setBroken(shown.id)} />}
      <div class="imagine-line">
        <Say text={words.sentence} lang={c.lang} />
        <p class="big" lang={c.lang}>
          {words.sentence}
        </p>
      </div>
      <p class="imagine-plan">{words.plan}</p>
      {shown ? <Credit photo={shown} /> : <Mascot size={130} flag={c.flag} mood="cheer" motion="bob" />}
    </section>
  );
}
