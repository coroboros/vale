import { describe, expect, it } from 'vitest';
import { BOOT_SCRIPT } from '../../build/boot';
import { welcomeHtml } from '../../build/welcome';
import { BRAND } from '../../src/brand';
import { COURSES } from '../../src/content';
import { languageOf } from '../../src/content/pages';
import { STORAGE_KEY } from '../../src/state/schema';
import { THEMES } from '../../src/ui/themes';

/** Runs index.html's first lines in a made-up browser and returns the view they chose. */
function boot({ installed = false, iPhoneIcon = false, saved = null as string | null, hash = '' } = {}) {
  const documentElement = { dataset: {} as Record<string, string> };
  const browser = {
    matchMedia: (query: string) => ({ matches: installed && query === '(display-mode: standalone)' }),
    navigator: { standalone: iPhoneIcon },
    localStorage: { getItem: (key: string) => (key === STORAGE_KEY ? saved : null) },
    location: { hash },
    document: { documentElement },
  };
  new Function(...Object.keys(browser), BOOT_SCRIPT)(...Object.values(browser));
  return documentElement.dataset.view;
}

describe('the welcome page', () => {
  it('greets a newcomer in a browser', () => {
    expect(boot()).toBeUndefined();
    expect(boot({ saved: JSON.stringify({ onboarded: false }) })).toBeUndefined();
  });

  it('is skipped by the installed app, a traveller who has set off and a link into the app', () => {
    expect(boot({ installed: true })).toBe('app');
    expect(boot({ iPhoneIcon: true })).toBe('app');
    expect(boot({ saved: JSON.stringify({ onboarded: true }) })).toBe('app');
    expect(boot({ hash: '#/apprendre/es/bar' })).toBe('app');
  });

  it('still greets when the stored data cannot be read', () => {
    expect(boot({ saved: '{not json' })).toBeUndefined();
  });

  it('is written into index.html for search engines, in a newcomer’s colours', () => {
    const html = welcomeHtml({ counts: true });
    expect(html).toContain(`<h1 class="wordmark big-mark">${BRAND.name.toLowerCase()}</h1>`);
    expect(html).toContain('data-island="counts"');
    expect(welcomeHtml({ counts: false })).not.toContain('data-island="counts"');
    expect(html).toContain('data-start');
    for (const course of COURSES) expect(html).toContain(`href="${languageOf(course)}/"`);
    expect(html).toContain(`--accent: ${THEMES[COURSES[0]!.flag].accent}`);
  });
});
