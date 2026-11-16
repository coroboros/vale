/** Application state: one signal holding the persisted DB, plus derived views. */
import { computed, signal } from '@preact/signals';
import { courseById, indexOf } from '../content';
import { THEMES } from '../ui/themes';
import { migrateV3 } from './migrate';
import { blankData, blankDB, type DB, LEGACY_KEY, type ProfileData, STORAGE_KEY, sanitize } from './schema';

export const db = signal<DB>(blankDB());
/** False when the browser refuses to store data (private mode, full disk). */
export const storageOk = signal(true);

let timer: ReturnType<typeof setTimeout> | undefined;

function readJSON(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null');
  } catch {
    return null;
  }
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db.value));
    storageOk.value = true;
  } catch {
    storageOk.value = false;
  }
}

/** Writes pending changes now (called when the app is hidden or closed). */
export function flush(): void {
  if (timer === undefined) return;
  clearTimeout(timer);
  timer = undefined;
  persist();
}

/** Loads saved data, migrating the v3 app's data on first launch. The v3 record is left intact. */
export function loadDB(now = Date.now()): void {
  const saved = readJSON(STORAGE_KEY);
  if (saved) {
    db.value = sanitize(saved);
    return;
  }
  const migrated = migrateV3(readJSON(LEGACY_KEY), now);
  db.value = migrated ? sanitize(migrated) : blankDB();
  if (migrated) persist();
}

/** Applies a change to a copy of the DB, publishes it and saves shortly after. */
export function update(mutate: (draft: DB) => void): void {
  const draft = structuredClone(db.value);
  mutate(draft);
  db.value = draft;
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = undefined;
    persist();
  }, 250);
}

/** Changes the active profile's data. */
export function updateData(mutate: (data: ProfileData, draft: DB) => void): void {
  update(draft => {
    draft.data[draft.active] ??= blankData();
    mutate(draft.data[draft.active]!, draft);
  });
}

/** Keeps several open tabs in sync and never loses a pending write. */
export function watchStorage(): void {
  window.addEventListener('storage', event => {
    if (event.key !== STORAGE_KEY || !event.newValue) return;
    try {
      db.value = sanitize(JSON.parse(event.newValue));
    } catch {
      /* ignore a partial write from another tab */
    }
  });
  document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && flush());
  window.addEventListener('pagehide', flush);
}

export const profile = computed(() => db.value.profiles.find(p => p.id === db.value.active) ?? null);
export const pdata = computed<ProfileData>(() => db.value.data[db.value.active] ?? blankData());
export const course = computed(() => courseById(profile.value?.course ?? 'es'));
export const cindex = computed(() => indexOf(course.value));
export const theme = computed(() => THEMES[course.value.theme] ?? THEMES.sol!);
export const settings = computed(() => db.value.settings);
