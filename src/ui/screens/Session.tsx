/** A practice session: one exercise at a time, immediate feedback, a ticket at the end. */
import { Check, Clock, Flame, Mic, Play, Square, Target, Volume2, VolumeX, X, Zap } from 'lucide-preact';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { advance, closeSession, running, type Summary, setQuiet, submitAnswer } from '../../actions';
import type { Card, Exercise } from '../../engine/exercises';
import { grade, normalize, type Verdict } from '../../engine/grade';
import { stamps as allStamps } from '../../engine/progress';
import { shuffle } from '../../engine/random';
import { progress } from '../../engine/session';
import { canRecord, playTake, releaseMic, startRecording, stopRecording } from '../../platform/recorder';
import { play } from '../../platform/sfx';
import { say } from '../../platform/speech';
import { autoplays, course, isQuiet, settings, theme } from '../../state/store';
import { Bar, ChoiceGroup, Phonetic, Say, Sheet } from '../kit';
import { Mascot } from '../Mascot';
import { Stamp } from '../Stamp';

type Feedback = { ok: boolean; verdict?: Verdict; neutral?: boolean } | null;

const speak = (card: Card, variant = 0) => say(card.item.t, { lang: card.lang, slow: settings.value.slow, variant });

/**
 * Keyboard: 1-9 pick, Enter checks or continues, Escape quits. Registered before the first
 * paint (layout effect), so a key pressed as soon as an exercise appears is never lost.
 */
function useKeys(handler: (key: string) => void) {
  const ref = useRef(handler);
  ref.current = handler;
  useLayoutEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (typing && e.key !== 'Enter' && e.key !== 'Escape') return;
      ref.current(e.key);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

function FeedbackPanel({ fb, card, onNext }: { fb: NonNullable<Feedback>; card: Card | null; onNext: () => void }) {
  const title = fb.neutral
    ? 'C’était…'
    : fb.ok
      ? fb.verdict === 'accents'
        ? 'Presque parfait'
        : fb.verdict === 'typo'
          ? 'Bien, une petite faute'
          : 'Bien joué'
      : 'La bonne réponse';
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);
  return (
    <div class={`feedback ${fb.neutral ? 'neutral' : fb.ok ? 'ok' : 'ko'}`} aria-live="polite">
      <div class="feedback-body">
        <Mascot
          size={64}
          mood={fb.neutral ? 'idle' : fb.ok ? 'happy' : 'oops'}
          pattern={theme.value.pattern}
          decorative
        />
        <div class="feedback-text">
          <p class="feedback-title">{title}</p>
          {card && (
            <>
              <p class="feedback-answer" lang={card.lang}>
                {card.item.t}
              </p>
              <Phonetic ph={card.item.ph} />
              <p class="muted">{card.item.fr}</p>
              {fb.verdict === 'accents' && <p class="muted">Attention aux accents.</p>}
              {!fb.ok && card.item.note && <p class="feedback-note">{card.item.note}</p>}
            </>
          )}
        </div>
        {card && <Say text={card.item.t} lang={card.lang} small soft />}
      </div>
      <button
        ref={btn}
        type="button"
        class={`btn btn-block ${fb.neutral ? 'btn-primary' : fb.ok ? 'btn-ok' : 'btn-ko'}`}
        onClick={onNext}
      >
        Continuer
      </button>
    </div>
  );
}

function Learn({ ex, onDone }: { ex: Exercise & { kind: 'learn' }; onDone: () => void }) {
  const { card } = ex;
  useEffect(() => {
    if (autoplays()) void speak(card);
  }, [card.key]);
  useKeys(k => {
    if (k === 'Enter') onDone();
    if (k === ' ') void speak(card);
  });
  return (
    <div class="ex">
      <p class="ex-kicker">Nouvelle phrase</p>
      <div class="learn-card">
        <p class="big" lang={card.lang}>
          {card.item.t}
        </p>
        <Phonetic ph={card.item.ph} />
        <p class="learn-fr">{card.item.fr}</p>
        {card.item.note && <p class="learn-note">{card.item.note}</p>}
        <div class="say-row">
          <Say text={card.item.t} lang={card.lang} />
          <Say text={card.item.t} lang={card.lang} slow />
        </div>
      </div>
      <div class="ex-actions">
        <button type="button" class="btn btn-primary btn-block" onClick={onDone}>
          Continuer
        </button>
      </div>
    </div>
  );
}

/** Offered on exercises that need sound: switches quiet mode on for an hour (as Duolingo does). */
function CantListen({ onMute }: { onMute?: () => void }) {
  if (!onMute) return null;
  return (
    <button type="button" class="btn btn-ghost btn-block" onClick={onMute}>
      Je ne peux pas écouter maintenant
    </button>
  );
}

function Choice({
  ex,
  onResult,
  onMute,
}: {
  ex: Exercise & { kind: 'guess' | 'reco' | 'listen' | 'pick' };
  onResult: (ok: boolean) => void;
  onMute?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const { card } = ex;
  const targetOptions = ex.kind === 'listen' || ex.kind === 'pick';
  useEffect(() => {
    if (ex.kind === 'listen' || (autoplays() && (ex.kind === 'reco' || ex.kind === 'guess')))
      void speak(card, ex.kind === 'listen' ? 1 : 0);
  }, [card.key, ex.kind]);
  const check = () => picked && onResult(picked === ex.answer);
  useKeys(k => {
    const n = Number(k);
    if (n >= 1 && n <= ex.options.length) setPicked(ex.options[n - 1]!);
    if (k === 'Enter') check();
    if (k === ' ' && ex.kind !== 'pick') void speak(card, 1);
  });
  const prompt = {
    guess: 'Devine ce que ça veut dire',
    reco: 'Que veut dire cette phrase ?',
    listen: 'Qu’est-ce que tu entends ?',
    pick: 'Comment dit-on…',
  }[ex.kind];
  return (
    <div class="ex">
      <p class="ex-kicker">{prompt}</p>
      {ex.kind === 'listen' ? (
        <div class="say-row center">
          <Say text={card.item.t} lang={card.lang} variant={1} />
          <Say text={card.item.t} lang={card.lang} slow variant={1} />
        </div>
      ) : ex.kind === 'pick' ? (
        <p class="big prompt-fr">{card.item.fr}</p>
      ) : (
        <div class="prompt-target">
          <Say text={card.item.t} lang={card.lang} small />
          <p class="big" lang={card.lang}>
            {card.item.t}
          </p>
        </div>
      )}
      <ChoiceGroup
        name="answer"
        label="Réponses"
        numbered
        value={picked}
        options={ex.options.map(o => ({ value: o, title: o, lang: targetOptions ? card.lang : undefined }))}
        onChange={o => {
          play('tap');
          setPicked(o);
          if (ex.kind === 'pick' && autoplays()) void say(o, { lang: card.lang });
        }}
      />
      <div class="ex-actions">
        {ex.kind === 'listen' && <CantListen onMute={onMute} />}
        <button type="button" class="btn btn-primary btn-block" disabled={!picked} onClick={check}>
          {ex.kind === 'guess' ? 'Voir la réponse' : 'Vérifier'}
        </button>
      </div>
    </div>
  );
}

function Tiles({
  ex,
  onResult,
}: {
  ex: Exercise & { kind: 'tilesFr' | 'tilesTarget' };
  onResult: (ok: boolean) => void;
}) {
  const [chosen, setChosen] = useState<number[]>([]);
  const { card } = ex;
  const targetTiles = ex.kind === 'tilesTarget';
  useEffect(() => {
    if (!targetTiles && autoplays()) void speak(card);
  }, [card.key]);
  const check = () =>
    chosen.length && onResult(normalize(chosen.map(i => ex.tiles[i]).join(' ')) === normalize(ex.answer.join(' ')));
  useKeys(k => {
    const n = Number(k);
    const free = ex.tiles.map((_, i) => i).filter(i => !chosen.includes(i));
    if (n >= 1 && n <= free.length) setChosen([...chosen, free[n - 1]!]);
    if (k === 'Backspace') setChosen(chosen.slice(0, -1));
    if (k === 'Enter') check();
  });
  return (
    <div class="ex">
      <p class="ex-kicker">{targetTiles ? `Traduis en ${course.value.name.toLowerCase()}` : 'Traduis en français'}</p>
      {targetTiles ? (
        <p class="big prompt-fr">{card.item.fr}</p>
      ) : (
        <div class="prompt-target">
          <Say text={card.item.t} lang={card.lang} small />
          <p class="big" lang={card.lang}>
            {card.item.t}
          </p>
        </div>
      )}
      <fieldset class="answer-line" lang={targetTiles ? card.lang : 'fr'}>
        <legend class="sr-only">Ta réponse</legend>
        {chosen.map(i => (
          <button key={i} type="button" class="tile" onClick={() => setChosen(chosen.filter(x => x !== i))}>
            {ex.tiles[i]}
          </button>
        ))}
      </fieldset>
      <div class="bank" lang={targetTiles ? card.lang : 'fr'}>
        {ex.tiles.map((w, i) => (
          <button
            key={i}
            type="button"
            class="tile"
            disabled={chosen.includes(i)}
            onClick={() => {
              play('tap');
              setChosen([...chosen, i]);
            }}
          >
            {w}
          </button>
        ))}
      </div>
      <div class="ex-actions">
        <button type="button" class="btn btn-primary btn-block" disabled={!chosen.length} onClick={check}>
          Vérifier
        </button>
      </div>
    </div>
  );
}

function Dictation({
  card,
  onResult,
  onMute,
}: {
  card: Card;
  onResult: (ok: boolean, verdict: Verdict) => void;
  onMute?: () => void;
}) {
  const [text, setText] = useState('');
  useEffect(() => void speak(card, 1), [card.key]);
  const check = () => {
    if (!text.trim()) return;
    const g = grade(text, [card.item.t]);
    onResult(g.verdict !== 'wrong', g.verdict);
  };
  return (
    <div class="ex">
      <p class="ex-kicker">Écris ce que tu entends</p>
      <div class="say-row center">
        <Say text={card.item.t} lang={card.lang} variant={1} />
        <Say text={card.item.t} lang={card.lang} slow variant={1} />
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          check();
        }}
      >
        <label class="sr-only" for="dictation">
          Ta réponse
        </label>
        <input
          id="dictation"
          class="input big-input"
          lang={card.lang}
          value={text}
          onInput={e => setText(e.currentTarget.value)}
          autocomplete="off"
          autocapitalize="off"
          spellcheck={false}
          enterkeyhint="done"
        />
        <div class="ex-actions">
          <CantListen onMute={onMute} />
          <button type="submit" class="btn btn-primary btn-block" disabled={!text.trim()}>
            Vérifier
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Say it aloud, hear yourself next to the model voice, then judge honestly.
 * Recording is optional. In quiet mode the phrase is said in one's head: recalling it silently
 * still strengthens memory (Smith, Roediger & Karpicke, 2013), and the model voice waits for a tap.
 */
function Speak({ card, onResult }: { card: Card; onResult: (ok: boolean) => void }) {
  const quiet = isQuiet();
  const mic = canRecord() && !quiet;
  const [state, setState] = useState<'ready' | 'recording' | 'revealed'>('ready');
  const [take, setTake] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const revealed = useRef(false);
  useEffect(() => () => releaseMic(), []);
  const reveal = (url: string | null) => {
    revealed.current = true;
    setTake(url);
    setState('revealed');
    if (!quiet) void speak(card);
  };
  const toggle = async () => {
    if (state === 'recording') return reveal(await stopRecording());
    try {
      await startRecording();
      // The answer may have been revealed while the microphone permission was pending.
      if (revealed.current) void stopRecording();
      else setState('recording');
    } catch {
      setDenied(true);
      if (!revealed.current) reveal(null);
    }
  };
  useKeys(k => {
    if (k === 'Enter' && state === 'revealed') onResult(true);
    if (k === ' ' && state !== 'revealed' && mic) void toggle();
  });
  return (
    <div class="ex">
      <p class="ex-kicker">{quiet ? 'Dis-le dans ta tête' : 'Dis-le à voix haute'}</p>
      <p class="big prompt-fr">{card.item.fr}</p>
      {state !== 'revealed' ? (
        <div class="speak-zone">
          {mic && !denied ? (
            <button
              type="button"
              class={`mic${state === 'recording' ? ' on' : ''}`}
              onClick={() => void toggle()}
              aria-label={state === 'recording' ? 'Arrêter' : 'Enregistrer ma voix'}
            >
              {state === 'recording' ? <Square size={34} /> : <Mic size={38} />}
            </button>
          ) : null}
          <p class="muted">
            {state === 'recording'
              ? 'Je t’écoute… touche pour arrêter.'
              : mic
                ? 'Touche le micro, dis la phrase, touche à nouveau.'
                : quiet
                  ? 'Dis la phrase dans ta tête, puis découvre la réponse.'
                  : 'Dis la phrase à voix haute, puis découvre la réponse.'}
          </p>
          <button type="button" class={mic && !denied ? 'btn btn-ghost' : 'btn'} onClick={() => reveal(null)}>
            Voir la réponse
          </button>
        </div>
      ) : (
        <div class="speak-zone">
          <p class="big" lang={card.lang}>
            {card.item.t}
          </p>
          <Phonetic ph={card.item.ph} />
          <div class="compare">
            {take && (
              <button type="button" class="btn" onClick={() => void playTake(take)}>
                <Play size={18} aria-hidden="true" /> Ma voix
              </button>
            )}
            <button type="button" class="btn" onClick={() => void speak(card)}>
              <Play size={18} aria-hidden="true" /> Le modèle
            </button>
          </div>
          <div class="judge">
            <button type="button" class="btn btn-block" onClick={() => onResult(false)}>
              À retravailler
            </button>
            <button type="button" class="btn btn-primary btn-block" onClick={() => onResult(true)}>
              {quiet ? 'Je l’avais' : 'Je l’ai bien dit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Match({ cards, onDone }: { cards: Card[]; onDone: () => void }) {
  const left = useMemo(() => shuffle(Math.random, cards), [cards]);
  const right = useMemo(() => shuffle(Math.random, cards), [cards]);
  const [solved, setSolved] = useState<string[]>([]);
  const [sel, setSel] = useState<{ side: 'l' | 'r'; key: string } | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const pickSide = (side: 'l' | 'r', c: Card) => {
    if (solved.includes(c.key)) return;
    if (side === 'l' && autoplays()) void say(c.item.t, { lang: c.lang });
    if (!sel || sel.side === side) return setSel({ side, key: c.key });
    if (sel.key === c.key) {
      play('ok', solved.length);
      const next = [...solved, c.key];
      setSolved(next);
      setSel(null);
      if (next.length === cards.length) setTimeout(onDone, 500);
    } else {
      play('ko');
      setWrong(c.key);
      setSel(null);
      setTimeout(() => setWrong(null), 400);
    }
  };
  const cell = (side: 'l' | 'r', c: Card) => (
    <button
      key={side + c.key}
      type="button"
      class={`pair${solved.includes(c.key) ? ' solved' : ''}${sel?.side === side && sel.key === c.key ? ' sel' : ''}${wrong === c.key ? ' wrong' : ''}`}
      disabled={solved.includes(c.key)}
      lang={side === 'l' ? c.lang : 'fr'}
      onClick={() => pickSide(side, c)}
    >
      {side === 'l' ? c.item.t : c.item.fr}
    </button>
  );
  return (
    <div class="ex">
      <p class="ex-kicker">Bonus : relie les paires</p>
      <div class="pairs">
        <div>{left.map(c => cell('l', c))}</div>
        <div>{right.map(c => cell('r', c))}</div>
      </div>
    </div>
  );
}

function Ticket({ title, summary }: { title: string; summary: Summary }) {
  const { outcome: o } = summary;
  const accuracy = o.total ? Math.round((o.correct / o.total) * 100) : 100;
  const minutes = Math.max(1, Math.round(summary.ms / 60000));
  const stampInfo = allStamps(course.value).filter(s => summary.stamps.includes(s.id));
  useEffect(() => play(summary.stamps.length ? 'stamp' : 'done'), []);
  const headline = !o.passed
    ? 'Pas encore, mais c’est noté'
    : o.perfect
      ? 'Sans faute'
      : summary.lessonDone
        ? 'Leçon terminée'
        : 'Session terminée';
  return (
    <div class="ticket-wrap">
      <Mascot mood={o.passed ? 'cheer' : 'idle'} size={150} pattern={theme.value.pattern} motion="jump" />
      <h1>{headline}</h1>
      <section class="ticket" aria-label="Bilan de la session">
        <p class="ticket-title">{title}</p>
        <div class="ticket-stats">
          <div>
            <Zap size={20} aria-hidden="true" />
            <strong class="num">+{o.xp}</strong>
            <span>XP</span>
          </div>
          <div>
            <Target size={20} aria-hidden="true" />
            <strong class="num">{accuracy} %</strong>
            <span>réussite</span>
          </div>
          <div>
            <Clock size={20} aria-hidden="true" />
            <strong class="num">{minutes} min</strong>
            <span>pratique</span>
          </div>
          <div>
            <Flame size={20} aria-hidden="true" />
            <strong class="num">{summary.streak}</strong>
            <span>jour{summary.streak > 1 ? 's' : ''} de série</span>
          </div>
        </div>
        {o.learned.length > 0 && (
          <p class="ticket-foot">
            {o.learned.length} nouvelle{o.learned.length > 1 ? 's' : ''} phrase{o.learned.length > 1 ? 's' : ''} en
            mémoire
          </p>
        )}
      </section>
      {stampInfo.length > 0 && (
        <div class="new-stamps">
          {stampInfo.map(s => (
            <div key={s.id} class="new-stamp">
              <Stamp id={s.id} label={s.label} date={Date.now()} fresh />
              <span>Nouveau tampon : {s.label}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" class="btn btn-primary btn-block" onClick={closeSession} autofocus>
        Continuer
      </button>
    </div>
  );
}

export function SessionScreen() {
  const r = running.value!;
  const ex = r.session.current;
  const [fb, setFb] = useState<Feedback>(null);
  const exKey = `${r.session.step}:${ex && ex.kind !== 'match' ? ex.card.key + ex.kind : 'match'}`;
  const [confirmQuit, setConfirmQuit] = useState(false);

  if (r.summary) return <Ticket title={r.title} summary={r.summary} />;

  const result = (ok: boolean, verdict?: Verdict) => {
    const neutral = ex?.kind === 'guess';
    if (!neutral) play(ok ? 'ok' : 'ko', r.combo);
    submitAnswer(ok);
    setFb({ ok, verdict, neutral });
  };
  const next = () => {
    setFb(null);
    advance();
  };
  const card = ex && ex.kind !== 'match' ? ex.card : null;
  // A listening drill is chosen on purpose: no quiet mode inside it.
  const drill = r.session.mode.kind === 'practice' && r.session.mode.focus === 'listening';
  const quiet = isQuiet();
  const mute = drill ? undefined : () => setQuiet(true, { forAnHour: true });

  return (
    <div class="session">
      <header class="session-top">
        <button type="button" class="icon-btn" aria-label="Quitter la session" onClick={() => setConfirmQuit(true)}>
          <X size={26} />
        </button>
        <Bar value={progress(r.session)} label="Progression de la session" />
        {!drill && (
          <button
            type="button"
            class="icon-btn"
            aria-label="Mode discret"
            aria-pressed={quiet}
            onClick={() => setQuiet(!quiet, { forAnHour: true })}
          >
            {quiet ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        )}
        <div class={`combo${r.combo >= 3 ? ' hot' : ''}`}>
          <Check size={18} aria-hidden="true" />
          <span class="num">{r.combo}</span>
          <span class="sr-only">bonnes réponses d’affilée</span>
        </div>
      </header>
      <main class={`session-body${fb ? ' has-feedback' : ''}`} key={exKey}>
        {ex?.kind === 'learn' && (
          <Learn
            ex={ex}
            onDone={() => {
              submitAnswer(true);
              advance();
            }}
          />
        )}
        {(ex?.kind === 'guess' || ex?.kind === 'reco' || ex?.kind === 'listen' || ex?.kind === 'pick') && !fb && (
          <Choice ex={ex} onResult={ok => result(ok)} onMute={mute} />
        )}
        {(ex?.kind === 'tilesFr' || ex?.kind === 'tilesTarget') && !fb && <Tiles ex={ex} onResult={ok => result(ok)} />}
        {ex?.kind === 'dictation' && !fb && <Dictation card={ex.card} onResult={result} onMute={mute} />}
        {ex?.kind === 'speak' && !fb && <Speak card={ex.card} onResult={ok => result(ok)} />}
        {ex?.kind === 'match' && <Match cards={ex.cards} onDone={next} />}
        {fb && card && <ReviewCard card={card} />}
      </main>
      {fb && <FeedbackPanel fb={fb} card={card} onNext={next} />}
      {confirmQuit && (
        <Sheet title="Quitter la session ?" onClose={() => setConfirmQuit(false)}>
          <p>Les phrases de cette session ne seront pas enregistrées.</p>
          <div class="judge sheet-actions">
            <button type="button" class="btn btn-block" onClick={closeSession}>
              Quitter
            </button>
            <button type="button" class="btn btn-primary btn-block" onClick={() => setConfirmQuit(false)}>
              Continuer la session
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/** Keeps the phrase on screen behind the feedback panel, so the answer is read in context. */
function ReviewCard({ card }: { card: Card }) {
  return (
    <div class="ex review-card" aria-hidden="true">
      <p class="big" lang={card.lang}>
        {card.item.t}
      </p>
      <p class="learn-fr">{card.item.fr}</p>
    </div>
  );
}
