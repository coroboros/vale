import { dayKey } from '../engine/progress';
import { hashSeed } from '../engine/random';
import { frenchDay } from './french';

export function Stamp({
  id,
  label,
  date,
  locked,
  fresh,
  size = 104,
}: {
  id: string;
  label: string;
  date?: number;
  locked?: boolean;
  fresh?: boolean;
  size?: number;
}) {
  const tilt = (hashSeed(id) % 25) - 12;
  const when = date ? frenchDay(dayKey(date), 'short') : '';
  const words = label.split(' ');
  const lines =
    label.length > 12 && words.length > 1
      ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
      : [label];
  return (
    <svg
      class={`stamp${locked ? ' locked' : ''}${fresh ? ' fresh' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={locked ? `${label} : à gagner` : `${label}${when ? `, obtenu le ${when}` : ''}`}
    >
      <g transform={`rotate(${tilt} 60 60)`} fill="none" stroke="currentColor">
        <circle cx="60" cy="60" r="54" stroke-width="3.5" stroke-dasharray={locked ? '6 7' : undefined} />
        <circle cx="60" cy="60" r="45" stroke-width="1.6" />
        <g fill="currentColor" stroke="none" text-anchor="middle" font-family="var(--font-display)">
          {lines.map((line, i) => (
            <text
              key={line}
              x="60"
              y={lines.length === 1 ? 64 : 57 + i * 15}
              font-size={line.length > 10 ? 12 : 15}
              font-weight="800"
            >
              {line}
            </text>
          ))}
          {when && (
            <text x="60" y="88" font-size="9.5" font-weight="700" letter-spacing="1">
              {when}
            </text>
          )}
          <path d="M28 40 h64" stroke="currentColor" stroke-width="1.2" />
        </g>
      </g>
    </svg>
  );
}
