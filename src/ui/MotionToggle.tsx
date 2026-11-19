import { Pause, Play } from 'lucide-preact';

/**
 * Pauses a drawing that keeps moving, as anything moving for more than five seconds must offer
 * (WCAG 2.2.2): the welcome journey, a trip's window, the pages' drawing.
 */
export function MotionToggle({
  playing,
  onToggle,
  pause,
  resume,
}: {
  playing: boolean;
  onToggle: () => void;
  pause: string;
  resume: string;
}) {
  return (
    <button type="button" class="icon-btn motion-toggle" aria-label={playing ? pause : resume} onClick={onToggle}>
      {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
    </button>
  );
}
