/**
 * The Content Security Policy of the app and of the pages beside it: only their own scripts run, and
 * they reach nothing but their own origin and the translation and count services the build names.
 * Sent in a <meta> tag: GitHub Pages ignores custom headers, and the end-to-end tests run under the
 * policy itself. A <meta> cannot carry frame-ancestors (CSP Level 3, « meta element »), so framing
 * stays allowed, as the app expects when a preview frames it.
 */
import type { Plugin } from 'vite';
import { BOOT_HASH } from './boot.ts';

/** A service's origin; none when the build serves it from the app's own ('.'). */
const originOf = (address: unknown) =>
  typeof address === 'string' && URL.canParse(address) ? new URL(address).origin : null;

export function securityPolicy(env: Record<string, unknown>): string {
  const services = new Set(
    [env.VITE_TRANSLATE_URL, env.VITE_COUNTS_URL].map(originOf).filter(origin => origin !== null),
  );
  return [
    "default-src 'self'",
    // The welcome page's first lines (build/boot.ts) run inline, allowed by their hash alone.
    `script-src 'self' ${BOOT_HASH}`,
    // The pages carry their trip's colours in a style attribute.
    "style-src 'self' 'unsafe-inline'",
    // The card's picture is drawn from data URLs and shown from a blob; recordings play from blobs.
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    ["connect-src 'self'", ...services].join(' '),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

export function contentSecurity(): Plugin {
  let policy = '';
  return {
    name: 'content-security',
    apply: 'build',
    configResolved(config) {
      policy = securityPolicy(config.env);
    },
    // Before the scripts and styles it governs: a policy only covers what comes after it.
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: policy }, injectTo: 'head-prepend' },
    ],
  };
}
