import { Check, Clock, Flame, Mic, Play, Shell, Square, Target, Volume2, VolumeX, X } from 'lucide-preact';
import { Fragment } from 'preact';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  advance,
  closeSession,
  running,
  type Summary,
  setQuiet,
  setSpeechCheck,
  startSession,
  submitAnswer,
} from '../../actions';
import type { Card, Exercise } from '../../engine/exercises';
import { grade, normalize, type Verdict } from '../../engine/grade';
import { stamps as allStamps, dayKey, goalTitle, NEAR_GOAL, shells, shellWord } from '../../engine/progress';
import { checkSpeech, type SpeechCheck } from '../../engine/pronunciation';
import { shuffle } from '../../engine/random';
import { progress } from '../../engine/session';
import { canHear, canInstall, installPack, listen, probe, whereHeard } from '../../platform/recognition';
import { canRecord, playTake, releaseMic, startRecording, stopRecording } from '../../platform/recorder';
import { play } from '../../platform/sfx';
import { say, stopSpeech } from '../../platform/speech';
import { autoplays, course, isQuiet, pdata, profile, settings } from '../../state/store';
import { FromBernard } from '../FromBernard';
import { Bar, ChoiceGroup, Phonetic, Say, Sheet } from '../kit';
import { Mascot } from '../Mascot';
import { Stamp } from '../Stamp';

type Feedback = { ok: boolean; verdict?: Verdict; neutral?: boolean; heard?: SpeechCheck } | null;

const speak = (card: Card, variant = 0) => say(card.item.t, { lang: card.lang, slow: settings.value.slow, variant });

/** A layout effect, so a key pressed as soon as an exercise appears is never lost. */
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
  // A retry shows how the latest attempt went; the first one has already been graded.
  const ok = fb.heard?.ok ?? fb.ok;
  const title = fb.neutral
    ? 'C’était…'
    : fb.heard
      ? fb.heard.all
        ? 'Je t’ai compris'
        : ok
          ? 'Presque tout compris'
          : 'Pas encore compris'
      : ok
        ? fb.verdict === 'accents'
          ? 'Presque parfait'
          : fb.verdict === 'typo'
            ? 'Bien, une petite faute'
            : 'Bien joué'
        : 'La bonne réponse';
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => btn.current?.focus(), []);
  return (
    <div class={`feedback ${fb.neutral ? 'neutral' : ok ? 'ok' : 'ko'}`} aria-live="polite">
      <div class="feedback-body">
        <Mascot size={64} mood={fb.neutral ? 'idle' : ok ? 'happy' : 'oops'} decorative />
        <div class="feedback-text">
          <p class="feedback-title">{title}</p>
          {card && (
            <>
              {fb.heard ? (
                <HeardPhrase check={fb.heard} lang={card.lang} />
              ) : (
                <p class="feedback-answer" lang={card.lang}>
                  {card.item.t}
                </p>
              )}
              <Phonetic ph={card.item.ph} />
              <p class="muted">{card.item.fr}</p>
              {fb.heard && !fb.heard.all && (
                <p class="muted">
                  J’ai entendu : « <span lang={card.lang}>{fb.heard.heard}</span> »
                </p>
              )}
              {fb.verdict === 'accents' && <p class="muted">Attention aux accents.</p>}
              {!ok && card.item.note && <p class="feedback-note">{card.item.note}</p>}
            </>
          )}
        </div>
        {card && <Say text={card.item.t} lang={card.lang} small soft />}
      </div>
      <button
        ref={btn}
        type="button"
        class={`btn btn-block ${fb.neutral ? 'btn-primary' : ok ? 'btn-ok' : 'btn-ko'}`}
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

function TargetPrompt({ card }: { card: Card }) {
  return (
    <div class="prompt-target">
      <Say text={card.item.t} lang={card.lang} small />
      <p class="big" lang={card.lang}>
        {card.item.t}
      </p>
    </div>
  );
}

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
        <TargetPrompt card={card} />
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
      {targetTiles ? <p class="big prompt-fr">{card.item.fr}</p> : <TargetPrompt card={card} />}
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
 * In quiet mode the phrase is said in one's head: recalling it silently still strengthens memory
 * (Smith, Roediger & Karpicke, 2013).
 */
const ASK_DEVICE = 'La reconnaissance vocale tourne sur ton appareil : ta voix n’en sort pas.';
const ASK_BROWSER =
  'Ton navigateur reconnaît ta voix : sur ton appareil quand il le peut, sinon par son service en ligne (Apple, Google…). Bagage ne garde rien.';
const ASK_INSTALL =
  'Ton navigateur peut reconnaître ta voix sur ton appareil après un téléchargement, une seule fois : ta voix n’en sortira pas. Sinon, son service en ligne l’entend. Bagage ne garde rien.';

/**
 * With the browser's speech recognition, the learner sees which words it heard; without it, they
 * record themselves, compare with the model and judge.
 */
function Speak({
  card,
  judged,
  onResult,
  onRetry,
}: {
  card: Card;
  judged: boolean;
  onResult: (ok: boolean, heard?: SpeechCheck) => void;
  onRetry: (heard: SpeechCheck) => void;
}) {
  const quiet = isQuiet();
  const mic = canRecord() && !quiet;
  const choice = settings.value.speechCheck;
  const [where, setWhere] = useState(() => whereHeard(card.lang));
  const checks = !quiet && choice !== 'off' && canHear() && !!where;
  const [state, setState] = useState<
    'ready' | 'asking' | 'installing' | 'starting' | 'listening' | 'recording' | 'revealed'
  >('ready');
  const [note, setNote] = useState('');
  const [last, setLast] = useState<SpeechCheck | null>(null);
  const [take, setTake] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);
  const revealed = useRef(false);
  const alive = useRef(true);
  const cancel = useRef<(() => void) | null>(null);
  const yes = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (where === undefined && !quiet && choice !== 'off')
      void probe(card.lang).then(() => {
        if (alive.current) setWhere(whereHeard(card.lang));
      });
    return () => {
      alive.current = false;
      cancel.current?.();
      releaseMic();
    };
  }, []);
  useEffect(() => {
    if (state === 'asking') yes.current?.focus();
  }, [state]);

  const reveal = (url: string | null) => {
    cancel.current?.();
    revealed.current = true;
    setTake(url);
    setState('revealed');
    if (!quiet) void speak(card);
  };
  const record = async () => {
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
  const hear = (at = where) => {
    stopSpeech();
    setNote('');
    setState('starting');
    const run = listen(card.lang, at || 'browser', () => setState('listening'));
    cancel.current = run.cancel;
    void run.done.then(h => {
      cancel.current = null;
      if (!alive.current || revealed.current) return;
      setState('ready');
      if (h.kind !== 'heard') {
        setNote(
          h.kind === 'silence'
            ? 'Je n’ai rien entendu. Réessaie un peu plus fort.'
            : 'La reconnaissance vocale ne répond pas.',
        );
        return;
      }
      const check = checkSpeech(card.item.t, h.transcripts, course.value.numbers.spell);
      setLast(check);
      if (judged) onRetry(check);
      else onResult(check.ok, check);
      if (!check.all) void speak(card);
    });
  };
  const tap = async () => {
    if (state === 'recording') return reveal(await stopRecording());
    if (state !== 'ready') return;
    if (checks && choice === 'ask') return setState('asking');
    if (checks) return hear();
    if (mic) await record();
  };
  const installing = useRef(false);
  const choose = (on: boolean) => {
    installing.current = false;
    setSpeechCheck(on);
    if (on) hear();
    else if (mic) void record();
    else setState('ready');
  };
  // Chrome on a computer: its language pack keeps the voice on the device, instead of its online service.
  const offer = where === 'browser' && (canInstall(card.lang) || state === 'installing');
  const install = async () => {
    if (installing.current) return;
    installing.current = true;
    setNote('');
    setState('installing');
    const ok = await installPack(card.lang);
    // The learner may have chosen otherwise meanwhile: the pack still serves the next phrases.
    if (!installing.current || !alive.current || revealed.current) return;
    installing.current = false;
    if (!ok) {
      setNote('Le téléchargement n’a pas abouti.');
      setState('asking');
      return;
    }
    setWhere('device');
    setSpeechCheck(true);
    hear('device');
  };
  useKeys(k => {
    if (judged) return;
    if (k === 'Enter' && state === 'revealed') onResult(true);
    if (k === ' ' && (state === 'ready' || state === 'recording')) void tap();
  });

  const busy = state === 'starting' || state === 'listening';
  const micButton = (label: string) => (
    <button
      type="button"
      class={`mic${judged ? ' small' : ''}${state === 'listening' || state === 'recording' ? ' on' : ''}`}
      onClick={() => void tap()}
      aria-disabled={busy}
      aria-label={busy ? 'Je t’écoute' : state === 'recording' ? 'Arrêter' : label}
    >
      {state === 'recording' ? <Square size={34} /> : <Mic size={judged ? 28 : 38} />}
    </button>
  );
  const line =
    state === 'starting'
      ? 'Un instant…'
      : state === 'listening'
        ? 'Je t’écoute…'
        : state === 'recording'
          ? 'Je t’écoute… touche pour arrêter.'
          : note;

  if (judged && last?.all) return <ReviewCard card={card} />;
  if (judged)
    return (
      <div class="ex">
        <p class="ex-kicker">Encore une fois ?</p>
        <div class="speak-zone">
          {checks && micButton('Réessayer')}
          <p class="muted" aria-live="polite">
            {line || (checks ? 'Touche le micro et redis la phrase.' : '')}
          </p>
        </div>
      </div>
    );
  return (
    <div class="ex">
      <p class="ex-kicker">{quiet ? 'Dis-le dans ta tête' : 'Dis-le à voix haute'}</p>
      <p class="big prompt-fr">{card.item.fr}</p>
      {state === 'asking' || state === 'installing' ? (
        <div class="speak-ask">
          <p class="speak-ask-title">Je te dis ce que j’ai compris ?</p>
          <p class="muted" aria-live="polite">
            {state === 'installing'
              ? 'Téléchargement de la reconnaissance vocale, une seule fois…'
              : `${note ? `${note} ` : ''}${offer ? ASK_INSTALL : where === 'device' ? ASK_DEVICE : ASK_BROWSER}`}
          </p>
          <div class="judge">
            <button type="button" class="btn btn-block" onClick={() => choose(false)}>
              {mic ? 'Juste m’enregistrer' : 'Non merci'}
            </button>
            <button
              ref={yes}
              type="button"
              class="btn btn-primary btn-block"
              aria-disabled={state === 'installing'}
              onClick={() => (offer ? void install() : choose(true))}
            >
              {offer ? 'Installer et vérifier' : 'Vérifier ma prononciation'}
            </button>
          </div>
          {offer && state === 'asking' && (
            <button type="button" class="btn btn-ghost btn-block" onClick={() => choose(true)}>
              Vérifier en ligne
            </button>
          )}
        </div>
      ) : state !== 'revealed' ? (
        <div class="speak-zone">
          {(checks || mic) && !denied ? micButton(checks ? 'Dire la phrase' : 'Enregistrer ma voix') : null}
          <p class="muted" aria-live="polite">
            {line ||
              (checks
                ? 'Touche le micro et dis la phrase.'
                : mic
                  ? 'Touche le micro, dis la phrase, touche à nouveau.'
                  : quiet
                    ? 'Dis la phrase dans ta tête, puis découvre la réponse.'
                    : 'Dis la phrase à voix haute, puis découvre la réponse.')}
          </p>
          <button
            type="button"
            class={(checks || mic) && !denied ? 'btn btn-ghost' : 'btn'}
            onClick={() => reveal(null)}
          >
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

/** The phrase, each word marked as the recogniser heard it or not. */
function HeardPhrase({ check, lang }: { check: SpeechCheck; lang: string }) {
  return (
    <p class="feedback-answer" lang={lang}>
      {check.words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          {w.pre}
          {w.mark ? (
            <span class={`word-${w.mark}`}>
              {w.word}
              {w.mark === 'missed' && (
                <span class="sr-only" lang="fr">
                  {' '}
                  (pas entendu)
                </span>
              )}
            </span>
          ) : (
            w.word
          )}
          {w.post}
        </Fragment>
      ))}
    </p>
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
  const goal = profile.value!.goal;
  const today = pdata.value.days[dayKey(Date.now())];
  const xp = today?.xp ?? 0;
  const near = goal - xp > 0 && goal - xp <= NEAR_GOAL;
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
      <Mascot mood={o.passed ? 'cheer' : 'idle'} size={150} motion="jump" />
      <h1>{headline}</h1>
      <section class="ticket" aria-label="Bilan de la session">
        <p class="ticket-title">{title}</p>
        <div class="ticket-stats">
          <div>
            <Shell size={20} aria-hidden="true" />
            <strong class="num">+{o.xp}</strong>
            <span>{shellWord(o.xp)}</span>
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
          {settings.value.showStreak && (
            <div>
              <Flame size={20} aria-hidden="true" />
              <strong class="num">{summary.streak}</strong>
              <span>jour{summary.streak > 1 ? 's' : ''} de série</span>
            </div>
          )}
        </div>
        {o.learned.length > 0 && (
          <p class="ticket-foot">
            {o.learned.length} nouvelle{o.learned.length > 1 ? 's' : ''} phrase{o.learned.length > 1 ? 's' : ''} en
            mémoire
          </p>
        )}
        <div class="ticket-goal">
          <p class="ticket-goal-title">{goalTitle(xp, goal)}</p>
          <Bar
            value={xp / goal}
            label={`Objectif du jour : ${shells(xp)} sur ${goal}`}
            tone={xp >= goal ? 'ok' : undefined}
          />
          {!!today?.welcome && <p class="small muted">Dont {shells(today.welcome)} pour tes réponses à l’accueil.</p>}
        </div>
      </section>
      {summary.postcard && <FromBernard text={summary.postcard} />}
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
      {near && (
        <button
          type="button"
          class="btn btn-block"
          onClick={() =>
            startSession({ kind: 'review', unitId: null }, 'Objectif du jour', { replace: true, max: goal - xp + 2 })
          }
        >
          Atteindre mon objectif
        </button>
      )}
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

  const result = (ok: boolean, verdict?: Verdict, heard?: SpeechCheck) => {
    const neutral = ex?.kind === 'guess';
    if (!neutral) play(ok ? 'ok' : 'ko', r.combo);
    submitAnswer(ok);
    setFb({ ok, verdict, neutral, heard });
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
        {ex?.kind === 'speak' && (!fb || fb.heard) && (
          <Speak
            card={ex.card}
            judged={!!fb}
            onResult={(ok, heard) => result(ok, undefined, heard)}
            onRetry={heard => setFb(f => f && { ...f, heard })}
          />
        )}
        {ex?.kind === 'match' && <Match cards={ex.cards} onDone={next} />}
        {fb && card && !fb.heard && <ReviewCard card={card} />}
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
