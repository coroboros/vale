/** Pieces the scenes share, and the shape of a scene. Coordinates: 360 × 240, horizon at y = 172. */
import type { ComponentChildren } from 'preact';

export interface Art {
  sky: [top: string, horizon: string];
  sun: { x: number; y: number; r: number; color: string };
  water?: [deep: string, horizon: string];
  land?: [near: string, horizon: string];
  clouds: [x: number, y: number, scale: number][];
  cloudColor?: string;
  birds?: [x: number, y: number];
  far: ComponentChildren;
  mid: ComponentChildren;
  near: ComponentChildren;
}

export const Shimmer = ({ from = 178 }: { from?: number }) => (
  <g class="scn-shimmer" stroke="#fff" stroke-linecap="round" opacity="0.55">
    {[
      [30, from + 6, 22],
      [120, from + 4, 30],
      [230, from + 9, 18],
      [300, from + 3, 26],
      [70, from + 18, 16],
      [180, from + 22, 34],
      [270, from + 26, 20],
      [20, from + 34, 28],
      [140, from + 40, 18],
    ].map(([x, y, w]) => (
      <path key={`${x}-${y}`} d={`M${x} ${y} h${w}`} stroke-width={y! > from + 20 ? 2 : 1.4} />
    ))}
  </g>
);

export const Sailboat = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g class="scn-bob">
      <path d="M-11 0 h22 l-4 4.5 h-14 z" fill="#16213E" />
      <path d="M0 -1 V-22 L11 -2 Z" fill="#fff" />
      <path d="M-1.5 -2 V-17 L-9 -2 Z" fill="#FFF3D6" />
    </g>
  </g>
);

export function Palm({ x, y, h, lean }: { x: number; y: number; h: number; lean: number }) {
  const tx = x + lean;
  const ty = y - h;
  const leaf = 'M0 0 C 9 -9 24 -10 35 2 C 23 -3 11 -2 0 0 Z';
  return (
    <g>
      <path
        d={`M${x} ${y} Q${x + lean * 0.1} ${y - h * 0.55} ${tx} ${ty}`}
        fill="none"
        stroke="#8B5E3C"
        stroke-width="4.5"
        stroke-linecap="round"
      />
      <g transform={`translate(${tx} ${ty})`} fill="#2F6D4F">
        {[-28, 6, 36].map(a => (
          <path key={a} d={leaf} transform={`rotate(${a})`} />
        ))}
        {[-28, 6, 36].map(a => (
          <path key={-a - 1} d={leaf} transform={`scale(-1 1) rotate(${a})`} />
        ))}
        <circle r="3.2" fill="#25553E" />
      </g>
    </g>
  );
}

export function StonePine({ x, y, h, w }: { x: number; y: number; h: number; w: number }) {
  const top = y - h;
  return (
    <g>
      <path
        d={`M${x} ${y} Q${x - 2} ${y - h * 0.5} ${x + 5} ${top + 6}`}
        fill="none"
        stroke="#6B4A33"
        stroke-width="3.5"
      />
      <g fill="#3A5F45">
        <ellipse cx={x + 5} cy={top + 4} rx={w / 2} ry="9" />
        <circle cx={x + 5 - w * 0.3} cy={top} r="8" />
        <circle cx={x + 5} cy={top - 4} r="10" />
        <circle cx={x + 5 + w * 0.3} cy={top} r="8" />
      </g>
      <ellipse cx={x + 5} cy={top - 6} rx={w * 0.28} ry="3" fill="#4C7A58" />
    </g>
  );
}

export const Cypress = ({ x, y, h }: { x: number; y: number; h: number }) => (
  <path
    d={`M${x} ${y - h} Q${x + 7} ${y - h * 0.55} ${x + 5} ${y} H${x - 5} Q${x - 7} ${y - h * 0.55} ${x} ${y - h} Z`}
    fill="#2F5A43"
  />
);

export function Arches({
  from,
  to,
  top,
  bottom,
  step,
  w,
  color,
}: Record<'from' | 'to' | 'top' | 'bottom' | 'step' | 'w', number> & { color: string }) {
  const r = w / 2;
  const xs: number[] = [];
  for (let x = from; x + w <= to; x += step) xs.push(x);
  return (
    <g fill={color}>
      {xs.map(x => (
        <path key={x} d={`M${x} ${bottom} V${top + r} A${r} ${r} 0 0 1 ${x + w} ${top + r} V${bottom} Z`} />
      ))}
    </g>
  );
}

export const Lamp = ({ x, base }: { x: number; base: number }) => (
  <g>
    <path d={`M${x} ${base} V${base - 42}`} stroke="#2F3542" stroke-width="2.6" />
    <path d={`M${x - 4.5} ${base - 42} h9 l-1.5 -9 h-6 z`} fill="#2F3542" />
    <circle cx={x} cy={base - 46} r="2" fill="#FFE7A3" />
  </g>
);

/** A small fishing boat rocking at (x, y): hull colour, then the band under its rim. */
export const Boat = ({ x, y, s = 1, hull, band }: { x: number; y: number; s?: number; hull: string; band: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g class="scn-bob">
      <path d="M-16 -4 H16 C14 2 10 5 6 5 H-6 C-10 5 -14 2 -16 -4 Z" fill={hull} />
      <path d="M-15.5 -4 H15.5 L15 -2.2 H-15 Z" fill={band} />
      <path d="M-2 -4 V-14" stroke="#5A3D2B" stroke-width="1.4" />
    </g>
  </g>
);

/** A lighthouse standing on (x, base), `h` tall, its bands in `band`. */
export function Lighthouse({ x, base, h, band }: { x: number; base: number; h: number; band: string }) {
  const top = base - h;
  return (
    <g>
      <path d={`M${x - 6} ${base} L${x - 4} ${top} H${x + 4} L${x + 6} ${base} Z`} fill="#fff" />
      <path d={`M${x - 5.4} ${base - h * 0.3} H${x + 5.4} L${x + 5.1} ${base - h * 0.45} H${x - 5.1} Z`} fill={band} />
      <path d={`M${x - 4.6} ${base - h * 0.65} H${x + 4.6} L${x + 4.3} ${base - h * 0.8} H${x - 4.3} Z`} fill={band} />
      <rect x={x - 3.5} y={top - 6} width="7" height="6" fill="#FFE39A" />
      <path d={`M${x - 5} ${top - 6} L${x} ${top - 11} L${x + 5} ${top - 6} Z`} fill="#16213E" />
    </g>
  );
}

/** A round-headed tree (plane, chestnut) on (x, y). */
export const RoundTree = ({ x, y, r, color = '#4C8A5B' }: { x: number; y: number; r: number; color?: string }) => (
  <g>
    <rect x={x - 1.8} y={y - r * 1.4} width="3.6" height={r * 1.4} fill="#6B4A33" />
    <circle cx={x} cy={y - r * 1.7} r={r} fill={color} />
    <circle cx={x - r * 0.35} cy={y - r * 2} r={r * 0.45} fill="#fff" opacity="0.12" />
  </g>
);

/** An orange or lemon tree on (x, y). */
export function CitrusTree({ x, y, s, fruit }: { x: number; y: number; s: number; fruit: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.8" y="-14" width="3.6" height="14" fill="#7A5236" />
      <g fill="#2F7A4F">
        <circle cx="-9" cy="-20" r="9" />
        <circle cx="8" cy="-21" r="9" />
        <circle cx="0" cy="-29" r="10" />
      </g>
      <circle cx="-3" cy="-31" r="4" fill="#3E9361" />
      <g fill={fruit}>
        {[
          [-11, -18],
          [-4, -24],
          [6, -16],
          [10, -26],
          [2, -33],
          [-8, -28],
        ].map(([cx, cy]) => (
          <circle key={`${cx}${cy}`} cx={cx} cy={cy} r="1.8" />
        ))}
      </g>
    </g>
  );
}

/** A tram on its rails at (x, y): Lisbon's yellow by default, Milan's orange with `body` and `band`. */
export function Tram({
  x,
  y,
  body = '#F6C21B',
  band = '#FFF6DF',
}: {
  x: number;
  y: number;
  body?: string;
  band?: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M40 -44 L48 -62" stroke="#3E4A63" stroke-width="1.6" />
      <rect x="0" y="-44" width="84" height="40" rx="7" fill={body} />
      <rect x="2" y="-46" width="80" height="6" rx="3" fill={band} />
      <rect x="4" y="-36" width="76" height="14" rx="2" fill={band} />
      <g fill="#3E4A63">
        {[7, 22, 37, 52, 67].map(wx => (
          <rect key={wx} x={wx} y="-34" width="11" height="10" rx="1.5" />
        ))}
      </g>
      <rect x="0" y="-17" width="84" height="3" fill="#E0A100" />
      <rect x="70" y="-21" width="9" height="16" rx="1" fill="#3E4A63" opacity="0.55" />
      <g fill="#2B3445">
        <circle cx="18" cy="-3" r="4.5" />
        <circle cx="66" cy="-3" r="4.5" />
      </g>
    </g>
  );
}
