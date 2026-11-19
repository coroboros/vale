/**
 * Tells IndexNow (Bing, Yandex, Naver, Seznam) which pages a deploy changed or removed, so they are
 * read again within minutes rather than at the next crawl (https://www.indexnow.org/documentation).
 * The protocol asks for changed addresses only, so the deploy job keeps the live pages before it
 * publishes, then compares:
 *   node build/indexnow.ts snapshot dist <dir>   before deploying
 *   node build/indexnow.ts ping <dir> dist       after, once the new version is live
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, INDEXNOW_KEY, siteUrl } from '../src/brand.ts';

const timeout = () => AbortSignal.timeout(15_000);

/** Every page of a build, as its folder relative to the app: '' for the app itself. */
export function pagesOf(dir: string, base = ''): string[] {
  const found = existsSync(join(dir, base, 'index.html')) ? [base] : [];
  for (const entry of readdirSync(join(dir, base), { withFileTypes: true }))
    if (entry.isDirectory() && !entry.name.startsWith('.')) found.push(...pagesOf(dir, `${base}${entry.name}/`));
  return found;
}

/** A page as a reader sees it: built file names change with every build, its text does not. */
const content = (html: string) => html.replace(/assets\/[\w.-]+/g, 'assets/*');

async function live(path: string): Promise<string | null> {
  // Past any cache, as a crawler arriving after the deploy would read it.
  const response = await fetch(`${siteUrl(path)}?fresh=${Date.now()}`, { signal: timeout() });
  return response.ok ? response.text() : null;
}

export async function snapshot(build: string, keep: string): Promise<void> {
  const sitemap = (await live('sitemap.xml')) ?? '';
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url!.slice(BRAND.url.length));
  mkdirSync(keep, { recursive: true });
  writeFileSync(join(keep, 'sitemap.json'), JSON.stringify(listed));
  for (const path of new Set([...pagesOf(build), ...listed])) {
    const html = await live(path);
    if (html === null) continue;
    mkdirSync(join(keep, path), { recursive: true });
    writeFileSync(join(keep, path, 'index.html'), html);
  }
}

/** The addresses to send: pages new or changed since the snapshot, and pages no longer listed. */
export function changes(kept: string, build: string): string[] {
  const read = (dir: string, path: string) => {
    const file = join(dir, path, 'index.html');
    return existsSync(file) ? content(readFileSync(file, 'utf8')) : null;
  };
  const now = pagesOf(build);
  const listed: string[] = existsSync(join(kept, 'sitemap.json'))
    ? JSON.parse(readFileSync(join(kept, 'sitemap.json'), 'utf8'))
    : [];
  const changed = now.filter(path => read(kept, path) !== read(build, path));
  const removed = listed.filter(path => !now.includes(path));
  return [...changed, ...removed].map(siteUrl);
}

export async function ping(kept: string, build: string, { wait = 10_000, tries = 48 } = {}): Promise<void> {
  // GitHub Pages publishes a minute or so after the push: wait until the app itself is the new one.
  const app = readFileSync(join(build, 'index.html'), 'utf8');
  for (let tried = 1; (await live('')) !== app; tried++) {
    if (tried === tries) return console.log('::warning::The new version never went live: nothing sent to IndexNow.');
    await new Promise(resolve => setTimeout(resolve, wait));
  }
  const urlList = changes(kept, build);
  if (!urlList.length) return console.log('No page changed: nothing sent to IndexNow.');
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(BRAND.url).host,
      key: INDEXNOW_KEY,
      keyLocation: siteUrl(`${INDEXNOW_KEY}.txt`),
      urlList,
    }),
    signal: timeout(),
  });
  // 200: received; 202: received, the key is still being checked.
  const flag = response.ok ? '' : '::warning::';
  console.log(`${flag}IndexNow answered ${response.status} for ${urlList.length} pages:\n${urlList.join('\n')}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, from = '', to = ''] = process.argv.slice(2);
  if (command === 'snapshot') await snapshot(from, to);
  else if (command === 'ping') await ping(from, to);
  else {
    console.error('Usage: node build/indexnow.ts snapshot <build> <dir> | ping <dir> <build>');
    process.exitCode = 1;
  }
}
