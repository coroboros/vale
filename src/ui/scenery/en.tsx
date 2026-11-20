/** The English-speaking destinations. */
import { Arches, type Art, Boat, Lamp, Palm, RoundTree, Sailboat } from './parts';

/** A London double-decker at (x, y), its wheels on the road. */
function Bus({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-48" width="100" height="44" rx="8" fill="#D23A2E" />
      <rect x="0" y="-27" width="100" height="3" fill="#F2EDE4" />
      <g fill="#2F3B4F">
        {[8, 30, 52, 74].map(wx => (
          <rect key={`u${wx}`} x={wx} y="-43" width="17" height="11" rx="2" />
        ))}
        {[8, 30, 52].map(wx => (
          <rect key={`l${wx}`} x={wx} y="-21" width="17" height="10" rx="2" />
        ))}
        <rect x="76" y="-21" width="16" height="17" rx="2" />
      </g>
      <g fill="#20252F">
        <circle cx="20" cy="-3" r="6" />
        <circle cx="80" cy="-3" r="6" />
      </g>
    </g>
  );
}

/** The orange Staten Island ferry, rocking at (x, y). */
const Ferry = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <g class="scn-bob">
      <path d="M-44 -6 H44 L38 6 H-38 Z" fill="#F28C28" />
      <rect x="-34" y="-16" width="68" height="10" fill="#F4EFE4" />
      <rect x="-24" y="-24" width="48" height="8" fill="#F4EFE4" />
      <g fill="#3E4A63">
        {[-30, -20, -10, 0, 10, 20].map(wx => (
          <rect key={wx} x={wx} y="-13" width="6" height="4" />
        ))}
      </g>
      <path d="M-2 -24 V-32" stroke="#3E4A63" stroke-width="1.4" />
    </g>
  </g>
);

/** The Golden Gate Bridge: towers at x = 118 and 262, the deck at y = 148, both ends on land. */
function GoldenGate() {
  const red = '#C4432F';
  const deck = 148;
  const top = 74;
  type Point = [number, number];
  const start: Point = [28, deck - 1];
  const spans: [Point, Point, Point][] = [
    [start, [84, 128], [118, top]],
    [
      [118, top],
      [190, 210],
      [262, top],
    ],
    [
      [262, top],
      [300, 128],
      [334, deck - 1],
    ],
  ];
  const at = ([a, b, c]: [Point, Point, Point], t: number): Point => [
    (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * b[0] + t ** 2 * c[0],
    (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * b[1] + t ** 2 * c[1],
  ];
  const hangers = spans.flatMap((span, i) => {
    const n = i === 1 ? 13 : 5;
    return Array.from({ length: n }, (_, k) => at(span, (k + 1) / (n + 1)));
  });
  return (
    <g>
      <path
        d={`M${start.join(' ')} ${spans.map(([, b, c]) => `Q${b.join(' ')} ${c.join(' ')}`).join(' ')}`}
        fill="none"
        stroke={red}
        stroke-width="1.8"
      />
      <g stroke={red} stroke-width="0.6" opacity="0.8">
        {hangers.map(([x, y]) => (
          <path key={x} d={`M${x.toFixed(1)} ${y.toFixed(1)} V${deck}`} />
        ))}
      </g>
      <rect x="22" y={deck} width="318" height="4" fill={red} />
      <path d={`M22 ${deck + 6} H340`} stroke="#9C3324" stroke-width="1.2" />
      {[118, 262].map(x => (
        <g key={x} fill={red}>
          <rect x={x - 6} y={top - 2} width="3.4" height={174 - top} />
          <rect x={x + 2.6} y={top - 2} width="3.4" height={174 - top} />
          {[top - 2, top + 16, top + 36, top + 58].map(y => (
            <rect key={y} x={x - 6} y={y} width="12" height="3.2" />
          ))}
          <rect x={x - 8} y="166" width="16" height="7" fill="#8E7D6A" />
        </g>
      ))}
    </g>
  );
}

/** A wind-shaped Monterey cypress on (x, y), its flat crown pushed inland. */
const SeaCypress = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path
      d="M0 0 C-1 -12 2 -22 -2 -34 M-1 -24 C-8 -28 -16 -30 -24 -34 M0 -30 C6 -34 12 -38 16 -44"
      fill="none"
      stroke="#5A4632"
      stroke-width="3"
      stroke-linecap="round"
    />
    <path
      d="M-40 -34 C-34 -42 -18 -44 -8 -40 C-4 -50 14 -54 26 -48 C34 -48 38 -42 32 -38 C20 -34 4 -36 -6 -34 C-16 -30 -32 -29 -40 -34 Z"
      fill="#3E6B4A"
    />
    <path
      d="M-30 -36 C-22 -40 -12 -40 -6 -37 M2 -44 C10 -48 20 -48 26 -45"
      fill="none"
      stroke="#5B8A62"
      stroke-width="2"
    />
  </g>
);

/** Ocean Drive's pastel hotels, from x along the promenade at y. */
function DecoHotels({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="6" y={y - 52} width="40" height="52" fill="#F7E3A1" />
      <rect x="22" y={y - 66} width="8" height="16" fill="#F7E3A1" />
      <rect x="48" y={y - 62} width="44" height="62" fill="#F5B8C6" />
      <path d={`M64 ${y - 62} V${y - 80} H76 V${y - 62} Z`} fill="#F5B8C6" />
      <path d={`M92 ${y - 46} H108 C112 ${y - 46} 114 ${y - 42} 114 ${y - 38} V${y} H92 Z`} fill="#A9E2D0" />
      <g fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.9">
        <path d={`M4 ${y - 36} H48 M4 ${y - 20} H48 M46 ${y - 44} H94 M46 ${y - 28} H94 M46 ${y - 12} H94`} />
        <path d={`M90 ${y - 30} H116 M90 ${y - 16} H116`} />
      </g>
      <g fill="#3E8FA0">
        {[12, 24, 36].map(x => (
          <rect key={x} x={x} y={y - 32} width="6" height="8" />
        ))}
        {[54, 66, 78].map(x => (
          <rect key={x} x={x} y={y - 40} width="6" height="9" />
        ))}
        {[54, 66, 78].map(x => (
          <rect key={`b${x}`} x={x} y={y - 24} width="6" height="9" />
        ))}
        <rect x="98" y={y - 26} width="10" height="7" />
      </g>
      <path d={`M68 ${y - 80} V${y - 88}`} stroke="#F08AA4" stroke-width="1.4" />
    </g>
  );
}

/** A Miami Beach lifeguard tower on stilts, its ramp down to the sand at (x, y). */
const LifeguardTower = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <g stroke="#E9E2D2" stroke-width="2.4">
      <path d="M-14 0 V-20 M14 0 V-20 M-14 -6 L14 -18 M14 -6 L-14 -18" />
    </g>
    <path d="M14 -22 L38 0" stroke="#D9CBA8" stroke-width="4" />
    <rect x="-20" y="-24" width="40" height="4" fill="#2BB3B1" />
    <rect x="-17" y="-44" width="34" height="20" rx="2" fill="#FF7BA0" />
    <rect x="-11" y="-40" width="22" height="9" fill="#FFF6E5" />
    <path d="M-17 -30 H17" stroke="#FFD15C" stroke-width="3" />
    <path d="M-22 -44 L0 -56 L22 -44 Z" fill="#2BB3B1" />
    <path d="M0 -56 V-66" stroke="#59616C" stroke-width="1" />
    <path d="M0 -66 H9 L7 -63 L9 -60 H0" fill="#E2553F" />
  </g>
);

/** A brown pelican on its post at (x, y), the post's foot. */
const Pelican = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-3" y="-26" width="6" height="26" fill="#8B5E3C" />
    <ellipse cx="0" cy="-32" rx="9" ry="6" fill="#8C7F72" />
    <path d="M6 -36 C10 -44 6 -48 2 -46 C0 -42 2 -38 4 -36 Z" fill="#F4EFE4" />
    <path d="M5 -46 L20 -40 L6 -42 Z" fill="#E9B44C" />
    <path d="M-8 -32 C-12 -30 -14 -28 -15 -26" stroke="#6E6257" stroke-width="2" stroke-linecap="round" />
  </g>
);

/** A cruise ship far out on the horizon. */
const CruiseShip = ({ x }: { x: number }) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M0 165 H86 L80 172 H6 Z" fill="#F4F3EE" />
    <rect x="10" y="157" width="64" height="8" fill="#FBFAF6" />
    <rect x="18" y="151" width="46" height="6" fill="#F4F3EE" />
    <rect x="52" y="143" width="8" height="8" fill="#5D8FC0" />
    <path d="M4 168 H82" stroke="#5D8FC0" stroke-width="1.4" />
    <g fill="#9DB5CC">
      {[14, 22, 30, 38, 46, 54, 62].map(wx => (
        <rect key={wx} x={wx} y="159" width="4" height="2" />
      ))}
    </g>
  </g>
);

export const EN: Record<string, Art> = {
  londres: {
    sky: ['#A3C4E4', '#F4EEE3'],
    sun: { x: 312, y: 58, r: 15, color: '#FFE08A' },
    water: ['#3D6680', '#8DB0C4'],
    clouds: [
      [18, 34, 0.9],
      [120, 20, 0.75],
      [214, 44, 0.6],
      [296, 26, 0.5],
    ],
    flyer: ['birds', 178, 76],
    far: (
      <>
        <path d="M0 173 V160 H16 V150 H30 V156 H44 V146 H58 V154 H100 V150 H116 V158 H132 V173 Z" fill="#C5D2DE" />
        <path d="M34 150 C34 138 52 138 52 150 Z M42 138 V132 H44 V138 Z" fill="#C5D2DE" />
        <path d="M70 173 L82 94 L94 173 Z" fill="#B7C7D6" />
        <path d="M82 94 L86 173" stroke="#D7E1EA" stroke-width="1" />
        <path d="M104 173 C102 150 104 130 112 122 C120 130 122 150 120 173 Z" fill="#B0C1D1" />
      </>
    ),
    mid: (
      <>
        <rect x="140" y="140" width="164" height="33" fill="#DCC593" />
        <path
          d={`M140 140 ${Array.from({ length: 21 }, (_, i) => `L${144 + i * 8} 133 L${148 + i * 8} 140`).join(' ')} Z`}
          fill="#C9B07B"
        />
        <g stroke="#C2A66E" stroke-width="1.1">
          {Array.from({ length: 27 }, (_, i) => (
            <path key={i} d={`M${143 + i * 6} 144 V172`} />
          ))}
        </g>
        <path d="M220 140 V124 H232 V140 Z M220 124 L226 106 L232 124 Z" fill="#D2B985" />
        <rect x="300" y="104" width="24" height="69" fill="#D6BE8B" />
        <path
          d="M298 104 H326 V100 H298 Z M300 100 l2 -6 l2 6 m6 0 l2 -6 l2 6 m6 0 l2 -6 l2 6"
          fill="#C9B07B"
          stroke="#C9B07B"
        />
        <path d="M312 94 V84" stroke="#59616C" stroke-width="1" />
        <rect x="120" y="120" width="20" height="53" fill="#DCC593" />
        <g stroke="#C2A66E" stroke-width="1">
          <path d="M125 124 V172 M130 124 V172 M135 124 V172" />
        </g>
        <rect x="117" y="98" width="26" height="24" fill="#D2B985" />
        <circle cx="130" cy="110" r="8" fill="#FFF5D8" stroke="#B8975E" stroke-width="1.5" />
        <path d="M130 110 V104.5 M130 110 L133.5 112" stroke="#3E4A63" stroke-width="1.2" stroke-linecap="round" />
        <rect x="120" y="86" width="20" height="12" fill="#CDB37E" />
        <Arches from={122} to={139} top={88} bottom={97} step={6} w={3.5} color="#8F7448" />
        <path d="M119 86 L130 62 L141 86 Z" fill="#59616C" />
        <circle cx="130" cy="61" r="1.8" fill="#F2C230" />
      </>
    ),
    near: (
      <>
        <path d="M0 214 C120 208 240 210 360 214 V330 H0 Z" fill="#B7B0A3" />
        <path d="M0 214 C120 208 240 210 360 214" fill="none" stroke="#DCD6CB" stroke-width="4" />
        <Lamp x={40} base={214} />
        <Lamp x={318} base={208} />
        <Bus x={136} y={246} />
      </>
    ),
  },
  edimbourg: {
    sky: ['#A7C6E2', '#F2EEE6'],
    sun: { x: 302, y: 50, r: 15, color: '#FFE08A' },
    land: ['#6F8F5C', '#9DB685'],
    clouds: [
      [14, 36, 0.9],
      [120, 22, 0.75],
      [214, 52, 0.6],
      [296, 84, 0.5],
    ],
    flyer: ['gulls', 170, 68],
    far: (
      <path d="M226 173 C246 150 268 128 294 120 C310 116 326 124 336 136 C346 146 354 162 360 173 Z" fill="#8A9C76" />
    ),
    mid: (
      <>
        <path d="M30 173 C34 150 52 128 78 120 C106 112 150 112 172 124 C188 134 194 156 196 173 Z" fill="#6B6A63" />
        <path
          d="M52 140 C62 130 76 126 90 128 M150 126 C164 132 176 144 180 160"
          fill="none"
          stroke="#5A5953"
          stroke-width="2"
        />
        <path d="M70 120 C70 110 98 106 104 116 V122 H70 Z" fill="#A7A39A" />
        <rect x="100" y="98" width="52" height="24" fill="#B1ACA2" />
        <path
          d="M100 98 v-4 h5 v4 m5 0 v-4 h5 v4 m5 0 v-4 h5 v4 m5 0 v-4 h5 v4 m5 0 v-4 h5 v4"
          fill="#B1ACA2"
          stroke="#B1ACA2"
        />
        <rect x="120" y="82" width="14" height="16" fill="#A7A39A" />
        <path d="M118 82 L127 72 L136 82 Z" fill="#7F7B74" />
        <path d="M127 72 V62" stroke="#59616C" stroke-width="1" />
        <g class="scn-bob">
          <path d="M127 62 h7 v4 h-7 z" fill="#2B5FAF" />
          <path d="M127 62 l7 4 M134 62 l-7 4" stroke="#fff" stroke-width="0.8" />
        </g>
        <g fill="#5E5A55">
          {[106, 114, 140, 146].map(x => (
            <rect key={x} x={x} y="106" width="3" height="5" />
          ))}
        </g>
        {(
          [
            [196, 132, 16, '#B9B2A6'],
            [212, 126, 14, '#ADA699'],
            [226, 136, 16, '#B9B2A6'],
            [254, 130, 14, '#ADA699'],
            [268, 138, 18, '#B9B2A6'],
          ] as const
        ).map(([x, top, w, color]) => (
          <g key={x}>
            <rect x={x} y={top} width={w} height={173 - top} fill={color} />
            <path d={`M${x} ${top} L${x + w / 2} ${top - 6} L${x + w} ${top} Z`} fill="#8D877C" />
          </g>
        ))}
        <rect x="242" y="112" width="10" height="61" fill="#A39C8F" />
        <path d="M240 112 C240 102 254 102 254 112 Z M246 103 V96" fill="#A39C8F" stroke="#A39C8F" stroke-width="2" />
        <path d="M294 173 L300 104 L306 173 Z" fill="#5E5A55" />
        <path d="M296 150 H304 M297 132 H303" stroke="#4A4743" stroke-width="1.4" />
      </>
    ),
    near: (
      <>
        <path d="M0 212 C120 204 240 208 360 212 V330 H0 Z" fill="#7FA36A" />
        <RoundTree x={38} y={230} r={18} />
        <RoundTree x={292} y={228} r={16} color="#5A8E5E" />
        <Lamp x={332} base={206} />
      </>
    ),
  },

  dublin: {
    sky: ['#A9C9E6', '#F3EFE6'],
    sun: { x: 70, y: 56, r: 15, color: '#FFE08A' },
    water: ['#3E6475', '#87A9B6'],
    clouds: [
      [150, 28, 0.85],
      [258, 46, 0.7],
      [18, 94, 0.5],
    ],
    flyer: ['gulls', 214, 72],
    far: (
      <>
        <path d="M200 173 V40 L201 40 L202 173 Z" fill="#C9CFD4" />
        <rect x="18" y="148" width="90" height="25" fill="#E7E0D2" />
        <path d="M18 148 H108 L100 142 H26 Z" fill="#DCD4C3" />
        <g fill="#C9BFAE">
          {[26, 40, 54, 76, 90].map(x => (
            <rect key={x} x={x} y="154" width="6" height="12" />
          ))}
        </g>
        <path d="M56 142 V132 H70 V142 Z" fill="#E7E0D2" />
        <path d="M54 132 C54 120 72 120 72 132 Z" fill="#7FB09B" />
        <path d="M63 121 V114" stroke="#7FB09B" stroke-width="1.6" />
      </>
    ),
    mid: (
      <>
        {(
          [
            [112, 136, 30, '#B8604A'],
            [142, 140, 26, '#A9553F'],
            [168, 134, 30, '#C7745B'],
            [208, 138, 28, '#B8604A'],
            [236, 132, 32, '#A9553F'],
            [268, 140, 26, '#C7745B'],
            [294, 134, 30, '#B8604A'],
            [324, 138, 36, '#A9553F'],
          ] as const
        ).map(([x, top, w, color], i) => (
          <g key={x}>
            <rect x={x} y={top} width={w} height={173 - top} fill={color} />
            <g fill="#F4EFE4">
              {[0.2, 0.55].map(k => (
                <rect key={k} x={x + w * k} y={top + 6} width="5" height="7" />
              ))}
              {[0.2, 0.55].map(k => (
                <rect key={k} x={x + w * k} y={top + 18} width="5" height="7" />
              ))}
            </g>
            <rect
              x={x + w * 0.4}
              y="163"
              width="6"
              height="10"
              rx="3"
              fill={['#F2C230', '#2357C6', '#1F7A4D', '#C8102E'][i % 4]}
            />
          </g>
        ))}
      </>
    ),
    near: (
      <>
        <path d="M24 214 C90 176 270 176 336 214" fill="none" stroke="#F5F2EA" stroke-width="5" />
        <path d="M24 206 C90 192 270 192 336 206" fill="none" stroke="#F5F2EA" stroke-width="3" />
        <g stroke="#F5F2EA" stroke-width="1.2">
          {Array.from({ length: 23 }, (_, i) => {
            const x = 40 + i * 12;
            const t = (x - 24) / 312;
            return <path key={x} d={`M${x} ${206 - 56 * t * (1 - t)} V${214 - 152 * t * (1 - t)}`} />;
          })}
        </g>
        {[120, 180, 240].map(x => (
          <g key={x}>
            <path d={`M${x} ${193} V${180}`} stroke="#F5F2EA" stroke-width="2" />
            <path
              d={`M${x - 6} 182 C${x - 6} 174 ${x + 6} 174 ${x + 6} 182`}
              fill="none"
              stroke="#F5F2EA"
              stroke-width="1.6"
            />
            <circle cx={x} cy="178" r="2.4" fill="#FFE7A3" />
          </g>
        ))}
        <Boat x={300} y={230} s={0.8} hull="#1F7A4D" band="#F5F2EA" />
      </>
    ),
  },

  newyork: {
    sky: ['#8FC3EE', '#FFF0DC'],
    sun: { x: 304, y: 52, r: 17, color: '#FFD15C' },
    water: ['#2D5C86', '#7FA8C9'],
    clouds: [
      [16, 34, 0.8],
      [130, 20, 0.65],
      [220, 62, 0.5],
    ],
    flyer: ['helicopter', 170, 72],
    far: (
      <>
        <path
          d="M168 173 V150 H180 V138 H192 V152 H206 V132 H218 V146 H252 V136 H262 V150 H290 V128 H300 V144 H336 V140 H346 V156 H352 V173 Z"
          fill="#B6C3D2"
        />
        <g fill="#A4B3C4">
          <rect x="222" y="118" width="24" height="55" />
          <rect x="227" y="104" width="14" height="14" />
          <rect x="230" y="94" width="8" height="10" />
        </g>
        <path d="M233.4 94 V66 H234.6 V94 Z" fill="#8E9DB0" />
        <rect x="266" y="112" width="14" height="61" fill="#A9B7C7" />
        <g fill="#D9DEE4">
          <path d="M266 112 C266 104 280 104 280 112 Z" />
          <path d="M268 105 C268 99 278 99 278 105 Z" />
          <path d="M270 99 C270 94 276 94 276 99 Z" />
        </g>
        <path d="M272.4 94 L273 74 L273.6 94 Z" fill="#C3CAD3" />
        <path d="M306 173 L310 80 H318 L322 173 Z" fill="#AEBFD2" />
        <path d="M313.6 80 V62 H314.4 V80 Z" fill="#8E9DB0" />
      </>
    ),
    mid: (
      <>
        <path d="M58 196 Q118 180 178 196 Z" fill="#7DAA76" />
        <path d="M92 190 L98 182 H138 L144 190 Z" fill="#C9B79A" />
        <path d="M104 182 V150 H132 V182 Z" fill="#C9B79A" />
        <path d="M106 150 V146 H130 V150 Z M102 153 H134 V156 H102 Z" fill="#B5A386" />
        <g fill="#5FA894">
          <path d="M109 146 L113 106 Q118 98 123 106 L127 146 Z" />
          <circle cx="118" cy="94" r="4.5" />
        </g>
        <path d="M118 108 L117 146" stroke="#7CC0A9" stroke-width="1.2" />
        <g stroke="#5FA894" stroke-linecap="round">
          <path
            d="M114.5 91 L111.5 87 M116 90 L114.5 85.5 M118 89.5 V84.5 M120 90 L121.5 85.5 M121.5 91 L124.5 87"
            stroke-width="1.6"
          />
          <path d="M114 104 L106.5 77" stroke-width="4.5" />
        </g>
        <path d="M106 77 L105 71" stroke="#4E8E7B" stroke-width="3" stroke-linecap="round" />
        <path d="M105 72 C102 68 103.5 64 105 61 C106.5 64 108 68 105 72 Z" fill="#F2B33D" />
        <path d="M122 110 L129 112 L127 126 L120 124 Z" fill="#7CC0A9" />
      </>
    ),
    near: <Ferry x={244} y={226} />,
  },
  californie: {
    sky: ['#7FC3EE', '#FFE2B8'],
    sun: { x: 64, y: 54, r: 18, color: '#FFC94D' },
    water: ['#1D5E8C', '#7DB4D6'],
    clouds: [
      [150, 26, 0.6],
      [250, 46, 0.75],
      [320, 18, 0.45],
    ],
    flyer: ['gulls', 196, 64],
    far: (
      <>
        <path
          d="M0 150 C30 140 54 120 84 118 C112 116 136 140 168 146 C204 152 230 128 262 126 C298 124 322 142 360 150 V173 H0 Z"
          fill="#D6B672"
        />
        <path
          d="M0 160 C40 154 80 150 120 154 C170 160 210 150 250 148 C290 146 330 154 360 160 V173 H0 Z"
          fill="#C29E5C"
        />
        <g fill="#FBF8F2" opacity="0.85">
          <ellipse cx="182" cy="143" rx="26" ry="6" />
          <ellipse cx="214" cy="138" rx="30" ry="9" />
          <ellipse cx="250" cy="135" rx="28" ry="8" />
          <ellipse cx="284" cy="139" rx="22" ry="6" />
        </g>
      </>
    ),
    mid: (
      <>
        <path d="M0 136 C10 134 22 138 30 146 C38 154 42 164 44 173 H0 Z" fill="#B99558" />
        <path d="M360 136 C350 136 340 140 332 148 C326 156 322 164 320 173 H360 Z" fill="#B99558" />
        <GoldenGate />
      </>
    ),
    near: (
      <>
        <Sailboat x={190} y={196} s={0.9} />
        <Sailboat x={300} y={206} s={0.7} />
        <path d="M20 330 C30 290 50 254 84 242 C130 230 190 234 224 250 C240 278 248 304 252 330 Z" fill="#C9A95C" />
        <path
          d="M20 330 C30 290 50 254 84 242 C130 230 190 234 224 250"
          fill="none"
          stroke="#E7D3A0"
          stroke-width="3"
        />
        <g fill="#F28A1E">
          {[
            [70, 262],
            [96, 252],
            [128, 258],
            [150, 270],
            [178, 256],
            [108, 280],
            [60, 290],
            [196, 282],
            [140, 296],
          ].map(([px, py]) => (
            <circle key={`${px}-${py}`} cx={px} cy={py} r="3" />
          ))}
        </g>
        <path d="M262 330 C266 290 284 266 312 260 C334 258 346 270 350 330 Z" fill="#8E8070" />
        <SeaCypress x={306} y={262} s={0.9} />
      </>
    ),
  },

  floride: {
    sky: ['#6EC3F0', '#FFF4DA'],
    sun: { x: 300, y: 48, r: 20, color: '#FFD045' },
    water: ['#0E8FA6', '#7FDDD8'],
    clouds: [
      [24, 30, 0.8],
      [140, 16, 0.55],
      [226, 62, 0.5],
    ],
    flyer: ['plane', 196, 58],
    far: <CruiseShip x={206} />,
    mid: (
      <>
        <path d="M0 132 C60 126 150 126 190 138 C204 146 212 160 214 173 H0 Z" fill="#E9DCB8" />
        <Palm x={34} y={150} h={46} lean={6} />
        <DecoHotels x={66} y={134} />
        <Palm x={194} y={156} h={44} lean={-6} />
        <path d="M360 132 C330 132 306 140 296 152 C290 160 288 166 288 173 H360 Z" fill="#E9DCB8" />
        <Palm x={330} y={156} h={52} lean={-8} />
      </>
    ),
    near: (
      <>
        <Sailboat x={232} y={194} s={0.7} />
        <path d="M40 330 C80 254 280 250 320 330 Z" fill="#F6E3B4" />
        <path d="M40 330 C80 254 280 250 320 330" fill="none" stroke="#B6EEE6" stroke-width="4" />
        <LifeguardTower x={186} y={284} />
        <Pelican x={88} y={300} />
        <Palm x={300} y={318} h={70} lean={-10} />
      </>
    ),
  },
};
