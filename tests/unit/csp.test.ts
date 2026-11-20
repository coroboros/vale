import { describe, expect, it } from 'vitest';
import { BOOT_HASH, BOOT_SCRIPT } from '../../build/boot';
import { securityPolicy } from '../../build/csp';

const directives = (policy: string) => new Map(policy.split('; ').map(d => [d.split(' ')[0], d] as const));

describe('the Content Security Policy', () => {
  it('runs only the app’s own scripts, the welcome page’s first lines by their hash, and nothing in plugins', async () => {
    const policy = directives(securityPolicy({}));
    expect(policy.get('script-src')).toBe(`script-src 'self' ${BOOT_HASH}`);
    const digest = Buffer.from(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(BOOT_SCRIPT))).toString(
      'base64',
    );
    expect(BOOT_HASH).toBe(`'sha256-${digest}'`);
    expect(policy.get('object-src')).toBe("object-src 'none'");
    expect(policy.get('base-uri')).toBe("base-uri 'self'");
  });

  it('lets the app reach the services the build names, once each, and no other', () => {
    const policy = directives(
      securityPolicy({
        VITE_TRANSLATE_URL: 'https://translate.example/v1/',
        VITE_COUNTS_URL: 'https://translate.example',
      }),
    );
    expect(policy.get('connect-src')).toBe("connect-src 'self' https://translate.example");
  });

  it('adds nothing for a service served by the app’s own origin', () => {
    expect(directives(securityPolicy({ VITE_TRANSLATE_URL: '.' })).get('connect-src')).toBe("connect-src 'self'");
  });
});
