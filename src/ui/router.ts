/** Hash routing: works from any folder, offline, and keeps the browser's back button meaningful. */
import { signal } from '@preact/signals';

export type Tab = 'home' | 'practice' | 'phrases' | 'card' | 'me';
export type Activity = 'prices' | 'pairs' | 'duel' | 'audio';

export type Route =
  | { name: Tab }
  | { name: 'session' }
  | { name: 'scene'; id: string }
  | { name: 'sounds' }
  | { name: 'activity'; kind: Activity }
  | { name: 'landing' }
  /** From a page for search engines (build/pages.ts): a course, and maybe one of its lessons. */
  | { name: 'learn'; course: string; lesson?: string };

const TAB_PATHS: Record<Tab, string> = {
  home: '/',
  practice: '/entrainement',
  phrases: '/phrases',
  card: '/carte',
  me: '/moi',
};

const ACTIVITIES: readonly Activity[] = ['prices', 'pairs', 'duel', 'audio'];

function parse(hash: string): Route {
  const path = hash.replace(/^#/, '') || '/';
  const tab = (Object.keys(TAB_PATHS) as Tab[]).find(t => TAB_PATHS[t] === path);
  if (tab) return { name: tab };
  if (path === '/session') return { name: 'session' };
  if (path === '/sons') return { name: 'sounds' };
  if (path === '/arrivee') return { name: 'landing' };
  const scene = path.match(/^\/scene\/([\w-]+)$/);
  if (scene) return { name: 'scene', id: scene[1]! };
  const learn = path.match(/^\/apprendre\/(\w+)(?:\/([\w-]+))?$/);
  if (learn) return { name: 'learn', course: learn[1]!, lesson: learn[2] };
  const game = path.match(/^\/jeu\/(\w+)$/);
  if (game && ACTIVITIES.includes(game[1] as Activity)) return { name: 'activity', kind: game[1] as Activity };
  return { name: 'home' };
}

function pathOf(r: Route): string {
  switch (r.name) {
    case 'session':
      return '/session';
    case 'sounds':
      return '/sons';
    case 'landing':
      return '/arrivee';
    case 'scene':
      return `/scene/${r.id}`;
    case 'activity':
      return `/jeu/${r.kind}`;
    case 'learn':
      return `/apprendre/${r.course}${r.lesson ? `/${r.lesson}` : ''}`;
    default:
      return TAB_PATHS[r.name];
  }
}

export const route = signal<Route>(parse(location.hash));

/** Full-screen flows replace history, so « back » returns to the tab they came from. */
export function go(r: Route, opts: { replace?: boolean } = {}): void {
  const url = `#${pathOf(r)}`;
  if (opts.replace) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  route.value = r;
  window.scrollTo({ top: 0 });
}

/** `fallback` when the app was opened on this screen. */
export function back(fallback: Route = { name: 'home' }): void {
  if (history.length > 1) history.back();
  else go(fallback, { replace: true });
}

export function initRouter(): void {
  window.addEventListener('popstate', () => {
    route.value = parse(location.hash);
  });
}

export const isTab = (r: Route): r is { name: Tab } => r.name in TAB_PATHS;
