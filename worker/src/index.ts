/**
 * Translation service of the app, a Cloudflare Worker.
 *
 *   POST /translate  {"text": "Je voudrais un late checkout", "course": "es"}
 *   → 200 {"t": "…", "ph": "…", "note": "…", "alternatives": ["…"]}
 *
 * Claude translates; every answer is kept in KV, so a sentence is paid for once.
 * Only the app's origins may call it, a few times a minute per IP (Workers Rate Limiting).
 */
import { COURSES } from '../../src/content';
import type { Course } from '../../src/content/types';
import { asTranslated, MAX_TRANSLATE_CHARS, sentenceKey } from '../../src/translation-api';
import { PROMPT_VERSION, translateWithClaude, UpstreamError } from './claude';

/** The subset of the KV and Rate Limiting bindings this Worker uses. */
interface Cache {
  get(key: string, type: 'json'): Promise<unknown>;
  put(key: string, value: string, options: { expirationTtl: number }): Promise<void>;
}
interface Limiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ANTHROPIC_API_KEY?: string;
  /** Comma-separated origins allowed to call the service. */
  ALLOWED_ORIGINS?: string;
  MODEL?: string;
  EFFORT?: string;
  ANTHROPIC_BASE_URL?: string;
  CACHE?: Cache;
  LIMITER?: Limiter;
}

interface Context {
  waitUntil(promise: Promise<unknown>): void;
}

const DEFAULTS = {
  model: 'claude-sonnet-5-5',
  effort: 'medium',
  baseUrl: 'https://api.anthropic.com',
} as const;
const EFFORTS = new Set(['low', 'medium', 'high', 'xhigh', 'max']);
const CACHE_TTL = 60 * 60 * 24 * 90;
const DEADLINE_MS = 15_000;
const MAX_BODY = 4096;

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
  'access-control-max-age': '86400',
  vary: 'origin',
});

async function cacheKey(course: Course, text: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sentenceKey(text)));
  const hex = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `t${PROMPT_VERSION}:${course.id}:${hex}`;
}

async function readInput(request: Request): Promise<{ text: string; course: Course } | { error: string }> {
  if (!request.headers.get('content-type')?.includes('application/json')) return { error: 'expected_json' };
  const raw = await request.text();
  if (raw.length > MAX_BODY) return { error: 'too_long' };
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { error: 'invalid_json' };
  }
  const { text, course } = (body ?? {}) as Record<string, unknown>;
  const clean = typeof text === 'string' ? text.normalize('NFC').replace(/\s+/g, ' ').trim() : '';
  if (!/\p{L}/u.test(clean)) return { error: 'empty_text' };
  if (clean.length > MAX_TRANSLATE_CHARS) return { error: 'too_long' };
  const found = COURSES.find(c => c.id === course);
  return found ? { text: clean, course: found } : { error: 'unknown_course' };
}

export async function handle(
  request: Request,
  env: Env,
  ctx: Context,
  fetcher: typeof fetch = (input, init) => fetch(input, init),
): Promise<Response> {
  if (new URL(request.url).pathname !== '/translate') return json({ error: 'not_found' }, 404);

  const origin = request.headers.get('origin') ?? '';
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim());
  if (!origin || !allowed.includes(origin)) return json({ error: 'origin_not_allowed' }, 403);
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { ...cors, allow: 'POST, OPTIONS' });
  if (!env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY is not set: run `npx wrangler secret put ANTHROPIC_API_KEY`.');
    return json({ error: 'not_configured' }, 500, cors);
  }

  const input = await readInput(request);
  if ('error' in input) return json(input, 400, cors);

  if (env.LIMITER) {
    const { success } = await env.LIMITER.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' });
    if (!success) return json({ error: 'rate_limited' }, 429, { ...cors, 'retry-after': '60' });
  }

  const key = await cacheKey(input.course, input.text);
  const cached = asTranslated(await env.CACHE?.get(key, 'json').catch(() => null));
  if (cached) return json(cached, 200, { ...cors, 'x-cache': 'hit' });

  try {
    const answer = await translateWithClaude(
      input.text,
      input.course,
      {
        apiKey: env.ANTHROPIC_API_KEY,
        model: env.MODEL || DEFAULTS.model,
        effort: env.EFFORT && EFFORTS.has(env.EFFORT) ? env.EFFORT : DEFAULTS.effort,
        baseUrl: (env.ANTHROPIC_BASE_URL || DEFAULTS.baseUrl).replace(/\/$/, ''),
        fetch: fetcher,
      },
      AbortSignal.timeout(DEADLINE_MS),
    );
    if (env.CACHE) ctx.waitUntil(env.CACHE.put(key, JSON.stringify(answer), { expirationTtl: CACHE_TTL }));
    return json(answer, 200, { ...cors, 'x-cache': 'miss' });
  } catch (error) {
    console.error('translation failed', error);
    if ((error as Error).name === 'TimeoutError') return json({ error: 'timeout' }, 504, cors);
    if (error instanceof UpstreamError && error.retryable)
      return json({ error: 'busy' }, 503, { ...cors, 'retry-after': '20' });
    return json({ error: 'translation_failed' }, 502, cors);
  }
}

export default {
  fetch: (request: Request, env: Env, ctx: Context) => handle(request, env, ctx),
};
