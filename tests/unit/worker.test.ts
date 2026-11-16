import { describe, expect, it, vi } from 'vitest';
import { es } from '../../src/content/courses/es';
import { sentenceKey } from '../../src/translation-api';
import { type Env, handle } from '../../worker/src/index';
import { readTranslation, systemPrompt } from '../../worker/src/prompt';
import { DEFAULT_MODELS, modelsFor } from '../../worker/src/workers-ai';

const ORIGIN = 'https://coroboros.github.io';

const GOOD = {
  t: '¿Sería posible tener un late checkout?',
  ph: 'sé-RI-a po-SSI-blé té-NÈR oun late checkout',
  note: 'À la réception, on dit aussi « salida tardía ».',
  alternatives: ['¿Podría dejar la habitación más tarde?', '¿Podría dejar la habitación más tarde?'],
};
const TIDY = { ...GOOD, alternatives: ['¿Podría dejar la habitación más tarde?'] };

const USAGE = { input_tokens: 1000, output_tokens: 200 };
const claudeAnswer = (body: unknown, stop = 'end_turn') =>
  new Response(
    JSON.stringify({ stop_reason: stop, content: [{ type: 'text', text: JSON.stringify(body) }], usage: USAGE }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  );
const MONTH = `spend:claude:${new Date().toISOString().slice(0, 7)}`;

function setup(overrides: Partial<Env> = {}) {
  const store = new Map<string, string>();
  const pending: Promise<unknown>[] = [];
  const run = vi.fn<(model: string, input: Record<string, unknown>) => Promise<unknown>>(async () => ({
    response: GOOD,
  }));
  const env: Env = {
    AI: { run },
    ALLOWED_ORIGINS: `${ORIGIN}, http://localhost:5173`,
    CACHE: {
      get: async key => (store.has(key) ? JSON.parse(store.get(key)!) : null),
      put: async (key, value) => void store.set(key, value),
    },
    ...overrides,
  };
  const ctx = { waitUntil: (p: Promise<unknown>) => void pending.push(p) };
  const claude = vi.fn<typeof fetch>(async () => claudeAnswer(GOOD));
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
      claude,
    );
    await Promise.all(pending);
    return res;
  };
  return { env, store, run, claude, call };
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

  it('accepts the app served from its own origin', async () => {
    const { call } = setup({ ALLOWED_ORIGINS: '' });
    const res = await call(
      { text: 'Bonjour', course: 'es' },
      { headers: { origin: 'https://translate.example.workers.dev', 'content-type': 'application/json' } },
    );
    expect(res.status).toBe(200);
  });

  it('rejects empty, oversized and unknown-language requests before calling a model', async () => {
    const { call, run } = setup();
    expect((await call({ text: '  ?! ', course: 'es' })).status).toBe(400);
    expect((await call({ text: 'a'.repeat(301), course: 'es' })).status).toBe(400);
    expect((await call({ text: 'Bonjour', course: 'xx' })).status).toBe(400);
    expect((await call('not an object')).status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it('asks Workers AI for JSON in the course conventions, without a reasoning pass', async () => {
    const { call, run, claude } = setup();
    const res = await call({ text: 'Je voudrais savoir s’il serait possible d’avoir un late checkout', course: 'es' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-cache')).toBe('miss');
    expect(res.headers.get('x-model')).toBe(DEFAULT_MODELS[0]);
    expect(await res.json()).toEqual(TIDY);

    const [model, input] = run.mock.calls[0]!;
    expect(model).toBe(DEFAULT_MODELS[0]);
    expect(input.chat_template_kwargs).toEqual({ thinking: false, enable_thinking: false });
    expect(input.response_format).toMatchObject({ type: 'json_schema' });
    const messages = input.messages as { role: string; content: string }[];
    expect(messages[0]!.content).toContain(es.phonetics);
    expect(messages[1]!.content).toContain('<french>\nJe voudrais savoir');
    expect(claude).not.toHaveBeenCalled();
  });

  it('teaches the phonetic conventions with real course phrases', () => {
    const prompt = systemPrompt(es);
    expect(prompt).toContain('es-ES');
    expect(prompt).toContain('Más despacio, por favor → MASS déss-PA-thyo, por fa-BOR');
    expect(prompt.match(/→/g)).toHaveLength(es.phoneticExamples.length);
  });

  it('reads answers wrapped in prose, code fences or the chat-completions shape', async () => {
    expect(readTranslation(`Voici :\n\`\`\`json\n${JSON.stringify(GOOD)}\n\`\`\``)).toEqual(TIDY);
    expect(() => readTranslation('Lo siento.')).toThrow();
    const { call, run } = setup();
    run.mockImplementation(async () => ({ choices: [{ message: { content: JSON.stringify(GOOD) } }] }));
    expect(await (await call({ text: 'Bonjour', course: 'es' })).json()).toEqual(TIDY);
  });

  it('falls back from one Workers AI model to the next', async () => {
    const { call, run } = setup();
    run.mockImplementationOnce(async () => {
      throw new Error('capacity');
    });
    const res = await call({ text: 'Bonjour', course: 'es' });
    expect(res.headers.get('x-model')).toBe(DEFAULT_MODELS[1]);
  });

  it('uses Claude first, counts what it costs, and stops at the monthly budget', async () => {
    const { call, run, claude, store } = setup({ ANTHROPIC_API_KEY: 'sk-test', CLAUDE_BUDGET_USD: '10' });
    const first = await call({ text: 'Bonjour', course: 'es' });
    expect(first.headers.get('x-model')).toBe('claude-sonnet-5-5');
    expect(run).not.toHaveBeenCalled();
    const [url, init] = claude.mock.calls[0]!;
    expect(url).toBe('https://api.anthropic.com/v1/messages');
    const headers = init?.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer sk-test');
    expect(headers['anthropic-version']).toBe('2026-10-21');
    const sent = JSON.parse(init?.body as string);
    expect(sent.model).toBe('claude-sonnet-5-5');
    expect(sent.output_config).toMatchObject({ effort: 'low', format: { type: 'json_schema' } });
    expect(sent).not.toHaveProperty('temperature');
    // 1,000 input and 200 output tokens at $2 and $10 per million.
    expect(JSON.parse(store.get(MONTH)!)).toBeCloseTo(0.004, 6);

    store.set(MONTH, '10');
    const capped = await call({ text: 'Bonsoir', course: 'es' });
    expect(capped.headers.get('x-model')).toBe(DEFAULT_MODELS[0]);
    expect(claude).toHaveBeenCalledTimes(1);
  });

  it('falls back to Workers AI when Claude fails, for example once the credits run out', async () => {
    const { call, claude } = setup({ ANTHROPIC_API_KEY: 'sk-test' });
    claude.mockImplementation(
      async () =>
        new Response('{"type":"error","error":{"message":"Your credit balance is too low"}}', { status: 400 }),
    );
    const res = await call({ text: 'Bonjour', course: 'es' });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-model')).toBe(DEFAULT_MODELS[0]);
  });

  it('never calls Claude without a place to count its spending', async () => {
    const { call, claude } = setup({ ANTHROPIC_API_KEY: 'sk-test', CACHE: undefined });
    expect((await call({ text: 'Bonjour', course: 'es' })).headers.get('x-model')).toBe(DEFAULT_MODELS[0]);
    expect(claude).not.toHaveBeenCalled();
  });

  it('lets each course have its own models', () => {
    const models = { it: ['@cf/a', '@cf/b'], default: ['@cf/c'] };
    expect(modelsFor('it', models)).toEqual(['@cf/a', '@cf/b']);
    expect(modelsFor('es', models)).toEqual(['@cf/c']);
    expect(modelsFor('es', { es: 'not a list' })).toEqual(DEFAULT_MODELS);
    expect(modelsFor('es', undefined)).toEqual(DEFAULT_MODELS);
  });

  it('pays for a sentence once: the same words come back from the cache', async () => {
    const { call, run } = setup();
    await call({ text: 'L’addition, s’il vous plaît.', course: 'es' });
    const again = await call({ text: "  l'addition,  S'IL vous plaît ", course: 'es' });
    expect(again.headers.get('x-cache')).toBe('hit');
    expect(run).toHaveBeenCalledTimes(1);
    const other = await call({ text: 'L’addition, s’il vous plaît.', course: 'it' });
    expect(other.headers.get('x-cache')).toBe('miss');
    expect(sentenceKey('Ça marche ?')).not.toBe(sentenceKey('Ça marche'));
    expect(sentenceKey('C’est sûr.')).not.toBe(sentenceKey('C’est sur'));
  });

  it('slows down a caller that sends too much', async () => {
    const { call, run } = setup({ LIMITER: { limit: async () => ({ success: false }) } });
    const res = await call({ text: 'Bonjour', course: 'es' });
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBe('60');
    expect(run).not.toHaveBeenCalled();
  });

  it('reports busy models, and never caches or returns an unusable answer', async () => {
    const busy = setup();
    busy.run.mockImplementation(async () => {
      throw new Error('3040: capacity exceeded');
    });
    expect((await busy.call({ text: 'Bonjour', course: 'es' })).status).toBe(503);

    const refused = setup({ ANTHROPIC_API_KEY: 'sk-test', AI: undefined });
    refused.claude.mockImplementation(async () => claudeAnswer({}, 'refusal'));
    expect((await refused.call({ text: 'Bonjour', course: 'es' })).status).toBe(502);
    expect([...refused.store.keys()]).toEqual([MONTH]);

    const unset = setup({ AI: undefined });
    expect((await unset.call({ text: 'Bonjour', course: 'es' })).status).toBe(500);
  });
});
