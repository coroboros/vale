/** Role-play: a short real-life exchange. Tap a word for its meaning, choose what you say. */
import { Languages, X } from 'lucide-preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { completeScene } from '../../actions';
import { normalize } from '../../engine/grade';
import { stamps as allStamps } from '../../engine/progress';
import { shuffle } from '../../engine/random';
import { play } from '../../platform/sfx';
import { say, stopSpeech } from '../../platform/speech';
import { autoplays, course, theme } from '../../state/store';
import { Say } from '../kit';
import { Mascot } from '../Mascot';
import { back, go } from '../router';
import { Stamp } from '../Stamp';

interface Bubble {
  who: 'them' | 'you';
  t: string;
  fr: string;
}

function Words({
  text,
  lang,
  gloss,
  onWord,
}: {
  text: string;
  lang: string;
  gloss: Record<string, string>;
  onWord: (w: string, fr: string) => void;
}) {
  return (
    <span lang={lang}>
      {text.split(/(\s+)/).map((part, i) => {
        const key = normalize(part);
        const fr = gloss[key];
        if (!fr) return <span key={i}>{part}</span>;
        return (
          <button key={i} type="button" class="gloss-word" onClick={() => onWord(part.replace(/[¿?¡!.,]/g, ''), fr)}>
            {part}
          </button>
        );
      })}
    </span>
  );
}

export function SceneScreen({ id }: { id: string }) {
  const c = course.value;
  const scene = c.scenes.find(s => s.id === id);
  const [step, setStep] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [word, setWord] = useState<{ w: string; fr: string } | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [misses, setMisses] = useState(0);
  const [earned, setEarned] = useState<string[] | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const line = scene?.lines[step];
  const options = useMemo(() => (line?.who === 'you' ? shuffle(Math.random, line.options) : []), [step, scene]);

  useEffect(() => {
    if (!scene || !line || line.who !== 'them') return;
    setBubbles(b => [...b, { who: 'them', t: line.t, fr: line.fr }]);
    let cancelled = false;
    const nextLine = () => !cancelled && setStep(s => s + 1);
    if (autoplays()) void say(line.t, { lang: c.lang }).then(() => setTimeout(nextLine, 350));
    else setTimeout(nextLine, 900);
    return () => {
      cancelled = true;
    };
  }, [step, scene]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [bubbles.length, step]);

  useEffect(() => {
    if (scene && step >= scene.lines.length && !earned) {
      play('done');
      const youLines = scene.lines.filter(l => l.who === 'you').length;
      setEarned(completeScene(scene.id, Math.max(0, youLines - misses)));
    }
  }, [step, scene]);

  useEffect(() => () => stopSpeech(), []);

  if (!scene) {
    go({ name: 'practice' }, { replace: true });
    return null;
  }

  const choose = (option: string) => {
    if (line?.who !== 'you') return;
    if (option === line.options[0]) {
      play('ok');
      setBubbles(b => [...b, { who: 'you', t: option, fr: line.task }]);
      if (autoplays()) void say(option, { lang: c.lang });
      setStep(s => s + 1);
    } else {
      play('ko');
      setMisses(m => m + 1);
      setWrong(option);
      setTimeout(() => setWrong(null), 500);
    }
  };

  const finished = step >= scene.lines.length;
  const stampInfo = allStamps(c).filter(s => earned?.includes(s.id));

  return (
    <div class="scene">
      <header class="session-top">
        <button type="button" class="icon-btn" aria-label="Quitter la scène" onClick={() => back({ name: 'practice' })}>
          <X size={26} />
        </button>
        <div class="scene-title">
          <p class="row-title">{scene.title}</p>
          <p class="row-sub" lang={c.lang}>
            {scene.native}
          </p>
        </div>
      </header>
      <div class="chat" aria-live="polite">
        {bubbles.map((b, i) => (
          <div key={i} class={`msg ${b.who}`}>
            {b.who === 'them' && <span class="avatar-dot" aria-hidden="true" />}
            <div class="bubble">
              {b.who === 'them' ? (
                <Words text={b.t} lang={c.lang} gloss={c.gloss} onWord={(w, fr) => setWord({ w, fr })} />
              ) : (
                <span lang={c.lang}>{b.t}</span>
              )}
              {revealed.includes(i) && <span class="bubble-fr">{b.fr}</span>}
              <span class="bubble-tools">
                <Say text={b.t} lang={c.lang} small soft />
                {b.who === 'them' && !revealed.includes(i) && (
                  <button
                    type="button"
                    class="icon-btn"
                    aria-label="Traduire"
                    onClick={() => setRevealed(r => [...r, i])}
                  >
                    <Languages size={20} />
                  </button>
                )}
              </span>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      {word && (
        <button type="button" class="gloss-bar" onClick={() => setWord(null)}>
          <strong lang={c.lang}>{word.w}</strong> : {word.fr}
        </button>
      )}
      {!finished && line?.who === 'you' && (
        <div class="scene-turn">
          <p class="scene-task">{line.task}</p>
          <div class="choices">
            {options.map(o => (
              <button
                key={o}
                type="button"
                class={`choice${wrong === o ? ' shake' : ''}`}
                lang={c.lang}
                onClick={() => choose(o)}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
      {finished && (
        <div class="scene-end">
          <Mascot mood="cheer" size={120} pattern={theme.value.pattern} motion="jump" />
          <h2>Scène réussie</h2>
          <p class="muted">
            {misses
              ? `${misses} hésitation${misses > 1 ? 's' : ''}, c’est comme ça qu’on apprend.`
              : 'Sans une hésitation.'}
          </p>
          {stampInfo.map(s => (
            <Stamp key={s.id} id={s.id} label={s.label} date={Date.now()} fresh />
          ))}
          <button type="button" class="btn btn-primary btn-block" onClick={() => back({ name: 'practice' })}>
            Continuer
          </button>
        </div>
      )}
    </div>
  );
}
