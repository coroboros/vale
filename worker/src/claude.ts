/**
 * Claude through the Messages API: the first choice when ANTHROPIC_API_KEY is set (Claude Max
 * plans include monthly API credits that pay for it), always within the monthly budget kept by
 * index.ts. API reference: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
 */
import type { Course } from '../../src/content/types';
import type { Translated } from '../../src/translation-api';
import { readTranslation, SCHEMA, systemPrompt, UpstreamError, userMessage } from './prompt';

export interface ClaudeConfig {
  apiKey: string;
  model: string;
  effort: string;
  /** https://api.anthropic.com, or a Cloudflare AI Gateway endpoint in front of it. */
  baseUrl: string;
  fetch: typeof fetch;
}

export const CLAUDE_DEFAULTS = { model: 'claude-sonnet-5-5', effort: 'low', baseUrl: 'https://api.anthropic.com' };

interface Price {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
}

/** List prices, USD per million tokens (platform.claude.com, November 2026). */
const PRICES: Record<string, Price> = {
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.1 },
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
};
/** A model missing from the table is counted at a top-tier price, so the budget errs on the safe side. */
const UNKNOWN_PRICE: Price = { input: 10, output: 50, cacheWrite: 12.5, cacheRead: 1 };

interface Usage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

/** What a response cost, in USD. */
export function costOf(model: string, usage: Usage | undefined): number {
  if (!usage) return 0;
  const p = PRICES[model] ?? UNKNOWN_PRICE;
  return (
    ((usage.input_tokens ?? 0) * p.input +
      (usage.output_tokens ?? 0) * p.output +
      (usage.cache_creation_input_tokens ?? 0) * p.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * p.cacheRead) /
    1e6
  );
}

const API_VERSION = '2026-10-21';

interface MessageResponse {
  stop_reason?: string;
  content?: { type: string; text?: string }[];
  usage?: Usage;
}

/** Reads Claude's answer, or throws when it is unusable (refusal, cut off, malformed). */
export function readAnswer(data: MessageResponse): Translated {
  if (data.stop_reason !== 'end_turn') throw new UpstreamError(`unexpected stop_reason: ${data.stop_reason}`, false);
  return readTranslation(data.content?.find(block => block.type === 'text')?.text ?? '');
}

/** Translates; `onCost` hears what the call cost, even when the answer turns out unusable. */
export async function translateWithClaude(
  text: string,
  course: Course,
  cfg: ClaudeConfig,
  signal: AbortSignal,
  onCost: (usd: number) => void,
): Promise<Translated> {
  let res: Response;
  try {
    res = await cfg.fetch(`${cfg.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${cfg.apiKey}`,
        'anthropic-version': API_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 1024,
        system: [{ type: 'text', text: systemPrompt(course), cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage(text) }],
        output_config: { effort: cfg.effort, format: { type: 'json_schema', schema: SCHEMA } },
      }),
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new UpstreamError(`network: ${(error as Error).message}`, true);
  }
  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 300);
    throw new UpstreamError(`Claude API ${res.status}: ${detail}`, res.status === 429 || res.status >= 500);
  }
  const data = (await res.json()) as MessageResponse;
  onCost(costOf(cfg.model, data.usage));
  return readAnswer(data);
}
