/** Portugal's destinations. */
import { type Art, Boat, Lamp, Lighthouse, Sailboat, Tram } from './parts';

/** A Lisbon house: pastel front, terracotta roof, two windows. */
function TownHouse({ x, base, w, h, color }: { x: number; base: number; w: number; h: number; color: string }) {
  const top = base - h;
  return (
    <g>
      <rect x={x} y={top} width={w} height={h} fill={color} />
      <path d={`M${x - 1} ${top} L${x + 2} ${top - 4} H${x + w - 2} L${x + w + 1} ${top} Z`} fill="#D9734E" />
      <rect x={x + w * 0.2} y={top + h * 0.3} width="3" height="4" rx="0.8" fill="#3E4A63" />
      <rect x={x + w * 0.6} y={top + h * 0.3} width="3" height="4" rx="0.8" fill="#3E4A63" />
    </g>
  );
}

/** Porto's rabelo: a flat boat with barrels and a square sail, at (x, y). */
const Rabelo = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g class="scn-bob">
      <path d="M-34 -4 H34 C30 4 22 7 12 7 H-18 C-26 7 -32 3 -34 -4 Z" fill="#5A3D2B" />
      <path d="M30 -4 C36 -10 40 -16 40 -22" fill="none" stroke="#5A3D2B" stroke-width="2" />
      <g fill="#8B5E3C">
        {[-24, -12, 0, 12].map(bx => (
          <rect key={bx} x={bx} y="-12" width="10" height="8" rx="3" />
        ))}
      </g>
      <g stroke="#3E2A1E" stroke-width="1">
        <path d="M-24 -8 h46" />
      </g>
      <path d="M-4 -12 V-40" stroke="#3E2A1E" stroke-width="1.6" />
      <path d="M-16 -38 H8 V-16 H-16 Z" fill="#F7F1E6" />
      <path d="M-16 -28 H8" stroke="#C8653F" stroke-width="2" />
    </g>
  </g>
);

export const PT: Record<string, Art> = {
  lisbonne: {
    sky: ['#9CD6F6', '#FFF1D6'],
    sun: { x: 318, y: 62, r: 18, color: '#FFC94A' },
    water: ['#1F6FAE', '#6EB5E3'],
    clouds: [
      [30, 38, 0.8],
      [170, 22, 0.65],
      [262, 46, 0.5],
    ],
    flyer: ['gulls', 130, 80],
    far: (
      <>
        <path d="M150 173 C190 152 232 146 272 152 C302 156 330 148 360 144 V173 Z" fill="#D9CDB4" />
        <g fill="#C8513A">
          <rect x="150" y="161" width="210" height="3" />
          <path d="M194 164 V110 H200 V164 Z M298 164 V110 H304 V164 Z" />
        </g>
        <g fill="none" stroke="#C8513A" stroke-width="1.5">
          <path d="M150 152 Q172 138 197 111 Q249 196 301 111 Q328 136 360 160" />
          {Array.from({ length: 9 }, (_, i) => {
            const t = (i + 1) / 10;
            return <path key={t} d={`M${197 + 104 * t} ${111 + 170 * t * (1 - t)} V161`} stroke-width="0.7" />;
          })}
        </g>
        <path
          d="M333 148 V134 H337 V148 Z M328 129 H342 M335 125 V134"
          stroke="#CDBFA4"
          stroke-width="2"
          fill="#CDBFA4"
        />
      </>
    ),
    mid: (
      <>
        <path
          d="M-40 173 C-28 152 -14 134 0 126 C22 108 52 96 86 94 C114 92 140 104 162 122 C174 132 182 150 188 173 Z"
          fill="#EAD5B4"
        />
        <path
          d="M44 104 V94 H48 V98 H54 V94 H58 V98 H64 V94 H68 V98 H74 V94 H78 V98 H84 V94 H88 V98 H94 V94 H98 V104 Z M62 94 V84 H66 V88 H70 V84 H74 V94 Z"
          fill="#CDB997"
        />
        {(
          [
            [6, 128, 20, 18, '#F6D57A'],
            [30, 124, 18, 22, '#FFFFFF'],
            [52, 120, 20, 16, '#F2A7A0'],
            [100, 124, 18, 20, '#A9CCEB'],
            [122, 130, 20, 18, '#FFFFFF'],
            [0, 151, 18, 20, '#A9CCEB'],
            [22, 150, 20, 17, '#F3C08A'],
            [46, 148, 18, 22, '#FFFFFF'],
            [68, 150, 22, 18, '#F6D57A'],
            [94, 148, 18, 21, '#F2A7A0'],
            [116, 151, 20, 18, '#FFFFFF'],
            [140, 152, 18, 16, '#A9CCEB'],
            [0, 173, 22, 18, '#F2A7A0'],
            [26, 173, 20, 22, '#F6D57A'],
            [50, 173, 22, 17, '#FFFFFF'],
            [76, 173, 18, 21, '#A9CCEB'],
            [98, 173, 22, 18, '#F3C08A'],
            [124, 173, 20, 20, '#FFFFFF'],
            [148, 173, 22, 16, '#F6D57A'],
          ] as const
        ).map(([x, base, w, h, color]) => (
          <TownHouse key={`${x}-${base}`} x={x} base={base} w={w} h={h} color={color} />
        ))}
        <Sailboat x={262} y={190} s={0.75} />
      </>
    ),
    near: (
      <>
        <path d="M0 150 C120 147 240 147 360 150" fill="none" stroke="#3E4A63" stroke-width="0.8" opacity="0.6" />
        <path d="M0 208 C100 202 220 204 360 208 V330 H0 Z" fill="#E4D8C3" />
        <g fill="none" stroke="#F7F1E6" stroke-width="5" opacity="0.9">
          <path d="M0 256 C40 248 80 264 120 256 S200 248 240 256 S320 264 360 256" />
          <path d="M0 286 C40 278 80 294 120 286 S200 278 240 286 S320 294 360 286" />
        </g>
        <g fill="none" stroke="#A89A82" stroke-width="2">
          <path d="M0 232 C120 226 240 228 360 232" />
          <path d="M0 240 C120 234 240 236 360 240" />
        </g>
        <Tram x={150} y={234} />
        <Lamp x={56} base={232} />
        <path d="M326 240 V112 H360 V240 Z" fill="#F4F0E6" />
        <g fill="#2E6BC2">
          {[0, 1, 2, 3, 4, 5].map(row =>
            [0, 1].map(col => (
              <path
                key={`${row}-${col}`}
                d="M0 -4 L4 0 L0 4 L-4 0 Z"
                transform={`translate(${334 + col * 12} ${124 + row * 18})`}
              />
            )),
          )}
        </g>
        <rect x="336" y="160" width="14" height="24" rx="1" fill="#3E4A63" />
      </>
    ),
  },
  porto: {
    sky: ['#9DCDEE', '#FFF1DC'],
    sun: { x: 82, y: 58, r: 18, color: '#FFD15C' },
    water: ['#1F5F7A', '#6EA8BE'],
    clouds: [
      [160, 26, 0.7],
      [270, 44, 0.55],
      [12, 96, 0.45],
    ],
    flyer: ['gulls', 232, 72],
    far: (
      <>
        <path d="M0 132 C30 124 60 126 90 136 L110 173 H0 Z" fill="#B7A27F" />
        <path d="M28 130 V114 C28 104 52 104 52 114 V130 Z" fill="#EFE6D6" />
        <path d="M30 114 C30 106 50 106 50 114 Z" fill="#D9CDB6" />
        <path d="M40 106 V100" stroke="#B7A27F" stroke-width="1.6" />
        <path d="M222 173 C240 140 280 126 360 132 V173 Z" fill="#C9B08B" />
      </>
    ),
    mid: (
      <>
        <rect x="60" y="114" width="250" height="5" fill="#4A4E57" />
        <rect x="70" y="160" width="230" height="4" fill="#4A4E57" />
        <path d="M76 173 C110 112 260 112 294 173" fill="none" stroke="#4A4E57" stroke-width="5" />
        <path d="M86 173 C118 122 252 122 284 173" fill="none" stroke="#4A4E57" stroke-width="2" />
        <g stroke="#4A4E57" stroke-width="1.6">
          {(
            [
              [110, 142.9],
              [140, 132.4],
              [170, 127.8],
              [200, 127.8],
              [230, 132.4],
              [260, 142.9],
            ] as const
          ).map(([x, arch]) => (
            <path key={x} d={`M${x} 119 V${arch}`} />
          ))}
        </g>
        <path d="M58 173 V114 H72 V173 Z M298 173 V114 H312 V173 Z" fill="#C2B49A" />
        {(
          [
            [232, 146, 16, 27, '#E8B04B'],
            [248, 142, 14, 31, '#D96F5A'],
            [262, 148, 16, 25, '#7FA9C9'],
            [278, 140, 14, 33, '#F2E3C6'],
            [314, 144, 16, 29, '#E8B04B'],
            [330, 150, 14, 23, '#7FA9C9'],
            [344, 142, 16, 31, '#D96F5A'],
          ] as const
        ).map(([x, top, w, h, color]) => (
          <g key={x}>
            <rect x={x} y={top} width={w} height={h} fill={color} />
            <path d={`M${x - 1} ${top} L${x + w / 2} ${top - 4} L${x + w + 1} ${top} Z`} fill="#C8653F" />
            <rect x={x + w * 0.3} y={top + 6} width="3" height="5" fill="#3E4A63" />
            <rect x={x + w * 0.3} y={top + 16} width="3" height="5" fill="#3E4A63" />
          </g>
        ))}
      </>
    ),
    near: (
      <>
        <Rabelo x={116} y={214} />
        <Rabelo x={252} y={204} s={0.72} />
      </>
    ),
  },

  algarve: {
    sky: ['#87D0F5', '#FFF2D6'],
    sun: { x: 302, y: 56, r: 19, color: '#FFC53D' },
    water: ['#0E86A9', '#5ED0D4'],
    clouds: [
      [30, 34, 0.75],
      [150, 22, 0.6],
      [226, 72, 0.45],
    ],
    flyer: ['plane', 126, 74],
    far: <path d="M200 173 C220 160 260 156 300 160 C330 162 352 168 362 173 Z" fill="#E2B07A" />,
    mid: (
      <>
        <path d="M-40 173 C-30 150 -16 122 0 116 C40 112 80 116 110 126 C130 132 146 146 152 173 Z" fill="#E7A35E" />
        <path
          d="M-10 120 C-6 117 -3 116 0 116 C40 112 80 116 110 126 C80 122 40 120 0 124 C-4 124 -7 122 -10 120 Z"
          fill="#8FA65A"
        />
        <g fill="none" stroke="#CF8A47" stroke-width="2">
          <path d="M-22 138 C10 135 80 140 118 150 M-28 152 C8 149 76 154 128 164" />
        </g>
        <path
          d="M56 173 V160 C56 148 76 148 76 160 V173 Z M94 173 V158 C94 146 112 146 112 158 V173 Z"
          fill="#3FAFC6"
        />
        <path d="M178 173 C176 158 180 146 188 142 C196 146 200 158 198 173 Z" fill="#E09A55" />
        <path d="M188 142 C196 146 200 158 198 173 H192 C194 158 192 148 188 142 Z" fill="#CC8443" />
      </>
    ),
    near: (
      <>
        <Sailboat x={262} y={198} />
        <Boat x={212} y={212} hull="#fff" band="#E9A23B" />
        <path d="M-70 330 C-46 300 -24 250 0 226 C60 216 140 218 200 232 C232 262 262 300 286 330 Z" fill="#F6DDB0" />
        <path
          d="M-70 330 C-46 300 -24 250 0 226 C60 216 140 218 200 232 C232 262 262 300 286 330"
          fill="none"
          stroke="#9FE6DF"
          stroke-width="4"
        />
      </>
    ),
  },

  madere: {
    sky: ['#86C8F0', '#FFF1DA'],
    sun: { x: 70, y: 60, r: 18, color: '#FFC53D' },
    water: ['#0F4E8C', '#4F96D2'],
    clouds: [
      [160, 30, 0.75],
      [270, 58, 0.6],
      [8, 100, 0.4],
    ],
    flyer: ['paraglider', 210, 82],
    far: (
      <>
        <path d="M216 173 C236 164 268 160 300 162 L322 173 Z" fill="#B97C58" />
        <Lighthouse x={306} base={163} h={14} band="#1F5FBF" />
      </>
    ),
    mid: (
      <>
        <path d="M-44 173 C-30 140 -16 104 0 98 C40 94 90 104 130 122 C160 136 184 156 196 173 Z" fill="#B5704B" />
        <g fill="none" stroke-width="3">
          <path d="M-22 122 C10 119 90 128 132 142" stroke="#9C5B3B" />
          <path d="M-32 140 C16 137 100 146 150 160" stroke="#C98A5E" />
          <path d="M-38 156 C20 153 110 160 168 170" stroke="#9C5B3B" />
        </g>
        <path
          d="M-14 106 C-8 100 -4 98 0 98 C40 94 90 104 130 122 C104 114 60 106 0 110 C-6 110 -10 108 -14 106 Z"
          fill="#7FA05A"
        />
        {[
          [72, 106],
          [94, 112],
        ].map(([x, base]) => (
          <g key={x} transform={`translate(${x} ${base})`}>
            <path d="M0 0 L9 -20 L18 0 Z" fill="#8B6A3E" />
            <path d="M3.5 0 L9 -12 L14.5 0 Z" fill="#FFFFFF" />
            <path d="M7 0 V-5 H11 V0 Z" fill="#C8352E" />
            <path d="M3.5 0 L9 -12 L14.5 0" fill="none" stroke="#2E5FA8" stroke-width="1.2" />
          </g>
        ))}
        <path d="M150 173 C152 162 158 156 164 158 C170 160 172 166 172 173 Z" fill="#A5653F" />
      </>
    ),
    near: (
      <>
        <Boat x={252} y={210} hull="#fff" band="#1F5FBF" />
        <g transform="translate(26 240)">
          <path d="M0 0 C-4 -30 -2 -52 4 -64" fill="none" stroke="#7A8F3E" stroke-width="4" />
          <g fill="#5E9A3E">
            <path d="M4 -64 C20 -80 44 -78 56 -66 C40 -70 22 -66 4 -64 Z" />
            <path d="M4 -64 C-10 -84 -26 -84 -36 -72 C-22 -74 -8 -70 4 -64 Z" />
            <path d="M3 -60 C18 -62 36 -52 44 -40 C30 -48 16 -54 3 -60 Z" />
          </g>
        </g>
      </>
    ),
  },

  acores: {
    sky: ['#9BCDEC', '#F4F1E6'],
    sun: { x: 290, y: 54, r: 17, color: '#FFD86B' },
    land: ['#5E9150', '#8DBA72'],
    clouds: [
      [18, 40, 0.8],
      [130, 26, 0.7],
      [226, 60, 0.55],
    ],
    flyer: ['birds', 170, 78],
    far: (
      <>
        <path d="M0 150 C40 132 100 128 160 134 C220 126 300 130 360 150 V173 H0 Z" fill="#6E9D5E" />
        <path d="M0 162 C60 152 120 150 180 154 C240 148 300 152 360 162 V173 H0 Z" fill="#5F8E52" />
      </>
    ),
    mid: (
      <>
        <ellipse cx="108" cy="184" rx="92" ry="12" fill="#2F6FB5" />
        <ellipse cx="260" cy="186" rx="84" ry="11" fill="#3E8E6E" />
        <path d="M180 186 H192" stroke="#E9E1D2" stroke-width="2.5" />
        <g fill="none" stroke="#fff" stroke-linecap="round" opacity="0.5" class="scn-shimmer">
          <path d="M60 182 h22 M120 186 h30 M230 184 h20 M280 188 h26" stroke-width="1.4" />
        </g>
      </>
    ),
    near: (
      <>
        <path d="M0 214 C100 206 220 210 360 214 V330 H0 Z" fill="#6C9F58" />
        {(
          [
            [24, 222, '#6D8FE0'],
            [52, 216, '#9C7BD8'],
            [80, 224, '#B9C8F2'],
            [280, 214, '#6D8FE0'],
            [308, 220, '#9C7BD8'],
            [336, 212, '#B9C8F2'],
          ] as const
        ).map(([x, y, color]) => (
          <g key={x}>
            <circle cx={x} cy={y + 6} r="12" fill="#4E7F45" />
            <circle cx={x - 6} cy={y} r="7" fill={color} />
            <circle cx={x + 6} cy={y - 1} r="7" fill={color} />
            <circle cx={x} cy={y - 6} r="7" fill={color} />
          </g>
        ))}
        {[176, 200].map(x => (
          <g key={x}>
            <rect x={x} y="214" width="16" height="9" rx="4" fill="#fff" />
            <rect x={x + 4} y="215" width="6" height="7" fill="#2B2B2B" />
            <rect x={x + 14} y="211" width="6" height="6" rx="2" fill="#fff" />
            <path d={`M${x + 2} 223 v5 M${x + 13} 223 v5`} stroke="#2B2B2B" stroke-width="1.6" />
          </g>
        ))}
      </>
    ),
  },
};
