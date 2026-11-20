/**
 * The anonymous counts (counts-api.ts) and their switch: in « Moi », and on the first screen a
 * newcomer sees, as onboarding is counted too and the CNIL asks that people can easily say no
 * (docs/UX.md, « Who stops before the first lesson »).
 */
import { useState } from 'preact/hooks';
import { setShareCounts } from '../actions';
import { countsOn } from '../counts';
import { COUNTED } from '../counts-api';
import { settings } from '../state/store';
import { Sheet, Toggle } from './kit';

export function CountsRow() {
  return (
    <div class="row">
      <div class="row-main">
        <p class="row-title">Statistiques anonymes</p>
        <p class="row-sub">{COUNTED}</p>
      </div>
      <Toggle checked={settings.value.shareCounts} onChange={setShareCounts} label="Statistiques anonymes" />
    </div>
  );
}

export function CountsLink() {
  const [open, setOpen] = useState(false);
  if (!countsOn) return null;
  return (
    <>
      <button type="button" class="btn btn-ghost counts-link" onClick={() => setOpen(true)}>
        Statistiques anonymes
      </button>
      {open && (
        <Sheet title="Ce que Bagage compte" onClose={() => setOpen(false)}>
          <div class="form">
            <CountsRow />
            <button type="button" class="btn btn-primary btn-block" onClick={() => setOpen(false)}>
              C’est noté
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}
