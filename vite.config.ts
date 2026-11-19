/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { frenchTypography } from './build/french-spaces.ts';
import { situationPages } from './build/pages.ts';
import { BRAND, COLORS } from './src/brand.ts';
import { COURSES } from './src/content/index.ts';
import { languageOf } from './src/content/pages.ts';

export default defineConfig({
  // Relative URLs: the same build runs from GitHub Pages (/vale/) and from any other host.
  base: './',
  // No source maps in the published app: the code is private.
  build: {
    target: 'es2022',
    sourcemap: false,
    // The situation pages (build/pages.ts) carry their own small entry.
    rolldownOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        page: fileURLToPath(new URL('./src/page.tsx', import.meta.url)),
      },
    },
  },
  plugins: [
    frenchTypography(fileURLToPath(new URL('./src/', import.meta.url))),
    preact(),
    {
      name: 'brand-html',
      transformIndexHtml: html => html.replaceAll('%BRAND_NAME%', BRAND.name).replaceAll('%BRAND_PAGE%', COLORS.page),
    },
    situationPages(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: false,
      // Icons are already matched by the precache glob below.
      includeManifestIcons: false,
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Only the Latin subsets are ever used; skip the others. The situation pages are read online.
        globIgnores: [
          '**/*vietnamese*',
          '**/*cyrillic*',
          '**/*greek*',
          'assets/page-*',
          ...COURSES.map(c => `${languageOf(c)}/**`),
        ],
      },
      manifest: {
        id: './',
        name: `${BRAND.name} : ${BRAND.tagline}`,
        short_name: BRAND.name,
        description:
          'Les phrases de survie pour voyager : espagnol, italien, portugais, anglais. Hors ligne, sans compte, sans pub.',
        lang: 'fr',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: COLORS.page,
        theme_color: COLORS.page,
        categories: ['education', 'travel'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          // Bernard shrunk into the safe circle that Android may crop to (brand/make-icons.sh).
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    // The contrast tests read the real design tokens.
    css: { include: [/tokens\.css/] },
  },
});
