/**
 * The welcome page's day, drawn with the scenery's pieces: clouds round the window, a route over
 * « Comment ça marche » and the beach the page ends on. Like the scenes, they never move by
 * themselves: styles/welcome.css ties them to the scroll, and reduced motion leaves them still.
 */
import { Cloud, FlyerAt, Sailboat, Shimmer } from './parts';

const INK = '#16213E';
const WOOD = '#8B5E3C';

/** Three depths: the nearer a cloud, the larger it is and the further it drifts. */
export const Clouds = () => (
  <>
    {[1, 2, 3].map(depth => (
      <svg key={depth} class={`wp-cloud wp-cloud-${depth}`} viewBox="0 0 64 26" aria-hidden="true">
        <Cloud x={0} y={0} s={1} />
      </svg>
    ))}
  </>
);

/** A side view facing right: white, with the trip's colour on the tail. */
const Airliner = () => (
  <svg viewBox="0 0 48 22" aria-hidden="true">
    <path
      d="M7 3 H11 L17.5 9 H8.5 Z"
      style={{ fill: 'var(--accent)' }}
      stroke={INK}
      stroke-width="0.8"
      stroke-linejoin="round"
    />
    <path d="M5 9.5 Q5 8 7.5 8 H37 Q44 8 46.5 11.5 Q44 15 37 15 H8 Q5 15 5 12.5 Z" fill="#fff" stroke={INK} />
    <path d="M38.5 9.6 Q42.5 9.8 44.6 11.4 H38.5 Z" fill="#8FC3EE" />
    <path d="M13 11 H35" stroke={INK} stroke-width="1.5" stroke-dasharray="0.1 2.6" stroke-linecap="round" />
    <path d="M19 12.5 H29 L23 19.5 H19.5 Z" fill="#C9D4E2" stroke={INK} stroke-width="0.8" stroke-linejoin="round" />
  </svg>
);

/**
 * The route is a parabola from y = 80 to 20 and back (in hundredths of the band); styles/welcome.css
 * samples the same curve to fly the plane along it, so the two change together.
 */
export const Route = () => (
  <>
    <svg class="wp-route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 80 Q50 -40 100 80" />
    </svg>
    <div class="wp-plane">
      <Airliner />
    </div>
  </>
);

/**
 * Striped in the trip's colour, leaning a little; its shadow falls away from the low sun. Each
 * island is a Preact root of its own, where useId starts again, so the one parasol names its clip.
 */
function Parasol() {
  const clip = 'wp-parasol-canopy';
  return (
    <svg class="shore-parasol" viewBox="0 0 80 100" aria-hidden="true">
      <ellipse cx="28" cy="96" rx="24" ry="3.5" fill={WOOD} opacity="0.2" />
      <g transform="rotate(-8 40 96)">
        <path d="M40 14 V96" stroke={WOOD} stroke-width="2.6" stroke-linecap="round" />
        <clipPath id={clip}>
          <path d="M3 36 Q6 12 40 12 Q74 12 77 36 Q68 30 59 36 Q50 30 40 36 Q30 30 21 36 Q12 30 3 36 Z" />
        </clipPath>
        <g clip-path={`url(#${clip})`}>
          <rect y="8" width="80" height="32" fill="#fff" />
          <path d="M40 12 L-6.25 42 H16.25 Z M40 12 V42 H63.75 Z" style={{ fill: 'var(--accent)' }} />
        </g>
        <path
          d="M3 36 Q12 30 21 36 Q30 30 40 36 Q50 30 59 36 Q68 30 77 36"
          fill="none"
          stroke={INK}
          stroke-opacity="0.25"
        />
        <circle cx="40" cy="11" r="2.2" fill={INK} />
      </g>
    </svg>
  );
}

/** Bernard's luggage, in his colour, with the luggage tag that is the brand's own object. */
const Suitcase = () => (
  <svg class="shore-case" viewBox="0 0 62 68" aria-hidden="true">
    <ellipse cx="24" cy="65" rx="24" ry="3" fill={WOOD} opacity="0.2" />
    <path d="M22 13 V8 Q22 5 25 5 H35 Q38 5 38 8 V13" fill="none" stroke={INK} stroke-width="3" />
    <rect x="6" y="13" width="48" height="45" rx="7" style={{ fill: 'var(--crab)' }} />
    <path d="M17.5 13 V58 M42.5 13 V58" style={{ stroke: 'var(--crab-deep)' }} stroke-width="5" />
    <path d="M6 23 H54" stroke={INK} stroke-opacity="0.15" stroke-width="1.5" />
    <circle cx="14" cy="61.5" r="3.2" fill={INK} />
    <circle cx="46" cy="61.5" r="3.2" fill={INK} />
    <path d="M36.5 8 Q45 10 47.5 18" fill="none" stroke={INK} />
    <g transform="rotate(14 51 27)">
      <rect x="45" y="18" width="12" height="17" rx="2" fill="#FFF6E0" stroke={INK} />
      <rect x="45.5" y="18.5" width="11" height="4.5" rx="1.5" style={{ fill: 'var(--accent)' }} />
    </g>
  </svg>
);

const Shells = () => (
  <svg class="shore-shells" viewBox="0 0 40 14" aria-hidden="true">
    {[
      [7, 1],
      [30, 0.75],
    ].map(([x, s]) => (
      <g key={x} transform={`translate(${x} 13) scale(${s})`} stroke="#E2A27A" stroke-width="0.8">
        <path d="M0 0 L-6.5 -7 Q0 -13 6.5 -7 Z" fill="#FFF3E6" stroke-linejoin="round" />
        <path d="M0 0 L-3.4 -10 M0 0 V-11 M0 0 L3.4 -10" />
      </g>
    ))}
  </svg>
);

/** The wave's edge, one period repeated at any width: wet sand under a line of foam. */
const Foam = () => (
  <svg class="shore-foam" aria-hidden="true">
    <pattern id="wp-foam" width="32" height="14" patternUnits="userSpaceOnUse">
      <path d="M0 8 Q8 2 16 8 T32 8 V14 H0 Z" style={{ fill: 'var(--sand-wet)' }} />
      <path d="M0 8 Q8 2 16 8 T32 8" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" />
    </pattern>
    <rect width="100%" height="14" fill="url(#wp-foam)" />
  </svg>
);

/** The beach at the end of the day: the sun sets into the sea while the suitcase rolls up to the parasol. */
export const Shore = () => (
  <>
    <div class="shore-sky">
      <div class="shore-glow" />
      <div class="shore-sun" />
    </div>
    <div class="shore-glint" />
    <svg class="shore-shimmer" viewBox="0 178 360 48" preserveAspectRatio="none" aria-hidden="true">
      <Shimmer />
    </svg>
    <svg class="shore-boat" viewBox="-14 -25 28 31" aria-hidden="true">
      <Sailboat x={0} y={0} />
    </svg>
    <svg class="shore-gulls" viewBox="-2 -15 40 19" aria-hidden="true">
      <FlyerAt kind="gulls" x={0} y={0} />
    </svg>
    <Foam />
    <Parasol />
    <Suitcase />
    <Shells />
  </>
);
