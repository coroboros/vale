/**
 * Motion stops for people who ask their system for less of it; the pause button stops the loop for
 * everyone else (WCAG 2.2.2). With one stop nothing loops, so there is no pause button.
 */
import type { RefObject } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { flagOf, pictureOf } from '../content';
import type { Course, Region } from '../content/types';
import { reducedMotion } from '../platform/env';
import { say } from '../platform/speech';
import { easeVars } from './ease';
import { Mascot } from './Mascot';
import { MotionToggle } from './MotionToggle';
import { Scenery } from './scenery/Scenery';
import { THEMES, type Theme, themeVars } from './themes';

export interface Stop {
  place: string;
  /** The drawing: « Ailleurs » shows its country's emblem. */
  scene: string;
  greeting: string;
  lang: string;
  theme: Theme;
}

type Phase = 'arrive' | 'stay' | 'leave';
const PHASE_MS: Record<Phase, number> = { arrive: 1700, stay: 4300, leave: 1100 };

function usePageVisible() {
  const [visible, setVisible] = useState(document.visibilityState === 'visible');
  useEffect(() => {
    const update = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  return visible;
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function useLookAround(
  root: RefObject<HTMLElement | null>,
  glass: RefObject<HTMLElement | null>,
  enabled: boolean,
  onSwipe: () => void,
) {
  const dragged = useRef(false);
  const swipe = useRef(onSwipe);
  swipe.current = onSwipe;
  useEffect(() => {
    const el = root.current;
    const pane = glass.current;
    if (!enabled || !el || !pane) return;
    const view = easeVars(el, ['--lx', '--ly'], 0.09);
    const aim = (x: number, y: number) => view.aim(clamp(x), clamp(y));
    let start: { x: number; y: number; t: number; id: number } | null = null;
    const onMouse = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      aim(
        (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2),
        (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2),
      );
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      start = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId };
      dragged.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = (e.clientX - start.x) / (pane.clientWidth / 2);
      const dy = (e.clientY - start.y) / (pane.clientHeight / 2);
      if (Math.abs(dx) + Math.abs(dy) > 0.08) dragged.current = true;
      aim(-dx, -dy);
    };
    const onUp = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const quick = performance.now() - start.t < 450;
      if (quick && Math.abs(dx) > pane.clientWidth * 0.25) swipe.current();
      start = null;
      aim(0, 0);
    };
    window.addEventListener('pointermove', onMouse, { passive: true });
    pane.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    return () => {
      view.stop();
      window.removeEventListener('pointermove', onMouse);
      pane.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [enabled, root, glass]);
  return dragged;
}

function Wing() {
  return (
    <svg class="porthole-wing" viewBox="0 0 220 140" aria-hidden="true">
      <path d="M-10 140 V118 L150 64 C158 61 166 60 172 62 L180 66 L60 140 Z" fill="#EEF2F7" />
      <path d="M60 140 L180 66 L176 71 L76 140 Z" fill="#C9D3E0" />
      <path d="M20 132 L140 82" stroke="#D5DDE8" stroke-width="1.5" />
      <path d="M-10 118 L150 64 C158 61 166 60 172 62" fill="none" stroke="#fff" stroke-width="3" />
      <path
        d="M168 62 L186 26 C188 23 192 23 192 27 L184 66 Z"
        fill="var(--accent)"
        stroke="var(--accent-deep)"
        stroke-width="1.5"
      />
      <circle class="porthole-beacon" cx="189.5" cy="27" r="2.2" fill="#fff" />
    </svg>
  );
}

function CloudBank() {
  const edge: [number, number, number][] = [
    [62, 18, 34],
    [48, 66, 30],
    [64, 116, 40],
    [44, 168, 28],
    [60, 214, 38],
    [46, 264, 30],
    [64, 312, 40],
    [50, 356, 30],
  ];
  const puffs = [...edge, ...edge.map(([x, y, r]) => [300 - x, (y + 26) % 380, r] as [number, number, number])];
  return (
    <svg class="porthole-clouds" viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="porthole-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff" />
          <stop offset="1" stop-color="#eef4fb" />
        </linearGradient>
      </defs>
      <g fill="#dfe9f5">
        {puffs.map(([x, y, r]) => (
          <circle key={`s${x}-${y}`} cx={x + 5} cy={y + 7} r={r} />
        ))}
      </g>
      <rect x="62" y="-20" width="176" height="400" fill="url(#porthole-cloud)" />
      <g fill="url(#porthole-cloud)">
        {puffs.map(([x, y, r]) => (
          <circle key={`c${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
      <g fill="#fff" opacity="0.85">
        {[
          [22, 92, 14],
          [26, 240, 16],
          [278, 150, 14],
          [272, 300, 16],
        ].map(([x, y, r]) => (
          <circle key={`w${x}-${y}`} cx={x} cy={y} r={r} />
        ))}
      </g>
    </svg>
  );
}

export const stopOf = (course: Course, region: Region): Stop => ({
  place: region.id,
  scene: pictureOf(course, region.id),
  greeting: course.greet(region.native),
  lang: course.lang,
  theme: THEMES[flagOf(course, region.id)],
});

/**
 * Several stops: the welcome journey, flying from one to the next. One stop: the trip being chosen
 * in « Mes voyages »; the window lands there again whenever the choice changes.
 */
export function Porthole({ stops }: { stops: Stop[] }) {
  const still = reducedMotion();
  const single = stops.length === 1;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>(still ? 'stay' : 'arrive');
  const [playing, setPlaying] = useState(!still && !single);
  // One trip's window does not fly on to another place, but it flies over this one until paused.
  const [calm, setCalm] = useState(false);
  const alive = single ? !still && !calm : playing;
  const [hop, setHop] = useState(0);
  const [intro, setIntro] = useState(!still);
  const visible = usePageVisible();
  const root = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLButtonElement>(null);
  const stop = stops[index % stops.length]!;
  const next = () => setIndex(i => (i + 1) % stops.length);
  // A tap brings the bubble back at once; a new destination shows it once the land is in view.
  const arrival = `${index}-${stop.place}-${stop.lang}`;
  const [tappedAt, setTappedAt] = useState('');
  const greet = () => {
    setHop(h => h + 1);
    setTappedAt(arrival);
    void say(stop.greeting, { lang: stop.lang });
  };

  useEffect(() => {
    if (!single || still) return;
    setPhase('arrive');
    const timer = setTimeout(() => setPhase('stay'), PHASE_MS.arrive);
    return () => clearTimeout(timer);
  }, [single, stop.place, stop.lang]);

  useEffect(() => {
    if (!playing || !visible) return;
    const timer = setTimeout(() => {
      if (phase === 'leave') next();
      setPhase(phase === 'arrive' ? 'stay' : phase === 'stay' ? 'leave' : 'arrive');
    }, PHASE_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase, playing, visible]);

  useEffect(() => {
    if (!intro) return;
    const timer = setTimeout(() => setIntro(false), 1700);
    return () => clearTimeout(timer);
  }, [intro]);

  const flyOn = () => {
    if (single) greet();
    else if (!playing) {
      next();
      setPhase('stay');
    } else if (phase !== 'leave') setPhase('leave');
  };
  const dragged = useLookAround(root, glass, !still, flyOn);

  const togglePlay = () => {
    if (playing) setPhase('stay');
    setPlaying(!playing);
  };

  return (
    <div
      ref={root}
      class="porthole"
      data-phase={phase}
      data-playing={alive}
      data-intro={intro}
      style={themeVars(stop.theme)}
    >
      <button
        ref={glass}
        type="button"
        class="porthole-window"
        aria-label={single ? `Écouter Bernard dire « ${stop.greeting} »` : 'Voler vers la destination suivante'}
        tabIndex={single ? -1 : undefined}
        onClick={() => {
          if (dragged.current) dragged.current = false;
          else flyOn();
        }}
      >
        <span class="porthole-view">
          <span key={`${index}-${stop.place}-${stop.lang}`} class="porthole-land">
            <Scenery place={stop.scene} tall fly />
          </span>
          <Wing />
          <CloudBank />
          <span class="porthole-shade" />
          <span class="porthole-glare" />
        </span>
      </button>
      <button
        type="button"
        class="porthole-bernard"
        aria-label={`Écouter Bernard dire « ${stop.greeting} »`}
        onClick={greet}
      >
        <span
          key={`${arrival}-${hop}`}
          class="porthole-bubble"
          lang={stop.lang}
          style={tappedAt === arrival ? { '--bubble-delay': '0s' } : undefined}
        >
          {stop.greeting}
        </span>
        <span key={`${index}-${hop}`} class="porthole-hop">
          <Mascot size={140} flag={stop.theme.id} mood="happy" decorative blinks={alive && visible} />
        </span>
      </button>
      {!still && (
        <MotionToggle
          playing={alive}
          onToggle={single ? () => setCalm(!calm) : togglePlay}
          pause={single ? 'Mettre l’animation en pause' : 'Mettre le voyage en pause'}
          resume={single ? 'Reprendre l’animation' : 'Reprendre le voyage'}
        />
      )}
    </div>
  );
}
