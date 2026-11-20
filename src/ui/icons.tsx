/**
 * Bernard's beach in the icon set, drawn on Lucide's grid (24 px, 2 px round strokes) so these sit
 * with its icons. Which tabs got one, and why the others kept theirs: docs/BRAND.md, « Icons ».
 */
import type { LucideIcon, LucideProps } from 'lucide-preact';
import type { ComponentChildren } from 'preact';

function glyph(draw: () => ComponentChildren): LucideIcon {
  return ({ size = 24, color = 'currentColor', strokeWidth = 2, ...rest }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {draw()}
    </svg>
  );
}

export const TreasureMap = glyph(() => (
  <>
    <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" />
    <path d="M6.5 16.5c1.5 0 2.5-2.5 4.5-2.5s2-1.2 2.5-1.8" stroke-dasharray="0 3" />
    <path d="m14.5 9.5 3 3m0-3-3 3" />
  </>
));

export const LuggageTag = glyph(() => (
  <>
    <path d="M9 8h6l3 3v8.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19.5V11z" />
    <circle cx="12" cy="11" r="1" />
    <path d="M12 10c0-3 1.5-5.5 4-7" />
    <path d="M9 15h6M9 18h4" />
  </>
));

export const Traveller = glyph(() => (
  <>
    <path d="M5 7.5h14" />
    <path d="M8.5 7.5a3.5 3.5 0 0 1 7 0" />
    <path d="M8.73 8.75a3.5 3.5 0 1 0 6.54 0" />
    <path d="M5 21v-1.5A4.5 4.5 0 0 1 9.5 15h5a4.5 4.5 0 0 1 4.5 4.5V21" />
  </>
));

export const TreasureChest = glyph(() => (
  <>
    <path d="M3 11V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
    <path d="M3 11v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M3 11h7.5M13.5 11H21" />
    <rect x="10.5" y="9.5" width="3" height="4" rx=".5" />
  </>
));
