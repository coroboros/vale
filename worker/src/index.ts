/**
 * Claude first when a key is set, within a monthly budget, then open models on Workers AI. Every
 * answer is kept in KV, so a sentence is paid for once. Only the app's origins may call, a few times
 * a minute per IP. Request and answer: src/translation-api.ts. /count adds the app's anonymous counts
 * (src/counts-api.ts) to totals per day in D1.
 */
import { COURSES } from '../../src/content';
import type { Course } from '../../src/content/types';
import { asCounts } from '../../src/counts-api';
import { asTranslated, MAX_TRANSLATE_CHARS, sentenceKey, type Translated } from '../../src/translation-api';
import { CLAUDE_DEFAULTS, translateWithClaude } from './claude';
import { PROMPT_VERSION, UpstreamError } from './prompt';
import { type Ai, modelsFor, translateWithWorkersAi } from './workers-ai';

interface Cache {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
}
interface Limiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}
interface Statement {
  bind(...values: string[]): Statement;
}
interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown>;
}

export interface Env {
  AI?: Ai;
  /** Models per course, tried in order: {"es": ["@cf/…"], "default": ["@cf/…"]}. */
  MODELS?: unknown;
  /** Optional. */
  ANTHROPIC_API_KEY?: string;
  CLAUDE_MODEL?: string;
  CLAUDE_EFFORT?: string;
  /** Monthly ceiling for Claude, in USD, well under the plan's credits. Default 10. */
  CLAUDE_BUDGET_USD?: string | number;
  ANTHROPIC_BASE_URL?: string;
  /** Comma-separated origins allowed to call the service. */
  ALLOWED_ORIGINS?: string;
  CACHE?: Cache;
  LIMITER?: Limiter;
  /** D1: the anonymous counts. */
  COUNTS?: Database;
}

interface Context {
  waitUntil(promise: Promise<unknown>): void;
}

interface Attempt {
  model: string;
  run: (signal: AbortSignal) => Promise<Translated>;
}

const CACHE_TTL = 60 * 60 * 24 * 90;
const DEFAULT_BUDGET_USD = 10;
const DEADLINE_MS = 15_000;
/** One slow model must leave time for the next one. */
const ATTEMPT_MS = 8_000;
const MAX_BODY = 4096;
const EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);

type Headers = Record<string, string>;

const json = (body: unknown, status: number, headers: Headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });

const corsHeaders = (origin: string): Headers => ({
  'access-control-allow-origin': origin,
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-expose-headers': 'x-cache, x-model',
  'access-control-max-age': '86400',
  vary: 'origin',
});

async function cacheKey(course: Course, text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sentenceKey(text)));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `t${PROMPT_VERSION}:${course.id}:${hex}`;
}

async function readJson(request: Request): Promise<{ body: unknown } | { error: string }> {
  if (!request.headers.get('content-type')?.includes('application/json')) return { error: 'expected_json' };
  const raw = await request.text();
  if (raw.length > MAX_BODY) return { error: 'too_long' };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: 'invalid_json' };
  }
}

async function readInput(request: Request): Promise<{ text: string; course: Course } | { error: string }> {
  const read = await readJson(request);
  if ('error' in read) return read;
  const { text, course } = (read.body ?? {}) as Record<string, unknown>;
  const clean = typeof text === 'string' ? text.normalize('NFC').replace(/\s+/g, ' ').trim() : '';
  if (!/\p{L}/u.test(clean)) return { error: 'empty_text' };
  if (clean.length > MAX_TRANSLATE_CHARS) return { error: 'too_long' };
  const found = COURSES.find(c => c.id === course);
  return found ? { text: clean, course: found } : { error: 'unknown_course' };
}

async function overLimit(request: Request, env: Env): Promise<boolean> {
  if (!env.LIMITER) return false;
  const { success } = await env.LIMITER.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' });
  return !success;
}

const COUNTS_TABLE =
  'CREATE TABLE IF NOT EXISTS counts (day TEXT NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, name, value))';
const ADD_COUNT =
  'INSERT INTO counts (day, name, value, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (day, name, value) DO UPDATE SET n = n + 1';

/** Each count adds one to its day's total: nothing is kept per request, so nothing points back to a phone. */
async function count(request: Request, env: Env, cors: Headers): Promise<Response> {
  const db = env.COUNTS;
  if (!db) {
    console.error('No counts database: bind D1 as COUNTS.');
    return json({ error: 'not_configured' }, 503, cors);
  }
  if (await overLimit(request, env)) return json({ error: 'rate_limited' }, 429, { ...cors, 'retry-after': '60' });
  const read = await readJson(request);
  if ('error' in read) return json(read, 400, cors);
  const counts = asCounts(read.body, new Date().toISOString().slice(0, 10));
  if (!counts) return json({ error: 'invalid_counts' }, 400, cors);
  await db.batch([db.prepare(COUNTS_TABLE), ...counts.map(c => db.prepare(ADD_COUNT).bind(c.day, c.name, c.value))]);
  return new Response(null, { status: 204, headers: cors });
}

const spendKey = (now = new Date()) => `spend:claude:${now.toISOString().slice(0, 7)}`;

/** As counted by this Worker: Anthropic's own count may differ. */
async function claudeSpent(cache: Cache): Promise<number> {
  const value = await cache.get(spendKey(), 'json').catch(() => null);
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

async function addClaudeSpend(cache: Cache, usd: number) {
  if (usd <= 0) return;
  const total = (await claudeSpent(cache)) + usd;
  await cache.put(spendKey(), JSON.stringify(total), { expirationTtl: 60 * 60 * 24 * 62 });
}

/**
 * Claude first while this month's spend stays under budget (it needs KV to count), then the
 * Workers AI models in order. The credits themselves stop at zero on Anthropic's side: the
 * budget is a second, lower ceiling.
 */
async function attemptsFor(
  text: string,
  course: Course,
  env: Env,
  ctx: Context,
  fetcher: typeof fetch,
): Promise<Attempt[]> {
  const attempts: Attempt[] = [];
  const apiKey = env.ANTHROPIC_API_KEY;
  const cache = env.CACHE;
  const budget = Number(env.CLAUDE_BUDGET_USD ?? DEFAULT_BUDGET_USD);
  const ceiling = Number.isFinite(budget) && budget >= 0 ? budget : DEFAULT_BUDGET_USD;
  if (apiKey && cache) {
    const spent = await claudeSpent(cache);
    if (spent < ceiling) {
      const model = env.CLAUDE_MODEL || CLAUDE_DEFAULTS.model;
      const effort = env.CLAUDE_EFFORT && EFFORTS.has(env.CLAUDE_EFFORT) ? env.CLAUDE_EFFORT : CLAUDE_DEFAULTS.effort;
      const baseUrl = (env.ANTHROPIC_BASE_URL || CLAUDE_DEFAULTS.baseUrl).replace(/\/$/, '');
      attempts.push({
        model,
        run: signal =>
          translateWithClaude(text, course, { apiKey, model, effort, baseUrl, fetch: fetcher }, signal, usd =>
            ctx.waitUntil(addClaudeSpend(cache, usd)),
          ),
      });
    } else console.warn(`Claude budget reached: ${spent.toFixed(2)} of ${ceiling} USD this month.`);
  }
  const ai = env.AI;
  if (ai) {
    for (const model of modelsFor(course.id, env.MODELS))
      attempts.push({ model, run: signal => translateWithWorkersAi(text, course, ai, model, signal) });
  }
  return attempts;
}

export async function handle(
  request: Request,
  env: Env,
  ctx: Context,
  fetcher: typeof fetch = (input, init) => fetch(input, init),
): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (path !== '/translate' && path !== '/count') return json({ error: 'not_found' }, 404);

  // The app is served from this same Worker; other origins must be listed (local dev servers).
  const origin = request.headers.get('origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim());
  if (!origin || (origin !== new URL(request.url).origin && !allowed.includes(origin)))
    return json({ error: 'origin_not_allowed' }, 403);
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { ...cors, allow: 'POST, OPTIONS' });
  if (path === '/count') return count(request, env, cors);

  const input = await readInput(request);
  if ('error' in input) return json(input, 400, cors);

  if (!env.AI && !env.ANTHROPIC_API_KEY) {
    console.error('No translation provider: bind Workers AI as AI, or set ANTHROPIC_API_KEY.');
    return json({ error: 'not_configured' }, 500, cors);
  }

  if (await overLimit(request, env)) return json({ error: 'rate_limited' }, 429, { ...cors, 'retry-after': '60' });

  const key = await cacheKey(input.course, input.text);
  const cached = asTranslated(await env.CACHE?.get(key, 'json').catch(() => null));
  if (cached) return json(cached, 200, { ...cors, 'x-cache': 'hit' });

  const attempts = await attemptsFor(input.text, input.course, env, ctx, fetcher);
  if (!attempts.length) return json({ error: 'busy' }, 503, { ...cors, 'retry-after': '3600' });

  const overall = AbortSignal.timeout(DEADLINE_MS);
  let failure: unknown;
  for (const attempt of attempts) {
    try {
      const answer = await attempt.run(AbortSignal.any([overall, AbortSignal.timeout(ATTEMPT_MS)]));
      if (env.CACHE) ctx.waitUntil(env.CACHE.put(key, JSON.stringify(answer), { expirationTtl: CACHE_TTL }));
      return json(answer, 200, { ...cors, 'x-cache': 'miss', 'x-model': attempt.model });
    } catch (error) {
      failure = error;
      console.warn(`translation with ${attempt.model} failed`, error);
      if (overall.aborted) break;
    }
  }
  if (overall.aborted) return json({ error: 'timeout' }, 504, cors);
  if (failure instanceof UpstreamError && failure.retryable)
    return json({ error: 'busy' }, 503, { ...cors, 'retry-after': '20' });
  return json({ error: 'translation_failed' }, 502, cors);
}

export default {
  fetch: (request: Request, env: Env, ctx: Context) => handle(request, env, ctx),
};
