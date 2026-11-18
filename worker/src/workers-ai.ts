/** Billed in Neurons on the Workers plan. */
import type { Course } from '../../src/content/types';
import type { Translated } from '../../src/translation-api';
import { deadline, readTranslation, SCHEMA, systemPrompt, UpstreamError, userMessage } from './prompt';

export interface Ai {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
}

/**
 * Tried in order until one answers. DeepSeek V4.1 Flash first, Gemma 4 from another vendor as
 * the fallback. Override per course with the MODELS variable; `cd worker && npm run eval`
 * measures the candidates on the same sentences.
 */
export const DEFAULT_MODELS = ['@cf/deepseek-ai/deepseek-v4.1-flash-1017', '@cf/google/gemma-4-26b-a4b-it'];

/** The same body serves the binding and the REST API (eval/run.ts). */
export const workersAiInput = (text: string, course: Course) => ({
  messages: [
    { role: 'system', content: systemPrompt(course) },
    { role: 'user', content: userMessage(text) },
  ],
  response_format: { type: 'json_schema', json_schema: SCHEMA },
  max_tokens: 600,
  temperature: 0.2,
  // Answer directly: a one-sentence translation gains little from a reasoning pass, whose
  // tokens are billed and slow the answer down. Models ignore the key they do not use.
  chat_template_kwargs: { thinking: false, enable_thinking: false },
});

/** The text or object a model returned, from either response shape Workers AI uses. */
export function contentOf(out: unknown): unknown {
  if (!out || typeof out !== 'object') return out;
  const o = out as { response?: unknown; choices?: { message?: { content?: unknown } }[] };
  return o.response ?? o.choices?.[0]?.message?.content;
}

export async function translateWithWorkersAi(
  text: string,
  course: Course,
  ai: Ai,
  model: string,
  signal: AbortSignal,
): Promise<Translated> {
  let out: unknown;
  try {
    out = await deadline(ai.run(model, workersAiInput(text, course)), signal);
  } catch (error) {
    if (signal.aborted) throw error;
    throw new UpstreamError(`Workers AI ${model}: ${(error as Error).message}`, true);
  }
  return readTranslation(contentOf(out));
}

export function modelsFor(courseId: string, configured: unknown): string[] {
  const map = configured && typeof configured === 'object' ? (configured as Record<string, unknown>) : {};
  const list = map[courseId] ?? map.default;
  return Array.isArray(list) && list.length && list.every(m => typeof m === 'string') ? list : DEFAULT_MODELS;
}
