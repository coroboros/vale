/** Brings data from the v3 app (key "vale-v3") into the v4 schema, so nobody loses progress. */

import { indexOf, itemKey } from '../content';
import { es } from '../content/courses/es';
import { seedFromLevel } from '../engine/memory';
import { blankData, blankDay, blankDB, blankTrip, type DB, GOALS, isDay, PROFILE_COLORS } from './schema';

interface V3Data {
  p?: Record<string, { l: number; t: number }>;
  sc?: Record<string, unknown>;
  days?: Record<string, number>;
  miss?: Record<string, number>;
  favs?: Record<string, unknown>;
  st?: Partial<Record<'rec' | 'prices' | 'pairs' | 'duels' | 'perfect', number>>;
  card?: { hotel?: string; addr?: string; allergens?: string[]; diets?: string[] };
}

interface V3 {
  v: 3;
  ob?: boolean;
  profiles?: { id: string; name: string; g?: string; color?: string }[];
  active?: string;
  dest?: string;
  date?: string;
  goal?: number;
  set?: { auto?: boolean; slow?: boolean; ph?: boolean; sfx?: boolean };
  data?: Record<string, V3Data>;
}

const isV3 = (x: unknown): x is V3 => !!x && typeof x === 'object' && (x as V3).v === 3;

export function migrateV3(raw: unknown, now: number): DB | null {
  if (!isV3(raw) || !raw.profiles?.length) return null;
  const index = indexOf(es);
  const byLegacy = new Map(
    [...index.entries.values()].filter(e => e.item.legacy).map(e => [e.item.legacy!, e.item.id]),
  );
  const keyOf = (legacy: string) => {
    const id = byLegacy.get(legacy);
    return id ? itemKey(es.id, id) : null;
  };
  const db = blankDB();
  db.onboarded = raw.ob !== false;
  db.settings = {
    ...db.settings,
    autoplay: raw.set?.auto ?? true,
    slow: raw.set?.slow ?? false,
    phonetics: raw.set?.ph ?? true,
    sfx: raw.set?.sfx ?? true,
  };
  db.profiles = raw.profiles.map((p, i) => ({
    id: p.id,
    name: p.name || 'Moi',
    gender: p.g === 'a' ? 'f' : 'm',
    color: p.color ?? PROFILE_COLORS[i % PROFILE_COLORS.length]!,
    trips: [
      {
        ...blankTrip(es.id, es.id),
        region: es.regions.some(r => r.id === raw.dest) ? raw.dest! : 'autre',
        date: isDay(raw.date) ? raw.date : '',
        hotel: raw.data?.[p.id]?.card?.hotel ?? '',
        address: raw.data?.[p.id]?.card?.addr ?? '',
      },
    ],
    trip: es.id,
    goal: GOALS.some(g => g.xp === raw.goal) ? raw.goal! : 40,
    cue: '',
  }));
  db.active = db.profiles.some(p => p.id === raw.active) ? raw.active! : db.profiles[0]!.id;

  for (const profile of db.profiles) {
    const old = raw.data?.[profile.id] ?? {};
    const data = blankData();
    for (const [legacy, { l, t }] of Object.entries(old.p ?? {})) {
      const key = keyOf(legacy);
      const mem = key ? seedFromLevel(l, Math.min(t || now, now), key) : undefined;
      if (key && mem) data.mem[key] = mem;
    }
    for (const lesson of [...es.lessons, ...es.packs]) {
      const keys = lesson.items.map(i => itemKey(es.id, i.id));
      if (keys.every(k => data.mem[k])) data.lessons[itemKey(es.id, lesson.id)] = now;
    }
    for (const [scene, value] of Object.entries(old.sc ?? {})) if (value) data.scenes[itemKey(es.id, scene)] = now;
    for (const [day, xp] of Object.entries(old.days ?? {})) {
      if (typeof xp === 'number' && xp > 0) data.days[day] = { ...blankDay(), xp, sessions: 1 };
    }
    for (const [legacy, n] of Object.entries(old.miss ?? {})) {
      const key = keyOf(legacy);
      if (key && n > 0) data.mistakes[key] = n;
    }
    data.favorites = Object.keys(old.favs ?? {})
      .map(keyOf)
      .filter((k): k is string => !!k);
    data.stats = {
      spoken: old.st?.rec ?? 0,
      prices: old.st?.prices ?? 0,
      pairs: old.st?.pairs ?? 0,
      duels: old.st?.duels ?? 0,
      perfect: old.st?.perfect ?? 0,
    };
    data.card = { allergens: old.card?.allergens ?? [], diets: old.card?.diets ?? [] };
    db.data[profile.id] = data;
  }
  return db;
}
