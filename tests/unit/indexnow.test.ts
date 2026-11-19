import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { changes, pagesOf, ping, snapshot } from '../../build/indexnow';
import { BRAND, INDEXNOW_KEY } from '../../src/brand';

const page = (text: string, build: string) =>
  `<html><script src="assets/page-${build}.js"></script><h1>${text}</h1></html>`;

function write(dir: string, pages: Record<string, string>) {
  for (const [path, html] of Object.entries(pages)) {
    mkdirSync(join(dir, path), { recursive: true });
    writeFileSync(join(dir, path, 'index.html'), html);
  }
}

describe('telling search engines what a deploy changed', () => {
  let build: string;
  let kept: string;
  let site: Record<string, string>;
  let sent: { url: string; body: unknown }[];

  beforeEach(() => {
    const root = mkdtempSync(join(tmpdir(), 'indexnow-'));
    build = join(root, 'dist');
    kept = join(root, 'live');
    // The new build: the app and a page rebuilt with new file names only, a new language page.
    write(build, {
      '': page('Bagage', 'new'),
      'espagnol/': page('Espagnol', 'new'),
      'espagnol/dire-bonjour/': page('Dire bonjour', 'new'),
    });
    mkdirSync(join(build, '.git'));
    // What is online before the deploy: the same page, and one the new build no longer has.
    site = {
      '': page('Bagage', 'old'),
      'espagnol/dire-bonjour/': page('Dire bonjour', 'old'),
      'espagnol/ancienne/': page('Ancienne', 'old'),
      'sitemap.xml': ['', 'espagnol/dire-bonjour/', 'espagnol/ancienne/']
        .map(path => `<url><loc>${BRAND.url}${path}</loc></url>`)
        .join(''),
    };
    sent = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          sent.push({ url, body: JSON.parse(String(init.body)) });
          return new Response(null, { status: 202 });
        }
        const html = site[url.split('?')[0]!.slice(BRAND.url.length)];
        return html === undefined ? new Response(null, { status: 404 }) : new Response(html);
      }),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('finds every page of a build, the app included, but not the publishing folder', () => {
    expect(pagesOf(build).sort()).toEqual(['', 'espagnol/', 'espagnol/dire-bonjour/']);
  });

  it('sends the new and removed pages once the new version is live, not the ones only rebuilt', async () => {
    await snapshot(build, kept);
    expect(changes(kept, build)).toEqual([`${BRAND.url}espagnol/`, `${BRAND.url}espagnol/ancienne/`]);
    site[''] = page('Bagage', 'new');
    await ping(kept, build, { wait: 0 });
    expect(sent).toEqual([
      {
        url: 'https://api.indexnow.org/indexnow',
        body: {
          host: 'coroboros.github.io',
          key: INDEXNOW_KEY,
          keyLocation: `${BRAND.url}${INDEXNOW_KEY}.txt`,
          urlList: [`${BRAND.url}espagnol/`, `${BRAND.url}espagnol/ancienne/`],
        },
      },
    ]);
  });

  it('sends nothing while the old version is still online', async () => {
    await snapshot(build, kept);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await ping(kept, build, { wait: 0, tries: 3 });
    expect(sent).toEqual([]);
  });
});
