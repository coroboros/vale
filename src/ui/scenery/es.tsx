/** Spain's destinations. */
import { Arches, type Art, Boat, CitrusTree, Lamp, Palm, RoundTree, Sailboat, StonePine } from './parts';

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

export const ES: Record<string, Art> = {
  barcelone: {
    sky: ['#8FD3F7', '#FFF1CC'],
    sun: { x: 252, y: 66, r: 20, color: '#FFC53D' },
    water: ['#1C6FC0', '#5FB2EC'],
    clouds: [
      [40, 34, 0.9],
      [196, 20, 0.7],
      [296, 46, 0.6],
    ],
    flyer: ['gulls', 124, 66],
    far: (
      <>
        <path
          d="M0 158 C40 136 72 140 104 146 C132 126 160 128 188 140 C214 118 250 120 276 136 C304 126 334 138 360 158 V173 H0 Z"
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
        <path d="M0 220 C70 212 130 214 190 222 C250 230 300 226 360 220 V330 H0 Z" fill="#F6D9A6" />
        <path
          d="M0 220 C70 212 130 214 190 222 C250 230 300 226 360 220"
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

  andalousie: {
    sky: ['#7CC6F2', '#FFF3D4'],
    sun: { x: 96, y: 58, r: 21, color: '#FFC23D' },
    water: ['#2D7FC9', '#6DB8EC'],
    clouds: [
      [150, 28, 0.75],
      [276, 50, 0.6],
      [16, 70, 0.5],
    ],
    flyer: ['storks', 258, 92],
    far: <path d="M0 162 C60 150 120 156 180 152 C240 148 300 154 360 162 V173 H0 Z" fill="#EBD3AE" />,
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
        <path d="M0 222 C100 214 220 216 360 222 V330 H0 Z" fill="#E9C995" />
        <CitrusTree x={100} y={228} s={1.15} fruit="#FF9A2E" />
        <CitrusTree x={326} y={232} s={1} fruit="#FF9A2E" />
      </>
    ),
  },
  madrid: {
    sky: ['#86C9F2', '#FFF0D4'],
    sun: { x: 302, y: 58, r: 19, color: '#FFC53D' },
    land: ['#D2B286', '#E9D2AB'],
    clouds: [
      [28, 36, 0.8],
      [176, 22, 0.65],
      [252, 70, 0.5],
    ],
    flyer: ['birds', 214, 78],
    far: (
      <>
        <path
          d="M0 173 V150 H16 V140 H30 V148 H82 V142 H98 V150 H118 V173 Z M244 173 V146 H262 V138 H280 V146 H306 V140 H324 V150 H360 V173 Z"
          fill="#E5D2B8"
        />
        <path d="M40 173 V122 C40 112 64 112 64 122 V173 Z" fill="#ECDFCA" />
        <g stroke="#D9C7AA" stroke-width="1">
          <path d="M40 134 H64 M40 146 H64 M40 158 H64" />
        </g>
        <path d="M37 122 C37 100 67 100 67 122 Z" fill="#3B4252" />
        <path d="M49 101 h6 l-1 -7 h-4 z" fill="#3B4252" />
        <path d="M52 94 V84 M52 89 L45 83 M52 89 L59 83" stroke="#E2B53C" stroke-width="2" stroke-linecap="round" />
      </>
    ),
    mid: (
      <>
        <rect x="112" y="124" width="136" height="49" fill="#E2C9A2" />
        <rect x="108" y="118" width="144" height="7" fill="#CDB28A" />
        <path d="M150 118 V104 H210 V118 Z" fill="#D9BF97" />
        <path d="M146 104 H214 L210 99 H150 Z" fill="#C4A57C" />
        <path d="M174 104 C174 96 186 96 186 104 Z" fill="#B8956A" />
        <g fill="#A88B62">
          <circle cx="156" cy="96" r="3" />
          <circle cx="204" cy="96" r="3" />
          <rect x="154" y="96" width="4" height="4" />
          <rect x="202" y="96" width="4" height="4" />
        </g>
        <g stroke="#C8AA80" stroke-width="2">
          <path d="M118 126 V173 M144 126 V173 M216 126 V173 M242 126 V173" />
        </g>
        <Arches from={151} to={209} top={140} bottom={173} step={21} w={16} color="#AFC9DD" />
        <path d="M124 173 V150 H138 V173 Z M222 173 V150 H236 V173 Z" fill="#AFC9DD" />
      </>
    ),
    near: (
      <>
        <path d="M0 212 C90 204 270 204 360 212 V330 H0 Z" fill="#CDAF88" />
        <ellipse cx="180" cy="222" rx="58" ry="9" fill="#E6D8C2" />
        <ellipse cx="180" cy="220" rx="50" ry="6" fill="#7FC0E8" />
        <g class="scn-shimmer" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity="0.8">
          <path d="M180 216 C174 202 168 198 160 200 M180 216 C186 202 192 198 200 200 M180 216 V194" />
        </g>
        <path d="M176 216 h8 v-6 h-8 z" fill="#D8C8AE" />
        <RoundTree x={40} y={232} r={22} />
        <RoundTree x={322} y={234} r={19} color="#5A9466" />
        <Lamp x={96} base={216} />
        <Lamp x={268} base={216} />
      </>
    ),
  },

  valence: {
    sky: ['#8FD8F7', '#FFF4DA'],
    sun: { x: 70, y: 56, r: 19, color: '#FFC53D' },
    water: ['#2C80C4', '#86CDF1'],
    clouds: [
      [150, 28, 0.75],
      [272, 50, 0.6],
      [14, 92, 0.45],
    ],
    flyer: ['gulls', 226, 74],
    far: <path d="M0 166 H120 V160 H150 V166 H360 V173 H0 Z" fill="#D7E6EC" />,
    mid: (
      <>
        <g opacity="0.14" transform="translate(0 346) scale(1 -1)">
          <path d="M30 173 C34 146 60 128 100 124 C134 121 160 132 170 150 C174 158 174 166 172 173 Z" fill="#FFFFFF" />
          <path d="M200 173 C214 146 240 136 262 136 C284 136 310 146 324 173 Z" fill="#FFFFFF" />
        </g>
        <path d="M30 173 C34 146 60 128 100 124 C134 121 160 132 170 150 C174 158 174 166 172 173 Z" fill="#F7F9FA" />
        <path d="M44 173 C50 154 72 140 104 138 C130 136 150 146 160 160 L162 173 Z" fill="#DCE6EC" />
        <path d="M62 160 C80 150 120 146 150 156" fill="none" stroke="#7FA9C4" stroke-width="3" />
        <path
          d="M50 132 C88 98 150 92 198 112 C160 106 108 110 64 136 Z"
          fill="#FFFFFF"
          stroke="#C9D7E0"
          stroke-width="1"
        />
        <path d="M200 173 C214 146 240 136 262 136 C284 136 310 146 324 173 Z" fill="#F7F9FA" />
        <g stroke="#D3DEE5" stroke-width="1.4">
          <path d="M216 160 L228 146 M232 163 L242 142 M248 165 L254 138 M276 165 L270 138 M292 163 L282 142 M308 160 L296 146" />
        </g>
        <path d="M236 173 C240 158 250 152 262 152 C274 152 284 158 288 173 Z" fill="#8FC2E2" />
      </>
    ),
    near: (
      <>
        <path d="M0 222 H360 V330 H0 Z" fill="#EEE8DC" />
        <path d="M0 222 H360" stroke="#fff" stroke-width="3" />
        <Palm x={36} y={238} h={70} lean={8} />
        <Palm x={330} y={240} h={62} lean={-10} />
      </>
    ),
  },

  baleares: {
    sky: ['#84D0F6', '#FFF3DA'],
    sun: { x: 290, y: 58, r: 19, color: '#FFC53D' },
    water: ['#0B86A8', '#5FD1D6'],
    clouds: [
      [24, 40, 0.75],
      [150, 24, 0.6],
      [246, 76, 0.45],
    ],
    flyer: ['plane', 176, 72],
    far: (
      <>
        <path d="M112 173 C140 164 230 162 258 173 Z" fill="#CDBF9E" />
        <rect x="148" y="142" width="80" height="28" fill="#D9B98C" />
        <g fill="#C9A572">
          {[150, 162, 174, 186, 198, 210, 222].map(x => (
            <path key={x} d={`M${x} 170 V136 L${x + 2} 128 L${x + 4} 136 V170 Z`} />
          ))}
          <rect x="232" y="120" width="10" height="50" />
          <path d="M230 120 H244 V116 H230 Z" />
        </g>
        <circle cx="192" cy="152" r="5" fill="#A8804F" />
        <rect x="118" y="166" width="134" height="7" fill="#C8AE84" />
      </>
    ),
    mid: (
      <>
        <path d="M0 128 C30 116 60 122 84 136 C100 146 108 160 112 173 H0 Z" fill="#E6D2AA" />
        <path
          d="M0 140 C30 138 60 142 88 152 M0 156 C34 154 70 158 100 166"
          fill="none"
          stroke="#D3BC90"
          stroke-width="2"
        />
        <path d="M76 138 V118 H90 V138 Z" fill="#DCC89F" />
        <path d="M74 118 H92 V114 H74 Z" fill="#CDB68A" />
        <path d="M81 124 v6 h4 v-6 z" fill="#8A7553" />
        <StonePine x={14} y={124} h={24} w={38} />
        <StonePine x={46} y={122} h={20} w={30} />
        <path d="M360 128 C330 126 300 132 280 146 C266 156 260 166 258 173 H360 Z" fill="#E1CCA2" />
        <path
          d="M360 140 C330 140 300 148 280 160 M360 156 C334 156 310 162 292 168"
          fill="none"
          stroke="#CFB78C"
          stroke-width="2"
        />
        <StonePine x={312} y={132} h={24} w={36} />
      </>
    ),
    near: (
      <>
        <Sailboat x={156} y={198} />
        <Sailboat x={236} y={190} s={0.7} />
        <Boat x={104} y={214} hull="#fff" band="#2E86C1" />
        <path d="M60 330 C100 256 260 256 300 330 Z" fill="#F4DFB2" />
        <path d="M60 330 C100 256 260 256 300 330" fill="none" stroke="#9FE6DF" stroke-width="4" />
      </>
    ),
  },

  canaries: {
    sky: ['#7EC3EF', '#FFEFD6'],
    sun: { x: 74, y: 52, r: 18, color: '#FFC53D' },
    land: ['#9A5D3E', '#C98F66'],
    clouds: [
      [214, 26, 0.7],
      [20, 30, 0.6],
      [292, 64, 0.5],
    ],
    flyer: ['paraglider', 146, 66],
    far: (
      <>
        <path d="M96 173 L158 132 C164 128 170 128 176 132 L222 173 Z" fill="#97786B" />
        <path d="M138 173 L232 84 C238 78 246 78 252 84 L366 173 Z" fill="#8A6F64" />
        <path d="M242 82 L262 173 H252 L238 96 Z" fill="#7A6158" />
        <path
          d="M222 94 L232 84 C238 78 246 78 252 84 L264 95 C256 91 250 98 243 93 C236 98 230 91 222 94 Z"
          fill="#FFFFFF"
        />
      </>
    ),
    mid: (
      <>
        <path
          d="M98 173 C96 160 102 148 102 136 C102 128 94 120 96 110 C98 100 114 96 122 102 C130 108 126 118 122 126 C118 136 122 150 124 173 Z"
          fill="#7A4A33"
        />
        <path
          d="M114 100 C124 104 126 114 120 126 C116 136 118 152 120 173 H124 C122 150 118 136 122 126 C126 118 130 108 122 102 Z"
          fill="#5E3826"
        />
        <path
          d="M40 173 C42 160 50 152 60 154 C66 156 70 164 70 173 Z M272 173 C276 162 288 158 296 164 L300 173 Z"
          fill="#84513A"
        />
      </>
    ),
    near: (
      <>
        <path d="M0 212 C80 204 200 210 360 212 V330 H0 Z" fill="#B47A54" />
        <g fill="#7E9A4C">
          <circle cx="40" cy="222" r="9" />
          <circle cx="52" cy="218" r="7" />
          <circle cx="210" cy="216" r="7" />
          <circle cx="220" cy="219" r="5" />
        </g>
        <path d="M300 234 C298 220 296 210 300 198 L306 198 C308 210 308 220 306 234 Z" fill="#8C6A52" />
        <path
          d="M303 200 L288 186 M303 200 L318 186 M303 200 V184"
          stroke="#8C6A52"
          stroke-width="3"
          stroke-linecap="round"
        />
        <g fill="#4F7A44">
          <ellipse cx="286" cy="182" rx="12" ry="5" />
          <ellipse cx="303" cy="178" rx="13" ry="6" />
          <ellipse cx="320" cy="182" rx="12" ry="5" />
        </g>
      </>
    ),
  },

  paysbasque: {
    sky: ['#93CDEF', '#FFF2DE'],
    sun: { x: 300, y: 60, r: 18, color: '#FFD15C' },
    water: ['#1A69A6', '#6AB2DF'],
    clouds: [
      [26, 34, 0.8],
      [150, 22, 0.6],
      [240, 72, 0.5],
    ],
    flyer: ['paraglider', 196, 82],
    far: (
      <>
        <path d="M0 150 C30 132 70 132 104 152 L118 173 H0 Z" fill="#5F9566" />
        <path d="M40 140 V133 H58 V140 Z" fill="#D8D2C4" />
        <g stroke="#FFFFFF" stroke-linecap="round">
          <path d="M49 133 V120" stroke-width="3" />
          <path d="M45 125 L49 122 L53 125" stroke-width="1.6" fill="none" />
        </g>
        <circle cx="49" cy="117.5" r="2" fill="#FFFFFF" />
        <path d="M262 173 C270 150 300 136 330 138 C346 140 356 146 360 150 V173 Z" fill="#55895C" />
        <path d="M316 138 V130 H320 V138 Z M318 130 V122" stroke="#F3EFE6" stroke-width="2.4" fill="#F3EFE6" />
        <path d="M140 173 C150 156 196 150 214 164 L222 173 Z" fill="#6A9E6E" />
        <path d="M178 158 V148 H184 V158 Z" fill="#FFFFFF" />
        <path d="M177 148 H185 L181 144 Z" fill="#B5543C" />
      </>
    ),
    mid: <Boat x={120} y={190} s={0.8} hull="#fff" band="#1A69A6" />,
    near: (
      <>
        <Sailboat x={250} y={200} s={0.8} />
        <path d="M0 206 C90 196 270 196 360 206 V330 H0 Z" fill="#F4DFB4" />
        <path d="M0 232 C120 224 240 224 360 232 V330 H0 Z" fill="#D6CFC3" />
        <g fill="none" stroke="#fff" stroke-width="1.6">
          <path d="M0 220 C120 212 240 212 360 220 M0 232 C120 224 240 224 360 232" />
          {Array.from({ length: 22 }, (_, i) => (
            <circle
              key={i}
              cx={8 + (i * 360) / 22}
              cy={224 - 3.2 * Math.sin((Math.PI * (8 + (i * 360) / 22)) / 360)}
              r="3.4"
            />
          ))}
        </g>
        <Lamp x={60} base={230} />
        <Lamp x={300} base={230} />
      </>
    ),
  },

  galice: {
    sky: ['#9CCBEA', '#F6F1E3'],
    sun: { x: 302, y: 54, r: 17, color: '#FFD86B' },
    land: ['#6E9A5E', '#9FC184'],
    clouds: [
      [20, 30, 0.8],
      [136, 48, 0.7],
      [226, 22, 0.6],
    ],
    flyer: ['birds', 90, 74],
    far: <path d="M0 158 C60 140 120 146 180 154 C240 140 300 142 360 158 V173 H0 Z" fill="#8DB57A" />,
    mid: (
      <>
        <path d="M150 173 V114 H210 V173 Z" fill="#CDBFA4" />
        <path d="M150 114 L180 98 L210 114 Z" fill="#C2B391" />
        <path d="M177 98 V90 H183 V98 Z" fill="#C2B391" />
        <path d="M168 173 V150 C168 140 192 140 192 150 V173 Z" fill="#6E6A63" />
        <path d="M172 136 V124 C172 118 188 118 188 124 V136 Z" fill="#6E6A63" />
        {[124, 210].map(x => (
          <g key={x}>
            <rect x={x} y="100" width="26" height="73" fill="#C9BA9E" />
            <rect x={x + 3} y="80" width="20" height="20" fill="#CDBFA4" />
            <rect x={x + 6} y="66" width="14" height="14" fill="#C9BA9E" />
            <path d={`M${x + 6} 66 C${x + 6} 56 ${x + 20} 56 ${x + 20} 66 Z`} fill="#BBAA8B" />
            <path d={`M${x + 13} 57 V48`} stroke="#8F8270" stroke-width="1.6" />
            <rect x={x + 9} y="108" width="8" height="14" rx="4" fill="#6E6A63" />
            <rect x={x + 9} y="84" width="8" height="10" rx="4" fill="#6E6A63" />
            <path d={`M${x} 100 H${x + 26} M${x + 3} 80 H${x + 23}`} stroke="#B2A386" stroke-width="2" />
          </g>
        ))}
        <path d="M124 173 V166 H236 V173 Z" fill="#DCD0B8" />
      </>
    ),
    near: (
      <>
        <path d="M0 214 C100 206 220 210 360 214 V330 H0 Z" fill="#7FA86A" />
        {[54, 74, 94, 114].map(x => (
          <g key={x}>
            <rect x={x - 2.5} y="216" width="5" height="14" fill="#B9AE98" />
            <ellipse cx={x} cy="216" rx="5" ry="2" fill="#A89C84" />
          </g>
        ))}
        <rect x="48" y="196" width="72" height="18" fill="#C8B79A" />
        <g stroke="#A99878" stroke-width="1.2">
          {Array.from({ length: 11 }, (_, i) => (
            <path key={i} d={`M${53 + i * 6.4} 198 V212`} />
          ))}
        </g>
        <path d="M44 196 L84 184 L124 196 Z" fill="#B66A4A" />
        <path d="M122 184 V178 M119 181 H125" stroke="#8F8270" stroke-width="1.6" />
        <path d="M300 222 V198 M294 204 H306" stroke="#A89C84" stroke-width="3.4" stroke-linecap="round" />
      </>
    ),
  },
};
