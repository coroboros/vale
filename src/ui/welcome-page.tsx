/**
 * The welcome page's life (build/welcome.ts writes its text into index.html): the app's own pieces
 * settle on it (the flying window, the install button, the statistics switch), and « C'est parti »
 * opens onboarding at its first question. Only a newcomer in a browser sees it: build/boot.ts sends
 * everyone else to the app before the first paint (docs/UX.md, « The welcome page »).
 */
import { type ComponentChildren, render } from 'preact';
import { reachStep } from '../actions';
import { arrivedFrom } from '../counts';
import { db } from '../state/store';
import { App } from './App';
import { CountsLink } from './CountsChoice';
import { InstallButton } from './Install';
import { JOURNEY, Porthole } from './Porthole';
import { fromWelcomePage } from './screens/Onboarding';

const root = document.documentElement;

function islands(page: HTMLElement, name: string, content: () => ComponentChildren) {
  for (const slot of page.querySelectorAll<HTMLElement>(`[data-island="${name}"]`)) render(content(), slot);
}

function welcome(page: HTMLElement, app: HTMLElement) {
  islands(page, 'journey', () => <Porthole stops={JOURNEY} />);
  islands(page, 'install', () => <InstallButton block secondary />);
  islands(page, 'counts', () => <CountsLink />);
  reachStep('welcome', arrivedFrom());

  // The page leaves the document while the app shows, so only one of them is ever there to read.
  for (const button of page.querySelectorAll<HTMLElement>('[data-start]'))
    button.addEventListener('click', () => {
      const y = scrollY;
      fromWelcomePage.value = {
        back: () => {
          fromWelcomePage.value = null;
          render(null, app);
          app.before(page);
          delete root.dataset.view;
          scrollTo(0, y);
          button.focus();
        },
      };
      page.remove();
      root.dataset.view = 'app';
      render(<App />, app);
      scrollTo(0, 0);
      const question = app.querySelector<HTMLElement>('h1');
      if (question) {
        question.tabIndex = -1;
        question.focus();
      }
    });
}

/** Renders the app, behind the welcome page for a newcomer in a browser; loaded data can still overrule build/boot.ts. */
export function renderApp(app: HTMLElement): void {
  const page = document.getElementById('welcome');
  if (page && root.dataset.view !== 'app' && !db.value.onboarded) welcome(page, app);
  else {
    page?.remove();
    root.dataset.view = 'app';
    render(<App />, app);
  }
}
