/** Read eval/results.json yourself before choosing: the grades are a guide, not a verdict. */
import { writeFileSync } from 'node:fs';
import { COURSES } from '../../src/content';
import type { Course } from '../../src/content/types';
import type { Translated } from '../../src/translation-api';
import { readTranslation } from '../src/prompt';
import { contentOf, DEFAULT_MODELS, workersAiInput } from '../src/workers-ai';

const CANDIDATES = [
  ...DEFAULT_MODELS,
  '@cf/zai-org/glm-5.3-flash',
  '@cf/mistralai/mistral-small-3.1-24b-instruct',
  '@cf/qwen/qwen3-30b-a3b-fp8',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  '@cf/openai/gpt-oss-120b',
];
const JUDGE = '@cf/moonshotai/kimi-k2.6';

const SENTENCES = [
  'Je voudrais savoir s’il serait possible d’avoir un late checkout.',
  'Est-ce qu’on peut avoir une table en terrasse pour quatre ?',
  'Je suis allergique aux fruits à coque, est-ce qu’il y en a dans ce plat ?',
  'Où est-ce que je peux acheter un ticket de bus pour l’aéroport ?',
  'On a réservé une chambre double au nom de Martin pour trois nuits.',
  'Vous pouvez m’appeler un taxi pour 7 heures demain matin ?',
  'C’est combien pour aller au centre-ville ?',
  'Ma femme ne se sent pas bien, il y a une pharmacie ouverte près d’ici ?',
  'L’addition, s’il vous plaît. On peut payer séparément ?',
  'Excusez-moi, je crois que vous vous êtes trompé en me rendant la monnaie.',
  'Qu’est-ce que vous me conseillez comme plat typique de la région ?',
  'Il fait trop froid dans la chambre, la climatisation ne s’arrête pas.',
];

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const models = arg('models')?.split(',') ?? CANDIDATES;
const judge = arg('judge') ?? JUDGE;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
if (!account || !token) {
  console.error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN (an API token allowed to use Workers AI).');
  process.exit(1);
}

async function run(model: string, input: unknown): Promise<unknown> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    result?: unknown;
    errors?: { message: string }[];
  };
  if (!res.ok || !body.success) throw new Error(body.errors?.map(e => e.message).join('; ') || `HTTP ${res.status}`);
  return body.result;
}

async function pool<T>(tasks: (() => Promise<T>)[], size = 4): Promise<T[]> {
  const out: T[] = [];
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      out[i] = await tasks[i]!();
    }
  };
  await Promise.all(Array.from({ length: size }, worker));
  return out;
}

interface Answer {
  course: string;
  model: string;
  fr: string;
  ms: number;
  answer?: Translated;
  error?: string;
  score?: number;
}

async function translate(course: Course, model: string, fr: string): Promise<Answer> {
  const started = Date.now();
  try {
    const answer = readTranslation(contentOf(await run(model, workersAiInput(fr, course))));
    return { course: course.id, model, fr, ms: Date.now() - started, answer };
  } catch (error) {
    return { course: course.id, model, fr, ms: Date.now() - started, error: (error as Error).message };
  }
}

const GRADES = {
  type: 'object',
  properties: {
    grades: {
      type: 'array',
      items: {
        type: 'object',
        properties: { label: { type: 'string' }, score: { type: 'number' } },
        required: ['label', 'score'],
        additionalProperties: false,
      },
    },
  },
  required: ['grades'],
  additionalProperties: false,
};

/** Anonymised, so the judge cannot favour a vendor. */
async function grade(course: Course, fr: string, answers: Answer[]): Promise<void> {
  const valid = answers.filter(a => a.answer);
  if (!valid.length) return;
  const labels = valid.map((_, i) => String.fromCharCode(65 + i));
  const listing = valid.map((a, i) => `${labels[i]}: ${a.answer!.t}\n   pronunciation: ${a.answer!.ph}`).join('\n');
  const result = await run(judge, {
    messages: [
      {
        role: 'system',
        content: `You grade translations for French-speaking travellers into ${course.native} as spoken locally (${course.lang}). For each candidate give one score from 0 to 10: exact meaning (nothing missing or added), how naturally a local would say it in that situation, and whether the pronunciation line follows these French-reader conventions with the right stressed syllable: ${course.phonetics} Answer with JSON only.`,
      },
      { role: 'user', content: `French: ${fr}\n\n${listing}` },
    ],
    response_format: { type: 'json_schema', json_schema: GRADES },
    max_tokens: 400,
    temperature: 0,
    chat_template_kwargs: { thinking: false, enable_thinking: false },
  }).catch(() => null);
  const content = contentOf(result);
  const parsed = (
    typeof content === 'string'
      ? JSON.parse(content.slice(content.indexOf('{'), content.lastIndexOf('}') + 1) || '{}')
      : content
  ) as { grades?: { label: string; score: number }[] } | undefined;
  for (const g of parsed?.grades ?? []) {
    const a = valid[labels.indexOf(g.label)];
    if (a && Number.isFinite(g.score)) a.score = Math.max(0, Math.min(10, g.score));
  }
}

const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
const mean = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

const results: Answer[] = [];
const suggestion: Record<string, string[]> = {};
for (const course of COURSES) {
  console.log(`\n## ${course.name} (${course.lang})`);
  const answers = await pool(models.flatMap(model => SENTENCES.map(fr => () => translate(course, model, fr))));
  await pool(
    SENTENCES.map(
      fr => () =>
        grade(
          course,
          fr,
          answers.filter(a => a.fr === fr),
        ),
    ),
    2,
  );
  results.push(...answers);
  const rows = models
    .map(model => {
      const mine = answers.filter(a => a.model === model);
      const scored = mine.filter(a => a.score !== undefined).map(a => a.score!);
      return {
        model,
        valid: mine.filter(a => a.answer).length,
        score: mean(scored),
        ms: median(mine.map(a => a.ms)),
      };
    })
    .sort((a, b) => b.valid - a.valid || b.score - a.score || a.ms - b.ms);
  console.log('| Model | Valid answers | Grade /10 | Median time |');
  console.log('| --- | --- | --- | --- |');
  for (const r of rows)
    console.log(`| ${r.model} | ${r.valid}/${SENTENCES.length} | ${r.score.toFixed(1)} | ${r.ms} ms |`);
  suggestion[course.id] = rows.slice(0, 2).map(r => r.model);
}

writeFileSync(new URL('./results.json', import.meta.url), `${JSON.stringify({ judge, results }, null, 2)}\n`);
console.log('\nAnswers saved in worker/eval/results.json. Suggested setting for wrangler.jsonc:');
console.log(`"MODELS": ${JSON.stringify(suggestion)}`);
