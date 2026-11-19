import { Dumbbell, IdCard, Languages, MapPinned, User } from 'lucide-preact';
import { useEffect, useErrorBoundary } from 'preact/hooks';
import { openLesson, running } from '../actions';
import { BRAND } from '../brand';
import { exportBackup } from '../platform/backup';
import { applyUpdate, updateReady } from '../platform/pwa';
import { db, profile, theme } from '../state/store';
import { Daily } from './Daily';
import { showToast, ToastHost } from './kit';
import { Mascot, ScreenFlag } from './Mascot';
import { go, isTab, route, type Tab } from './router';
import { Activity } from './screens/Activity';
import { CardScreen } from './screens/Card';
import { Home } from './screens/Home';
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
import { Phrases } from './screens/Phrases';
import { Practice } from './screens/Practice';
import { Profile } from './screens/Profile';
import { SceneScreen } from './screens/Scene';
import { SessionScreen } from './screens/Session';
import { Sounds } from './screens/Sounds';
import { applyTheme } from './themes';

const TABS: { tab: Tab; label: string; href: string; Icon: typeof MapPinned }[] = [
  { tab: 'home', label: 'Itinéraire', href: '#/', Icon: MapPinned },
  { tab: 'practice', label: 'Entraînement', href: '#/entrainement', Icon: Dumbbell },
  { tab: 'phrases', label: 'Phrases', href: '#/phrases', Icon: Languages },
  { tab: 'card', label: 'Carte', href: '#/carte', Icon: IdCard },
  { tab: 'me', label: 'Moi', href: '#/moi', Icon: User },
];

function Nav({ current }: { current: Tab | null }) {
  return (
    <nav class="nav" aria-label="Navigation principale">
      <div class="nav-brand">
        <Mascot size={44} decorative />
        <span class="wordmark">{BRAND.name.toLowerCase()}</span>
      </div>
      {TABS.map(({ tab, label, href, Icon }) => (
        <a
          key={tab}
          class="nav-item"
          href={href}
          aria-current={current === tab ? 'page' : undefined}
          onClick={e => {
            // A tap opens the screen at its top, as `go` does; a modified click keeps its browser meaning.
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            go({ name: tab }, { replace: current === tab });
          }}
        >
          <Icon size={24} aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'home':
      return <Home />;
    case 'practice':
      return <Practice />;
    case 'phrases':
      return <Phrases />;
    case 'card':
      return <CardScreen />;
    case 'me':
      return <Profile />;
  }
}

function Crash({ error, reset }: { error: unknown; reset: () => void }) {
  return (
    <main class="crash">
      <Mascot mood="oops" size={140} />
      <h1>Un souci est survenu</h1>
      <p class="muted">Ta progression est enregistrée sur cet appareil. Recharge l’app pour reprendre.</p>
      <div class="crash-actions">
        <button type="button" class="btn btn-primary" onClick={() => location.reload()}>
          Recharger
        </button>
        <button type="button" class="btn" onClick={() => void exportBackup(db.value)}>
          Exporter mes données
        </button>
        <button type="button" class="btn btn-ghost" onClick={reset}>
          Réessayer
        </button>
      </div>
      <p class="crash-detail">{String((error as Error)?.message ?? error)}</p>
    </main>
  );
}

export function App() {
  const [error, reset] = useErrorBoundary(e => console.error(e));
  const t = theme.value;

  useEffect(() => applyTheme(t), [t]);

  useEffect(() => {
    if (updateReady.value) showToast('Une nouvelle version est prête.', { label: 'Mettre à jour', run: applyUpdate });
  }, [updateReady.value]);

  return (
    <ScreenFlag.Provider value={t.id}>
      {error ? (
        <Crash error={error} reset={reset} />
      ) : (
        <>
          <Screen />
          <ToastHost />
        </>
      )}
    </ScreenFlag.Provider>
  );
}

function Screen() {
  if (!db.value.onboarded || !profile.value) return <Onboarding />;
  const r = route.value;
  if (r.name === 'session') {
    if (!running.value) {
      go({ name: 'home' }, { replace: true });
      return null;
    }
    return <SessionScreen />;
  }
  if (r.name === 'scene') return <SceneScreen id={r.id} />;
  if (r.name === 'activity') return <Activity kind={r.kind} />;
  if (r.name === 'landing') return <Landing />;
  if (r.name === 'learn') {
    openLesson(r.course, r.lesson);
    return null;
  }

  const tab = isTab(r) ? r.name : null;
  return (
    <div class="shell">
      <a class="skip" href="#main">
        Aller au contenu
      </a>
      <Nav current={tab} />
      <main class="main" id="main">
        {r.name === 'sounds' ? <Sounds /> : tab && <TabContent tab={tab} />}
      </main>
      <aside class="aside" aria-label="Ma journée">
        <Daily />
      </aside>
    </div>
  );
}
