import { describe, expect, it, vi } from 'vitest';
import { es } from '../../src/content/courses/es';
import { sentenceKey } from '../../src/translation-api';
import { systemPrompt } from '../../worker/src/claude';
import { type Env, handle } from '../../worker/src/index';

const ORIGIN = 'https://coroboros.github.io';

const answer = (body: unknown, stop = 'end_turn') =>
  new Response(JSON.stringify({ stop_reason: stop, content: [{ type: 'text', text: JSON.stringify(body) }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const GOOD = {
  t: '¿Sería posible tener un late checkout?',
  ph: 'sé-RI-a po-SSI-blé té-NÈR oun late checkout',
  note: 'À la réception, on dit aussi « salida tardía ».',
  alternatives: ['¿Podría dejar la habitación más tarde?', '¿Podría dejar la habitación más tarde?'],
};

function setup(overrides: Partial<Env> = {}) {
  const store = new Map<string, string>();
  const pending: Promise<unknown>[] = [];
  const env: Env = {
    ANTHROPIC_API_KEY: 'sk-test',
    ALLOWED_ORIGINS: `${ORIGIN}, http://localhost:5173`,
    CACHE: {
      get: async key => (store.has(key) ? JSON.parse(store.get(key)!) : null),
      put: async (key, value) => void store.set(key, value),
    },
    ...overrides,
  };
  const ctx = { waitUntil: (p: Promise<unknown>) => void pending.push(p) };
  const upstream = vi.fn<typeof fetch>(async () => answer(GOOD));
  const call = async (body: unknown, init: RequestInit = {}) => {
    const res = await handle(
      new Request('https://translate.example.workers.dev/translate', {
        method: 'POST',
        headers: { origin: ORIGIN, 'content-type': 'application/json' },
        body: JSON.stringify(body),
        ...init,
      }),
      env,
      ctx,
      upstream,
    );
    await Promise.all(pending);
    return res;
  };
  return { env, store, upstream, call };
}

describe('translation worker', () => {
  it('only answers the app, on its one route', async () => {
    const { call } = setup();
    const stranger = await call({ text: 'Bonjour', course: 'es' }, { headers: { origin: 'https://evil.example' } });
    expect(stranger.status).toBe(403);
    expect(stranger.headers.get('access-control-allow-origin')).toBeNull();

    const preflight = await call(undefined, { method: 'OPTIONS', body: null });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(preflight.headers.get('access-control-allow-headers')).toBe('content-type');

    const res = await handle(new Request('https://x.dev/'), setup().env, { waitUntil() {} });
    expect(res.status).toBe(404);
  });

  it('rejects empty, oversized and unknown-language requests before calling Claude', async () => {
    const { call, upstream } = setup();
    expect((await call({ text: '  ?! ', course: 'es' })).status).toBe(400);
    expect((await call({ text: 'a'.repeat(301), course: 'es' })).status).toBe(400);
    expect((await call({ text: 'Bonjour', course: 'xx' })).status).toBe(400);
    expect((await call('not an object')).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('asks Claude with the course conventions and returns a tidy translation', async () => {
    const { call, upstream } = setup();
    const res = await call({ text: 'Je voudrais savoir s’il serait possible d’avoir un late checkout', course: 'es' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-cache')).toBe('miss');
    const body = await res.json();
    expect(body).toEqual({ ...GOOD, alternatives: ['¿Podría dejar la habitación más tarde?'] });

    const [url, init] = upstream.mock.calls[0]!;
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer sk-test');
    expect(headers['anthropic-version']).toBe('2026-10-21');
    const sent = JSON.parse(init?.body as string);
    expect(sent.model).toBe('claude-sonnet-5-5');
    expect(sent.output_config.effort).toBe('medium');
    expect(sent.output_config.format.type).toBe('json_schema');
    expect(sent.output_config.format.schema.required).toEqual(['t', 'ph', 'note', 'alternatives']);
    expect(sent).not.toHaveProperty('temperature');
    expect(sent.system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(sent.messages[0].content).toContain('<french>\nJe voudrais savoir');
  });

  it('teaches the phonetic conventions with real course phrases', () => {
    const prompt = systemPrompt(es);
    expect(prompt).toContain(es.phonetics);
    expect(prompt).toContain('es-ES');
    expect(prompt).toContain('Más despacio, por favor → MASS déss-PA-thyo, por fa-BOR');
    expect(prompt.match(/→/g)).toHaveLength(es.phoneticExamples.length);
  });

  it('pays for a sentence once: the same words come back from the cache', async () => {
    const { call, upstream } = setup();
    await call({ text: 'L’addition, s’il vous plaît.', course: 'es' });
    const again = await call({ text: "  l'addition,  S'IL vous plaît ", course: 'es' });
    expect(again.headers.get('x-cache')).toBe('hit');
    expect(upstream).toHaveBeenCalledTimes(1);
    const other = await call({ text: 'L’addition, s’il vous plaît.', course: 'it' });
    expect(other.headers.get('x-cache')).toBe('miss');
    expect(sentenceKey('Ça marche ?')).not.toBe(sentenceKey('Ça marche'));
    expect(sentenceKey('C’est sûr.')).not.toBe(sentenceKey('C’est sur'));
  });

  it('slows down a caller that sends too much', async () => {
    const { call, upstream } = setup({ LIMITER: { limit: async () => ({ success: false }) } });
    const res = await call({ text: 'Bonjour', course: 'es' });
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(upstream).not.toHaveBeenCalled();
  });

  it('retries an overloaded API once, then reports it as busy', async () => {
    const { call, upstream } = setup();
    upstream.mockResolvedValueOnce(new Response('overloaded', { status: 529 }));
    expect((await call({ text: 'Bonjour', course: 'es' })).status).toBe(200);
    expect(upstream).toHaveBeenCalledTimes(2);

    upstream.mockImplementation(async () => new Response('overloaded', { status: 529 }));
    const res = await call({ text: 'Bonsoir', course: 'es' });
    expect(res.status).toBe(503);
  });

  it('never returns a refusal, a cut-off answer or a missing key as a translation', async () => {
    const refused = setup();
    refused.upstream.mockImplementation(async () => answer({}, 'refusal'));
    expect((await refused.call({ text: 'Bonjour', course: 'es' })).status).toBe(502);
    expect(refused.store.size).toBe(0);

    const cut = setup();
    cut.upstream.mockImplementation(async () => answer(GOOD, 'max_tokens'));
    expect((await cut.call({ text: 'Bonjour', course: 'es' })).status).toBe(502);

    const unset = setup({ ANTHROPIC_API_KEY: '' });
    expect((await unset.call({ text: 'Bonjour', course: 'es' })).status).toBe(500);
  });
});
