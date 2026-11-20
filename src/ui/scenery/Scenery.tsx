/**
 * Scenery never animates itself: the porthole decides how alive it is, so reduced motion keeps it
 * still. One coordinate space for every scene: 360 × 240, horizon at y = 172. The scenes live by
 * country next to this file; every destination has one (tested). A flying porthole draws each
 * layer three times, one width apart, and slides it by that width in a loop, so a scene's
 * continuous lines (shores, quays, ridges) must end at x = 360 where they start at x = 0.
 */
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';
import { EN } from './en';
import { ES } from './es';
import { IT } from './it';
import { type Art, Cloud, FlyerAt, Shimmer } from './parts';
import { PT } from './pt';

const strip = (layer: ComponentChildren) => (
  <g class="scn-pan">
    {[-360, 0, 360].map(dx => (
      <g key={dx} transform={`translate(${dx} 0)`}>
        {layer}
      </g>
    ))}
  </g>
);

const ART: Record<string, Art> = { ...ES, ...IT, ...PT, ...EN };

export const hasScenery = (place: string) => place in ART;

/**
 * Portrait windows such as the porthole show more sky and ground, so the landmark keeps a sensible
 * size; ground layers therefore run down to y = 330.
 */
export function Scenery({ place, tall, fly }: { place: string; tall?: boolean; fly?: boolean }) {
  const art = ART[place];
  const id = useId();
  if (!art) return null;
  const below = art.water ?? art.land!;
  const layer = (content: ComponentChildren) => (fly ? strip(content) : content);
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
        {layer(art.clouds.map(([x, y, s]) => <Cloud key={`${x}-${y}`} x={x} y={y} s={s} />))}
      </g>
      {art.flyer && <FlyerAt kind={art.flyer[0]} x={art.flyer[1]} y={art.flyer[2]} />}
      <g class="scn-far">{layer(art.far)}</g>
      <g class="scn-mid">
        <rect y="172" width="360" height="158" fill={`url(#${id}w)`} />
        {art.water && <Shimmer />}
        {layer(art.mid)}
      </g>
      <g class="scn-near">{layer(art.near)}</g>
    </svg>
  );
}
