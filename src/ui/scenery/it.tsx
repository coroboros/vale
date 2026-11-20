/** Italy's destinations. */
import { Arches, type Art, Boat, CitrusTree, Cypress, Lamp, StonePine, Tram } from './parts';

export const IT: Record<string, Art> = {
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
    flyer: ['gulls', 244, 92],
    far: (
      <>
        <path d="M0 166 C60 160 120 162 180 164 C240 160 300 162 360 166 V173 H0 Z" fill="#E7A796" />
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

  roma: {
    sky: ['#F8B48A', '#FFF0D8'],
    sun: { x: 286, y: 76, r: 20, color: '#FFD06A' },
    land: ['#CFA16B', '#EBC48E'],
    clouds: [
      [30, 40, 0.8],
      [150, 24, 0.7],
      [240, 54, 0.5],
    ],
    flyer: ['birds', 190, 70],
    far: (
      <>
        <path d="M0 160 C50 150 110 156 160 150 C210 146 280 152 360 160 V173 H0 Z" fill="#E8C4A0" />
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
        <path d="M0 214 C90 206 200 212 360 214 V330 H0 Z" fill="#C49460" />
        <StonePine x={92} y={230} h={60} w={76} />
        <Cypress x={268} y={232} h={50} />
        <Cypress x={279} y={234} h={40} />
        <StonePine x={312} y={236} h={54} w={66} />
      </>
    ),
  },
  firenze: {
    sky: ['#F7BE90', '#FFF0D6'],
    sun: { x: 304, y: 84, r: 20, color: '#FFD06A' },
    water: ['#3E7D86', '#8FC2BE'],
    clouds: [
      [24, 40, 0.8],
      [140, 24, 0.65],
      [236, 50, 0.5],
    ],
    flyer: ['balloon', 210, 70],
    far: (
      <>
        <path d="M0 152 C60 138 120 142 180 150 C240 136 300 140 360 152 V173 H0 Z" fill="#B9A37A" />
        <Cypress x={36} y={150} h={18} />
        <Cypress x={250} y={144} h={16} />
        <Cypress x={262} y={145} h={13} />
      </>
    ),
    mid: (
      <>
        <path
          d="M0 173 V156 H20 V150 H44 V156 H80 V160 H206 V154 H232 V160 H270 V152 H330 V158 H360 V173 Z"
          fill="#E8C38E"
        />
        <path
          d="M0 156 H20 L32 152 L44 156 H80 L92 156 M206 154 L219 150 L232 154 M270 152 L300 148 L330 152 L360 156"
          fill="none"
          stroke="#D07D50"
          stroke-width="2.4"
        />
        <path d="M88 160 V136 H198 V160 Z" fill="#EFE6D8" />
        <g stroke="#7FA28A" stroke-width="1">
          <path d="M88 144 H198 M88 152 H198 M104 136 V160 M120 136 V160 M166 136 V160 M182 136 V160" />
        </g>
        <path d="M110 136 V116 H178 V136 Z" fill="#E8DCC8" />
        <path d="M110 122 H178" stroke="#7FA28A" stroke-width="1.4" />
        <path d="M106 116 C106 84 124 66 144 62 C164 66 182 84 182 116 Z" fill="#D2693F" />
        <g fill="none" stroke="#F4E9D8" stroke-width="2">
          <path d="M144 62 V116 M126 72 C120 86 118 100 118 116 M162 72 C168 86 170 100 170 116" />
        </g>
        <path d="M139 62 V52 H149 V62 Z" fill="#F4E9D8" />
        <path d="M138 52 L144 42 L150 52 Z" fill="#E8DCC8" />
        <rect x="206" y="70" width="18" height="90" fill="#F1E8DA" />
        <g fill="#E3A9A0">
          {[82, 102, 122, 142].map(y => (
            <rect key={y} x="208" y={y} width="14" height="6" />
          ))}
        </g>
        <g fill="#7FA28A">
          {[92, 112, 132].map(y => (
            <rect key={y} x="208" y={y} width="14" height="3" />
          ))}
        </g>
        <path d="M204 70 H226 V65 H204 Z" fill="#E1D4C0" />
        <rect x="284" y="96" width="16" height="56" fill="#C8A177" />
        <path d="M280 96 H304 V88 H280 Z" fill="#B88F66" />
        <path d="M281 88 v-4 h3 v4 m4 0 v-4 h3 v4 m4 0 v-4 h3 v4 m4 0 v-4 h3 v4" fill="#B88F66" stroke="#B88F66" />
        <path d="M288 84 V72 H296 V84 Z M287 72 L292 64 L297 72 Z" fill="#C8A177" />
      </>
    ),
    near: (
      <>
        <rect x="30" y="198" width="300" height="9" fill="#D9A86C" />
        {(
          [
            [36, 30, '#E9A25A'],
            [68, 26, '#F3C784'],
            [96, 34, '#E7915C'],
            [132, 28, '#F2D49A'],
            [162, 30, '#E9A25A'],
            [194, 26, '#F3C784'],
            [222, 34, '#E7915C'],
            [258, 30, '#F2D49A'],
            [290, 34, '#E9A25A'],
          ] as const
        ).map(([x, w, color]) => (
          <g key={x}>
            <rect x={x} y="184" width={w} height="14" fill={color} />
            <rect x={x - 1} y="181" width={w + 2} height="3" fill="#C9744A" />
            <rect x={x + w * 0.3} y="188" width="3" height="4" fill="#5B4636" />
            <rect x={x + w * 0.6} y="188" width="3" height="4" fill="#5B4636" />
          </g>
        ))}
        <g fill="#C9935F">
          {[30, 130, 230, 312].map(x => (
            <rect key={x} x={x} y="207" width="18" height="26" />
          ))}
        </g>
        <g fill="none" stroke="#B57C49" stroke-width="2">
          <path d="M48 214 C70 204 108 204 130 214 M148 214 C170 204 208 204 230 214 M248 214 C268 206 296 206 312 214" />
        </g>
        <Boat x={186} y={230} s={0.8} hull="#8B5E3C" band="#F2D49A" />
      </>
    ),
  },

  milano: {
    sky: ['#7FB4E6', '#E6EDF4'],
    sun: { x: 64, y: 60, r: 17, color: '#FFD86B' },
    land: ['#BFB4A3', '#DDD3C3'],
    clouds: [
      [150, 24, 0.75],
      [270, 48, 0.6],
      [8, 94, 0.45],
    ],
    flyer: ['birds', 96, 84],
    far: (
      <>
        <path d="M0 173 V156 H40 V148 H70 V156 H290 V150 H320 V156 H360 V173 Z" fill="#D9D0C2" />
        <g fill="#E0D3CA">
          {[126, 142, 158, 202, 218, 234].map((x, i) => (
            <path key={x} d={`M${x - 3} 128 L${x} ${96 - (i % 3) * 6} L${x + 3} 128 Z`} />
          ))}
        </g>
        <path d="M176 128 L180 46 L184 128 Z" fill="#DCCEC5" />
        <path d="M177 47 h6 l-3 -10 z" fill="#E2B53C" />
      </>
    ),
    mid: (
      <>
        <path d="M100 173 V128 L180 104 L260 128 V173 Z" fill="#F4ECE6" />
        {[100, 128, 156, 198, 226, 254].map((x, i) => {
          const top = [124, 116, 110, 110, 116, 124][i]!;
          return (
            <g key={x}>
              <rect x={x} y={top} width="6" height={173 - top} fill="#DED1C8" />
              <path d={`M${x} ${top} L${x + 3} ${top - 18} L${x + 6} ${top} Z`} fill="#DED1C8" />
              <circle cx={x + 3} cy={top - 19} r="1.4" fill="#D9CBC0" />
            </g>
          );
        })}
        <Arches from={110} to={252} top={148} bottom={173} step={29} w={14} color="#8C7F78" />
        <g fill="#B9AFA8">
          {[118, 147, 205, 234].map(x => (
            <path key={x} d={`M${x} 140 V130 L${x + 4} 124 L${x + 8} 130 V140 Z`} />
          ))}
        </g>
        <circle cx="180" cy="128" r="8" fill="#B9AFA8" />
      </>
    ),
    near: (
      <>
        <path d="M0 212 C120 206 240 206 360 212 V330 H0 Z" fill="#CFC6B6" />
        <g stroke="#BDB3A2" stroke-width="1">
          <path d="M0 224 C120 218 240 218 360 224 M0 238 C120 232 240 232 360 238" fill="none" />
        </g>
        <Tram x={200} y={236} body="#EF9B2C" band="#FFF2DC" />
        <Lamp x={70} base={216} />
        <g class="scn-bob" fill="#8A8F99">
          <ellipse cx="120" cy="226" rx="4" ry="2.6" />
          <ellipse cx="134" cy="230" rx="3.6" ry="2.4" />
          <circle cx="123" cy="223.5" r="1.6" />
          <circle cx="136.5" cy="227.6" r="1.4" />
        </g>
      </>
    ),
  },

  napoli: {
    sky: ['#8ACDF2', '#FFF0D2'],
    sun: { x: 92, y: 56, r: 19, color: '#FFC53D' },
    water: ['#155F9E', '#5EA9DE'],
    clouds: [
      [150, 30, 0.7],
      [262, 22, 0.55],
      [8, 96, 0.45],
    ],
    flyer: ['gulls', 200, 78],
    far: (
      <>
        <path
          d="M40 173 C70 150 96 116 128 108 C140 106 150 112 160 120 C170 110 180 106 192 110 C220 118 250 150 290 173 Z"
          fill="#8E8AA0"
        />
        <path
          d="M160 120 C170 110 180 106 192 110 C200 116 196 126 186 128 C176 130 168 126 160 120 Z"
          fill="#9F9BB0"
        />
      </>
    ),
    mid: (
      <>
        <path d="M214 173 C222 150 238 124 262 108 C290 92 330 90 360 96 C380 100 396 130 404 173 Z" fill="#B98E68" />
        {(
          [
            [232, 158, 16, 15, '#F4B6A6'],
            [250, 154, 18, 19, '#FFFFFF'],
            [270, 150, 16, 23, '#F6D58A'],
            [288, 156, 18, 17, '#F7C9A8'],
            [308, 152, 16, 21, '#FFFFFF'],
            [326, 156, 18, 17, '#F4B6A6'],
            [246, 134, 16, 16, '#F6D58A'],
            [264, 128, 18, 18, '#FFFFFF'],
            [302, 126, 16, 18, '#F7C9A8'],
            [320, 130, 18, 16, '#F6D58A'],
            [276, 108, 16, 16, '#F4B6A6'],
            [312, 104, 18, 18, '#FFFFFF'],
          ] as const
        ).map(([x, base, w, h, color]) => (
          <g key={`${x}-${base}`}>
            <rect x={x} y={base - h} width={w} height={h} fill={color} />
            <rect x={x + w * 0.25} y={base - h * 0.6} width="3" height="4" fill="#3E4A63" />
            <rect x={x + w * 0.6} y={base - h * 0.6} width="3" height="4" fill="#3E4A63" />
          </g>
        ))}
        <path d="M282 128 C282 118 298 118 298 128 Z" fill="#3E9E7E" />
        <path d="M285 122 h10 M284 125 h12" stroke="#F2C230" stroke-width="1" />
        <rect x="284" y="128" width="12" height="10" fill="#F6D58A" />
      </>
    ),
    near: (
      <>
        <Boat x={108} y={204} hull="#fff" band="#2E86C1" />
        <Boat x={168} y={214} s={0.8} hull="#2E86C1" band="#fff" />
        <path d="M200 330 C220 250 300 230 360 226 H420 C440 226 450 262 456 330 Z" fill="#C9B9A2" />
        <StonePine x={30} y={236} h={62} w={72} />
      </>
    ),
  },

  sicilia: {
    sky: ['#8CCFF3', '#FFF1D4'],
    sun: { x: 300, y: 62, r: 19, color: '#FFC53D' },
    water: ['#1270A8', '#62B6E2'],
    clouds: [
      [130, 22, 0.55],
      [216, 52, 0.5],
    ],
    flyer: ['birds', 176, 84],
    far: (
      <>
        <path d="M0 173 L62 116 C66 112 72 112 76 116 L150 173 Z" fill="#9A8C8C" />
        <path
          d="M54 124 L62 116 C66 112 72 112 76 116 L84 124 C76 120 72 126 68 122 C62 126 60 120 54 124 Z"
          fill="#EDE7E2"
        />
        <g class="scn-drift" fill="#EDE7E2" opacity="0.75">
          <circle cx="70" cy="104" r="6" />
          <circle cx="78" cy="94" r="8" />
          <circle cx="90" cy="84" r="10" />
          <circle cx="106" cy="78" r="9" />
        </g>
      </>
    ),
    mid: (
      <>
        <path d="M196 173 C200 140 228 116 266 112 C300 110 330 126 346 150 L360 173 Z" fill="#C9A47C" />
        <path d="M206 160 C220 132 250 122 280 124" fill="none" stroke="#B48C64" stroke-width="2" />
        <path d="M200 173 V156 H232 V173 Z M270 173 V158 H300 V173 Z" fill="#E8C994" />
        <path d="M232 173 V150 H270 V173 Z" fill="#E2BC86" />
        {[236, 256].map(x => (
          <g key={x}>
            <rect x={x} y="130" width="11" height="43" fill="#DDB37C" />
            <path d={`M${x - 1} 130 L${x + 5.5} 120 L${x + 12} 130 Z`} fill="#B97A50" />
            <rect x={x + 4} y="138" width="3" height="6" rx="1.5" fill="#6E5640" />
          </g>
        ))}
      </>
    ),
    near: (
      <>
        <Boat x={128} y={200} hull="#F2C230" band="#2E86C1" />
        <path d="M0 222 C80 212 200 216 360 222 V330 H0 Z" fill="#F2D9A8" />
        {[90, 140].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 234 V210`} stroke="#8B5E3C" stroke-width="1.6" />
            <path d={`M${x - 16} 212 C${x - 10} 200 ${x + 10} 200 ${x + 16} 212 Z`} fill={i ? '#2E86C1' : '#F2C230'} />
          </g>
        ))}
        <CitrusTree x={320} y={236} s={1} fruit="#F7D84A" />
      </>
    ),
  },
};
