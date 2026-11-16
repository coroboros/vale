/**
 * Optional last resort: Claude through the Messages API, used only when ANTHROPIC_API_KEY is
 * set. Claude Max plans include monthly API credits that can pay for it.
 * API reference: https://platform.claude.com/docs/en/build-with-claude/structured-outputs
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

export const CLAUDE_DEFAULTS = { model: 'claude-haiku-5-5', effort: 'low', baseUrl: 'https://api.anthropic.com' };

const API_VERSION = '2026-10-21';

interface MessageResponse {
  stop_reason?: string;
  content?: { type: string; text?: string }[];
}

/** Reads Claude's answer, or throws when it is unusable (refusal, cut off, malformed). */
export function readAnswer(data: MessageResponse): Translated {
  if (data.stop_reason !== 'end_turn') throw new UpstreamError(`unexpected stop_reason: ${data.stop_reason}`, false);
  return readTranslation(data.content?.find(block => block.type === 'text')?.text ?? '');
}

export async function translateWithClaude(
  text: string,
  course: Course,
  cfg: ClaudeConfig,
  signal: AbortSignal,
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
  return readAnswer((await res.json()) as MessageResponse);
}
