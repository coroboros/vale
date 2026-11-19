/**
 * The situation pages' script (build/pages.ts): the destination's drawing, and each phrase spoken
 * by a voice of the device when it has one for the language.
 */
import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/atkinson-hyperlegible-next/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/kit.css';
import './styles/page.css';
import { effect } from '@preact/signals';
import { Volume2 } from 'lucide-preact';
import { render } from 'preact';
import { initVoices, speak, voicesFor } from './platform/voices';
import { Scenery } from './ui/scenery/Scenery';

const view = document.querySelector<HTMLElement>('.page-view');
if (view?.dataset.scenery) render(<Scenery place={view.dataset.scenery} />, view);

initVoices();
for (const slot of document.querySelectorAll<HTMLElement>('.page-say')) {
  const { say = '', lang = '' } = slot.dataset;
  effect(() => {
    const voice = voicesFor(lang)[0];
    render(
      voice ? (
        <button
          type="button"
          class="play small soft"
          aria-label="Écouter"
          onClick={() => void speak(say, voice, { lang })}
        >
          <Volume2 size={20} />
        </button>
      ) : null,
      slot,
    );
  });
}
