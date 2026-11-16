/**
 * Bernard, the hermit crab. He carries his home everywhere (the app works offline) and
 * changes shell with each language (the course theme). Flat 2D on purpose: in a meta-analysis
 * of pedagogical agents, 2D agents helped learning more than 3D ones (Castro-Alonso et al., 2021).
 */
import { useId } from 'preact/hooks';
import { BRAND } from '../brand';

export type Mood = 'idle' | 'happy' | 'oops' | 'cheer' | 'sleep';

const PUPIL: Record<Mood, [number, number]> = {
  idle: [0, 1],
  happy: [0, -1.5],
  oops: [0, 2.5],
  cheer: [1, -2],
  sleep: [0, 0],
};

function Eye({ x, y, mood }: { x: number; y: number; mood: Mood }) {
  const [dx, dy] = PUPIL[mood];
  return (
    <g>
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
        <>
          <circle cx={x + dx} cy={y + dy} r="4" fill="var(--ink)" />
          <circle cx={x + dx + 1.4} cy={y + dy - 1.6} r="1.3" fill="#fff" />
        </>
      )}
    </g>
  );
}

function Motif({ pattern }: { pattern: 'tiles' | 'waves' }) {
  if (pattern === 'waves') {
    return (
      <g fill="none" stroke="var(--motif)" stroke-width="2.6" stroke-linecap="round">
        <path d="M52 30 q5 -5 10 0 t10 0 t10 0" />
        <path d="M46 46 q5 -5 10 0 t10 0 t10 0 t10 0" />
        <path d="M50 62 q5 -5 10 0 t10 0 t10 0" />
      </g>
    );
  }
  const rosette = (x: number, y: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
      <circle r="4.2" fill="var(--motif)" />
      <circle r="1.6" fill="var(--accent)" />
    </g>
  );
  return <g>{[rosette(58, 28), rosette(86, 34), rosette(52, 50), rosette(92, 56), rosette(74, 72)]}</g>;
}

export function Mascot({
  mood = 'idle',
  size = 120,
  pattern = 'tiles',
  motion,
  decorative,
}: {
  mood?: Mood;
  size?: number;
  pattern?: 'tiles' | 'waves';
  motion?: 'bob' | 'jump';
  /** Hide from assistive tech when the text next to it already says everything. */
  decorative?: boolean;
}) {
  const happy = mood === 'happy' || mood === 'cheer';
  const clip = useId();
  return (
    <svg
      class={`mascot${motion ? ` ${motion}` : ''}`}
      width={size}
      height={size * 0.85}
      viewBox="0 0 120 102"
      role="img"
      aria-hidden={decorative ? 'true' : undefined}
    >
      <title>{BRAND.mascot}</title>
      <ellipse cx="60" cy="96" rx="40" ry="4.5" fill="rgb(22 33 62 / 10%)" />
      {/* shell */}
      <circle cx="73" cy="48" r="36" fill="var(--accent)" stroke="var(--accent-deep)" stroke-width="3" />
      <clipPath id={clip}>
        <circle cx="73" cy="48" r="34" />
      </clipPath>
      <g clip-path={`url(#${clip})`} opacity="0.9">
        <Motif pattern={pattern} />
      </g>
      <path
        d="M73 48 m-4 0 a4 4 0 1 1 8 0 a8 8 0 1 1 -16 0 a14 14 0 1 1 28 0 a20 20 0 1 1 -40 0"
        fill="none"
        stroke="var(--accent-deep)"
        stroke-width="3"
        stroke-linecap="round"
      />
      <ellipse cx="46" cy="66" rx="13" ry="15" fill="var(--accent-deep)" />
      {/* legs */}
      <g stroke="var(--crab-deep)" stroke-width="3.2" stroke-linecap="round">
        <path d="M30 80 l-5 9" />
        <path d="M39 83 l-2 9" />
        <path d="M49 82 l3 9" />
      </g>
      {/* body */}
      <ellipse cx="40" cy="70" rx="19" ry="15" fill="var(--crab)" stroke="var(--crab-deep)" stroke-width="2.2" />
      {/* eye stalks */}
      <g stroke="var(--crab-deep)" stroke-width="3.4" stroke-linecap="round">
        <path d="M34 60 L30 38" />
        <path d="M45 59 L49 36" />
      </g>
      <Eye x={29} y={33} mood={mood} />
      <Eye x={50} y={31} mood={mood} />
      {/* face */}
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
      {/* claws */}
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
