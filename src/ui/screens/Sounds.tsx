import { ArrowLeft } from 'lucide-preact';
import { useEffect } from 'preact/hooks';
import { markSoundsSeen } from '../../actions';
import { course } from '../../state/store';
import { Say } from '../kit';
import { back } from '../router';

export function Sounds() {
  const c = course.value;
  useEffect(() => markSoundsSeen(), [c.id]);
  return (
    <>
      <header class="page-head with-back">
        <button type="button" class="icon-btn" aria-label="Retour" onClick={() => back()}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1>Les sons</h1>
          <p class="muted">Ce qui change pour une oreille française.</p>
        </div>
      </header>
      <p class="card note-card">{c.phonetics}</p>
      <section class="sounds" aria-label="Sons">
        {c.sounds.map(s => (
          <article key={s.key} class="card sound">
            <h2 class="sound-title">{s.title}</h2>
            <p class="muted">{s.desc}</p>
            <ul class="sound-examples">
              {s.examples.map(([word, ph, fr]) => (
                <li key={word}>
                  <Say text={word} lang={c.lang} small soft />
                  <span class="sound-word" lang={c.lang}>
                    {word}
                  </span>
                  <span class="ph">{ph}</span>
                  {fr && <span class="muted">{fr}</span>}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </>
  );
}
