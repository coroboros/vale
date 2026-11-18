/**
 * Flat 2D on purpose: 2D pedagogical agents helped learning more than 3D ones (Castro-Alonso et
 * al., 2021).
 */
import type { RefObject } from 'preact';
import { useEffect, useId, useRef } from 'preact/hooks';
import { BRAND } from '../brand';
import type { Flag } from '../content/types';
import { reducedMotion } from '../platform/env';
import { theme } from '../state/store';
import { easeVars } from './ease';

export type Mood = 'idle' | 'happy' | 'oops' | 'cheer' | 'sleep';

const PUPIL: Record<Mood, [number, number]> = {
  idle: [0, 1],
  happy: [0, -1.5],
  oops: [0, 2.5],
  cheer: [1, -2],
  sleep: [0, 0],
};

const EYES = { x: 39.5 / 120, y: 32 / 102 };
const TRAVEL = 3.2;

function useAliveEyes(
  svg: RefObject<SVGSVGElement | null>,
  followPointer: boolean,
  blinks: boolean,
  rest: [number, number],
) {
  useEffect(() => {
    const el = svg.current;
    if (!el || !followPointer || reducedMotion()) return;
    const pupils = easeVars(el, ['--px', '--py'], 0.2, rest);
    let idle = 0;
    const lookAt = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width * EYES.x);
      const dy = e.clientY - (r.top + r.height * EYES.y);
      const d = Math.hypot(dx, dy) || 1;
      const k = (Math.min(1, d / 120) * TRAVEL) / d;
      pupils.aim(dx * k, dy * k);
      // A finger lifts: after a moment Bernard looks back at you.
      clearTimeout(idle);
      if (e.pointerType !== 'mouse') idle = window.setTimeout(() => pupils.aim(...rest), 1500);
    };
    window.addEventListener('pointermove', lookAt, { passive: true });
    window.addEventListener('pointerdown', lookAt, { passive: true });
    return () => {
      window.removeEventListener('pointermove', lookAt);
      window.removeEventListener('pointerdown', lookAt);
      pupils.stop();
      clearTimeout(idle);
    };
  }, [followPointer]);

  useEffect(() => {
    const el = svg.current;
    if (!el || !blinks || reducedMotion()) return;
    let timer = 0;
    const once = () => {
      el.classList.remove('blink');
      void el.getBoundingClientRect(); // restarts the animation if the class was still there
      el.classList.add('blink');
    };
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          once();
          if (Math.random() < 0.2) window.setTimeout(once, 280); // sometimes twice, as people do
          schedule();
        },
        2200 + Math.random() * 3800,
      );
    };
    const end = (e: AnimationEvent) => {
      if (e.animationName === 'mascot-blink') el.classList.remove('blink');
    };
    el.addEventListener('animationend', end);
    schedule();
    return () => {
      clearTimeout(timer);
      el.removeEventListener('animationend', end);
      el.classList.remove('blink');
    };
  }, [blinks]);
}

function Eye({ x, y, mood }: { x: number; y: number; mood: Mood }) {
  return (
    <g class="mascot-eye">
      <circle cx={x} cy={y} r="8.5" fill="#fff" stroke="var(--crab-deep)" stroke-width="2" />
      {mood === 'sleep' ? (
        <path
          d={`M${x - 5} ${y + 1} q5 4 10 0`}
          fill="none"
          stroke="var(--ink)"
          stroke-width="2.4"
          stroke-linecap="round"
        />
      ) : (
        <g class="mascot-pupil">
          <circle cx={x} cy={y} r="4" fill="var(--ink)" />
          <circle cx={x + 1.4} cy={y - 1.6} r="1.3" fill="#fff" />
        </g>
      )}
    </g>
  );
}

const RED = { es: '#AA151B', it: '#CE2B37', pt: '#DA291C', gb: '#C8102E' };

/** The flag fills the shell's circle (centre 73,48, radius 34). */
function FlagArt({ flag }: { flag: Flag }) {
  const [x, y, s] = [39, 14, 68];
  if (flag === 'es') {
    return (
      <g>
        <rect x={x} y={y} width={s} height={s} fill={RED.es} />
        <rect x={x} y={y + s / 4} width={s} height={s / 2} fill="#F1BF00" />
      </g>
    );
  }
  if (flag === 'it') {
    return (
      <g>
        <rect x={x} y={y} width={s / 3} height={s} fill="#009246" />
        <rect x={x + s / 3} y={y} width={s / 3} height={s} fill="#F4F5F0" />
        <rect x={x + (2 * s) / 3} y={y} width={s / 3} height={s} fill={RED.it} />
      </g>
    );
  }
  if (flag === 'pt') {
    const split = x + (2 * s) / 5;
    return (
      <g>
        <rect x={x} y={y} width={s} height={s} fill={RED.pt} />
        <rect x={x} y={y} width={split - x} height={s} fill="#046A38" />
        <circle cx={split} cy={48} r="10" fill="none" stroke="#FFE000" stroke-width="2.6" />
        <path d={`M${split - 4} 43.5 h8 v6 a4 4 0 0 1 -8 0 z`} fill="#fff" stroke={RED.pt} stroke-width="1.6" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={s} height={s} fill="#012169" />
      <path d={`M${x} ${y} L${x + s} ${y + s} M${x + s} ${y} L${x} ${y + s}`} stroke="#fff" stroke-width="13" />
      <path d={`M${x} ${y} L${x + s} ${y + s} M${x + s} ${y} L${x} ${y + s}`} stroke={RED.gb} stroke-width="4.4" />
      <path d={`M73 ${y} V${y + s} M${x} 48 H${x + s}`} stroke="#fff" stroke-width="20" />
      <path d={`M73 ${y} V${y + s} M${x} 48 H${x + s}`} stroke={RED.gb} stroke-width="11" />
    </g>
  );
}

/** Bernard everywhere is the Bernard of the welcome flight: he watches the pointer and blinks. */
export function Mascot({
  mood = 'idle',
  size = 120,
  flag = theme.value.id,
  motion,
  decorative,
  followPointer = true,
  blinks = true,
}: {
  mood?: Mood;
  size?: number;
  /** The current course's country unless a screen shows another one. */
  flag?: Flag;
  motion?: 'bob' | 'jump';
  /** When the text next to it already says everything. */
  decorative?: boolean;
  followPointer?: boolean;
  blinks?: boolean;
}) {
  const happy = mood === 'happy' || mood === 'cheer';
  const clip = useId();
  const svg = useRef<SVGSVGElement>(null);
  const rest = PUPIL[mood];
  useAliveEyes(svg, followPointer, blinks, rest);
  return (
    <svg
      ref={svg}
      style={{ '--px': rest[0], '--py': rest[1] }}
      class={`mascot${motion ? ` ${motion}` : ''}`}
      width={size}
      height={size * 0.85}
      viewBox="0 0 120 102"
      role="img"
      aria-hidden={decorative ? 'true' : undefined}
    >
      <title>{BRAND.mascot}</title>
      <ellipse cx="60" cy="96" rx="40" ry="4.5" fill="rgb(22 33 62 / 10%)" />
      <circle cx="73" cy="48" r="36" fill="var(--accent)" stroke="var(--accent-deep)" stroke-width="3" />
      <clipPath id={clip}>
        <circle cx="73" cy="48" r="34" />
      </clipPath>
      <g clip-path={`url(#${clip})`}>
        <FlagArt flag={flag} />
        <ellipse cx="60" cy="31" rx="15" ry="8" fill="#fff" opacity="0.22" transform="rotate(-28 60 31)" />
      </g>
      <path
        d="M73 48 m-4 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a14 14 0 1 1 28 0 a20 20 0 1 1 -40 0"
        fill="none"
        stroke="rgb(22 33 62 / 30%)"
        stroke-width="2.6"
        stroke-linecap="round"
      />
      <ellipse cx="46" cy="66" rx="13" ry="15" fill="var(--accent-deep)" />
      <g stroke="var(--crab-deep)" stroke-width="3.2" stroke-linecap="round">
        <path d="M30 80 l-5 9" />
        <path d="M39 83 l-2 9" />
        <path d="M49 82 l3 9" />
      </g>
      <ellipse cx="40" cy="70" rx="19" ry="15" fill="var(--crab)" stroke="var(--crab-deep)" stroke-width="2.2" />
      <g stroke="var(--crab-deep)" stroke-width="3.4" stroke-linecap="round">
        <path d="M34 60 L30 38" />
        <path d="M45 59 L49 36" />
      </g>
      <Eye x={29} y={33} mood={mood} />
      <Eye x={50} y={31} mood={mood} />
      <ellipse cx="29" cy="71" rx="3.6" ry="2.2" fill="var(--blush)" opacity="0.75" />
      <ellipse cx="51" cy="71" rx="3.6" ry="2.2" fill="var(--blush)" opacity="0.75" />
      {mood === 'oops' ? (
        <ellipse cx="40" cy="73" rx="2.6" ry="3" fill="var(--ink)" />
      ) : (
        <path
          d={happy ? 'M33 70 q7 8 14 0' : 'M35 71 q5 4 10 0'}
          fill={happy ? 'var(--ink)' : 'none'}
          stroke="var(--ink)"
          stroke-width="2.2"
          stroke-linecap="round"
        />
      )}
      <g
        fill="var(--crab)"
        stroke="var(--crab-deep)"
        stroke-width="2.2"
        transform={happy ? 'rotate(-38 22 70)' : undefined}
      >
        <path d="M22 70 m-9 0 a9 9 0 1 0 9 -9 l0 6 a3 3 0 0 1 -3 3 z" />
      </g>
      <g
        fill="var(--crab)"
        stroke="var(--crab-deep)"
        stroke-width="2.2"
        transform={mood === 'cheer' ? 'rotate(35 58 76)' : undefined}
      >
        <path d="M58 76 m-7 0 a7 7 0 1 0 7 -7 l0 4.6 a2.4 2.4 0 0 1 -2.4 2.4 z" />
      </g>
    </svg>
  );
}
