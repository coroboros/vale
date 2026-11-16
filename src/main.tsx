import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/atkinson-hyperlegible-next/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/kit.css';
import './styles/journey.css';
import './styles/screens.css';
import { render } from 'preact';
import { settleDay } from './actions';
import { initMemory } from './engine/memory';
import { requestPersistence } from './platform/backup';
import { initInstall } from './platform/install';
import { initPWA } from './platform/pwa';
import { initSpeech } from './platform/speech';
import { loadDB, theme, watchStorage } from './state/store';
import { App } from './ui/App';
import { initRouter } from './ui/router';
import { applyTheme } from './ui/themes';

async function boot() {
  // The memory model must exist before loading: migrating v3 data rebuilds FSRS states.
  await initMemory();
  loadDB();
  watchStorage();
  settleDay();
  initRouter();
  initSpeech();
  initInstall();
  initPWA();
  void requestPersistence();
  applyTheme(theme.value);
  render(<App />, document.getElementById('app')!);
}

void boot();
