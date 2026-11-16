(() => {
  'use strict';

  const D = window.VALE_DATA;
  const BUILD = window.VALE_BUILD || 'dev';
  const PAGES_URL = 'https://coroboros.github.io/vale/';
  const root = document.documentElement;
  const app = document.getElementById('app');
  const inFrame = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();

  /* ============================================================ helpers */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escA = s => String(s ?? '').replace(/[&<>"']/g, c => ESC[c]);
  // HTML escape plus French spacing: no line break before ? ! : ; » € or inside "14 h 30".
  const esc = s => escA(s)
    .replace(/ ([?!:;»€])/g, ' $1').replace(/« /g, '« ')
    .replace(/(\d) h\b/g, '$1 h').replace(/\bh (\d)/g, 'h $1');
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const shuffle = a => {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const pad = n => String(n).padStart(2, '0');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const seeded = seed => { let s = seed || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; };
  const initial = n => (String(n || '?').trim()[0] || '?').toUpperCase();

  // Phonetics: syllables written in capitals are stressed -> <b>; hyphens become thin dots.
  function ph(s) {
    return String(s).split(/([\s\-\/,·…?!]+)/).map(t => {
      if (!t) return '';
      if (/^[\s\-\/,·…?!]+$/.test(t)) return esc(t).replace(/-/g, '<span class="sy">·</span>');
      const stressed = t === t.toUpperCase() && t !== t.toLowerCase();
      return stressed ? `<b>${esc(t.toLowerCase())}</b>` : esc(t.toLowerCase());
    }).join('');
  }
  const phLine = (s, keep) => (s ? `<p class="ph${keep ? ' keep' : ''}" lang="fr">${ph(s)}</p>` : '');

  /* ============================================================== icons */
  const svg = (d, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    speaker: svg('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'),
    mute: svg('<path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>'),
    snail: svg('<circle cx="10" cy="12.3" r="5.3"/><path d="M10 12.3a2 2 0 1 1 2-2"/><path d="M2.5 18H17a3.5 3.5 0 0 0 3.5-3.5V12"/><path d="M20.5 12l-1.1-2.7M20.5 12l1.5-2.4"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>'),
    stop: svg('<rect x="6.5" y="6.5" width="11" height="11" rx="2.5" fill="currentColor"/>'),
    play: svg('<path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/>'),
    pause: svg('<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>'),
    next: svg('<path d="M6 6l8 6-8 6z" fill="currentColor"/><path d="M17.5 6v12"/>'),
    prev: svg('<path d="M18 6l-8 6 8 6z" fill="currentColor"/><path d="M6.5 6v12"/>'),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    back: svg('<path d="M15 5l-7 7 7 7"/>'),
    check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    x: svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
    star: svg('<path d="M12 3.4l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.7l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'),
    starf: svg('<path fill="currentColor" d="M12 3.4l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.7l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>'),
    target: svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.3"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>'),
    clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    search: svg('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
    chev: svg('<path d="M6 9l6 6 6-6"/>', 'ico chev'),
    chevr: svg('<path d="M9 6l6 6-6 6"/>'),
    expand: svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    bulb: svg('<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>'),
    trash: svg('<path d="M4.5 7h15M10 11v6M14 11v6"/><path d="M6.5 7l1 12.5A1.5 1.5 0 0 0 9 21h6a1.5 1.5 0 0 0 1.5-1.5l1-12.5"/><path d="M9.5 7V4.5h5V7"/>'),
    replay: svg('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4 4v4.5h4.5"/>'),
    plane: svg('<path fill="currentColor" stroke="none" d="M21 15.5v-1.8l-7.5-4.8V4a1.5 1.5 0 0 0-3 0v4.9L3 13.7v1.8l7.5-2.4v4.7l-2.2 1.6v1.4L12 19.8l3.7 1v-1.4l-2.2-1.6v-4.7z"/>'),
    route: svg('<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>'),
    dumbbell: svg('<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>'),
    idcard: svg('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16.2a3.4 3.4 0 0 1 6.4 0M14.5 10h4M14.5 13.5h3"/>'),
    book: svg('<path d="M5 5a2 2 0 0 1 2-2h12v14H7a2 2 0 0 0-2 2z"/><path d="M5 19a2 2 0 0 0 2 2h12v-4"/>'),
    user: svg('<circle cx="12" cy="7.6" r="3.6"/><path d="M5 20.5a7 7 0 0 1 14 0"/>'),
    headphones: svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3.5" y="14" width="4" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4" height="6.5" rx="1.6"/>'),
    bolt: svg('<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>'),
    duel: svg('<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="8" r="3"/><path d="M2.5 19a5.5 5.5 0 0 1 11 0M12.6 15.3A5.5 5.5 0 0 1 22 19"/>'),
    errors: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.2M12 16.3v.2"/>'),
    globe: svg('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>'),
    share: svg('<path d="M12 3.5v11M8 7.5l4-4 4 4"/><path d="M7.5 10.5H6a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-1.5"/>'),
    addsq: svg('<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8.5v7M8.5 12h7"/>'),
    flag: svg('<path d="M5 21V4M5 4.5h11l-2 4 2 4H5"/>'),
    cloud: svg('<path d="M7 18.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18.5z"/><path d="M9.5 14l2 2 3.5-3.6"/>'),
    grid: svg('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
    swap: svg('<path d="M7 7.5h12l-3-3M17 16.5H5l3 3"/>'),
    calendar: svg('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M8.5 3v4M15.5 3v4"/>'),
    sparkle: svg('<path d="M12 3.5l1.8 5.1 5.2 1.9-5.2 1.9L12 17.5l-1.8-5.1-5.2-1.9 5.2-1.9z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4"/>'),
    ask: svg('<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 3.5V16a2 2 0 0 1-2-2z"/><path d="M10 8.8a2 2 0 1 1 2.7 1.9c-.4.2-.7.5-.7.9v.2M12 13.6v.1"/>'),
    key: svg('<circle cx="8" cy="12" r="3.6"/><path d="M11.6 12h8.9M17.2 12v3M20.3 12v2.4"/>'),
    euro: svg('<path d="M17.5 6.7A6.5 6.5 0 1 0 17.5 17.3"/><path d="M4.8 10.3h8.4M4.8 13.7h8.4"/>'),
    cup: svg('<path d="M5 9.5h11V14a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.4 2.4 0 0 1 0 4.8H16"/><path d="M9 3.6c-.9 1 .9 2 0 3M12.5 3.6c-.9 1 .9 2 0 3"/>'),
    fork: svg('<path d="M7 3v6a2 2 0 0 0 4 0V3M9 11v10"/><path d="M17 21V3c-2.2 1.6-3 4.2-3 7v3.5h3"/>'),
    pin: svg('<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
    bed: svg('<path d="M3 19V6M3 15.5h18V19M21 15.5V12a3 3 0 0 0-3-3h-7v6.5"/><circle cx="7" cy="11.6" r="1.9"/>'),
    bag: svg('<path d="M5 8h14l-1.2 11.6a1.5 1.5 0 0 1-1.5 1.4H7.7a1.5 1.5 0 0 1-1.5-1.4z"/><path d="M9 10.5V7a3 3 0 0 1 6 0v3.5"/>'),
    cross: svg('<path d="M9.5 4h5v5.5H20v5h-5.5V20h-5v-5.5H4v-5h5.5z"/>'),
    chat: svg('<path d="M3.5 6.5A2.5 2.5 0 0 1 6 4h7a2.5 2.5 0 0 1 2.5 2.5v4A2.5 2.5 0 0 1 13 13H9l-3.5 3v-3a2.5 2.5 0 0 1-2-2.5z"/><path d="M18.5 9.3a2.3 2.3 0 0 1 2 2.3v3.6a2.2 2.2 0 0 1-2.2 2.2v2.4l-3-2.4h-2.6a2.2 2.2 0 0 1-2-1.3"/>'),
    refresh: svg('<path d="M19.5 12a7.5 7.5 0 0 1-12.8 5.3M4.5 12a7.5 7.5 0 0 1 12.8-5.3"/><path d="M17.5 3.4v3.4h-3.4M6.5 20.6v-3.4h3.4"/>'),
    car: svg('<path d="M3.5 16.5v-4.3L6 7.4a2 2 0 0 1 1.8-1.1h8.4A2 2 0 0 1 18 7.4l2.5 4.8v4.3z"/><path d="M3.5 12.2h17M6.5 16.5V19M17.5 16.5V19"/><circle cx="7.6" cy="14.3" r=".6" fill="currentColor"/><circle cx="16.4" cy="14.3" r=".6" fill="currentColor"/>'),
    bell: svg('<path d="M5 17a7 7 0 0 1 14 0z"/><path d="M12 10V8M10 7.5h4M3 20.5h18"/>'),
    person: svg('<circle cx="12" cy="7.6" r="3.6"/><path d="M5 20.5a7 7 0 0 1 14 0"/>'),
    trophy: svg('<path d="M7.5 4h9v5a4.5 4.5 0 0 1-9 0z"/><path d="M7.5 6H4.5a3 3 0 0 0 3 4M16.5 6h3a3 3 0 0 1-3 4M12 13.5V17M8.5 20.5h7"/>')
  };
  const FLAG = '<svg viewBox="0 0 36 26" aria-hidden="true"><rect width="36" height="26" fill="#E1303A"/><rect y="6.5" width="36" height="13" fill="#FFC83D"/></svg>';

  // Sol, the brand's sun.
  function sol(mood = 'happy', size = 96, cls = '') {
    const rays = Array.from({ length: 10 }, (_, i) => `<rect x="56" y="3" width="8" height="17" rx="4" transform="rotate(${i * 36} 60 60)"/>`).join('');
    const E = '#222A3C';
    const eyes = {
      happy: `<ellipse cx="48" cy="57" rx="4.6" ry="6" fill="${E}"/><ellipse cx="72" cy="57" rx="4.6" ry="6" fill="${E}"/><circle cx="49.5" cy="54.5" r="1.6" fill="#fff"/><circle cx="73.5" cy="54.5" r="1.6" fill="#fff"/>`,
      cheer: `<path d="M42 59q6-8 12 0M66 59q6-8 12 0" fill="none" stroke="${E}" stroke-width="4.5" stroke-linecap="round"/>`,
      wow: `<ellipse cx="48" cy="56" rx="5.4" ry="7" fill="${E}"/><ellipse cx="72" cy="56" rx="5.4" ry="7" fill="${E}"/><circle cx="50" cy="53" r="2" fill="#fff"/><circle cx="74" cy="53" r="2" fill="#fff"/>`,
      think: `<ellipse cx="51" cy="55" rx="4.4" ry="5.6" fill="${E}"/><ellipse cx="75" cy="55" rx="4.4" ry="5.6" fill="${E}"/>`,
      sleep: `<path d="M42 58q6 5 12 0M66 58q6 5 12 0" fill="none" stroke="${E}" stroke-width="4" stroke-linecap="round"/>`
    };
    const mouth = {
      happy: `<path d="M50 69q10 9 20 0" fill="none" stroke="${E}" stroke-width="4.5" stroke-linecap="round"/>`,
      cheer: '<path d="M47 67h26q-1.5 15-13 15t-13-15z" fill="#7A2E1C"/><path d="M53 76.5q7 4 14 0" fill="none" stroke="#FF8FA0" stroke-width="4" stroke-linecap="round"/>',
      wow: '<ellipse cx="60" cy="73" rx="5.5" ry="6.5" fill="#7A2E1C"/>',
      think: `<path d="M53 72h14" fill="none" stroke="${E}" stroke-width="4.5" stroke-linecap="round"/>`,
      sleep: `<path d="M55 72q5 3 10 0" fill="none" stroke="${E}" stroke-width="4" stroke-linecap="round"/>`
    };
    return `<svg class="sol ${cls}" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">
      <g class="rays" fill="#FFCF5A">${rays}</g>
      <circle cx="60" cy="64" r="34" fill="#E5920B"/><circle cx="60" cy="60" r="34" fill="#FFB21E"/>
      <ellipse cx="49" cy="42" rx="12" ry="6" fill="#fff" opacity=".35" transform="rotate(-18 49 42)"/>
      <g class="eyes">${eyes[mood] || eyes.happy}</g>
      <circle cx="39" cy="68" r="5.5" fill="#FF7A8A" opacity=".42"/><circle cx="81" cy="68" r="5.5" fill="#FF7A8A" opacity=".42"/>
      ${mouth[mood] || mouth.happy}
    </svg>`;
  }
  // Logo: the inverted ¡ whose dot is Sol.
  const MARK = '<svg class="mark" viewBox="0 0 40 70" aria-hidden="true"><circle cx="20" cy="15" r="13" fill="#FFB21E"/><circle cx="15.5" cy="14" r="1.9" fill="#222A3C"/><circle cx="24.5" cy="14" r="1.9" fill="#222A3C"/><path d="M15.5 19q4.5 3.4 9 0" fill="none" stroke="#222A3C" stroke-width="2" stroke-linecap="round"/><path d="M15 34q0-3 3-3h4q3 0 3 3l3.5 26q.6 7-8.5 7t-8.5-7z" fill="#2F6BFF"/></svg>';
  const logoHTML = () => `<span class="logo" aria-label="¡Vale!">${MARK}vale<b>!</b></span>`;

  /* =============================================================== data */
  const ITEMS = [], LES = {}, SCN = {};
  const tokES = s => s.replace(/[¿?¡!.,…:;]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const tokFR = s => s.replace(/[?!.,…:;]/g, ' ').trim().split(/\s+/).filter(Boolean);
  const wordOK = w => /^[\p{L}\p{N}'’-]+$/u.test(w);
  const prepItem = (it, L, i, lang) => {
    it.id = `${L.id}.${i}`; it.L = L; it.lang = lang;
    it.tES = !it.k && !/[\/()]/.test(it.es) && tokES(it.es).length >= 2 ? tokES(it.es) : null;
    it.tFR = !it.k && !/[\/()]/.test(it.fr) && tokFR(it.fr).length >= 2 ? tokFR(it.fr) : null;
  };
  D.lessons.forEach((L, li) => { L.num = li + 1; L.lang = 'es'; LES[L.id] = L; L.items.forEach((it, i) => { prepItem(it, L, i, 'es'); ITEMS.push(it); }); });
  Object.entries(D.packs).forEach(([k, pk]) => {
    const L = { id: `pack-${k}`, t: pk.t, es: pk.es, pack: k, lang: pk.lang, items: pk.items };
    LES[L.id] = L;
    L.items.forEach((it, i) => prepItem(it, L, i, pk.lang));
  });
  D.scenes.forEach(s => { SCN[s.id] = s; });
  const SCENES = D.scenes;
  const L_ICON = { base: 'sun', parler: 'ask', cles: 'key', nombres: 'euro', bar: 'cup', resto: 'fork', ville: 'pin', hotel: 'bed', shopping: 'bag', urgences: 'cross' };
  const S_ICON = { cafe: 'cup', tapas: 'fork', taxi: 'car', hotel: 'bell', rue: 'person', pharma: 'cross' };
  const BASE_PATH = [
    { t: 'sons' },
    { t: 'lesson', id: 'base' }, { t: 'lesson', id: 'parler' }, { t: 'lesson', id: 'cles' }, { t: 'lesson', id: 'nombres' },
    { t: 'review' },
    { t: 'lesson', id: 'bar' }, { t: 'scene', id: 'cafe' },
    { t: 'lesson', id: 'resto' }, { t: 'scene', id: 'tapas' },
    { t: 'lesson', id: 'ville' }, { t: 'scene', id: 'taxi' }, { t: 'scene', id: 'rue' },
    { t: 'lesson', id: 'hotel' }, { t: 'scene', id: 'hotel' },
    { t: 'lesson', id: 'shopping' },
    { t: 'lesson', id: 'urgences' }, { t: 'scene', id: 'pharma' },
    { t: 'review' }
  ];
  const PRAISE = ['¡Muy bien!', '¡Eso es!', '¡Perfecto!', '¡Genial!', '¡Bien hecho!', '¡Olé!'];
  const COLORS = ['#2F6BFF', '#E8458B', '#8A5CF6', '#14A38B'];
  const GOALS = [[20, 'Tranquille', '5 min par jour'], [40, 'Régulier', '10 min par jour'], [60, 'Intense', '15 min par jour']];

  /* ============================================================ storage */
  const KEY = 'vale-v3';
  const blankStats = () => ({ rec: 0, prices: 0, pairs: 0, duels: 0, perfect: 0, lessons: 0, questDays: 0 });
  const blank = () => ({ p: {}, sc: {}, days: {}, q: {}, badges: {}, miss: {}, favs: {}, st: blankStats(), card: { hotel: '', addr: '', allergens: [], diets: [] } });
  let S = null;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  if (!S || S.v !== 3) {
    S = { v: 3, ob: false, profiles: [], active: '', dest: 'autre', date: '', goal: 40, snd: false, set: {}, data: {}, installSeen: false };
    try { const old = JSON.parse(localStorage.getItem('vale-espagnol-v1') || 'null'); if (old && old.p) S.migrate = { p: old.p, sc: old.sc || {} }; } catch (e) { /* none */ }
  }
  S.set = Object.assign({ auto: true, slow: false, ph: true, sfx: true }, S.set || {});
  Object.values(S.data || {}).forEach(d => {
    d.st = Object.assign(blankStats(), d.st || {});
    d.card = Object.assign({ hotel: '', addr: '', allergens: [], diets: [] }, d.card || {});
    ['p', 'sc', 'days', 'q', 'badges', 'miss', 'favs'].forEach(k => { d[k] = d[k] || {}; });
  });
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: progress lives for this visit */ } };
  const prof = () => S.profiles.find(p => p.id === S.active) || S.profiles[0] || { id: 'p1', name: 'Moi', g: 'o', color: COLORS[0] };
  const P = () => { const id = prof().id; if (!S.data[id]) S.data[id] = blank(); return S.data[id]; };
  const gEnd = () => (prof().g === 'a' ? 'a' : 'o');

  const lv = id => (P().p[id] ? P().p[id].l : 0);
  const setLv = (id, l) => { P().p[id] = { l, t: Date.now() }; };
  const mastered = L => L.items.filter(it => lv(it.id) >= 4).length;
  const lessonDone = L => mastered(L) === L.items.length;
  const startedL = L => L.items.some(it => lv(it.id) >= 1);
  const dest = () => D.dests.find(x => x.id === S.dest) || D.dests[D.dests.length - 1];
  const packL = () => (dest().pack ? LES[`pack-${dest().pack}`] : null);
  const poolItems = () => (packL() ? ITEMS.concat(packL().items) : ITEMS);
  const seenItems = () => poolItems().filter(it => lv(it.id) >= 1);
  const totalMastered = () => poolItems().filter(it => lv(it.id) >= 4).length;
  const errItems = () => poolItems().filter(it => P().miss[it.id] > 0);
  const findItem = id => { const [lid] = id.split('.'); const L = LES[lid]; return L ? L.items.find(it => it.id === id) : null; };
  const daysLeft = () => {
    if (!S.date) return null;
    const t = new Date(`${S.date}T00:00:00`); const n = new Date(); n.setHours(0, 0, 0, 0);
    return Math.round((t - n) / 86400000);
  };
  const PATH = () => { const p = BASE_PATH.slice(); if (packL()) p.splice(p.length - 1, 0, { t: 'lesson', id: packL().id }); return p; };

  /* ======================================================== gamification */
  const today = () => dkey();
  const xpToday = () => P().days[today()] || 0;
  function streak() {
    const days = P().days; const d = new Date(); let s = 0;
    if (!days[dkey(d)]) d.setDate(d.getDate() - 1);
    while (days[dkey(d)] > 0) { s++; d.setDate(d.getDate() - 1); }
    return s;
  }
  function addXP(n) { if (!n) return; const d = today(); P().days[d] = (P().days[d] || 0) + n; quest('xp', n); }
  const QUESTS = [
    { k: 'xp', t: g => `Gagner ${g} XP`, n: g => g, i: 'bolt' },
    { k: 'lesson', t: () => 'Terminer une leçon', n: () => 1, i: 'route' },
    { k: 'scene', t: () => 'Jouer une situation', n: () => 1, i: 'chat' },
    { k: 'combo', t: () => '5 bonnes réponses d’affilée', n: () => 5, i: 'sun' },
    { k: 'speak', t: () => 'Prononcer 5 expressions', n: () => 5, i: 'mic', need: () => REC.ok },
    { k: 'listen', t: () => '10 phrases en mains libres', n: () => 10, i: 'headphones', need: () => T.ok },
    { k: 'prices', t: () => 'Comprendre 5 prix', n: () => 5, i: 'euro', need: () => T.ok },
    { k: 'pairs', t: () => 'Trouver 10 paires', n: () => 10, i: 'grid' },
    { k: 'fix', t: () => 'Corriger 3 erreurs', n: () => 3, i: 'errors' }
  ];
  function todaysQuests() {
    const r = seeded(hash(today() + prof().id));
    const pool = QUESTS.filter(q => q.k !== 'xp' && (!q.need || q.need()));
    const out = [QUESTS[0]];
    let guard = 0;
    while (out.length < 3 && guard++ < 50) { const q = pool[Math.floor(r() * pool.length)]; if (q && !out.includes(q)) out.push(q); }
    return out;
  }
  const qState = () => { const d = today(); return P().q[d] || (P().q[d] = {}); };
  const qVal = (q, Q) => (q.k === 'xp' ? xpToday() : Q[q.k] || 0);
  function quest(k, n = 1) {
    const Q = qState();
    if (k === 'combo') Q.combo = Math.max(Q.combo || 0, n);
    else if (k !== 'xp') Q[k] = (Q[k] || 0) + n;
    const qs = todaysQuests();
    if (!Q._done && qs.every(q => qVal(q, Q) >= q.n(S.goal))) {
      Q._done = true; P().st.questDays++;
      setTimeout(() => { sfx('badge'); toast({ ic: 'flag', c: 'var(--green)', cd: 'var(--green-d)', t: '¡Fantástico!', s: 'Les 3 défis du jour sont relevés' }); }, 400);
    }
  }
  const BADGES = [
    { k: 'first', t: 'Premier pas', d: 'Finir une leçon', i: 'route', c: 'blue', ok: Dd => Dd.st.lessons >= 1 },
    { k: 'perfect', t: 'Sans faute', d: 'Une leçon à 100 %', i: 'starf', c: 'gold', ok: Dd => Dd.st.perfect >= 1 },
    { k: 'streak3', t: 'Trois soleils', d: '3 jours de suite', i: 'sun', c: 'gold', ok: () => streak() >= 3 },
    { k: 'streak7', t: 'Semaine de feu', d: '7 jours de suite', i: 'sun', c: 'red', ok: () => streak() >= 7 },
    { k: 'scenes', t: 'Comme un local', d: 'Jouer toutes les situations', i: 'chat', c: 'violet', ok: Dd => SCENES.every(s => Dd.sc[s.id]) },
    { k: 'words50', t: 'Cinquante', d: '50 expressions maîtrisées', i: 'book', c: 'blue', ok: () => totalMastered() >= 50 },
    { k: 'all', t: 'Prêt à atterrir', d: 'Terminer toutes les leçons', i: 'plane', c: 'gold', ok: () => D.lessons.every(lessonDone) },
    { k: 'ear', t: 'Oreille d’or', d: 'Comprendre 20 prix', i: 'euro', c: 'green', ok: Dd => Dd.st.prices >= 20 },
    { k: 'voice', t: 'Belle voix', d: '20 enregistrements', i: 'mic', c: 'violet', ok: Dd => Dd.st.rec >= 20 },
    { k: 'duo', t: 'En duo', d: 'Jouer un duel', i: 'duel', c: 'blue', ok: Dd => Dd.st.duels >= 1 },
    { k: 'flash', t: 'Éclair', d: '12 paires en 60 secondes', i: 'bolt', c: 'gold', ok: Dd => Dd.st.pairs >= 12 },
    { k: 'quests', t: 'Défis relevés', d: '3 défis en un jour', i: 'flag', c: 'green', ok: Dd => Dd.st.questDays >= 1 }
  ];
  function checkBadges() {
    const Dd = P();
    const fresh = BADGES.filter(b => !Dd.badges[b.k] && b.ok(Dd));
    if (!fresh.length) return;
    fresh.forEach(b => { Dd.badges[b.k] = Date.now(); });
    save();
    fresh.forEach((b, i) => setTimeout(() => {
      sfx('badge');
      toast({ ic: b.i, c: `var(--${b.c})`, cd: `var(--${b.c}-d)`, t: b.t, s: 'Nouveau badge' });
    }, 900 + i * 2600));
  }
  function noteMiss(it, ok) {
    const M = P().miss;
    if (ok) { if (M[it.id] > 0) { M[it.id]--; if (!M[it.id]) delete M[it.id]; quest('fix'); } }
    else M[it.id] = Math.min(3, (M[it.id] || 0) + 1);
  }

  /* ============================================================== audio */
  const T = { ok: false, v: {} };
  const NATURAL = /m[oó]nica|marisol|jorge|luc[ií]a|helena|laura|pablo|elvira|[aá]lvaro|paloma|google|thomas|am[eé]lie|aur[eé]lie|audrey|marie|montserrat|jordi/i;
  const NOVELTY = /eddy|\bflo\b|grandma|grandpa|reed|rocko|sandy|shelley|abuel|grand-/i;
  function pickVoices() {
    if (!('speechSynthesis' in window)) return;
    let vs = [];
    try { vs = window.speechSynthesis.getVoices() || []; } catch (e) { return; }
    const best = (pre, region) => {
      const re = new RegExp(`^${pre}(\\b|[-_])`, 'i');
      const c = vs.filter(v => re.test(v.lang || ''));
      if (!c.length) return null;
      const sc = v => (region && new RegExp(`^${pre}[-_]${region}`, 'i').test(v.lang) ? 4 : 0) + (v.localService ? 2 : 0) + (NATURAL.test(v.name) ? 2 : 0) - (NOVELTY.test(v.name) ? 6 : 0);
      return c.sort((a, b) => sc(b) - sc(a))[0];
    };
    T.v = { es: best('es', 'ES'), fr: best('fr', 'FR'), ca: best('ca'), eu: best('eu'), gl: best('gl') };
    T.ok = !!T.v.es;
    root.classList.toggle('tts', T.ok);
  }
  const canSay = (lang = 'es') => !!T.v[lang];
  const forSpeech = s => String(s).replace(/\s*[\/·]\s*/g, ', ').replace(/…/g, '').trim();
  function say(text, o = {}) {
    const v = T.v[o.lang || 'es'];
    if (!v) return Promise.resolve();
    return new Promise(res => {
      let done = false;
      const end = () => { if (!done) { done = true; res(); } };
      try {
        const s = window.speechSynthesis;
        if (!o.queue && (s.speaking || s.pending)) s.cancel();
        const u = new SpeechSynthesisUtterance(forSpeech(text));
        u.voice = v; u.lang = v.lang;
        u.rate = o.rate || ((o.slow || S.set.slow) ? 0.62 : 0.9);
        u.onend = end; u.onerror = end;
        s.speak(u);
        setTimeout(end, 1500 + forSpeech(text).length * (o.slow ? 160 : 95));
      } catch (e) { end(); }
    });
  }
  const autoSay = (t, lang) => { if (S.set.auto) say(t, { lang }); };
  const hush = () => { try { window.speechSynthesis.cancel(); } catch (e) { /* none */ } };
  if ('speechSynthesis' in window) {
    pickVoices();
    try { window.speechSynthesis.addEventListener('voiceschanged', pickVoices); } catch (e) {
      try { window.speechSynthesis.onvoiceschanged = pickVoices; } catch (e2) { /* none */ }
    }
    [250, 1000, 2500].forEach(ms => setTimeout(() => { if (!T.ok) pickVoices(); }, ms));
  }
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* none */ }

  let AC = null;
  const ac = () => {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) { /* none */ } }
    return AC;
  };
  function tone(freq, t0, dur, type = 'sine', vol = 0.16) {
    const a = ac(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  const SFX = {
    ok: n => { const b = 1 + Math.min(n || 0, 8) * 0.035; tone(660 * b, 0, 0.12); tone(990 * b, 0.08, 0.22); },
    bad: () => { tone(233, 0, 0.16, 'triangle', 0.18); tone(174, 0.1, 0.24, 'triangle', 0.16); },
    done: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.24)),
    badge: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.07, 0.26, 'sine', 0.12)),
    tap: () => tone(880, 0, 0.04, 'sine', 0.05)
  };
  const sfx = (k, n) => { if (S.set.sfx) { try { SFX[k](n); } catch (e) { /* none */ } } };

  const REC = { ok: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder) && !inFrame, denied: false, mr: null, chunks: [], url: null, timer: 0 };
  async function recStart(onStop) {
    try {
      try { if (navigator.audioSession) navigator.audioSession.type = 'play-and-record'; } catch (e) { /* none */ }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(m => window.MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) || '';
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      REC.chunks = []; REC.mr = mr;
      mr.ondataavailable = e => { if (e.data && e.data.size) REC.chunks.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* none */ }
        const blob = new Blob(REC.chunks, { type: mr.mimeType || 'audio/mp4' });
        if (REC.url) URL.revokeObjectURL(REC.url);
        REC.url = blob.size ? URL.createObjectURL(blob) : null;
        onStop(REC.url);
      };
      mr.start();
      REC.timer = setTimeout(recStop, 4500);
      return true;
    } catch (e) {
      REC.denied = true;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e2) { /* none */ }
      return false;
    }
  }
  function recStop() { clearTimeout(REC.timer); try { if (REC.mr && REC.mr.state === 'recording') REC.mr.stop(); } catch (e) { /* none */ } }
  const playUrl = url => new Promise(res => {
    if (!url) { res(); return; }
    try { const a = new Audio(url); a.onended = res; a.onerror = res; const p = a.play(); if (p && p.catch) p.catch(res); setTimeout(res, 6000); } catch (e) { res(); }
  });

  /* ============================================================== state */
  const V = { mode: S.ob ? 'tabs' : 'onboard', tab: 'path', ob: 0, obf: { n1: '', g1: 'o', duo: false, n2: '', g2: 'a', dest: 'autre', date: '', goal: 40 }, sheet: null, show: null, cat: 'all', q: '', open: null, arm: false, sub: null };
  let SS = null, SC = null, CH = null, PR = null, AU = null, DU = null, timer = 0, raf = 0, HINT = null, HINT_T = 0, LAST_SHEET = null, LAST_SHOW = null;

  function render(o = {}) {
    const run = () => {
      root.classList.toggle('no-ph', !S.set.ph);
      let html;
      switch (V.mode) {
        case 'onboard': html = viewOnboard(); break;
        case 'session': html = viewSession(o.anim); break;
        case 'result': html = viewResult(); break;
        case 'scene': html = viewScene(o.anim); break;
        case 'chrono': html = viewChrono(); break;
        case 'prices': html = viewPrices(o.anim); break;
        case 'audio': html = viewAudio(); break;
        case 'duel': html = viewDuel(o.anim); break;
        case 'sub': html = viewSub(o.anim); break;
        default: html = viewTab(o.anim) + tabbar();
      }
      const sk = V.sheet ? JSON.stringify(V.sheet) : null, shk = V.show ? V.show.es : null;
      if (V.sheet) html += viewSheet(sk !== LAST_SHEET);
      if (V.show) html += viewShow(shk !== LAST_SHOW);
      LAST_SHEET = sk; LAST_SHOW = shk;
      app.innerHTML = html;
      if (o.top) window.scrollTo(0, 0);
      if (o.cur) scrollToCur();
      if (o.bottom) requestAnimationFrame(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: reduced() ? 'auto' : 'smooth' }));
      if (o.party) confetti();
    };
    if (o.vt && document.startViewTransition && !reduced()) { try { document.startViewTransition(run); return; } catch (e) { /* fall back */ } }
    run();
  }
  function scrollToCur() {
    const el = app.querySelector('.node.cur');
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo(0, Math.max(0, window.scrollY + r.top - window.innerHeight / 2 + r.height / 2));
  }
  function stopAll() {
    clearTimeout(timer); cancelAnimationFrame(raf); hush(); recStop(); hideHint();
    if (AU) { AU.playing = false; AU.tok++; }
  }

  function toast(o) {
    const old = document.querySelector('.toast'); if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status');
    el.innerHTML = `<span class="m" style="--c:${o.c || 'var(--gold)'};--cd:${o.cd || 'var(--gold-d)'}">${I[o.ic] || I.star}</span><div><b>${esc(o.t)}</b><span>${esc(o.s || '')}</span></div>${o.btn ? `<button class="press">${esc(o.btn)}</button>` : ''}`;
    if (o.btn) el.querySelector('button').addEventListener('click', () => { el.remove(); o.on && o.on(); });
    document.body.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, o.btn ? 9000 : 2800);
  }
  function showHint(el, text) {
    hideHint();
    const tip = document.createElement('div');
    tip.className = 'hintpop'; tip.textContent = text;
    document.body.appendChild(tip);
    const r = el.getBoundingClientRect(), tw = tip.offsetWidth, th = tip.offsetHeight;
    const x = Math.max(10, Math.min(window.innerWidth - tw - 10, r.left + r.width / 2 - tw / 2));
    let y = r.top - th - 8; if (y < 10) y = r.bottom + 8;
    tip.style.left = `${x}px`; tip.style.top = `${y}px`;
    HINT = tip; clearTimeout(HINT_T); HINT_T = setTimeout(hideHint, 2600);
  }
  function hideHint() { if (HINT) { HINT.remove(); HINT = null; } }

  /* ====================================================== shared pieces */
  const head = (p, quit, extra = '') => `<header class="shead">
      <button class="icon-btn" data-act="${quit}" aria-label="Quitter">${I.close}</button>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}"><i style="width:${p}%"></i></div>
      <span class="side">${extra}<button class="icon-btn needs-tts" data-act="auto" aria-pressed="${S.set.auto}" aria-label="Son automatique">${S.set.auto ? I.speaker : I.mute}</button></span>
    </header>`;
  const optsHTML = (opts, picked, isEs, act, grid) => `<div class="opts${grid ? ' grid' : ''}${picked != null ? ' locked' : ''}" role="group">${opts.map((o, i) => {
    let cls = `opt${isEs ? ' es' : ''}`;
    if (picked != null) { if (o.ok) cls += ' ok'; else if (i === picked) cls += ' bad'; }
    return `<button class="${cls}" data-act="${act}" data-arg="${i}"${isEs ? ' lang="es"' : ''}>${esc(o.t)}</button>`;
  }).join('')}</div>`;
  const audioPair = (es, lang, xl) => (canSay(lang)
    ? `<div class="${xl ? 'listen' : 'audio'}"><button class="press spk say${xl ? ' xl' : ''}" data-act="say" data-arg="${escA(es)}" data-lang="${lang}" aria-label="Écouter">${I.speaker}</button><button class="press plain spk sm say" data-act="slow" data-arg="${escA(es)}" data-lang="${lang}" aria-label="Lentement">${I.snail}</button></div>`
    : '');
  function banner(ok, h, sub, act) {
    return `<div class="fb ${ok ? 'ok' : 'bad'}" role="status"><div class="fb-in">
      <div class="fb-row"><span class="badge">${ok ? I.check : I.x}</span><div>${h}${sub || ''}</div></div>
      <button class="press btn ${ok ? 'green' : 'red'}" data-act="${act}">Continuer</button></div></div>`;
  }
  const actResult = o => `<div class="screen"><main class="result">${sol(o.mood || 'cheer', 132, 'jump')}<h1 lang="es">${esc(o.title)}</h1>${o.sub ? `<p class="sub">${esc(o.sub)}</p>` : ''}${o.body || ''}</main>
    <footer class="sfoot"><div class="pair"><button class="press plain btn" data-act="home">Terminer</button><button class="press btn" data-act="${o.again}">Rejouer</button></div></footer></div>`;

  /* =============================================================== tabs */
  const TABS = [['path', 'route', 'Parcours'], ['train', 'dumbbell', 'Entraînement'], ['card', 'idcard', 'Ma carte'], ['lex', 'book', 'Lexique'], ['me', 'user', 'Profil']];
  const tabbar = () => `<nav class="tabs" aria-label="Sections"><div class="tabs-in">${TABS.map(([id, ic, label]) =>
    `<button class="tab" data-act="tab" data-arg="${id}" aria-label="${label}"${V.tab === id ? ' aria-current="page"' : ''}>${I[ic]}</button>`).join('')}</div></nav>`;
  function viewTab(anim) {
    if (V.tab === 'train') return viewTrain(anim);
    if (V.tab === 'card') return viewCard(anim);
    if (V.tab === 'lex') return viewLex(anim);
    if (V.tab === 'me') return viewMe(anim);
    return viewPath();
  }

  /* --------------------------------------------------------------- path */
  function nodeInfo(n) {
    if (n.t === 'lesson') {
      const L = LES[n.id], m = mastered(L), tot = L.items.length;
      return { kind: L.pack ? 'pack' : 'lesson', icon: L.pack ? 'globe' : L_ICON[n.id], title: L.t, sub: L.es, done: m === tot, started: startedL(L), m, tot, L };
    }
    if (n.t === 'scene') { const s = SCN[n.id]; return { kind: 'scene', icon: S_ICON[n.id], title: s.t, sub: s.es, done: !!P().sc[n.id], started: false }; }
    if (n.t === 'sons') return { kind: 'sons', glyph: 'ñ', title: 'Les sons', sub: 'La pronunciación', done: !!P().snd, started: false };
    return { kind: 'review', icon: 'refresh', title: 'Révision', sub: 'Repaso', done: false, off: seenItems().length < 4 };
  }
  const curIndex = () => PATH().findIndex(n => n.t !== 'review' && !nodeInfo(n).done);
  const ringSVG = frac => { const r = 44, C = 2 * Math.PI * r; return `<svg class="ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="${r}"/><circle class="val" cx="50" cy="50" r="${r}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/></svg>`; };
  function topbar() {
    const d = dest(), left = daysLeft();
    const chipTxt = left != null && left > 0 ? `J-${left}` : left === 0 ? '¡Hoy!' : d.es;
    const st = streak(), g = xpToday(), goal = S.goal, frac = Math.min(1, g / goal), C = 2 * Math.PI * 15;
    return `<header class="top">
      <button class="chip-dest" data-act="sheet" data-arg="dest" aria-label="Destination : ${escA(d.t)}"><span class="flag">${FLAG}</span>${esc(chipTxt)}</button>
      <span style="flex:1"></span>
      <span class="stat${st ? '' : ' off'}" aria-label="Série de ${st} jours">${I.sun}<span>${st}</span></span>
      <button class="goal${frac >= 1 ? ' full' : ''}" data-act="tab" data-arg="train" aria-label="Objectif du jour : ${g} sur ${goal} XP"><svg class="r" viewBox="0 0 36 36"><circle class="trk" cx="18" cy="18" r="15"/><circle class="val" cx="18" cy="18" r="15" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/></svg>${I.bolt}</button>
      <button class="avatar" style="--c:${prof().color}" data-act="sheet" data-arg="profiles" aria-label="Profil : ${escA(prof().name)}">${esc(initial(prof().name))}</button>
    </header>`;
  }
  function viewPath() {
    const W = Math.min(app.clientWidth || window.innerWidth || 390, 520);
    const amp = Math.min(86, W * 0.21), wave = [0, 0.62, 1, 0.62, 0, -0.62, -1, -0.62];
    const ROW = 106, TOP = 116, path = PATH(), cur = curIndex();
    const pts = path.map((n, i) => ({ x: Math.round(W / 2 + wave[i % 8] * amp), y: TOP + i * ROW }));
    const H = TOP + (path.length - 1) * ROW + 70;
    const all = [{ x: W / 2, y: 40 }, ...pts];
    let d = `M${all[0].x},${all[0].y}`;
    for (let i = 1; i < all.length; i++) { const a = all[i - 1], b = all[i], my = (a.y + b.y) / 2; d += ` C${a.x},${my} ${b.x},${my} ${b.x},${b.y}`; }
    const nodes = path.map((n, i) => {
      const f = nodeInfo(n);
      let cls = `node ${f.kind}`, ring = '';
      if (f.kind === 'review') { if (f.off) cls += ' off'; }
      else if (f.done) cls += ' done';
      else {
        if (f.m > 0) { ring = ringSVG(f.m / f.tot); cls += ' ringed'; }
        if (i === cur) cls += ' cur'; else if (!f.started) cls += ' todo';
      }
      const inner = f.glyph ? `<span class="glyph">${f.glyph}</span>` : I[f.icon];
      return `<button class="${cls}" style="left:${pts[i].x}px;top:${pts[i].y}px" data-act="node" data-arg="${i}" aria-label="${escA(f.title)}">${ring}${inner}</button>`;
    }).join('');
    let mascot = '';
    if (cur >= 0) {
      const c = pts[cur], side = c.x < W / 2 ? 1 : c.x > W / 2 ? -1 : (cur % 2 ? 1 : -1);
      const x = Math.max(8, Math.min(W - 80, c.x + side * 104 - 36));
      mascot = `<span class="sol-wrap" style="position:absolute;left:${x}px;top:${c.y - 44}px">${sol('happy', 72, 'bob')}</span>`;
    }
    return `<div class="pathpage">${topbar()}
      ${inFrame ? `<a class="offline-note" href="${PAGES_URL}" target="_blank" rel="noopener">${I.cloud}<span>Installe la version hors ligne sur ton iPhone</span></a>` : ''}
      <div class="path" style="width:${W}px;height:${H}px">
        <svg class="route" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}"/></svg>
        <span class="plane" style="left:${W / 2}px;top:40px">${I.plane}</span>
        ${mascot}${nodes}
      </div></div>`;
  }
  function nodeSheet(i) {
    const n = PATH()[i], f = nodeInfo(n);
    const tone = f.kind === 'scene' ? 'violet' : f.kind === 'review' ? 'gold' : f.kind === 'pack' ? 'green' : '';
    const inner = f.glyph ? `<span class="glyph">${f.glyph}</span>` : I[f.icon];
    const meter = f.tot ? `<div class="meter"><div class="bar"><i style="width:${Math.round((100 * f.m) / f.tot)}%"></i></div><span class="n">${I.starf}${f.m}/${f.tot}</span></div>` : '';
    const label = f.kind === 'sons' ? 'Écouter' : f.kind === 'review' ? 'Réviser' : f.kind === 'scene' ? (f.done ? 'Rejouer' : 'Jouer') : f.done ? 'Revoir' : f.started ? 'Continuer' : 'Commencer';
    const test = f.L && !f.done ? `<button class="textbtn" data-act="test" data-arg="${f.L.id}">Je connais déjà · tester</button>` : '';
    return `<div class="sheet" role="dialog" aria-label="${escA(f.title)}"><div class="grab"></div>
      <div class="sheet-head"><span class="tile ${tone}">${inner}</span><div><h2>${esc(f.title)}</h2><p class="sub" lang="es">${esc(f.sub)}</p></div></div>
      ${meter}<button class="press btn ${tone}" data-act="go" data-arg="${i}">${label}</button>${test}</div>`;
  }

  /* -------------------------------------------------------------- train */
  function viewTrain(anim) {
    const qs = todaysQuests(), Q = qState();
    const doneN = qs.filter(q => qVal(q, Q) >= q.n(S.goal)).length;
    const rows = qs.map(q => {
      const n = q.n(S.goal), v = Math.min(n, qVal(q, Q)), ok = v >= n;
      return `<li class="qrow${ok ? ' done' : ''}"><span class="qi">${ok ? I.check : I[q.i]}</span><div><div class="qt">${esc(q.t(S.goal))}<span>${v}/${n}</span></div><div class="bar thin${ok ? ' green' : ''}"><i style="width:${Math.round((100 * v) / n)}%"></i></div></div></li>`;
    }).join('');
    const nErr = errItems().length, nSeen = seenItems().length;
    const card = (act, icon, tone, title, meta, o = {}) => `<button class="tcard${o.off ? ' off' : ''}" data-act="${act}"${o.arg ? ` data-arg="${o.arg}"` : ''}${o.off ? ' aria-disabled="true"' : ''}>${o.cnt ? `<span class="cnt">${o.cnt}</span>` : ''}<span class="tile ${tone}">${icon}</span><h3>${title}</h3>${meta ? `<p class="meta">${meta}</p>` : ''}</button>`;
    return `<main class="page${anim ? ' pop' : ''}">
      <section class="quests"><div class="qh">${sol(doneN === 3 ? 'cheer' : 'happy', 44)}<h2>Défis du jour</h2><span class="n">${doneN}/3</span></div><ul>${rows}</ul></section>
      <div class="tgrid">
        ${card('errors', I.errors, 'red', 'Mes erreurs', nErr ? `${nErr} à revoir` : 'Rien à corriger', { cnt: nErr, off: !nErr })}
        ${card('review', I.refresh, 'gold', 'Révision', nSeen >= 4 ? 'Les plus fragiles' : 'Après une leçon', { off: nSeen < 4 })}
        ${card('chrono', I.bolt, 'violet', 'Paires chrono', '60 secondes')}
        ${card('prices', I.euro, 'green', 'Prix à l’oreille', T.ok ? '10 prix' : 'Voix requise', { off: !T.ok })}
        ${card('audio', I.headphones, '', 'Mains libres', T.ok ? 'Avec écouteurs' : 'Voix requise', { off: !T.ok })}
        ${card('duel', I.duel, 'violet', 'Duel à deux', 'Un seul téléphone')}
        ${card('sub', '<span class="glyph">ñ</span>', 'light', 'Les sons', '13 règles', { arg: 'sounds' })}
        ${card('sub', I.bulb, 'gold', 'Sur place', 'Les codes', { arg: 'tips' })}
      </div></main>`;
  }
  function viewSub(anim) {
    const sounds = V.sub === 'sounds';
    const d = dest();
    const tips = D.tips.slice();
    if (d.south) tips.push(D.south);
    if (d.pack) tips.push(Object.assign({ i: 'globe' }, D.packs[d.pack].tip));
    const TONES = ['', 'violet', 'gold', 'green'];
    const body = sounds
      ? `<div class="grid3">${D.sounds.map((s, k) => `<button class="lt" data-act="sound" data-arg="${k}" aria-label="${escA(s.t)}">${esc(s.k)}</button>`).join('')}</div>`
      : `<ul class="tips">${tips.map((t, i) => `<li class="tipc"><span class="tile ${TONES[i % 4]}">${I[t.i] || I.bulb}</span><span class="w"><h3>${esc(t.t)}</h3><p>${esc(t.d)}</p></span></li>`).join('')}</ul>`;
    return `<div class="screen"><header class="shead"><button class="icon-btn" data-act="back" aria-label="Retour">${I.back}</button><h1 style="font-size:20px;font-weight:900;color:var(--ink);text-align:center">${sounds ? 'Les sons' : 'Sur place'}</h1><span class="side"></span></header>
      <main class="page${anim ? ' pop' : ''}" style="padding-top:8px">${body}</main></div>`;
  }
  function soundSheet(k) {
    const s = D.sounds[k];
    return `<div class="sheet" role="dialog" aria-label="${escA(s.t)}"><div class="grab"></div>
      <div class="sheet-head"><span class="tile light"><span class="glyph">${esc(s.k)}</span></span><h2>${esc(s.t)}</h2></div>
      <p class="rule">${esc(s.d)}</p>
      <div class="exs">${s.ex.map(([es, p, gl]) => `<button class="exb" data-act="say" data-arg="${escA(es)}"><span class="sp">${I.speaker}</span><span class="w"><span class="es" lang="es">${esc(es)}${gl ? ` <span class="gl">${esc(gl)}</span>` : ''}</span><span class="ph keep">${ph(p)}</span></span></button>`).join('')}</div>
    </div>`;
  }

  /* --------------------------------------------------------------- card */
  const withA = es => (es.startsWith('el ') ? `al ${es.slice(3)}` : `a ${es}`);
  const joinEs = a => (a.length < 2 ? a[0] || '' : `${a.slice(0, -1).join(', ')} y ${a[a.length - 1]}`);
  function cardList() {
    const C = P().card, g = gEnd(), L = [];
    L.push({ k: 'help', es: D.card.help.es, fr: D.card.help.fr, hero: true });
    if (C.hotel) L.push({ k: 'hotel', es: `Al hotel ${C.hotel}, por favor.`, fr: `À l’hôtel ${C.hotel}, s’il vous plaît.` });
    if (C.addr) L.push({ k: 'addr', es: C.addr, fr: 'Mon adresse ici' });
    const al = (C.allergens || []).map(id => D.card.allergens.find(a => a.id === id)).filter(Boolean);
    if (al.length) L.push({ k: 'allergy', es: `Soy alérgic${g} ${joinEs(al.map(a => withA(a.es)))}. Es muy importante.`, fr: `Je suis allergique : ${al.map(a => a.fr).join(', ')}. C’est très important.` });
    (C.diets || []).forEach(id => { const x = D.card.diets.find(y => y.id === id); if (x) L.push({ k: `diet-${id}`, es: x.es.replace('{g}', g), fr: x.fr }); });
    if (prof().name) L.push({ k: 'name', es: `Me llamo ${prof().name}.`, fr: `Je m’appelle ${prof().name}.` });
    L.push({ k: 'sos', es: D.card.sos.es, fr: D.card.sos.fr });
    const favs = Object.keys(P().favs).map(findItem).filter(Boolean);
    favs.forEach(it => L.push({ k: `fav-${it.id}`, es: it.es, fr: it.fr, lang: it.lang, fav: true }));
    return L;
  }
  const scardHTML = c => `<div class="scard${c.hero ? ' hero' : ''}"><p class="es" lang="es">${esc(c.es)}</p><p class="fr">${esc(c.fr)}</p><div class="acts">${canSay(c.lang || 'es') ? `<button class="press${c.hero ? ' plain' : ''} spk sm" data-act="say" data-arg="${escA(c.es)}" data-lang="${c.lang || 'es'}" aria-label="Écouter">${I.speaker}</button>` : ''}<button class="press plain spk sm" data-act="showc" data-arg="${escA(c.k)}" aria-label="Montrer en grand">${I.expand}</button></div></div>`;
  function viewCard(anim) {
    const L = cardList(), C = P().card;
    const filled = C.hotel || C.addr || (C.allergens || []).length || (C.diets || []).length;
    const mine = L.filter(c => !c.fav), favs = L.filter(c => c.fav);
    return `<main class="page${anim ? ' pop' : ''}">
      <div class="ptitle"><h1>Ma carte</h1><button class="press plain spk sm" data-act="sheet" data-arg="editcard" aria-label="Modifier ma carte">${I.edit}</button></div>
      ${mine.map(scardHTML).join('')}
      ${filled ? '' : `<button class="addcard" data-act="sheet" data-arg="editcard">${I.plus}<span>Ajoute ton hôtel, tes allergies et ton régime</span></button>`}
      ${favs.length ? `<h2 class="gh">Favoris</h2>${favs.map(scardHTML).join('')}` : ''}
    </main>`;
  }
  function editCardSheet() {
    const C = P().card;
    return `<div class="sheet" role="dialog" aria-label="Modifier ma carte"><div class="grab"></div>
      <div class="field"><label for="c-hotel">Hôtel</label><input class="inp" id="c-hotel" value="${escA(C.hotel)}" placeholder="Hotel Sol" autocomplete="off" autocapitalize="words"></div>
      <div class="field"><label for="c-addr">Adresse</label><input class="inp" id="c-addr" value="${escA(C.addr)}" placeholder="Calle Mayor 12, Madrid" autocomplete="off"></div>
      <p class="flabel">Allergies</p><div class="chips" style="margin:8px 0 18px">${D.card.allergens.map(a => `<button class="chip" data-act="calg" data-arg="${a.id}" aria-pressed="${C.allergens.includes(a.id)}">${esc(a.fr)}</button>`).join('')}</div>
      <p class="flabel">Régime</p><div class="chips" style="margin:8px 0 6px">${D.card.diets.map(x => `<button class="chip" data-act="cdiet" data-arg="${x.id}" aria-pressed="${C.diets.includes(x.id)}">${esc(x.fr.replace(/\.$/, ''))}</button>`).join('')}</div>
      <div class="stack"><button class="press btn" data-act="close">OK</button></div></div>`;
  }

  /* ---------------------------------------------------------------- lex */
  const CATS = () => [['all', 'Tout'], ['phr', 'Phrases'], ['fav', 'Favoris'], ['carte', 'À table'], ['panneaux', 'Panneaux'], ['pieges', 'Faux amis']].concat(packL() ? [['pack', D.packs[dest().pack].es]] : []);
  function lexEntries() {
    const out = [];
    D.lessons.forEach(L => L.items.forEach(it => out.push({ id: it.id, cat: 'phr', group: L.t, es: it.es, fr: it.fr, ph: it.ph, n: it.n, lang: 'es', item: it })));
    if (packL()) packL().items.forEach(it => out.push({ id: it.id, cat: 'pack', group: packL().t, es: it.es, fr: it.fr, ph: it.ph, lang: it.lang, item: it }));
    D.extras.forEach(x => x.items.forEach((it, i) => out.push({ id: `${x.id}.${i}`, cat: x.id, group: x.t, es: it.es, fr: it.fr, ph: it.ph, n: it.n, lang: 'es' })));
    return out;
  }
  function lexResults() {
    const q = norm(V.q), F = P().favs;
    const list = lexEntries().filter(e => (V.cat === 'all' || e.cat === V.cat || (V.cat === 'fav' && F[e.id])) && (!q || norm(`${e.es} ${e.fr} ${e.n || ''}`).includes(q)));
    if (!list.length) return `<div class="empty">${V.cat === 'fav' ? `${I.star}<span>Touche l’étoile d’une expression pour la garder ici et sur ta carte.</span>` : I.search}</div>`;
    let html = '', g = null;
    for (const e of list) {
      if (e.group !== g) { if (g !== null) html += '</ul>'; g = e.group; html += `<h2 class="gh">${esc(g)}</h2><ul class="lx">`; }
      const open = V.open === e.id;
      const l = e.item ? lv(e.id) : 0;
      const str = e.item ? `<span class="str" aria-label="Niveau ${l} sur 4">${[1, 2, 3, 4].map(k => `<i class="${l >= k ? 'on' : ''}"></i>`).join('')}</span>` : '';
      const canStar = !!e.item;
      html += `<li><button class="lx-row" data-act="lx" data-arg="${e.id}" aria-expanded="${open}"><span class="w"><span class="es" lang="es">${esc(e.es)}</span><span class="fr">${esc(e.fr)}</span></span><span class="end">${str}${I.chev}</span></button>${open
        ? `<div class="lx-more">${phLine(e.ph) || '<span></span>'}<span class="acts">${canSay(e.lang) ? `<button class="press spk sm" data-act="say" data-arg="${escA(e.es)}" data-lang="${e.lang}" aria-label="Écouter">${I.speaker}</button><button class="press plain spk sm" data-act="slow" data-arg="${escA(e.es)}" data-lang="${e.lang}" aria-label="Lentement">${I.snail}</button>` : ''}${canStar ? `<button class="press plain spk sm${F[e.id] ? ' star-on' : ''}" data-act="fav" data-arg="${e.id}" aria-pressed="${!!F[e.id]}" aria-label="Favori">${F[e.id] ? I.starf : I.star}</button>` : ''}<button class="press plain spk sm" data-act="show" data-arg="${e.id}" aria-label="Montrer en grand">${I.expand}</button></span></div>`
        : ''}</li>`;
    }
    return `${html}</ul>`;
  }
  const viewLex = anim => `<main class="page${anim ? ' pop' : ''}">
      <div class="search">${I.search}<label class="sr" for="q">Chercher</label><input id="q" type="search" value="${escA(V.q)}" placeholder="Chercher" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"></div>
      <div class="chips scroll" role="group" aria-label="Filtrer">${CATS().map(([id, label]) => `<button class="chip" data-act="cat" data-arg="${id}" aria-pressed="${V.cat === id}">${esc(label)}</button>`).join('')}</div>
      <div id="lxres">${lexResults()}</div></main>`;
  const refreshLex = () => { const box = document.getElementById('lxres'); if (box) box.innerHTML = lexResults(); };

  /* ----------------------------------------------------------------- me */
  function weekRow() {
    const days = P().days, out = [], d = new Date(), names = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) {
      const k = dkey(d), on = days[k] > 0, isToday = i === 6;
      out.push(`<span class="day${on ? ' on' : ''}${isToday ? ' today' : ''}"><i>${on ? I.sun : ''}</i>${names[d.getDay()]}</span>`);
      d.setDate(d.getDate() + 1);
    }
    return `<div class="week" aria-label="Sept derniers jours">${out.join('')}</div>`;
  }
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => navigator.standalone === true || !!(window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  const needsInstall = () => !inFrame && isIOS && !standalone();
  let SWREADY = false;
  function viewMe(anim) {
    const pf = prof(), Dd = P(), st = streak();
    const xpAll = Object.values(Dd.days).reduce((a, b) => a + b, 0);
    const sc = SCENES.filter(s => Dd.sc[s.id]).length;
    const left = daysLeft();
    const medals = BADGES.map(b => { const got = !!Dd.badges[b.k]; return `<button class="medal${got ? '' : ' lock'}" data-act="badge" data-arg="${b.k}"><span class="m" style="--c:var(--${b.c});--cd:var(--${b.c}-d)">${I[b.i]}</span><span>${esc(b.t)}</span></button>`; }).join('');
    const tog = (key, icon, label) => `<div class="set"><span class="ic">${icon}</span><span class="t" id="l-${key}">${label}</span><button class="toggle" role="switch" aria-checked="${!!S.set[key]}" aria-labelledby="l-${key}" data-act="toggle" data-arg="${key}"></button></div>`;
    const row = (act, arg, icon, label, val, cls = '') => `<button class="set ${cls}" data-act="${act}"${arg ? ` data-arg="${arg}"` : ''}><span class="ic">${icon}</span><span class="t">${label}</span>${val ? `<span class="v">${val}</span>` : ''}${I.chevr}</button>`;
    let off;
    if (inFrame) off = `<a class="set" href="${PAGES_URL}" target="_blank" rel="noopener" style="text-decoration:none"><span class="ic">${I.cloud}</span><span class="t">Version hors ligne</span>${I.chevr}</a>`;
    else if (needsInstall()) off = row('sheet', 'install', I.addsq, 'Installer sur l’iPhone', '');
    else off = `<div class="set ${SWREADY ? 'ok' : ''}"><span class="ic">${I.cloud}</span><span class="t">${SWREADY ? 'Prête hors ligne' : 'Préparation hors ligne…'}</span></div>`;
    const goal = GOALS.find(g => g[0] === S.goal) || GOALS[1];
    return `<main class="page${anim ? ' pop' : ''}">
      <section class="mehead"><span class="avatar lg" style="--c:${pf.color}">${esc(initial(pf.name))}</span><div><h1>${esc(pf.name)}</h1><p class="sub">${esc(dest().t)}${left != null && left > 0 ? ` · J-${left}` : ''}</p></div></section>
      <div class="stats4">
        <div class="sbox">${I.sun}<div><b>${st}</b><span>${st > 1 ? 'jours de suite' : 'jour de suite'}</span></div></div>
        <div class="sbox" style="--c:var(--blue)">${I.bolt}<div><b>${xpAll}</b><span>XP</span></div></div>
        <div class="sbox" style="--c:var(--green)">${I.book}<div><b>${totalMastered()}</b><span>expressions</span></div></div>
        <div class="sbox" style="--c:var(--violet)">${I.chat}<div><b>${sc}/${SCENES.length}</b><span>situations</span></div></div>
      </div>
      ${weekRow()}
      <h2 class="gh">Badges</h2><div class="bgrid">${medals}</div>
      <h2 class="gh">Réglages</h2>
      <div class="setlist">
        ${row('sheet', 'profiles', I.swap, S.profiles.length > 1 ? 'Changer de profil' : 'Ajouter un profil', S.profiles.length > 1 ? esc(pf.name) : '')}
        ${row('sheet', 'goal', I.bolt, 'Objectif du jour', `${goal[0]} XP`)}
        ${row('sheet', 'dest', I.plane, 'Destination', esc(dest().t))}
        ${T.ok ? tog('auto', I.speaker, 'Son automatique') + tog('slow', I.snail, 'Voix lente') : ''}
        ${tog('sfx', I.sparkle, 'Effets sonores')}
        ${tog('ph', '<span style="font-size:16px;font-weight:900">Aa</span>', 'Phonétique')}
        ${off}
        <button class="set danger" data-act="reset"><span class="ic">${I.trash}</span><span class="t">${V.arm ? 'Toucher encore pour tout effacer' : 'Effacer ma progression'}</span></button>
      </div>
      <div class="about">${logoHTML()}<p>Parle espagnol dès l’atterrissage.</p><div class="promise"><span>${I.check}Hors ligne</span><span>${I.check}Sans pub</span><span>${I.check}Sans compte</span></div><p style="margin-top:12px">Version ${esc(BUILD)}</p></div>
    </main>`;
  }

  /* ------------------------------------------------------------- sheets */
  function profilesSheet() {
    const list = S.profiles.map(p => `<button class="set" data-act="switch" data-arg="${p.id}"><span class="avatar" style="--c:${p.color}">${esc(initial(p.name))}</span><span class="t">${esc(p.name)}</span>${p.id === prof().id ? `<span class="ic" style="background:var(--green-l);color:var(--green)">${I.check}</span>` : ''}</button>`).join('');
    const add = S.profiles.length < 2 ? `<div class="field" style="margin-top:18px"><label for="np">Ajouter un profil</label><input class="inp" id="np" placeholder="Prénom" autocomplete="off" autocapitalize="words"></div>
      <div class="chips" style="margin-bottom:6px"><button class="chip" data-act="npg" data-arg="o" aria-pressed="${V.npg !== 'a'}" lang="es">Encantado<small>homme</small></button><button class="chip" data-act="npg" data-arg="a" aria-pressed="${V.npg === 'a'}" lang="es">Encantada<small>femme</small></button></div>
      <div class="stack"><button class="press btn" data-act="addp">Ajouter</button></div>` : '';
    return `<div class="sheet" role="dialog" aria-label="Profils"><div class="grab"></div><div class="setlist">${list}</div>${add}</div>`;
  }
  const destSheet = () => `<div class="sheet" role="dialog" aria-label="Destination"><div class="grab"></div>
      <div class="sheet-head"><span class="tile">${I.plane}</span><h2>Où vas-tu ?</h2></div>
      <div class="grid2">${D.dests.map(x => `<button class="chip big" data-act="setdest" data-arg="${x.id}" aria-pressed="${S.dest === x.id}">${esc(x.t)}<small lang="es">${esc(x.es)}</small></button>`).join('')}</div>
      <div class="field" style="margin-top:18px"><label for="trip">Départ</label><input class="inp" id="trip" type="date" value="${escA(S.date)}"></div>
      <button class="press btn" data-act="close">OK</button></div>`;
  const goalSheet = () => `<div class="sheet" role="dialog" aria-label="Objectif"><div class="grab"></div>
      <div class="sheet-head"><span class="tile">${I.bolt}</span><h2>Ton rythme</h2></div>
      <div class="stack" style="margin-top:0">${GOALS.map(([xp, t, s]) => `<button class="chip big" data-act="setgoal" data-arg="${xp}" aria-pressed="${S.goal === xp}" style="text-align:left">${t} · ${xp} XP<small>${s}</small></button>`).join('')}</div></div>`;
  const installSheet = () => `<div class="sheet" role="dialog" aria-label="Installer"><div class="grab"></div>
      <div class="sheet-head"><span class="tile">${I.cloud}</span><div><h2>Installe ¡Vale!</h2><p class="sub">Elle marchera sans réseau, comme une app</p></div></div>
      <div class="steps">
        <div class="step"><span class="n">${I.share}</span><span>Dans Safari, touche Partager (parfois sous « ⋯ »)</span></div>
        <div class="step"><span class="n">${I.addsq}</span><span>Choisis « Sur l’écran d’accueil »</span></div>
        <div class="step"><span class="n">${I.check}</span><span>Ouvre ¡Vale! depuis l’écran d’accueil et apprends depuis là</span></div>
      </div>
      <div class="stack"><button class="press btn" data-act="close">Compris</button></div></div>`;
  function badgeSheet(k) {
    const b = BADGES.find(x => x.k === k), at = P().badges[k];
    return `<div class="sheet" role="dialog" aria-label="${escA(b.t)}"><div class="grab"></div>
      <div class="sheet-head"><span class="tile ${at ? b.c === 'blue' ? '' : b.c : 'grey'}">${I[b.i]}</span><div><h2>${esc(b.t)}</h2><p class="sub">${esc(b.d)}</p></div></div>
      <p class="rule">${at ? `Débloqué le ${new Date(at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.` : 'Pas encore débloqué.'}</p></div>`;
  }
  function viewSheet(fresh) {
    const sh = V.sheet;
    const inner = sh.k === 'node' ? nodeSheet(sh.i) : sh.k === 'sound' ? soundSheet(sh.i) : sh.k === 'profiles' ? profilesSheet()
      : sh.k === 'dest' ? destSheet() : sh.k === 'goal' ? goalSheet() : sh.k === 'install' ? installSheet() : sh.k === 'editcard' ? editCardSheet() : sh.k === 'badge' ? badgeSheet(sh.i) : '';
    return `<div class="scrim${fresh ? ' in' : ''}" data-act="close">${inner}</div>`;
  }
  const viewShow = fresh => `<div class="show${fresh ? ' in' : ''}" role="dialog" aria-label="Phrase en grand">
      <button class="icon-btn x" data-act="unshow" aria-label="Fermer">${I.close}</button>
      <p class="big" lang="es">${esc(V.show.es)}</p><p class="fr">${esc(V.show.fr)}</p>
      ${canSay(V.show.lang || 'es') ? `<button class="press spk sp" data-act="say" data-arg="${escA(V.show.es)}" data-lang="${V.show.lang || 'es'}" aria-label="Écouter">${I.speaker}</button>` : ''}</div>`;

  /* ========================================================= onboarding */
  function viewOnboard() {
    const f = V.obf, st = V.ob;
    const dots = `<div class="dots">${[0, 1, 2, 3].map(i => `<i class="${i === st ? 'on' : ''}"></i>`).join('')}</div>`;
    const back = st > 0 ? `<button class="icon-btn" data-act="obback" aria-label="Retour" style="position:absolute;left:10px;top:calc(var(--top) + 6px)">${I.back}</button>` : '';
    let body = '', foot = '';
    if (st === 0) {
      body = `${sol('cheer', 150, 'bob')}${logoHTML().replace('class="logo"', 'class="logo" style="font-size:64px"')}<p class="lead">Parle espagnol dès l’atterrissage.</p><div class="promise"><span>${I.check}Hors ligne</span><span>${I.check}Sans pub</span><span>${I.check}Sans compte</span></div>`;
      foot = needsInstall() && !S.installSeen
        ? `<button class="press btn" data-act="obinstall">Installer l’app</button><button class="textbtn" data-act="obnext">Continuer dans Safari</button>`
        : `<button class="press btn" data-act="obnext">C’est parti</button>`;
    } else if (st === 1) {
      const gChips = (k, v) => `<div class="chips"><button class="chip" data-act="obg" data-arg="${k}:o" aria-pressed="${v !== 'a'}" lang="es">Encantado<small>homme</small></button><button class="chip" data-act="obg" data-arg="${k}:a" aria-pressed="${v === 'a'}" lang="es">Encantada<small>femme</small></button></div>`;
      body = `<h1>Comment tu t’appelles ?</h1>
        <input class="inp" id="o-n1" value="${escA(f.n1)}" placeholder="Prénom" autocomplete="given-name" autocapitalize="words">
        ${gChips('g1', f.g1)}
        <div class="switchrow"><span style="font-size:17px;font-weight:800;color:var(--ink)">On part à deux</span><button class="toggle" role="switch" aria-checked="${f.duo}" aria-label="On part à deux" data-act="obduo"></button></div>
        ${f.duo ? `<input class="inp" id="o-n2" value="${escA(f.n2)}" placeholder="Prénom" autocomplete="off" autocapitalize="words">${gChips('g2', f.g2)}` : ''}`;
      foot = '<button class="press btn" data-act="obnext">Suivant</button>';
    } else if (st === 2) {
      body = `<h1>Où vas-tu ?</h1>
        <div class="grid2">${D.dests.map(x => `<button class="chip big" data-act="obdest" data-arg="${x.id}" aria-pressed="${f.dest === x.id}">${esc(x.t)}<small lang="es">${esc(x.es)}</small></button>`).join('')}</div>
        <div class="field"><label for="o-date">Départ</label><input class="inp" id="o-date" type="date" value="${escA(f.date)}"></div>`;
      foot = '<button class="press btn" data-act="obnext">Suivant</button>';
    } else {
      body = `<h1>Ton rythme</h1><div class="stack" style="margin-top:0">${GOALS.map(([xp, t, s]) => `<button class="chip big" data-act="obgoal" data-arg="${xp}" aria-pressed="${f.goal === xp}" style="text-align:left">${t} · ${xp} XP<small>${s}</small></button>`).join('')}</div>`;
      foot = '<button class="press btn" data-act="obdone">Commencer</button>';
    }
    return `<div class="ob${st === 0 ? ' hello' : ''}" style="position:relative">${back}${st > 0 ? dots : ''}<div class="body">${body}</div><div class="foot">${foot}</div></div>`;
  }
  function finishOnboarding() {
    const f = V.obf;
    S.profiles = [{ id: 'p1', name: (f.n1 || 'Moi').trim().slice(0, 24), g: f.g1, color: COLORS[0] }];
    if (f.duo) S.profiles.push({ id: 'p2', name: (f.n2 || 'Mon duo').trim().slice(0, 24), g: f.g2, color: COLORS[1] });
    S.active = 'p1'; S.dest = f.dest; S.date = f.date; S.goal = f.goal;
    S.profiles.forEach(p => { S.data[p.id] = S.data[p.id] || blank(); });
    if (S.migrate) { Object.assign(S.data.p1.p, S.migrate.p); Object.assign(S.data.p1.sc, S.migrate.sc); delete S.migrate; }
    S.ob = true; save();
    V.mode = 'tabs'; V.tab = 'path';
    render({ vt: true, cur: true });
  }

  /* ============================================================ session */
  const POOL = 4;
  function startSession(items, meta) {
    stopAll();
    const test = meta.kind === 'test';
    const cards = items.map(it => { const l = lv(it.id); const s = test ? 1 : l >= 4 ? 3 : Math.min(l, 2); return { it, lv: s, start: s, best: s }; });
    SS = { meta, cards, queue: test ? shuffle(cards) : cards.slice(), active: [], last: null, cur: null, answered: 0, correct: 0, t0: Date.now(), combo: 0, comboMax: 0, xp: 0, steps: 0, matched: test };
    refill();
    V.mode = 'session'; V.sheet = null;
    nextStep();
    if (V.mode !== 'session') return;
    render({ top: true, anim: true, vt: true });
    speakCurrent();
  }
  function refill() { const max = SS.meta.kind === 'test' ? 1 : POOL; while (SS.active.length < max && SS.queue.length) SS.active.push(SS.queue.shift()); }
  function typeFor(c) {
    const it = c.it, voice = canSay(it.lang);
    if (SS.meta.kind === 'test') return Math.random() < 0.5 ? 'reco' : 'prod';
    if (c.lv === 0) return 'learn';
    if (c.lv === 1) return pick(['reco', 'reco'].concat(voice ? ['listen'] : [], it.tFR ? ['tilesFR'] : []));
    if (c.lv === 2) return pick(['prod'].concat(it.tES ? ['tilesES', 'tilesES'] : [], voice && it.tES ? ['dict'] : []));
    return REC.ok && !REC.denied ? 'speak' : 'recall';
  }
  function distractors(it, field, n = 3) {
    const seen = new Set([norm(it[field])]), out = [];
    const kind = o => (o.k || '') === (it.k || '');
    const fits = o => o !== it && !(it.g && o.g === it.g) && !seen.has(norm(o[field]));
    const take = list => { for (const o of shuffle(list)) { if (out.length >= n) break; if (fits(o)) { out.push(o); seen.add(norm(o[field])); } } };
    take(it.L.items.filter(kind));
    if (out.length < n && !it.L.pack) take(ITEMS.filter(kind));
    if (out.length < n) take(it.L.pack ? it.L.items : ITEMS);
    return out;
  }
  const buildOpts = (it, type) => { const field = type === 'prod' ? 'es' : 'fr'; return shuffle([{ t: it[field], ok: true }, ...distractors(it, field).map(d => ({ t: d[field], ok: false }))]); };
  function makeTiles(it, lang) {
    const target = lang === 'fr' ? it.tFR : it.tES;
    const tset = new Set(target.map(norm)), seen = new Set(), extra = [];
    const want = Math.max(2, Math.min(4, 9 - target.length));
    const others = shuffle(it.L.items.filter(o => o !== it)).flatMap(o => (lang === 'fr' ? tokFR(o.fr) : tokES(o.es)));
    for (const w of others) {
      const k = norm(w);
      if (!k || !wordOK(w) || tset.has(k) || seen.has(k)) continue;
      seen.add(k); extra.push(w);
      if (extra.length >= want) break;
    }
    return { lang, target, bank: shuffle(target.concat(extra)).map((t, id) => ({ id, t, used: false })), ans: [], checked: null };
  }
  const makeMatch = items => ({ items, left: shuffle(items.map((it, i) => ({ i, t: it.es }))), right: shuffle(items.map((it, i) => ({ i, t: it.fr }))), sel: null, done: [], bad: null });
  function nextStep() {
    if (!SS.matched && SS.steps >= 7) {
      const known = SS.cards.filter(c => c.lv >= 1 && c.it.fr.length <= 34 && c.it.es.length <= 30);
      if (known.length >= 4) { SS.matched = true; SS.steps++; SS.cur = { type: 'match', m: makeMatch(shuffle(known).slice(0, 5).map(c => c.it)) }; return; }
    }
    if (!SS.active.length) { finish(); return; }
    let i = 0;
    if (SS.active.length > 1 && SS.active[0] === SS.last) i = 1;
    const c = SS.active.splice(i, 1)[0], type = typeFor(c);
    SS.steps++;
    const cur = { c, type, picked: null, done: false, ok: null, revealed: false };
    if (type === 'reco' || type === 'prod' || type === 'listen') cur.opts = buildOpts(c.it, type);
    if (type === 'tilesFR' || type === 'tilesES' || type === 'dict') cur.tl = makeTiles(c.it, type === 'tilesFR' ? 'fr' : 'es');
    if (type === 'speak') cur.rec = 'idle';
    SS.cur = cur;
  }
  // Levels: 0 new · 1 seen · 2 recognised · 3 produced · 4 recalled (mastered).
  function settle(ok) {
    const { c, type } = SS.cur;
    if (type !== 'learn') { SS.answered++; if (ok) SS.correct++; }
    SS.last = c;
    if (SS.meta.kind === 'test') { refill(); return; }
    if (type === 'learn') c.lv = 1;
    else if (type === 'reco' || type === 'listen' || type === 'tilesFR') c.lv = ok ? 2 : 1;
    else if (type === 'prod' || type === 'tilesES' || type === 'dict') c.lv = ok ? 3 : 1;
    else c.lv = ok ? 4 : 2;
    c.best = Math.max(c.best, c.lv);
    const old = lv(c.it.id);
    setLv(c.it.id, ok ? Math.max(old, c.lv) : Math.min(old, c.lv));
    if (c.lv < 4) SS.active.push(c); else refill();
  }
  function answer(ok) {
    const cur = SS.cur;
    cur.done = true; cur.ok = ok;
    settle(ok);
    noteMiss(cur.c.it, ok);
    if (ok) { SS.combo++; SS.comboMax = Math.max(SS.comboMax, SS.combo); quest('combo', SS.combo); SS.xp++; addXP(1); sfx('ok', SS.combo); }
    else { SS.combo = 0; sfx('bad'); }
    save();
    render();
    if (cur.type === 'prod' || cur.type === 'tilesES') autoSay(cur.c.it.es, cur.c.it.lang);
    if (ok) timer = setTimeout(() => { if (SS && SS.cur === cur) advance(); }, cur.type === 'reco' ? 1100 : 1700);
  }
  function advance() {
    clearTimeout(timer);
    if (!SS) return;
    recStop();
    nextStep();
    if (V.mode !== 'session') return;
    render({ top: true, anim: true });
    speakCurrent();
  }
  function speakCurrent() {
    const cur = SS && SS.cur;
    if (!cur || !cur.c) return;
    if (cur.type === 'learn' || cur.type === 'reco' || cur.type === 'listen' || cur.type === 'dict') autoSay(cur.c.it.es, cur.c.it.lang);
  }
  function finish() {
    const kind = SS.meta.kind, acc = SS.answered ? Math.round((100 * SS.correct) / SS.answered) : 100;
    let bonus = 0, passed = null;
    if (kind === 'test') { passed = acc >= 80; if (passed) { SS.meta.L.items.forEach(it => setLv(it.id, 4)); bonus = 10; } }
    else {
      bonus = 5 + (acc === 100 ? 5 : 0);
      if (kind === 'lesson') { P().st.lessons++; quest('lesson'); if (acc === 100) P().st.perfect++; }
    }
    addXP(bonus); SS.xp += bonus; save();
    SS.result = { n: SS.cards.length, acc, min: Math.max(1, Math.round((Date.now() - SS.t0) / 60000)), xp: SS.xp, passed };
    V.mode = 'result';
    sfx('done');
    render({ top: true, party: passed !== false, vt: true });
    checkBadges();
  }
  const progress = () => {
    if (SS.meta.kind === 'test') return Math.round((100 * SS.answered) / SS.cards.length);
    const need = SS.cards.reduce((a, c) => a + (4 - c.start), 0), got = SS.cards.reduce((a, c) => a + (c.best - c.start), 0);
    return need ? Math.round((100 * got) / need) : 100;
  };
  function sessionBanner(cur) {
    const it = cur.c.it, ok = cur.ok, t = cur.type;
    const esLine = `<p class="s" lang="es">${esc(it.es)}</p>${phLine(it.ph)}`;
    if (ok) return banner(true, `<p class="h" lang="es">${pick(PRAISE)}</p>`, t === 'reco' || t === 'tilesFR' ? '' : esLine, 'next');
    if (t === 'prod' || t === 'tilesES' || t === 'dict') return banner(false, `<p class="h" lang="es">${esc(it.es)}</p>`, `${t === 'dict' ? `<p class="s">${esc(it.fr)}</p>` : ''}${phLine(it.ph)}`, 'next');
    return banner(false, `<p class="h">${esc(it.fr)}</p>`, t === 'listen' ? `<p class="s" lang="es">${esc(it.es)}</p>` : '', 'next');
  }
  function tilesHTML(tl) {
    const ans = tl.ans.map(id => `<button class="tl${id === tl.last ? ' new' : ''}" data-act="tback" data-arg="${id}"${tl.lang === 'es' ? ' lang="es"' : ''}>${esc(tl.bank[id].t)}</button>`).join('');
    tl.last = null;
    const bank = tl.bank.map(b => `<button class="tl${b.used ? ' used' : ''}" data-act="tpick" data-arg="${b.id}"${tl.lang === 'es' ? ' lang="es"' : ''}${b.used ? ' aria-hidden="true" tabindex="-1"' : ''}>${esc(b.t)}</button>`).join('');
    return `<div class="answer${tl.checked ? ` ${tl.checked}` : ''}" aria-label="Ta phrase">${ans}</div><div class="bank">${bank}</div>`;
  }
  function viewSession(anim) {
    const cur = SS.cur;
    let body = '', foot = '';
    const combo = SS.combo >= 3 ? `<span class="combo" aria-label="${SS.combo} bonnes réponses d’affilée">${I.sun}${SS.combo}</span>` : '';
    if (cur.type === 'match') {
      const m = cur.m;
      const btn = (side, o) => {
        const done = m.done.includes(o.i), sel = m.sel && m.sel.side === side && m.sel.i === o.i;
        const bad = m.bad && m.bad.some(b => b.side === side && b.i === o.i);
        return `<button class="pr${done ? ' ok' : ''}${sel ? ' sel' : ''}${bad ? ' bad' : ''}" data-act="mpick" data-arg="${side}:${o.i}"${side === 'L' ? ' lang="es"' : ''}${done ? ' disabled' : ''}>${esc(o.t)}</button>`;
      };
      body = `<p class="kicker">${I.grid}Associe les paires</p><div class="pairs"><div class="col">${m.left.map(o => btn('L', o)).join('')}</div><div class="col">${m.right.map(o => btn('R', o)).join('')}</div></div>`;
      return `<div class="screen">${head(progress(), 'quit', combo)}<main class="stage${anim ? ' pop' : ''}">${body}</main></div>`;
    }
    const it = cur.c.it, lang = it.lang;
    if (cur.type === 'learn') {
      const echo = REC.ok && !REC.denied ? `<button class="press plain spk sm" data-act="echo" aria-label="Répéter et m’écouter">${cur.echo === 'rec' ? I.stop : I.mic}</button>` : '';
      body = `<div class="card">${canSay(lang) || echo ? `<div class="audio">${canSay(lang) ? `<button class="press spk say" data-act="say" data-arg="${escA(it.es)}" data-lang="${lang}" aria-label="Écouter">${I.speaker}</button><button class="press plain spk sm say" data-act="slow" data-arg="${escA(it.es)}" data-lang="${lang}" aria-label="Lentement">${I.snail}</button>` : ''}${echo}</div>` : ''}
        <h1 class="es-big" lang="es">${esc(it.es)}</h1>${phLine(it.ph)}<hr><p class="fr-big${it.k === 'num' ? ' num' : ''}">${esc(it.fr)}</p></div>
        ${cur.echo === 'done' ? `<div class="cmp"><button class="press plain" data-act="sayit">${I.speaker}Modèle</button><button class="press plain" data-act="playme">${I.play}Moi</button></div>` : ''}
        ${it.n ? `<p class="tip">${I.bulb}<span>${esc(it.n)}</span></p>` : ''}`;
      foot = '<button class="press btn" data-act="next">Continuer</button>';
    } else if (cur.type === 'reco') {
      body = `<div class="prompt">${canSay(lang) ? `<button class="press spk say" data-act="say" data-arg="${escA(it.es)}" data-lang="${lang}" aria-label="Écouter">${I.speaker}</button>` : ''}<div class="w"><h1 class="es-q" lang="es">${esc(it.es)}</h1>${phLine(it.ph)}</div></div>${optsHTML(cur.opts, cur.picked, false, 'pick')}`;
    } else if (cur.type === 'prod') {
      body = `<h1 class="fr-q">${esc(it.fr)}</h1>${optsHTML(cur.opts, cur.picked, true, 'pick')}`;
    } else if (cur.type === 'listen') {
      body = `${audioPair(it.es, lang, true)}${optsHTML(cur.opts, cur.picked, false, 'pick')}`;
    } else if (cur.type === 'tilesFR') {
      body = `<div class="prompt">${canSay(lang) ? `<button class="press spk say" data-act="say" data-arg="${escA(it.es)}" data-lang="${lang}" aria-label="Écouter">${I.speaker}</button>` : ''}<div class="w"><h1 class="es-q" lang="es">${esc(it.es)}</h1></div></div>${tilesHTML(cur.tl)}`;
      if (!cur.done) foot = `<button class="press btn" data-act="tcheck"${cur.tl.ans.length ? '' : ' disabled'}>Vérifier</button>`;
    } else if (cur.type === 'tilesES') {
      body = `<h1 class="fr-q">${esc(it.fr)}</h1>${tilesHTML(cur.tl)}`;
      if (!cur.done) foot = `<button class="press btn" data-act="tcheck"${cur.tl.ans.length ? '' : ' disabled'}>Vérifier</button>`;
    } else if (cur.type === 'dict') {
      body = `${audioPair(it.es, lang, true)}${tilesHTML(cur.tl)}`;
      if (!cur.done) foot = `<button class="press btn" data-act="tcheck"${cur.tl.ans.length ? '' : ' disabled'}>Vérifier</button>`;
    } else if (cur.type === 'speak') {
      if (cur.rec === 'done') {
        body = `<h1 class="fr-q">${esc(it.fr)}</h1><div class="card pop"><h2 class="es-big" lang="es">${esc(it.es)}</h2>${phLine(it.ph)}</div>
          <div class="cmp">${canSay(lang) ? `<button class="press plain" data-act="sayit">${I.speaker}Modèle</button>` : ''}<button class="press plain" data-act="playme">${I.play}Moi</button></div>`;
        foot = `<div class="pair"><button class="press red btn" data-act="grade" data-arg="0" aria-label="À revoir">${I.x}</button><button class="press green btn" data-act="grade" data-arg="1" aria-label="Bien dit">${I.check}</button></div>`;
      } else {
        const rec = cur.rec === 'rec';
        body = `<h1 class="fr-q">${esc(it.fr)}</h1>
          <button class="press mic${rec ? ' rec' : ''}" data-act="mic" aria-label="${rec ? 'Arrêter' : 'Dis-le en espagnol'}">${rec ? I.stop : I.mic}</button>
          ${rec ? '<div class="recbar"><i></i></div>' : '<p class="mic-hint">Dis-le en espagnol</p>'}`;
        foot = rec ? '' : '<button class="textbtn" data-act="reveal">Je ne peux pas parler</button>';
      }
    } else {
      body = `<h1 class="fr-q">${esc(it.fr)}</h1>${cur.revealed
        ? `<div class="card pop">${audioPair(it.es, lang)}<h2 class="es-big" lang="es">${esc(it.es)}</h2>${phLine(it.ph)}</div>`
        : '<button class="mystery" data-act="reveal" aria-label="Voir la réponse">?</button>'}`;
      foot = cur.revealed
        ? `<div class="pair"><button class="press red btn" data-act="grade" data-arg="0" aria-label="Pas encore">${I.x}</button><button class="press green btn" data-act="grade" data-arg="1" aria-label="Je savais">${I.check}</button></div>`
        : '<button class="press btn" data-act="reveal">Voir</button>';
    }
    const fb = cur.done && cur.type !== 'speak' && cur.type !== 'recall' ? sessionBanner(cur) : '';
    return `<div class="screen${fb ? ' has-fb' : ''}">${head(progress(), 'quit', combo)}
      <main class="stage${anim ? ' pop' : ''}">${body}</main>
      ${foot && !fb ? `<footer class="sfoot">${foot}</footer>` : ''}${fb}</div>`;
  }
  function viewResult() {
    const r = SS.result, kind = SS.meta.kind, failed = r.passed === false;
    const title = failed ? '¡Casi!' : r.acc >= 90 ? '¡Perfecto!' : r.acc >= 70 ? '¡Muy bien!' : '¡Bien hecho!';
    const sub = failed ? 'Presque : fais la leçon pour la valider' : kind === 'test' ? 'Leçon validée' : '';
    const g = xpToday(), goal = S.goal, st = streak();
    return `<div class="screen"><main class="result">
      ${sol(failed ? 'think' : 'cheer', 132, 'jump')}
      <h1 lang="es">${title}</h1>${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
      <div class="tiles3">
        <div class="stt" aria-label="${r.xp} XP gagnés"><div class="tp">${I.bolt}</div><div class="v">+${r.xp}</div></div>
        <div class="stt g" aria-label="Précision ${r.acc} %"><div class="tp">${I.target}</div><div class="v">${r.acc} %</div></div>
        <div class="stt b" aria-label="${r.min} minutes"><div class="tp">${I.clock}</div><div class="v">${r.min} min</div></div>
      </div>
      <div class="goalline"><div class="bar blue"><i style="width:${Math.min(100, Math.round((100 * g) / goal))}%"></i></div><span class="n">${Math.min(g, goal)}/${goal} XP</span></div>
      ${st ? `<p class="streakline">${I.sun}${st} ${st > 1 ? 'jours de suite' : 'jour de suite'}</p>` : ''}
    </main><footer class="sfoot">${failed
      ? `<div class="pair"><button class="press plain btn" data-act="home">Plus tard</button><button class="press btn" data-act="lesson" data-arg="${SS.meta.L.id}">La leçon</button></div>`
      : '<button class="press btn" data-act="home">Continuer</button>'}</footer></div>`;
  }

  /* ============================================================= scenes */
  function startScene(id) {
    stopAll();
    const s = SCN[id]; if (!s) return;
    SS = null;
    SC = { s, i: 0, log: [], opts: null, picked: null, errors: 0, done: false, xp: 0 };
    V.mode = 'scene'; V.sheet = null;
    const said = flowScene();
    render({ top: true, anim: true, vt: true });
    if (said.length) autoSay(said);
  }
  function flowScene() {
    const said = [], L = SC.s.lines;
    while (SC.i < L.length && L[SC.i].w === 't') { SC.log.push({ w: 't', es: L[SC.i].es, fr: L[SC.i].fr, open: false }); said.push(L[SC.i].es); SC.i++; }
    if (SC.i >= L.length) {
      SC.done = true; SC.opts = null;
      P().sc[SC.s.id] = { e: SC.errors, t: Date.now() };
      quest('scene'); addXP(5); SC.xp += 5; save();
      sfx('done'); setTimeout(checkBadges, 300);
    } else {
      SC.opts = shuffle(L[SC.i].o.map((t, k) => ({ t, ok: k === 0 })));
      SC.picked = null;
    }
    return said;
  }
  function sceneContinue() {
    clearTimeout(timer);
    if (!SC || SC.done || SC.picked == null) return;
    const line = SC.s.lines[SC.i];
    SC.log.push({ w: 'y', es: line.o[0] });
    SC.i++;
    const said = flowScene();
    render({ bottom: true, party: SC.done });
    if (S.set.auto) { say(line.o[0]).then(() => { if (said.length && SC) say(said, { queue: true }); }); }
  }
  const hinted = s => s.split(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)/).map((tok, i) => {
    if (i % 2 === 0) return esc(tok);
    const k = tok.toLowerCase();
    return D.gloss[k] ? `<button class="hw" data-act="hint" data-arg="${escA(k)}">${esc(tok)}</button>` : esc(tok);
  }).join('');
  function viewScene(anim) {
    const s = SC.s, total = s.lines.filter(l => l.w === 'y').length;
    const p = Math.round((100 * SC.log.filter(m => m.w === 'y').length) / total);
    const ava = `<span class="ava">${I[S_ICON[s.id]]}</span>`;
    const log = SC.log.map((m, k) => (m.w === 't'
      ? `<div class="msg them">${ava}<div class="bub"><div class="w"><p class="es" lang="es">${hinted(m.es)}</p>${m.open ? `<p class="tr">${esc(m.fr)}</p>` : ''}</div><div class="tools"><button class="mini say" data-act="sayline" data-arg="${k}" aria-label="Réécouter">${I.speaker}</button><button class="mini${m.open ? ' on' : ''}" data-act="tr" data-arg="${k}" aria-pressed="${m.open}" aria-label="Traduire">${I.globe}</button></div></div></div>`
      : `<div class="msg you"><div class="bub"><p class="es" lang="es">${esc(m.es)}</p></div></div>`)).join('');
    let foot, fb = '';
    if (SC.done) {
      const idx = SCENES.indexOf(s), nxt = SCENES[idx + 1];
      foot = `<div class="win"><span class="tile gold">${I.starf}</span><h2 lang="es">¡Conseguido!</h2></div>
        <div class="pair wide"><button class="press plain btn" data-act="scene" data-arg="${s.id}" aria-label="Rejouer">${I.replay}</button>${nxt && !P().sc[nxt.id] ? `<button class="press violet btn" data-act="scene" data-arg="${nxt.id}">Suivante</button>` : '<button class="press violet btn" data-act="home">Continuer</button>'}</div>`;
    } else {
      const y = s.lines[SC.i];
      foot = `<p class="task">${esc(y.task)}</p>${optsHTML(SC.opts, SC.picked, true, 'spick')}`;
      if (SC.picked != null && !SC.opts[SC.picked].ok) fb = banner(false, `<p class="h" lang="es">${esc(y.o[0])}</p>`, '', 'scont');
    }
    return `<div class="screen${fb ? ' has-fb' : ''}">${head(p, 'quit')}
      <main class="chat${anim ? ' pop' : ''}">${log}</main>
      <footer class="sfoot">${foot}</footer>${fb}</div>`;
  }

  /* ============================================================ chrono */
  function startChrono() {
    stopAll();
    const seen = seenItems().filter(it => it.es.length <= 26 && it.fr.length <= 30);
    const base = (seen.length >= 8 ? seen : LES.base.items.concat(LES.parler.items, LES.nombres.items)).filter(it => it.es.length <= 26 && it.fr.length <= 30);
    CH = { pool: shuffle(base), i: 0, uid: 0, items: {}, left: [], right: [], sel: null, bad: null, fresh: [], score: 0, t0: 0, dur: 60000, over: false };
    const uids = [0, 1, 2, 3, 4].map(() => chNew());
    CH.left = shuffle(uids); CH.right = shuffle(uids);
    V.mode = 'chrono'; V.sheet = null;
    render({ top: true, vt: true });
    CH.t0 = performance.now();
    chTick();
  }
  function chNew() {
    const used = new Set(CH.left.map(u => CH.items[u] && CH.items[u].id));
    let it = CH.pool[CH.i % CH.pool.length], guard = 0;
    while (used.has(it.id) && guard++ < CH.pool.length) { CH.i++; it = CH.pool[CH.i % CH.pool.length]; }
    CH.i++;
    const u = CH.uid++; CH.items[u] = it; return u;
  }
  function chTick() {
    if (!CH || CH.over || V.mode !== 'chrono') return;
    const left = Math.max(0, CH.dur - (performance.now() - CH.t0));
    const bar = document.querySelector('.timer');
    if (bar) { bar.firstElementChild.style.width = `${(100 * left) / CH.dur}%`; bar.classList.toggle('low', left < 10000); }
    if (left <= 0) {
      CH.over = true;
      const Dd = P(); Dd.st.pairs = Math.max(Dd.st.pairs, CH.score); save();
      sfx('done'); render({ party: CH.score >= 8 }); checkBadges();
      return;
    }
    raf = requestAnimationFrame(chTick);
  }
  function viewChrono() {
    if (CH.over) return actResult({ title: CH.score >= 12 ? '¡Rapidísimo!' : CH.score >= 6 ? '¡Muy bien!' : '¡Ánimo!', sub: `${CH.score} paire${CH.score > 1 ? 's' : ''} · record ${Math.max(P().st.pairs, CH.score)}`, again: 'chrono', mood: CH.score >= 6 ? 'cheer' : 'happy' });
    const btn = (side, pos) => {
      const u = side === 'L' ? CH.left[pos] : CH.right[pos], it = CH.items[u];
      const sel = CH.sel && CH.sel.side === side && CH.sel.pos === pos;
      const bad = CH.bad && CH.bad.some(b => b.side === side && b.pos === pos);
      const fresh = CH.fresh.includes(`${side}${pos}`);
      return `<button class="pr${sel ? ' sel' : ''}${bad ? ' bad' : ''}${fresh ? ' fresh' : ''}" data-act="chpick" data-arg="${side}:${pos}"${side === 'L' ? ' lang="es"' : ''}>${esc(side === 'L' ? it.es : it.fr)}</button>`;
    };
    return `<div class="screen"><header class="shead"><button class="icon-btn" data-act="quit" aria-label="Quitter">${I.close}</button><div class="bar timer"><i style="width:100%"></i></div><span class="side"><span class="score" aria-label="Score">${CH.score}</span></span></header>
      <main class="stage"><div class="pairs"><div class="col">${[0, 1, 2, 3, 4].map(p => btn('L', p)).join('')}</div><div class="col">${[0, 1, 2, 3, 4].map(p => btn('R', p)).join('')}</div></div></main></div>`;
  }

  /* ============================================================ prices */
  const U = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
  const TENS = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa' };
  function numEs(n, apoc) {
    let s = n < 30 ? U[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? ` y ${U[n % 10]}` : '') : n === 100 ? 'cien' : `ciento ${numEs(n - 100)}`;
    if (apoc) s = s.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un');
    return s;
  }
  const CONF = { 2: [12, 20], 3: [13, 30], 4: [14, 40], 5: [15, 50], 6: [16, 60], 7: [17, 70], 8: [18, 80], 9: [19, 90], 12: [2, 20], 13: [3, 30], 14: [4, 40], 15: [5, 50], 16: [6, 60], 17: [7, 70], 18: [8, 80], 19: [9, 90], 20: [12, 2], 30: [13, 3], 40: [14, 4], 50: [15, 5], 60: [70, 16], 70: [60, 17], 80: [18, 8], 90: [19, 9] };
  const fmtPrice = (e, c) => `${e},${pad(c)} €`;
  function genPrice() {
    const e = 1 + Math.floor(Math.random() * 49), c = pick([0, 0, 10, 20, 20, 30, 40, 50, 50, 60, 70, 80, 90, 95, 99]);
    const E = numEs(e, true), C = numEs(c);
    const text = e === 1 ? (c ? `Un euro con ${C}.` : 'Un euro.') : c ? pick([`Son ${E} euros con ${C}.`, `${cap(E)} con ${C}.`]) : `Son ${E} euros.`;
    const key = (x, y) => `${x}|${y}`, have = new Set([key(e, c)]), opts = [{ t: fmtPrice(e, c), ok: true }];
    const cand = [];
    (CONF[e] || []).forEach(x => cand.push([x, c]));
    if (c) (CONF[c] || [(c + 10) % 100]).forEach(y => cand.push([e, y]));
    cand.push([e + 10, c], [Math.max(1, e - 10), c], [e + 1, c], [e, (c + 50) % 100], [e > 9 ? (e % 10) * 10 + Math.floor(e / 10) : e + 20, c]);
    for (const [x, y] of shuffle(cand)) {
      if (opts.length >= 4) break;
      if (x < 1 || x > 99 || y < 0 || y > 99 || have.has(key(x, y))) continue;
      have.add(key(x, y)); opts.push({ t: fmtPrice(x, y), ok: false });
    }
    while (opts.length < 4) { const x = 1 + Math.floor(Math.random() * 60); if (!have.has(key(x, c))) { have.add(key(x, c)); opts.push({ t: fmtPrice(x, c), ok: false }); } }
    return { text, opts: shuffle(opts), picked: null };
  }
  function startPrices() {
    stopAll();
    PR = { i: 0, n: 10, ok: 0, cur: genPrice(), over: false, xp: 0 };
    V.mode = 'prices'; V.sheet = null;
    render({ top: true, anim: true, vt: true });
    say(PR.cur.text);
  }
  function viewPrices(anim) {
    if (PR.over) return actResult({ title: PR.ok >= 8 ? '¡Oído de oro!' : '¡Bien!', sub: `${PR.ok}/${PR.n} prix compris`, again: 'prices', mood: PR.ok >= 6 ? 'cheer' : 'happy', body: `<div class="tiles3"><div class="stt"><div class="tp">${I.bolt}</div><div class="v">+${PR.xp}</div></div><div class="stt g"><div class="tp">${I.target}</div><div class="v">${PR.ok}/${PR.n}</div></div><div class="stt b"><div class="tp">${I.euro}</div><div class="v">${P().st.prices}</div></div></div>` });
    const c = PR.cur, done = c.picked != null, ok = done && c.opts[c.picked].ok;
    const fb = done ? banner(ok, `<p class="h">${ok ? `<span lang="es">${pick(PRAISE)}</span>` : esc(c.opts.find(o => o.ok).t)}</p>`, `<p class="s" lang="es">${esc(c.text)}</p>`, 'prnext') : '';
    return `<div class="screen${fb ? ' has-fb' : ''}">${head(Math.round((100 * PR.i) / PR.n), 'quit')}
      <main class="stage${anim ? ' pop' : ''}"><div class="listen"><button class="press spk say xl" data-act="say" data-arg="${escA(c.text)}" aria-label="Écouter">${I.speaker}</button><button class="press plain spk sm say" data-act="slow" data-arg="${escA(c.text)}" aria-label="Lentement">${I.snail}</button></div>${optsHTML(c.opts, c.picked, false, 'prpick', true)}</main>${fb}</div>`;
  }

  /* ========================================================= hands-free */
  function startAudio() {
    stopAll();
    const seen = seenItems();
    AU = { list: seen.length >= 5 ? shuffle(seen) : LES.base.items.slice(), i: 0, playing: false, phase: 'idle', tok: 0, done: 0 };
    V.mode = 'audio'; V.sheet = null;
    render({ top: true, vt: true });
  }
  const alive = tok => AU && AU.playing && AU.tok === tok;
  async function auLoop() {
    const tok = ++AU.tok;
    AU.playing = true;
    while (alive(tok) && AU.i < AU.list.length) {
      const it = AU.list[AU.i];
      AU.phase = 'fr'; render();
      if (T.v.fr) await say(it.fr, { lang: 'fr', rate: 1 }); else await wait(1600);
      if (!alive(tok)) return;
      AU.phase = 'you'; render(); await wait(2800);
      if (!alive(tok)) return;
      AU.phase = 'es'; render(); await say(it.es, { lang: it.lang });
      if (!alive(tok)) return;
      await wait(400); await say(it.es, { lang: it.lang, slow: true, queue: true });
      if (!alive(tok)) return;
      AU.done++; quest('listen'); if (AU.done % 2 === 0) addXP(1); save();
      await wait(900);
      if (!alive(tok)) return;
      AU.i++;
    }
    if (AU && AU.tok === tok) { AU.playing = false; AU.phase = AU.i >= AU.list.length ? 'end' : 'idle'; render(); checkBadges(); }
  }
  function viewAudio() {
    if (AU.phase === 'end') return actResult({ title: '¡Terminado!', sub: `${AU.done} phrases écoutées`, again: 'audio' });
    const it = AU.list[Math.min(AU.i, AU.list.length - 1)], ph = AU.phase;
    const label = ph === 'fr' ? [I.headphones, 'Écoute'] : ph === 'you' ? [I.mic, 'À toi'] : ph === 'es' ? [I.speaker, 'En espagnol'] : [I.play, 'Prêt'];
    return `<div class="screen">${head(Math.round((100 * AU.i) / AU.list.length), 'quit')}
      <main class="au">${sol(ph === 'you' ? 'wow' : 'happy', 96, 'bob')}
        <p class="phase">${label[0]}${label[1]}</p>
        <p class="fr">${esc(it.fr)}</p>
        <p class="es${ph === 'es' ? '' : ' hide'}" lang="es">${esc(it.es)}</p>
        <div class="auctl"><button class="press plain sm" data-act="auprev" aria-label="Précédente">${I.prev}</button><button class="press big" data-act="aupl" aria-label="${AU.playing ? 'Pause' : 'Lecture'}">${AU.playing ? I.pause : I.play}</button><button class="press plain sm" data-act="aunext" aria-label="Suivante">${I.next}</button></div>
      </main></div>`;
  }

  /* ============================================================== duel */
  function startDuel() {
    stopAll();
    const pl = S.profiles.length >= 2 ? S.profiles.slice(0, 2).map(p => ({ name: p.name, color: p.color, id: p.id })) : [{ name: prof().name || 'Joueur 1', color: prof().color, id: prof().id }, { name: 'Joueur 2', color: COLORS[1] }];
    const seen = seenItems();
    DU = { pl: pl.map(p => Object.assign(p, { score: 0 })), round: 0, rounds: 10, phase: 'ready', q: null, pool: shuffle(seen.length >= 10 ? seen : ITEMS.slice(0, 50)), t0: 0, dur: 10000 };
    V.mode = 'duel'; V.sheet = null;
    render({ top: true, vt: true });
  }
  const duTurn = () => DU.round % 2;
  function duQuestion() {
    const it = DU.pool[DU.round % DU.pool.length], type = Math.random() < 0.5 ? 'reco' : 'prod';
    DU.q = { it, type, opts: buildOpts(it, type), picked: null, ok: null, pts: 0 };
    DU.phase = 'q';
    render({ anim: true });
    if (type === 'reco') autoSay(it.es, it.lang);
    DU.t0 = performance.now();
    duTick();
  }
  function duTick() {
    if (!DU || DU.phase !== 'q' || V.mode !== 'duel') return;
    const left = Math.max(0, DU.dur - (performance.now() - DU.t0));
    const bar = document.querySelector('.timer');
    if (bar) { bar.firstElementChild.style.width = `${(100 * left) / DU.dur}%`; bar.classList.toggle('low', left < 3000); }
    if (left <= 0) { duAnswer(-1); return; }
    raf = requestAnimationFrame(duTick);
  }
  function duAnswer(i) {
    if (!DU || DU.phase !== 'q') return;
    cancelAnimationFrame(raf);
    const q = DU.q, ok = i >= 0 && q.opts[i].ok;
    q.picked = i >= 0 ? i : q.opts.findIndex(o => !o.ok); q.ok = ok;
    if (ok) { const left = Math.max(0, DU.dur - (performance.now() - DU.t0)); q.pts = 100 + Math.round((50 * left) / DU.dur); DU.pl[duTurn()].score += q.pts; sfx('ok'); } else sfx('bad');
    DU.phase = 'fb';
    render();
  }
  function viewDuel(anim) {
    const p = DU.pl[duTurn()];
    const vs = (win) => `<div class="vs">${DU.pl.map((x, k) => `<div class="p${win === k ? ' win' : ''}"><span class="avatar lg" style="--c:${x.color}">${esc(initial(x.name))}</span>${esc(x.name)}<b>${x.score}</b></div>${k === 0 ? '<span class="x">vs</span>' : ''}`).join('')}</div>`;
    if (DU.phase === 'end') {
      const w = DU.pl[0].score === DU.pl[1].score ? -1 : DU.pl[0].score > DU.pl[1].score ? 0 : 1;
      return `<div class="screen"><main class="duel-ready">${sol('cheer', 120, 'jump')}<h1 lang="es">${w < 0 ? '¡Empate!' : `¡Gana ${esc(DU.pl[w].name)}!`}</h1>${vs(w)}</main>
        <footer class="sfoot"><div class="pair"><button class="press plain btn" data-act="home">Terminer</button><button class="press btn" data-act="duel">Revanche</button></div></footer></div>`;
    }
    if (DU.phase === 'ready') {
      return `<div class="screen"><header class="shead"><button class="icon-btn" data-act="quit" aria-label="Quitter">${I.close}</button><div class="bar"><i style="width:${(100 * DU.round) / DU.rounds}%"></i></div><span class="side"></span></header>
        <main class="duel-ready${anim ? ' pop' : ''}"><span class="avatar lg" style="--c:${p.color}">${esc(initial(p.name))}</span><h1>À toi, ${esc(p.name)}</h1><p class="lead">${DU.round ? 'Passe le téléphone' : `Question ${DU.round + 1} sur ${DU.rounds}`}</p>${vs(-1)}</main>
        <footer class="sfoot"><button class="press btn" data-act="dready">Prêt</button></footer></div>`;
    }
    const q = DU.q, it = q.it;
    const prompt = q.type === 'reco' ? `<div class="prompt">${canSay(it.lang) ? `<button class="press spk say" data-act="say" data-arg="${escA(it.es)}" data-lang="${it.lang}" aria-label="Écouter">${I.speaker}</button>` : ''}<div class="w"><h1 class="es-q" lang="es">${esc(it.es)}</h1></div></div>` : `<h1 class="fr-q">${esc(it.fr)}</h1>`;
    const fb = DU.phase === 'fb' ? banner(q.ok, `<p class="h">${q.ok ? `+${q.pts}` : esc(q.type === 'reco' ? it.fr : it.es)}</p>`, q.ok ? '' : `<p class="s">${esc(q.type === 'reco' ? it.es : it.fr)}</p>`, 'dnext') : '';
    return `<div class="screen${fb ? ' has-fb' : ''}"><header class="shead"><span class="avatar" style="--c:${p.color}">${esc(initial(p.name))}</span><div class="bar timer"><i style="width:${DU.phase === 'q' ? 100 : 0}%"></i></div><span class="side"><span class="score">${p.score}</span></span></header>
      <main class="stage${anim ? ' pop' : ''}">${prompt}${optsHTML(q.opts, q.picked, q.type === 'prod', 'dpick')}</main>${fb}</div>`;
  }

  /* ============================================================ confetti */
  function confetti() {
    if (reduced()) return;
    const cv = document.createElement('canvas'); cv.className = 'confetti'; document.body.appendChild(cv);
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = window.innerWidth, H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    const x = cv.getContext('2d'); if (!x) { cv.remove(); return; }
    x.scale(dpr, dpr);
    const cols = ['#2F6BFF', '#8A5CF6', '#FFB21E', '#2DC56E', '#FF5B66', '#E8458B'];
    const Pp = Array.from({ length: 130 }, () => ({ x: W / 2 + (Math.random() - 0.5) * 80, y: H * 0.3, vx: (Math.random() - 0.5) * 13, vy: -Math.random() * 13 - 4, r: Math.random() * 7 + 5, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.3, c: pick(cols), sq: Math.random() < 0.6 }));
    const t0 = performance.now();
    const step = t => {
      const k = (t - t0) / 1000;
      x.clearRect(0, 0, W, H); x.globalAlpha = Math.max(0, 1 - k / 2.4);
      for (const q of Pp) {
        q.vy += 0.34; q.vx *= 0.985; q.x += q.vx; q.y += q.vy; q.a += q.va;
        x.save(); x.translate(q.x, q.y); x.rotate(q.a); x.fillStyle = q.c;
        if (q.sq) x.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); else { x.beginPath(); x.arc(0, 0, q.r / 2.6, 0, 6.283); x.fill(); }
        x.restore();
      }
      if (k < 2.4) requestAnimationFrame(step); else cv.remove();
    };
    requestAnimationFrame(step);
  }

  /* ============================================================ actions */
  const ACT = {
    tab(id) {
      stopAll(); SS = null; SC = null; CH = null; PR = null; AU = null; DU = null;
      V.mode = 'tabs'; V.tab = id; V.sheet = null; V.open = null; V.arm = false;
      render({ top: true, anim: true, cur: id === 'path', vt: true });
    },
    home() { ACT.tab('path'); },
    quit() { ACT.tab(V.tab || 'path'); },
    back() { ACT.tab('train'); },
    sheet(k) { V.sheet = { k }; V.arm = false; render(); },
    close() { V.sheet = null; V.arm = false; render(); },
    node(i) {
      const n = PATH()[+i];
      if (n.t === 'review' && seenItems().length < 4) { sfx('bad'); return; }
      V.sheet = { k: 'node', i: +i }; render();
    },
    go(i) {
      const n = PATH()[+i];
      V.sheet = null;
      if (n.t === 'lesson') startSession(LES[n.id].items, { kind: 'lesson', L: LES[n.id] });
      else if (n.t === 'scene') startScene(n.id);
      else if (n.t === 'sons') { P().snd = true; save(); V.mode = 'sub'; V.sub = 'sounds'; render({ top: true, vt: true }); }
      else ACT.review();
    },
    test(lid) { const L = LES[lid]; startSession(shuffle(L.items).slice(0, Math.min(8, L.items.length)), { kind: 'test', L }); },
    lesson(lid) { const L = LES[lid]; if (L) startSession(L.items, { kind: 'lesson', L }); },
    review() {
      const pool = seenItems().sort((a, b) => (lv(a.id) - lv(b.id)) || ((P().p[a.id] || {}).t - (P().p[b.id] || {}).t)).slice(0, 10);
      if (pool.length >= 4) startSession(shuffle(pool), { kind: 'review' });
    },
    errors() { const e = errItems(); if (e.length) startSession(shuffle(e).slice(0, 10), { kind: 'errors' }); },
    chrono() { startChrono(); },
    prices() { if (T.ok) startPrices(); },
    audio() { if (T.ok) startAudio(); },
    duel() { startDuel(); },
    sub(k) { stopAll(); if (k === 'sounds') { P().snd = true; save(); } V.mode = 'sub'; V.sub = k; render({ top: true, vt: true }); },
    sound(k) { V.sheet = { k: 'sound', i: +k }; render(); autoSay(D.sounds[+k].ex[0][0]); },
    next() {
      clearTimeout(timer);
      const cur = SS && SS.cur; if (!cur) return;
      if (cur.type === 'learn') { settle(true); save(); advance(); return; }
      if (cur.done) advance();
    },
    pick(i) { const cur = SS && SS.cur; if (!cur || !cur.opts || cur.done) return; cur.picked = +i; answer(!!cur.opts[cur.picked].ok); },
    tpick(id) { const tl = SS && SS.cur && SS.cur.tl; if (!tl || tl.checked) return; const b = tl.bank[+id]; if (!b || b.used) return; b.used = true; tl.ans.push(b.id); tl.last = b.id; sfx('tap'); render(); },
    tback(id) { const tl = SS && SS.cur && SS.cur.tl; if (!tl || tl.checked) return; tl.ans = tl.ans.filter(x => x !== +id); tl.bank[+id].used = false; tl.last = null; render(); },
    tcheck() {
      const cur = SS && SS.cur, tl = cur && cur.tl;
      if (!tl || tl.checked || !tl.ans.length) return;
      const ok = norm(tl.ans.map(id => tl.bank[id].t).join(' ')) === norm(tl.target.join(' '));
      tl.checked = ok ? 'ok' : 'bad';
      answer(ok);
    },
    mpick(arg) {
      const cur = SS && SS.cur; if (!cur || cur.type !== 'match') return;
      const m = cur.m, [side, s] = arg.split(':'), i = +s;
      if (m.done.includes(i)) return;
      if (!m.sel || m.sel.side === side) { m.sel = { side, i }; sfx('tap'); render(); return; }
      if (m.sel.i === i) {
        m.done.push(i); m.sel = null; sfx('ok', m.done.length); addXP(1); quest('pairs');
        render();
        if (m.done.length === m.items.length) timer = setTimeout(() => { if (SS && SS.cur && SS.cur.m === m) advance(); }, 650);
      } else {
        m.bad = [m.sel, { side, i }]; m.sel = null; sfx('bad'); render();
        setTimeout(() => { if (SS && SS.cur && SS.cur.m === m) { m.bad = null; render(); } }, 450);
      }
    },
    async mic() {
      const cur = SS && SS.cur; if (!cur || cur.type !== 'speak') return;
      if (cur.rec === 'rec') { recStop(); return; }
      hush();
      const started = await recStart(url => {
        if (!SS || SS.cur !== cur) return;
        if (!url) { cur.type = 'recall'; cur.revealed = true; render(); return; }
        cur.rec = 'done'; cur.url = url; P().st.rec++; quest('speak'); addXP(1); save();
        render();
        (canSay(cur.c.it.lang) ? say(cur.c.it.es, { lang: cur.c.it.lang }) : Promise.resolve()).then(() => wait(250)).then(() => { if (SS && SS.cur === cur) playUrl(url); });
      });
      if (!SS || SS.cur !== cur) return;
      if (started) { cur.rec = 'rec'; render(); } else { cur.type = 'recall'; render(); }
    },
    async echo() {
      const cur = SS && SS.cur; if (!cur || cur.type !== 'learn') return;
      if (cur.echo === 'rec') { recStop(); return; }
      hush();
      const started = await recStart(url => {
        if (!SS || SS.cur !== cur) return;
        cur.echo = url ? 'done' : null; cur.url = url;
        if (url) { P().st.rec++; quest('speak'); save(); }
        render();
        if (url) (canSay(cur.c.it.lang) ? say(cur.c.it.es, { lang: cur.c.it.lang }) : Promise.resolve()).then(() => wait(250)).then(() => playUrl(url));
      });
      if (SS && SS.cur === cur && started) { cur.echo = 'rec'; render(); }
    },
    playme() { const cur = SS && SS.cur; if (cur && cur.url) playUrl(cur.url); },
    sayit() { const cur = SS && SS.cur; if (cur && cur.c) say(cur.c.it.es, { lang: cur.c.it.lang }); },
    reveal() {
      const cur = SS && SS.cur; if (!cur) return;
      if (cur.type === 'speak') { recStop(); cur.type = 'recall'; }
      if (cur.type !== 'recall' || cur.revealed) return;
      cur.revealed = true; render(); autoSay(cur.c.it.es, cur.c.it.lang);
    },
    grade(v) {
      const cur = SS && SS.cur; if (!cur || cur.done) return;
      if (!(cur.type === 'recall' && cur.revealed) && !(cur.type === 'speak' && cur.rec === 'done')) return;
      const ok = v === '1';
      cur.done = true;
      settle(ok); noteMiss(cur.c.it, ok);
      if (ok) { SS.combo++; SS.comboMax = Math.max(SS.comboMax, SS.combo); quest('combo', SS.combo); SS.xp++; addXP(1); sfx('ok', SS.combo); } else { SS.combo = 0; }
      save(); advance();
    },
    auto() { S.set.auto = !S.set.auto; save(); if (!S.set.auto) hush(); render(); },
    say(t, el) { say(t, { lang: (el && el.dataset.lang) || 'es' }); },
    slow(t, el) { say(t, { lang: (el && el.dataset.lang) || 'es', slow: true }); },
    scene(id) { startScene(id); },
    spick(i) {
      if (!SC || SC.done || SC.picked != null) return;
      SC.picked = +i;
      const ok = !!SC.opts[SC.picked].ok;
      if (ok) { addXP(1); SC.xp++; sfx('ok'); } else { SC.errors++; sfx('bad'); }
      save();
      render({ bottom: !ok });
      if (ok) timer = setTimeout(sceneContinue, 750);
    },
    scont() { sceneContinue(); },
    sayline(k) { const m = SC && SC.log[+k]; if (m) say(m.es); },
    tr(k) { const m = SC && SC.log[+k]; if (m) { m.open = !m.open; render({ bottom: m.open && +k === SC.log.length - 1 }); } },
    hint(k, el) { if (D.gloss[k]) showHint(el, D.gloss[k]); },
    chpick(arg) {
      if (!CH || CH.over) return;
      const [side, s] = arg.split(':'), pos = +s;
      CH.fresh = [];
      if (!CH.sel || CH.sel.side === side) { CH.sel = { side, pos }; render(); return; }
      const lp = side === 'L' ? pos : CH.sel.pos, rp = side === 'R' ? pos : CH.sel.pos;
      CH.sel = null;
      if (CH.left[lp] === CH.right[rp]) {
        CH.score++; sfx('ok', CH.score % 8); addXP(1); quest('pairs');
        const u = chNew(); CH.left[lp] = u; CH.right[rp] = u;
        const k = Math.floor(Math.random() * 5); [CH.right[rp], CH.right[k]] = [CH.right[k], CH.right[rp]];
        CH.fresh = [`L${lp}`, `R${rp}`, `R${k}`];
        save(); render();
      } else {
        CH.bad = [{ side: 'L', pos: lp }, { side: 'R', pos: rp }]; sfx('bad'); render();
        setTimeout(() => { if (CH) { CH.bad = null; render(); } }, 420);
      }
    },
    prpick(i) {
      const c = PR && PR.cur; if (!c || c.picked != null) return;
      c.picked = +i;
      const ok = !!c.opts[c.picked].ok;
      if (ok) { PR.ok++; P().st.prices++; quest('prices'); addXP(1); PR.xp++; sfx('ok', PR.ok); } else sfx('bad');
      save(); render();
      if (ok) timer = setTimeout(() => { if (PR && PR.cur === c) ACT.prnext(); }, 1500);
    },
    prnext() {
      clearTimeout(timer);
      if (!PR) return;
      PR.i++;
      if (PR.i >= PR.n) { PR.over = true; sfx('done'); render({ party: PR.ok >= 6 }); checkBadges(); return; }
      PR.cur = genPrice(); render({ top: true, anim: true }); say(PR.cur.text);
    },
    aupl() { if (!AU) return; if (AU.playing) { AU.playing = false; AU.tok++; hush(); AU.phase = 'idle'; render(); } else auLoop(); },
    aunext() { if (!AU) return; const was = AU.playing; AU.playing = false; AU.tok++; hush(); AU.i = Math.min(AU.list.length - 1, AU.i + 1); AU.phase = 'idle'; render(); if (was) auLoop(); },
    auprev() { if (!AU) return; const was = AU.playing; AU.playing = false; AU.tok++; hush(); AU.i = Math.max(0, AU.i - 1); AU.phase = 'idle'; render(); if (was) auLoop(); },
    dready() { if (DU && DU.phase === 'ready') duQuestion(); },
    dpick(i) { duAnswer(+i); },
    dnext() {
      if (!DU) return;
      DU.round++;
      if (DU.round >= DU.rounds) {
        DU.phase = 'end';
        DU.pl.forEach(p => { if (p.id && S.data[p.id]) S.data[p.id].st.duels++; });
        save(); sfx('done'); render({ party: true }); checkBadges();
      } else { DU.phase = 'ready'; render({ anim: true }); }
    },
    cat(id) { V.cat = id; V.open = null; render(); },
    lx(id) { V.open = V.open === id ? null : id; refreshLex(); },
    fav(id) { const F = P().favs; if (F[id]) delete F[id]; else { F[id] = 1; sfx('tap'); } save(); refreshLex(); },
    show(id) { const e = lexEntries().find(x => x.id === id); if (e) { V.show = { es: e.es, fr: e.fr, lang: e.lang }; render(); } },
    showc(k) { const c = cardList().find(x => x.k === k); if (c) { V.show = { es: c.es, fr: c.fr, lang: c.lang || 'es' }; render(); } },
    unshow() { V.show = null; render(); },
    switch(id) { if (S.profiles.some(p => p.id === id)) { S.active = id; save(); V.sheet = null; render({ vt: true, cur: V.tab === 'path' }); } },
    npg(g) { V.npg = g; const n = document.getElementById('np'); const val = n ? n.value : ''; render(); const n2 = document.getElementById('np'); if (n2) n2.value = val; },
    addp() {
      const n = document.getElementById('np'), name = (n && n.value.trim()) || 'Mon duo';
      const id = `p${Date.now().toString(36)}`;
      S.profiles.push({ id, name: name.slice(0, 24), g: V.npg === 'a' ? 'a' : 'o', color: COLORS[S.profiles.length % COLORS.length] });
      S.data[id] = blank(); save(); V.sheet = null; render();
    },
    setdest(id) { S.dest = id; save(); render(); },
    setgoal(x) { S.goal = +x; save(); V.sheet = null; render(); },
    toggle(k) { S.set[k] = !S.set[k]; save(); if (k === 'auto' && !S.set.auto) hush(); render(); },
    reset() {
      if (!V.arm) { V.arm = true; render(); return; }
      S.data[prof().id] = blank(); save(); V.arm = false;
      render({ top: true });
    },
    badge(k) { V.sheet = { k: 'badge', i: k }; render(); },
    calg(id) { const C = P().card; C.allergens = C.allergens.includes(id) ? C.allergens.filter(x => x !== id) : C.allergens.concat(id); save(); render(); },
    cdiet(id) { const C = P().card; C.diets = C.diets.includes(id) ? C.diets.filter(x => x !== id) : C.diets.concat(id); save(); render(); },
    obnext() {
      if (V.ob === 0 && needsInstall()) { S.installSeen = true; save(); }
      V.ob = Math.min(3, V.ob + 1); render({ vt: true });
    },
    obback() { V.ob = Math.max(0, V.ob - 1); render({ vt: true }); },
    obinstall() { S.installSeen = true; save(); V.sheet = { k: 'install' }; render(); },
    obg(arg) { const [k, g] = arg.split(':'); V.obf[k] = g; render(); },
    obduo() { V.obf.duo = !V.obf.duo; render(); },
    obdest(id) { V.obf.dest = id; render(); },
    obgoal(x) { V.obf.goal = +x; render(); },
    obdone() { finishOnboarding(); }
  };

  /* ============================================================= events */
  app.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) { hideHint(); return; }
    const act = el.dataset.act;
    if (act !== 'hint') hideHint();
    if (act === 'close' && el.classList.contains('scrim') && e.target.closest('.sheet')) return;
    if (el.getAttribute('aria-disabled') === 'true') return;
    ac();
    try { const r = ACT[act] && ACT[act](el.dataset.arg, el); if (r && r.catch) r.catch(err => console.error(err)); } catch (err) { console.error(err); }
  });
  app.addEventListener('input', e => {
    const t = e.target;
    if (t.id === 'q') { V.q = t.value; V.open = null; refreshLex(); return; }
    if (t.id === 'o-n1') V.obf.n1 = t.value;
    else if (t.id === 'o-n2') V.obf.n2 = t.value;
    else if (t.id === 'o-date') V.obf.date = t.value;
    else if (t.id === 'trip') { S.date = t.value; save(); }
    else if (t.id === 'c-hotel') { P().card.hotel = t.value.trim(); save(); }
    else if (t.id === 'c-addr') { P().card.addr = t.value.trim(); save(); }
  });
  app.addEventListener('change', e => { if (e.target.id === 'trip' || e.target.id === 'o-date') { if (e.target.id === 'trip') { S.date = e.target.value; save(); } else V.obf.date = e.target.value; } });
  document.addEventListener('touchstart', () => {}, { passive: true }); // enables :active on iOS
  let drag = null;
  app.addEventListener('touchstart', e => {
    const sh = e.target.closest('.sheet');
    if (!sh || sh.scrollTop > 0 || e.target.closest('input, .toggle, .chips')) return;
    drag = { sh, y0: e.touches[0].clientY, dy: 0 };
  }, { passive: true });
  app.addEventListener('touchmove', e => {
    if (!drag) return;
    drag.dy = Math.max(0, e.touches[0].clientY - drag.y0);
    if (drag.dy > 4) { drag.sh.style.transition = 'none'; drag.sh.style.transform = `translateY(${drag.dy}px)`; }
  }, { passive: true });
  app.addEventListener('touchend', () => {
    if (!drag) return;
    const { sh, dy } = drag; drag = null;
    if (dy > 90) ACT.close(); else { sh.style.transition = 'transform .2s'; sh.style.transform = ''; }
  }, { passive: true });
  window.addEventListener('scroll', hideHint, { passive: true });
  let rz = 0;
  window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (V.mode === 'tabs' && V.tab === 'path' && !V.sheet) render(); }, 160); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { hush(); if (AU && AU.playing) { AU.playing = false; AU.tok++; AU.phase = 'idle'; } } });

  /* =============================================================== PWA */
  if ('serviceWorker' in navigator && !inFrame && /^(https:|http:\/\/(localhost|127\.0\.0\.1))/.test(location.href)) {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(reg => {
      navigator.serviceWorker.ready.then(() => { SWREADY = true; if (V.mode === 'tabs' && V.tab === 'me') render(); });
      const onUpdate = () => toast({ ic: 'refresh', c: 'var(--blue)', cd: 'var(--blue-d)', t: 'Nouvelle version', s: 'Prête à installer', btn: 'Mettre à jour', on: () => { if (reg.waiting) reg.waiting.postMessage('skip'); } });
      if (reg.waiting && hadController) onUpdate();
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (nw) nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) onUpdate(); });
      });
    }).catch(() => { /* offline cache unavailable here */ });
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!hadController || reloading) return; reloading = true; location.reload(); });
  }

  /* ============================================================== boot */
  function boot(data) {
    if (data && data.tab && S.ob) V.tab = data.tab;
    render({ cur: V.mode === 'tabs' && V.tab === 'path' });
  }
  try { window.claude?.hot?.snapshot?.(() => ({ tab: V.tab })); } catch (e) { /* outside the viewer */ }
  try {
    if (window.claude?.hot?.ready) window.claude.hot.ready(boot);
    else boot(window.claude?.hot?.data ?? {});
  } catch (e) { boot({}); }
})();
