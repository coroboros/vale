/**
 * The welcome page's life (build/welcome.ts writes its text into index.html): the app's own pieces
 * settle on it (the flying window, the install button, the statistics switch), and « C'est parti »
 * opens onboarding at its first question. Only a newcomer in a browser sees it: build/boot.ts sends
 * everyone else to the app before the first paint (docs/UX.md, « The welcome page »).
 */
import { type ComponentChildren, render } from 'preact';
import { reachStep } from '../actions';
import { arrivedFrom } from '../counts';
import { reducedMotion } from '../platform/env';
import { db } from '../state/store';
import { App, TABS } from './App';
import { CountsLink } from './CountsChoice';
import { InstallButton } from './Install';
import { Say } from './kit';
import { Mascot } from './Mascot';
import { JOURNEY, Porthole } from './Porthole';
import { Stamp } from './Stamp';
import { Clouds, Route, Shore } from './scenery/WelcomeScenes';
import { fromWelcomePage } from './screens/Onboarding';

const root = document.documentElement;

function islands(page: HTMLElement, name: string, content: (data: DOMStringMap) => ComponentChildren) {
  for (const slot of page.querySelectorAll<HTMLElement>(`[data-island="${name}"]`)) render(content(slot.dataset), slot);
}

/** The page fades into the app and back (styles/welcome.css), where the browser can and motion is welcome. */
function swap(update: () => void) {
  if (document.startViewTransition && !reducedMotion()) document.startViewTransition(update);
  else update();
}

function welcome(page: HTMLElement, app: HTMLElement) {
  islands(page, 'journey', () => <Porthole stops={JOURNEY} />);
  islands(page, 'install', () => <InstallButton block secondary />);
  islands(page, 'counts', () => <CountsLink />);
  islands(page, 'say', ({ say = '', lang = '' }) => <Say text={say} lang={lang} small />);
  islands(page, 'stamp', ({ id = '', label = '' }) => <Stamp id={id} label={label} size={80} decorative />);
  islands(page, 'icon', ({ tab }) => {
    const Icon = TABS.find(t => t.tab === tab)?.Icon;
    return Icon && <Icon size={28} aria-hidden="true" />;
  });
  // Only his eyes move, after the pointer: a bob or a blink would move on with nothing to pause it (WCAG 2.2.2).
  islands(page, 'bernard', () => <Mascot size={132} mood="happy" blinks={false} decorative />);
  islands(page, 'clouds', () => <Clouds />);
  islands(page, 'route', () => <Route />);
  islands(page, 'shore', () => <Shore />);
  reachStep('welcome', arrivedFrom());

  // The page leaves the document while the app shows, so only one of them is ever there to read.
  for (const button of page.querySelectorAll<HTMLElement>('[data-start]'))
    button.addEventListener('click', () => {
      const y = scrollY;
      fromWelcomePage.value = {
        back: () =>
          swap(() => {
            fromWelcomePage.value = null;
            render(null, app);
            app.before(page);
            delete root.dataset.view;
            scrollTo(0, y);
            button.focus();
          }),
      };
      swap(() => {
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
