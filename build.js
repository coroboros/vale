// Builds the installable, offline web app into docs/ (served by GitHub Pages):
// index.html (font, styles, data, app inlined), sw.js, manifest.webmanifest.
// Icons: python3 brand/make_icons.py brand/icon.svg docs/icons
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'docs');
const data = require(path.join(ROOT, 'src/data.js'));
const css = fs.readFileSync(path.join(ROOT, 'src/style.css'), 'utf8');
const js = fs.readFileSync(path.join(ROOT, 'src/app.js'), 'utf8');
const iconSvg = fs.readFileSync(path.join(ROOT, 'brand/icon.svg'), 'utf8');

const FONT_DIR = path.join(ROOT, 'fonts');
const fontCss = [600, 700, 800, 900].map(w => {
  const b64 = fs.readFileSync(path.join(FONT_DIR, `nunito-latin-${w}-normal.woff2`)).toString('base64');
  return `@font-face{font-family:"Nunito";font-style:normal;font-weight:${w};font-display:swap;src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
}).join('\n');

const json = JSON.stringify(data).replace(/</g, '\\u003c');
const contentHash = crypto.createHash('sha256').update(css + js + json + iconSvg).digest('hex').slice(0, 8);
const BUILD = `3.0 · ${contentHash}`;
const favicon = `data:image/svg+xml,${encodeURIComponent(iconSvg.replace(/\s+/g, ' '))}`;

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#FFFFFF">
<meta name="color-scheme" content="light">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Vale">
<meta name="application-name" content="Vale">
<meta name="description" content="L’espagnol de survie pour francophones, 100 % hors ligne : parcours, situations, prononciation, carte de survie.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" href="${favicon}">
<title>¡Vale! Espagnol de survie</title>
<style>
${fontCss}
${css}
</style>
</head>
<body>
<div id="app"></div>
<script>window.VALE_DATA=${json};window.VALE_BUILD=${JSON.stringify(BUILD)};</script>
<script>
${js}
</script>
</body>
</html>
`;

const manifest = {
  name: '¡Vale! Espagnol de survie',
  short_name: 'Vale',
  description: 'L’espagnol de survie pour francophones, 100 % hors ligne.',
  lang: 'fr',
  dir: 'ltr',
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#FFFFFF',
  theme_color: '#FFFFFF',
  icons: [
    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};

const sw = `// ¡Vale! service worker: the whole app is cached on first visit and served offline.
const CACHE = 'vale-${contentHash}';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => { if (!self.registration.active) return self.skipWaiting(); }));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('vale-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
`;

fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));
fs.writeFileSync(path.join(OUT, 'sw.js'), sw);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
const n = data.lessons.reduce((a, L) => a + L.items.length, 0);
console.log(`built ${BUILD} · index ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB · ${n} items · ${data.scenes.length} scenes`);
