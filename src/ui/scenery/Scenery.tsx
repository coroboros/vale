/**
 * Scenery never animates itself: the porthole decides how alive it is, so reduced motion keeps it
 * still. One coordinate space for every scene: 360 × 240, horizon at y = 172. The scenes live by
 * country next to this file; every destination has one (tested).
 */
import { useId } from 'preact/hooks';
import { EN } from './en';
import { ES } from './es';
import { IT } from './it';
import { type Art, Shimmer } from './parts';
import { PT } from './pt';

const Cloud = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g class="scn-drift">
      <circle cx="14" cy="15" r="10" />
      <circle cx="31" cy="10" r="13" />
      <circle cx="49" cy="15" r="10" />
      <rect x="4" y="14" width="56" height="11" rx="5.5" />
    </g>
  </g>
);

const Birds = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <g class="scn-birds" fill="none" stroke="#3B4A6B" stroke-width="1.3" stroke-linecap="round" opacity="0.7">
      <path d="M0 0 q3.5 -3.5 7 0 q3.5 -3.5 7 0" />
      <path d="M16 -8 q3 -3 6 0 q3 -3 6 0" />
      <path d="M8 -15 q2.5 -2.5 5 0 q2.5 -2.5 5 0" />
    </g>
  </g>
);

const ART: Record<string, Art> = { ...ES, ...IT, ...PT, ...EN };

export const hasScenery = (place: string) => place in ART;

/**
 * Portrait windows such as the porthole show more sky and ground, so the landmark keeps a sensible
 * size; ground layers therefore run down to y = 330.
 */
export function Scenery({ place, tall }: { place: string; tall?: boolean }) {
  const art = ART[place];
  const id = useId();
  if (!art) return null;
  const below = art.water ?? art.land!;
  return (
    <svg
      class="scenery"
      viewBox={tall ? '0 -40 360 340' : '0 0 360 240'}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={art.sky[0]} />
          <stop offset="1" stop-color={art.sky[1]} />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color={below[0]} />
          <stop offset="1" stop-color={below[1]} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stop-color={art.sun.color} stop-opacity="0.55" />
          <stop offset="1" stop-color={art.sun.color} stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect class="scn-sky" y="-120" width="360" height="300" fill={`url(#${id}s)`} />
      <g class="scn-sun">
        <circle cx={art.sun.x} cy={art.sun.y} r={art.sun.r * 3.2} fill={`url(#${id}g)`} />
        <circle cx={art.sun.x} cy={art.sun.y} r={art.sun.r} fill={art.sun.color} />
      </g>
      <g class="scn-clouds" fill={art.cloudColor ?? '#fff'} opacity="0.9">
        {art.clouds.map(([x, y, s]) => (
          <Cloud key={`${x}-${y}`} x={x} y={y} s={s} />
        ))}
      </g>
      {art.birds && <Birds x={art.birds[0]} y={art.birds[1]} />}
      <g class="scn-far">{art.far}</g>
      <g class="scn-mid">
        <rect y="172" width="360" height="158" fill={`url(#${id}w)`} />
        {art.water && <Shimmer />}
        {art.mid}
      </g>
      <g class="scn-near">{art.near}</g>
    </svg>
  );
}
