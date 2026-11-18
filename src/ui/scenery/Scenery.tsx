/**
 * Scenery never animates itself: the porthole decides how alive it is, so reduced motion keeps it
 * still. One coordinate space for every scene: 360 × 240, horizon at y = 172.
 */
import type { ComponentChildren } from 'preact';
import { useId } from 'preact/hooks';

interface Art {
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

const Shimmer = ({ from = 178 }: { from?: number }) => (
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

const Sailboat = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g class="scn-bob">
      <path d="M-11 0 h22 l-4 4.5 h-14 z" fill="#16213E" />
      <path d="M0 -1 V-22 L11 -2 Z" fill="#fff" />
      <path d="M-1.5 -2 V-17 L-9 -2 Z" fill="#FFF3D6" />
    </g>
  </g>
);

function Palm({ x, y, h, lean }: { x: number; y: number; h: number; lean: number }) {
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

function StonePine({ x, y, h, w }: { x: number; y: number; h: number; w: number }) {
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

const Cypress = ({ x, y, h }: { x: number; y: number; h: number }) => (
  <path
    d={`M${x} ${y - h} Q${x + 7} ${y - h * 0.55} ${x + 5} ${y} H${x - 5} Q${x - 7} ${y - h * 0.55} ${x} ${y - h} Z`}
    fill="#2F5A43"
  />
);

function Spire({ cx, top, w, finial }: { cx: number; top: number; w: number; finial: string }) {
  const base = 153;
  return (
    <g>
      <path
        d={`M${cx - w / 2} ${base} L${cx - w * 0.28} ${top + 10} Q${cx} ${top - 6} ${cx + w * 0.28} ${top + 10} L${cx + w / 2} ${base} Z`}
        fill="#CB8F5F"
      />
      {[0.38, 0.56, 0.74].map(k => (
        <rect key={k} x={cx - 0.9} y={top + (base - top) * k} width="1.8" height="6" rx="0.9" fill="#A86B40" />
      ))}
      <circle cx={cx} cy={top + 1} r={w * 0.3} fill={finial} />
    </g>
  );
}

const Star = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <path
    d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z"
    transform={`translate(${x} ${y}) scale(${s})`}
    fill="#FFF6E0"
  />
);

function Arches({
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

function House({ x, w, h, roof }: { x: number; w: number; h: number; roof: 'tile' | 'flat' }) {
  const top = 173 - h;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill="#FFFFFF" />
      <rect x={x + w * 0.68} y={top} width={w * 0.32} height={h} fill="#EFE4D6" />
      {roof === 'tile' ? (
        <path d={`M${x - 1.5} ${top} L${x + w / 2} ${top - 6} L${x + w + 1.5} ${top} Z`} fill="#DD7A4C" />
      ) : (
        <rect x={x - 1} y={top - 2} width={w + 2} height="2.5" fill="#E7D8C4" />
      )}
      <rect x={x + w * 0.22} y={top + h * 0.3} width="3" height="4" rx="1" fill="#3E4A63" />
      <rect x={x + w * 0.5} y={top + h * 0.3} width="3" height="4" rx="1" fill="#3E4A63" />
    </g>
  );
}

function OrangeTree({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-1.8" y="-14" width="3.6" height="14" fill="#7A5236" />
      <g fill="#2F7A4F">
        <circle cx="-9" cy="-20" r="9" />
        <circle cx="8" cy="-21" r="9" />
        <circle cx="0" cy="-29" r="10" />
      </g>
      <circle cx="-3" cy="-31" r="4" fill="#3E9361" />
      <g fill="#FF9A2E">
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

const ART: Record<string, Art> = {
  barcelone: {
    sky: ['#8FD3F7', '#FFF1CC'],
    sun: { x: 252, y: 66, r: 20, color: '#FFC53D' },
    water: ['#1C6FC0', '#5FB2EC'],
    clouds: [
      [40, 34, 0.9],
      [196, 20, 0.7],
      [296, 46, 0.6],
    ],
    birds: [124, 66],
    far: (
      <>
        <path
          d="M0 158 C40 136 72 140 104 146 C132 126 160 128 188 140 C214 118 250 120 276 136 C304 126 334 132 360 142 V173 H0 Z"
          fill="#E8CDB0"
        />
        <path d="M228 125 h8 v-5 l-4 -6 l-4 6 z" fill="#D9B591" />
      </>
    ),
    mid: (
      <>
        <path d="M270 173 V132 C270 112 278 104 284 104 C290 104 298 112 298 132 V173 Z" fill="#5D97D8" />
        <path d="M276 116 C280 108 288 108 292 116 V173 H276 Z" fill="#7FB3EA" opacity="0.6" />
        <path
          d="M36 173 V160 H50 V154 H64 V160 H76 V150 H92 V157 H104 V152 H118 V158 H132 V150 H146 V173 Z M236 173 V156 H250 V150 H264 V158 H300 V152 H316 V160 H332 V173 Z"
          fill="#F0C29A"
        />
        <path d="M146 173 V152 L152 146 H238 L242 152 V173 Z" fill="#CB8F5F" />
        <Spire cx={198} top={60} w={8} finial="#F2C230" />
        <Spire cx={214} top={58} w={8} finial="#E3735A" />
        <Spire cx={206} top={38} w={13} finial="#F2C230" />
        <Star x={206} y={31} s={1} />
        <Spire cx={226} top={58} w={11} finial="#F2C230" />
        <Star x={226} y={52} s={0.7} />
        <Spire cx={156} top={82} w={9} finial="#E3735A" />
        <Spire cx={166} top={72} w={9.5} finial="#F2C230" />
        <Spire cx={176} top={72} w={9.5} finial="#E3735A" />
        <Spire cx={186} top={82} w={9} finial="#F2C230" />
        <Arches from={150} to={238} top={160} bottom={173} step={11} w={6} color="#A86B40" />
      </>
    ),
    near: (
      <>
        <Sailboat x={132} y={190} s={0.7} />
        <Sailboat x={232} y={198} />
        <path d="M0 220 C70 212 130 214 190 222 C250 230 300 226 360 216 V330 H0 Z" fill="#F6D9A6" />
        <path
          d="M0 220 C70 212 130 214 190 222 C250 230 300 226 360 216"
          fill="none"
          stroke="#fff"
          stroke-width="2"
          opacity="0.85"
        />
        <Palm x={96} y={234} h={84} lean={10} />
        <Palm x={318} y={238} h={74} lean={-12} />
      </>
    ),
  },

  venezia: {
    sky: ['#F7A08F', '#FFE7C2'],
    sun: { x: 118, y: 150, r: 22, color: '#FFD15C' },
    water: ['#0B6F7F', '#3DA7B0'],
    cloudColor: '#FFF3EA',
    clouds: [
      [28, 40, 0.8],
      [206, 26, 0.75],
      [300, 62, 0.55],
    ],
    birds: [244, 92],
    far: (
      <>
        <path d="M0 166 C60 160 120 162 180 164 C240 160 300 162 360 158 V173 H0 Z" fill="#E7A796" />
        <path d="M28 165 C28 153 48 153 48 165 Z M37 155 V150 H39 V155 Z" fill="#DC9886" />
      </>
    ),
    mid: (
      <>
        <rect x="50" y="146" width="92" height="27" fill="#F6CDB9" />
        <Arches from={52} to={141} top={151} bottom={157} step={6} w={3.5} color="#D99A85" />
        <Arches from={53} to={141} top={162} bottom={173} step={9} w={6} color="#B5735E" />
        <path d="M50 146 V142 H142 V146 Z" fill="#EFC0AA" />
        <rect x="150" y="142" width="56" height="31" fill="#F2D7C2" />
        <Arches from={153} to={204} top={156} bottom={173} step={10} w={7} color="#B98A73" />
        <g fill="#A9C4B8">
          <path d="M152 142 C151 132 157 128 160 124 C163 128 169 132 168 142 Z" />
          <path d="M168 141 C167 128 174 122 178 117 C182 122 189 128 188 141 Z" />
          <path d="M188 142 C187 132 193 128 196 124 C199 128 205 132 204 142 Z" />
        </g>
        <g fill="#F2C230">
          <circle cx="160" cy="122" r="1.6" />
          <circle cx="178" cy="115" r="1.8" />
          <circle cx="196" cy="122" r="1.6" />
        </g>
        <path d="M262 173 V150 H330 V173 Z" fill="#F4E3D3" />
        <path d="M270 150 C270 128 322 128 322 150 Z" fill="#E9DCCD" />
        <path d="M290 133 C290 124 302 124 302 133 Z M295 124 V119 H297 V124 Z" fill="#DCCBB8" />
        <path d="M214 173 V74 H232 V173 Z" fill="#C9573F" />
        <path d="M219 80 V172 M227 80 V172" stroke="#A8452F" stroke-width="1" />
        <path d="M212 74 V56 H234 V74 Z" fill="#F1DEC8" />
        <Arches from={215} to={233} top={59} bottom={71} step={6} w={3.5} color="#5B3A33" />
        <path d="M210 56 H236 V52 H210 Z" fill="#E2C9B0" />
        <path d="M215 52 V46 H231 V52 Z" fill="#C9573F" />
        <path d="M213 46 L223 18 L233 46 Z" fill="#4E9A84" />
        <circle cx="223" cy="16" r="2" fill="#F2C230" />
      </>
    ),
    near: (
      <>
        <g transform="translate(150 210)">
          <g class="scn-bob">
            <path
              d="M-46 0 C-20 10 26 10 50 -4 C54 -6 56 -12 56 -16 C58 -10 58 -2 52 4 C28 18 -24 16 -50 4 C-54 2 -52 -2 -46 0 Z"
              fill="#16213E"
            />
            <path d="M54 -19 h6 v2 h-2 v2 h2 v2 h-2 v2 h2 v2 h-6 z" fill="#E8E2D6" />
            <path d="M-30 -18 L-14 8" stroke="#8B5E3C" stroke-width="1.6" />
            <rect x="-37" y="-22" width="7" height="10" fill="#16213E" />
            <path d="M-37 -19 h7 M-37 -15.5 h7" stroke="#fff" stroke-width="1.4" />
            <path d="M-35 -12 V0 M-32 -12 V0" stroke="#16213E" stroke-width="2" />
            <circle cx="-33.5" cy="-25.5" r="3" fill="#E9B48C" />
            <ellipse cx="-33.5" cy="-28" rx="4.6" ry="1.3" fill="#F2C230" />
          </g>
        </g>
        {[96, 104, 262].map(x => (
          <g key={x}>
            <rect x={x} y="184" width="4" height="150" fill="#8B5E3C" />
            {[0, 1, 2, 3].map(i => (
              <rect key={i} x={x} y={186 + i * 6} width="4" height="3" fill="#2357C6" />
            ))}
            <path d={`M${x - 0.5} 184 L${x + 2} 179 L${x + 4.5} 184 Z`} fill="#2357C6" />
          </g>
        ))}
      </>
    ),
  },

  andalousie: {
    sky: ['#7CC6F2', '#FFF3D4'],
    sun: { x: 96, y: 58, r: 21, color: '#FFC23D' },
    water: ['#2D7FC9', '#6DB8EC'],
    clouds: [
      [150, 28, 0.75],
      [276, 50, 0.6],
      [16, 70, 0.5],
    ],
    birds: [258, 92],
    far: <path d="M0 162 C60 150 120 156 180 152 C240 148 300 154 360 150 V173 H0 Z" fill="#EBD3AE" />,
    mid: (
      <>
        <House x={40} w={22} h={16} roof="tile" />
        <House x={62} w={18} h={22} roof="flat" />
        <House x={80} w={26} h={14} roof="tile" />
        <House x={106} w={20} h={20} roof="flat" />
        <House x={126} w={22} h={17} roof="tile" />
        <path d="M146 173 V144 H236 V173 Z" fill="#E2B98A" />
        <path
          d="M146 144 l3 -7 l3 7 m6 0 l3 -7 l3 7 m6 0 l3 -7 l3 7 m6 0 l3 -7 l3 7 m6 0 l3 -7 l3 7 m6 0 l3 -7 l3 7 m6 0 l3 -7 l3 7 m6 0 l3 -7 l3 7"
          fill="#E2B98A"
          stroke="#E2B98A"
          stroke-width="1"
        />
        <Arches from={150} to={196} top={154} bottom={173} step={12} w={7} color="#C5945F" />
        <path d="M198 173 V82 H222 V173 Z" fill="#D9A26B" />
        <g fill="none" stroke="#B4794A" stroke-width="0.8">
          {[100, 114, 128, 142].map(y => (
            <path
              key={y}
              d={`M205 ${y - 5} L208.5 ${y} L205 ${y + 5} L201.5 ${y} Z M215 ${y - 5} L218.5 ${y} L215 ${y + 5} L211.5 ${y} Z`}
            />
          ))}
        </g>
        <path d="M196 82 H224 V78 H196 Z" fill="#E8C08E" />
        <path d="M200 78 V58 H220 V78 Z" fill="#F2DDBB" />
        <Arches from={203} to={219} top={61} bottom={75} step={9} w={5} color="#7A5236" />
        <path d="M198 58 H222 V55 H198 Z M203 55 V44 H217 V55 Z M206 44 V36 H214 V44 Z" fill="#F2DDBB" />
        <path d="M206 36 C206 30 214 30 214 36 Z" fill="#E8C08E" />
        <path d="M210 30 V22" stroke="#5B4A3A" stroke-width="1.2" />
        <path d="M210 23 l5 1.5 l-5 1.5 z" fill="#5B4A3A" />
        <House x={238} w={22} h={20} roof="tile" />
        <House x={260} w={18} h={15} roof="flat" />
        <path d="M282 173 V146 H302 V173 Z M286 146 V134 H298 V146 Z" fill="#E7B97B" />
        <path d="M287 134 C287 126 297 126 297 134 Z" fill="#F2C230" />
        <House x={306} w={24} h={19} roof="tile" />
        <House x={330} w={22} h={15} roof="flat" />
      </>
    ),
    near: (
      <>
        <Sailboat x={240} y={196} s={0.8} />
        <path d="M0 222 C100 214 220 216 360 224 V330 H0 Z" fill="#E9C995" />
        <OrangeTree x={100} y={228} s={1.15} />
        <OrangeTree x={326} y={232} s={1} />
      </>
    ),
  },

  roma: {
    sky: ['#F8B48A', '#FFF0D8'],
    sun: { x: 286, y: 76, r: 20, color: '#FFD06A' },
    land: ['#CFA16B', '#EBC48E'],
    clouds: [
      [30, 40, 0.8],
      [150, 24, 0.7],
      [240, 54, 0.5],
    ],
    birds: [190, 70],
    far: (
      <>
        <path d="M0 160 C50 150 110 156 160 150 C210 146 280 152 360 146 V173 H0 Z" fill="#E8C4A0" />
        <path d="M66 160 V152 H94 V160 Z M64 152 C64 132 96 132 96 152 Z M78 134 V128 H82 V134 Z" fill="#DCC2AB" />
        <circle cx="80" cy="127" r="1.5" fill="#DCC2AB" />
      </>
    ),
    mid: (
      <>
        <path d="M232 106 C246 108 262 116 276 132 L282 173 H232 Z" fill="#C9935F" />
        <path
          d="M118 173 V102 C118 98 120 96 124 96 H236 L240 100 V104 H250 V112 H258 V120 H266 V130 H274 V140 H282 V173 Z"
          fill="#E5B98B"
        />
        <g fill="#A86E45">
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={126 + i * 11} y="99" width="4" height="4" />
          ))}
        </g>
        <g stroke="#F3D1A8" stroke-width="1.5">
          <path d="M118 106 H240 M118 124 H258 M118 142 H274 M118 160 H282" />
        </g>
        <Arches from={122} to={238} top={109} bottom={121} step={11} w={6} color="#A9714A" />
        <Arches from={122} to={256} top={127} bottom={139} step={11} w={6} color="#A9714A" />
        <Arches from={122} to={272} top={145} bottom={157} step={11} w={6} color="#A9714A" />
        <Arches from={122} to={280} top={163} bottom={173} step={11} w={6} color="#A9714A" />
      </>
    ),
    near: (
      <>
        <path d="M0 214 C90 206 200 212 360 206 V330 H0 Z" fill="#C49460" />
        <StonePine x={92} y={230} h={60} w={76} />
        <Cypress x={268} y={232} h={50} />
        <Cypress x={279} y={234} h={40} />
        <StonePine x={312} y={236} h={54} w={66} />
      </>
    ),
  },

  coast: {
    sky: ['#93D4F5', '#FFF2D2'],
    sun: { x: 92, y: 62, r: 20, color: '#FFC53D' },
    water: ['#1B6FBF', '#5EB0EA'],
    clouds: [
      [150, 30, 0.8],
      [270, 52, 0.6],
      [12, 76, 0.5],
    ],
    birds: [200, 84],
    far: (
      <>
        <path d="M0 168 C30 160 60 162 90 168 Z" fill="#D9C4A4" />
        <path d="M140 173 C164 140 206 120 248 124 C290 128 322 146 360 150 V173 Z" fill="#E2C69E" />
      </>
    ),
    mid: (
      <>
        {(
          [
            [170, 18, 16],
            [188, 16, 22],
            [204, 20, 26],
            [262, 18, 24],
            [280, 22, 18],
            [302, 18, 14],
          ] as const
        ).map(([x, w, h]) => (
          <g key={x}>
            <rect x={x} y={173 - h} width={w} height={h} fill="#fff" />
            <path d={`M${x - 1.5} ${173 - h} L${x + w / 2} ${167 - h} L${x + w + 1.5} ${173 - h} Z`} fill="#DD7A4C" />
            <rect x={x + w / 2 - 2} y={166} width="4" height="7" rx="2" fill="var(--accent)" />
          </g>
        ))}
        <path d="M232 173 V104 H246 V173 Z" fill="#fff" />
        <path d="M230 104 L239 90 L248 104 Z" fill="#DD7A4C" />
        <path d="M236 122 V114 A3 3 0 0 1 242 114 V122 Z" fill="#3E4A63" />
      </>
    ),
    near: (
      <>
        <Sailboat x={150} y={196} />
        <Sailboat x={300} y={190} s={0.7} />
        <path d="M40 240 C54 220 90 212 118 220 C138 226 152 236 160 240 V330 H40 Z" fill="#B9A48A" />
        <path d="M94 222 V178 L98 172 H108 L112 178 V222 Z" fill="#fff" />
        <path d="M95 188 H111 V196 H95 Z M95 206 H111 V214 H95 Z" fill="var(--accent)" />
        <path d="M99 172 V164 H107 V172 Z" fill="#FFE39A" />
        <path d="M97 164 L103 158 L109 164 Z" fill="#16213E" />
      </>
    ),
  },
};

export const hasScenery = (place: string) => place in ART && place !== 'coast';

/**
 * Portrait windows such as the porthole show more sky and ground, so the landmark keeps a sensible
 * size; ground layers therefore run down to y = 330.
 */
export function Scenery({ place, tall }: { place: string; tall?: boolean }) {
  const art = ART[place] ?? ART.coast!;
  const id = useId();
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
