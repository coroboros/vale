import '@fontsource-variable/bricolage-grotesque/wght.css';
import '@fontsource-variable/atkinson-hyperlegible-next/index.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/kit.css';
import './styles/journey.css';
import './styles/screens.css';
import './styles/welcome.css';
import { settleDay } from './actions';
import { initCounts } from './counts';
import { initMemory } from './engine/memory';
import { requestPersistence } from './platform/backup';
import { initInstall } from './platform/install';
import { initPWA } from './platform/pwa';
import { initVoices } from './platform/voices';
import { loadDB, theme, watchStorage } from './state/store';
import { initRouter } from './ui/router';
import { applyTheme } from './ui/themes';
import { renderApp } from './ui/welcome-page';

async function boot() {
  // The memory model must exist before loading: migrating v3 data rebuilds FSRS states.
  await initMemory();
  loadDB();
  watchStorage();
  settleDay();
  initRouter();
  initVoices();
  initInstall();
  initPWA();
  initCounts();
  void requestPersistence();
  applyTheme(theme.value);
  renderApp(document.getElementById('app')!);
}

void boot();
