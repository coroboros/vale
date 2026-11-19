import { Pause, Play, SkipForward, X } from 'lucide-preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { logActivity } from '../../actions';
import { currencyOf, itemKey } from '../../content';
import { build, type Card, cardOf } from '../../engine/exercises';
import { pricePuzzle } from '../../engine/prices';
import { seeded, shuffle } from '../../engine/random';
import { play } from '../../platform/sfx';
import { canSpeak, say, stopSpeech } from '../../platform/speech';
import { tripOf } from '../../state/schema';
import { autoplays, cindex, course, db, pdata, profile } from '../../state/store';
import { Mascot } from '../Mascot';
import type { Activity as Kind } from '../router';
import { back } from '../router';

const TITLES: Record<Kind, string> = {
  prices: 'Prix à l’oreille',
  pairs: 'Paires express',
  duel: 'Duel à deux',
  audio: 'Mains libres',
};

/** Games never introduce new phrases. */
function useKnownCards(): Card[] {
  const index = cindex.value;
  const data = pdata.value;
  return useMemo(
    () => index.coreItems.filter(i => data.mem[itemKey(index.course.id, i.id)]).map(i => cardOf(index, i)),
    [index, data],
  );
}

function End({ title, detail, onAgain }: { title: string; detail: string; onAgain: () => void }) {
  useEffect(() => play('done'), []);
  return (
    <div class="activity-end">
      <Mascot mood="cheer" size={130} motion="jump" />
      <h2>{title}</h2>
      <p class="muted">{detail}</p>
      <div class="judge">
        <button type="button" class="btn btn-block" onClick={onAgain}>
          Rejouer
        </button>
        <button type="button" class="btn btn-primary btn-block" onClick={() => back({ name: 'practice' })} autofocus>
          Terminer
        </button>
      </div>
    </div>
  );
}

function Prices() {
  const c = course.value;
  const rng = useMemo(() => seeded(Date.now()), []);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const currency = currencyOf(c, tripOf(profile.value!).region);
  const puzzle = useMemo(() => pricePuzzle(c, currency, rng), [round]);
  const total = 10;
  useEffect(() => {
    if (round < total) void say(puzzle.spoken, { lang: c.lang });
  }, [round]);
  if (round >= total) {
    return (
      <End
        title={score >= 8 ? 'Oreille d’or' : 'Bien joué'}
        detail={`${score} prix compris sur ${total}.`}
        onAgain={() => {
          setScore(0);
          setRound(0);
        }}
      />
    );
  }
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === puzzle.answer;
    play(ok ? 'ok' : 'ko', score);
    const nextScore = score + (ok ? 1 : 0);
    if (ok) setScore(nextScore);
    setTimeout(() => {
      setPicked(null);
      if (round + 1 >= total) logActivity({ prices: nextScore }, nextScore);
      setRound(round + 1);
    }, 1100);
  };
  return (
    <div class="ex">
      <p class="ex-kicker">
        Prix {round + 1} sur {total} : combien ça coûte ?
      </p>
      <div class="say-row center">
        <button
          type="button"
          class="play"
          aria-label="Réécouter"
          onClick={() => void say(puzzle.spoken, { lang: c.lang })}
        >
          <Play size={26} />
        </button>
      </div>
      <div class="choices price-grid">
        {puzzle.options.map(o => (
          <button
            key={o}
            type="button"
            class={`choice${picked && o === puzzle.answer ? ' right' : ''}${picked === o && o !== puzzle.answer ? ' wrong' : ''}`}
            onClick={() => choose(o)}
          >
            <span class="num price">{o}</span>
          </button>
        ))}
      </div>
      {picked && (
        <p class="muted center" lang={c.lang}>
          {puzzle.spoken}
        </p>
      )}
    </div>
  );
}

function Pairs() {
  const known = useKnownCards();
  const [left, setLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [batch, setBatch] = useState(0);
  const [sel, setSel] = useState<{ side: 'l' | 'r'; key: string } | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const cards = useMemo(() => shuffle(Math.random, known).slice(0, 5), [batch, known]);
  const sides = useMemo(() => ({ l: shuffle(Math.random, cards), r: shuffle(Math.random, cards) }), [cards]);
  const over = left <= 0;
  const logged = useRef(false);
  useEffect(() => {
    if (over) return;
    const t = setInterval(() => setLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [over]);
  useEffect(() => {
    if (over && !logged.current) {
      logged.current = true;
      logActivity({ pairs: score }, score);
    }
  }, [over]);
  if (over)
    return (
      <End
        title={`${score} paires`}
        detail="En 60 secondes."
        onAgain={() => {
          logged.current = false;
          setScore(0);
          setSolved([]);
          setBatch(b => b + 1);
          setLeft(60);
        }}
      />
    );
  const pickCell = (side: 'l' | 'r', card: Card) => {
    if (!sel || sel.side === side) return setSel({ side, key: card.key });
    if (sel.key === card.key) {
      play('ok', score);
      setScore(score + 1);
      const next = [...solved, card.key];
      setSel(null);
      if (next.length === cards.length) {
        setSolved([]);
        setBatch(b => b + 1);
      } else setSolved(next);
    } else {
      play('ko');
      setSel(null);
    }
  };
  return (
    <div class="ex">
      <div class="timer" role="timer" aria-label={`${left} secondes restantes`}>
        <span class="num">{left}</span> s<span class="num">{score}</span> paires
      </div>
      <div class="pairs">
        {(['l', 'r'] as const).map(side => (
          <div key={side}>
            {sides[side].map(card => (
              <button
                key={side + card.key}
                type="button"
                class={`pair${solved.includes(card.key) ? ' solved' : ''}${sel?.side === side && sel.key === card.key ? ' sel' : ''}`}
                disabled={solved.includes(card.key)}
                lang={side === 'l' ? card.lang : 'fr'}
                onClick={() => pickCell(side, card)}
              >
                {side === 'l' ? card.item.t : card.item.fr}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Duel() {
  const known = useKnownCards();
  const index = cindex.value;
  const names =
    db.value.profiles.length > 1
      ? db.value.profiles.slice(0, 2).map(p => p.name)
      : [profile.value?.name ?? 'Joueur 1', 'Joueur 2'];
  const rounds = 10;
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [picked, setPicked] = useState<string | null>(null);
  const rng = useMemo(() => seeded(Date.now()), []);
  const questions = useMemo(
    () =>
      shuffle(rng, known)
        .slice(0, rounds)
        .map(card => build('pick', card, index, rng)),
    [known],
  );
  const logged = useRef(false);
  const q = questions[turn];
  if (turn >= questions.length || !q || q.kind !== 'pick') {
    if (!logged.current) {
      logged.current = true;
      logActivity({ duels: 1 }, 5);
    }
    const [a, b] = scores as [number, number];
    return (
      <End
        title={a === b ? 'Égalité' : `${a > b ? names[0] : names[1]} gagne`}
        detail={`${names[0]} ${a} : ${b} ${names[1]}`}
        onAgain={() => {
          logged.current = false;
          setScores([0, 0]);
          setTurn(0);
        }}
      />
    );
  }
  const player = turn % 2;
  const choose = (o: string) => {
    if (picked) return;
    setPicked(o);
    const ok = o === q.answer;
    play(ok ? 'ok' : 'ko');
    if (ok) setScores(s => s.map((v, i) => (i === player ? v + 1 : v)));
    if (autoplays()) void say(q.answer, { lang: q.card.lang });
    setTimeout(() => {
      setPicked(null);
      setTurn(turn + 1);
    }, 1300);
  };
  return (
    <div class="ex">
      <div class="duel-score">
        {names.map((n, i) => (
          <span key={n} class={i === player ? 'active' : ''}>
            {n} <strong class="num">{scores[i]}</strong>
          </span>
        ))}
      </div>
      <p class="ex-kicker">À {names[player]} : comment dit-on…</p>
      <p class="big prompt-fr">{q.card.item.fr}</p>
      <div class="choices">
        {q.options.map(o => (
          <button
            key={o}
            type="button"
            class={`choice${picked && o === q.answer ? ' right' : ''}${picked === o && o !== q.answer ? ' wrong' : ''}`}
            lang={q.card.lang}
            onClick={() => choose(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A pause to answer aloud before hearing the phrase: retrieval comes first. */
function Audio() {
  const known = useKnownCards();
  const queue = useMemo(() => shuffle(Math.random, known), [known]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const run = useRef(0);
  const card = queue[i % Math.max(1, queue.length)];
  const french = canSpeak('fr-FR');
  useEffect(() => {
    if (!playing || !card) return;
    const id = ++run.current;
    const alive = () => run.current === id;
    const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
    (async () => {
      if (french) await say(card.item.fr, { lang: 'fr-FR' });
      if (!alive()) return;
      await wait(2800);
      if (!alive()) return;
      await say(card.item.t, { lang: card.lang });
      if (!alive()) return;
      await wait(900);
      if (!alive()) return;
      await say(card.item.t, { lang: card.lang, slow: true });
      if (!alive()) return;
      await wait(1200);
      if (alive()) setI(n => n + 1);
    })();
    return () => {
      run.current++;
      stopSpeech();
    };
  }, [playing, i]);
  if (!card) return <p class="muted">Apprends quelques phrases d’abord.</p>;
  return (
    <div class="ex audio-mode">
      <p class="ex-kicker">Dis la phrase pendant le silence</p>
      <p class="big prompt-fr">{card.item.fr}</p>
      <p class="big" lang={card.lang}>
        {playing ? '…' : card.item.t}
      </p>
      <div class="say-row center">
        <button
          type="button"
          class="play"
          aria-label={playing ? 'Pause' : 'Lecture'}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? <Pause size={26} /> : <Play size={26} />}
        </button>
        <button type="button" class="play soft" aria-label="Phrase suivante" onClick={() => setI(n => n + 1)}>
          <SkipForward size={24} />
        </button>
      </div>
      {!french && <p class="muted small">Aucune voix française sur cet appareil : lis la consigne à l’écran.</p>}
    </div>
  );
}

export function Activity({ kind }: { kind: Kind }) {
  useEffect(() => () => stopSpeech(), []);
  return (
    <div class="activity">
      <header class="session-top">
        <button type="button" class="icon-btn" aria-label="Quitter" onClick={() => back({ name: 'practice' })}>
          <X size={26} />
        </button>
        <p class="row-title">{TITLES[kind]}</p>
      </header>
      <main class="session-body">
        {kind === 'prices' && <Prices />}
        {kind === 'pairs' && <Pairs />}
        {kind === 'duel' && <Duel />}
        {kind === 'audio' && <Audio />}
      </main>
    </div>
  );
}
