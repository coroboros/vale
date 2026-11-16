"""Functional pass over ¡Vale! v3 served over HTTP, at iPhone size, including a real offline reload."""
import datetime, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'tests' / 'shots'
OUT.mkdir(exist_ok=True)
for f in OUT.glob('*.png'):
    f.unlink()
PORT = 8765
srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'], cwd=ROOT / 'docs', stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
URL = f'http://localhost:{PORT}/'
errors, shots = [], []

FAKE_TTS = """
(() => {
  const voices = [{ name: 'Mónica', lang: 'es-ES', localService: true }, { name: 'Thomas', lang: 'fr-FR', localService: true }];
  window.__spoken = [];
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { speaking: false, pending: false, getVoices: () => voices,
    speak(u) { window.__spoken.push(u.lang + ':' + u.text); setTimeout(() => u.onend && u.onend(), 30); }, cancel() {}, addEventListener() {} } });
})();
"""

STATE = """
() => {
  const D = window.VALE_DATA;
  const items = D.lessons.flatMap(L => L.items).concat(Object.values(D.packs).flatMap(p => p.items));
  const q = s => document.querySelector(s);
  const tokES = s => s.replace(/[¿?¡!.,…:;]/g, ' ').trim().split(/\\s+/).filter(Boolean);
  const tokFR = s => s.replace(/[?!.,…:;]/g, ' ').trim().split(/\\s+/).filter(Boolean);
  const txt = el => el.textContent.replace(/\\u00a0/g, ' ').trim();
  const byEs = es => items.find(i => i.es === es), byFr = fr => items.find(i => i.fr === fr);
  if (q('.result')) return { type: 'result' };
  if (q('.fb')) return { type: 'banner' };
  if (q('.pairs')) {
    const L = [...document.querySelectorAll('.pairs .col:first-child .pr:not([disabled])')].map(txt);
    if (!L.length) return { type: 'wait' };
    const it = byEs(L[0]);
    return { type: 'match', l: L[0], r: it.fr };
  }
  const opts = [...document.querySelectorAll('.stage .opts .opt')].map(txt);
  const bank = q('.bank');
  if (bank) {
    let target;
    if (q('.stage .prompt .es-q')) target = tokFR(byEs(txt(q('.es-q'))).fr);
    else if (q('.stage .fr-q')) target = tokES(byFr(txt(q('.fr-q'))).es);
    else target = tokES(q('.spk.xl').dataset.arg);
    const sub = q('.stage .prompt .es-q') ? 'tilesFR' : q('.stage .fr-q') ? 'tilesES' : 'dict';
    return { type: sub, target, checked: !!q('.answer.ok, .answer.bad') };
  }
  if (q('.stage .prompt') && opts.length) return { type: 'reco', idx: opts.indexOf(byEs(txt(q('.es-q'))).fr) };
  if (q('.stage .listen') && opts.length) return { type: 'listen', idx: opts.indexOf(byEs(q('.spk.xl').dataset.arg).fr) };
  if (q('.stage .fr-q') && opts.length) return { type: 'prod', idx: opts.indexOf(byFr(txt(q('.fr-q'))).es) };
  if (q('.mic')) return { type: 'speak', rec: q('.mic.rec') ? 'rec' : 'idle' };
  if (q('[data-act=grade]')) return { type: 'grade' };
  if (q('.mystery')) return { type: 'recall' };
  if (q('.stage .card')) return { type: 'learn' };
  return { type: 'unknown', html: document.querySelector('.stage') ? document.querySelector('.stage').innerHTML.slice(0, 300) : 'no stage' };
}
"""


def shot(page, name):
    p = OUT / f'{name}.png'
    page.screenshot(path=str(p))
    shots.append(p)


def click_text(page, sel, text):
    for el in page.locator(sel).all():
        if el.text_content().replace('\xa0', ' ').strip() == text and el.is_visible():
            el.click(force=True)
            return True
    return False


def tap(page, sel, nth=0):
    """Click without waiting for animations; the state machine re-reads the screen anyway."""
    try:
        page.locator(sel).nth(nth).click(force=True, timeout=3000)
    except Exception:
        pass
    page.wait_for_timeout(60)


def run_session(page, wrong_first=False, seen=None, tag='', max_steps=400):
    seen = seen if seen is not None else set()
    did_wrong = False
    types = {}
    for _ in range(max_steps):
        s = page.evaluate(STATE)
        t = s['type']
        types[t] = types.get(t, 0) + 1
        if t == 'result':
            return types
        if t == 'wait':
            page.wait_for_timeout(200); continue
        if t == 'banner':
            tap(page, '.fb [data-act=next]'); continue
        if t not in seen:
            shot(page, f'{tag}{t}'); seen.add(t)
        if t == 'learn':
            tap(page, '.sfoot [data-act=next]')
        elif t in ('reco', 'listen', 'prod'):
            assert s['idx'] >= 0, s
            idx = s['idx']
            if wrong_first and not did_wrong:
                idx = (idx + 1) % 4; did_wrong = True
                tap(page, '.stage .opts .opt', idx)
                shot(page, f'{tag}wrong'); continue
            tap(page, '.stage .opts .opt', idx)
        elif t in ('tilesFR', 'tilesES', 'dict'):
            for w in s['target']:
                assert click_text(page, '.bank .tl:not(.used)', w), (w, s)
            if f'{t}-filled' not in seen:
                shot(page, f'{tag}{t}-filled'); seen.add(f'{t}-filled')
            tap(page, '.sfoot [data-act=tcheck]')
        elif t == 'match':
            assert click_text(page, '.pairs .col:first-child .pr', s['l'])
            assert click_text(page, '.pairs .col:last-child .pr', s['r'])
            page.wait_for_timeout(120)
        elif t == 'speak':
            tap(page, '.mic'); page.wait_for_timeout(700)
            if 'speak-rec' not in seen:
                shot(page, f'{tag}speak-rec'); seen.add('speak-rec')
            if page.locator('.mic.rec').count():
                tap(page, '.mic')
            page.wait_for_timeout(600)
        elif t == 'grade':
            if 'grade' not in seen:
                shot(page, f'{tag}grade'); seen.add('grade')
            tap(page, '[data-act=grade][data-arg="1"]')
            page.wait_for_timeout(150)
        elif t == 'recall':
            tap(page, '.sfoot [data-act=reveal]')
        else:
            raise RuntimeError(f'unknown state {s}')
    raise RuntimeError('session did not end')


try:
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        ctx = browser.new_context(viewport={'width': 393, 'height': 852}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='fr-FR')
        ctx.grant_permissions(['microphone'], origin=URL.rstrip('/'))
        ctx.add_init_script(FAKE_TTS)
        ctx.add_init_script("window.__m=0; document.addEventListener('DOMContentLoaded', () => new MutationObserver(m => window.__m += m.length).observe(document.getElementById('app'), { childList: true, subtree: true }));")
        page = ctx.new_page()
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        page.goto(URL); page.wait_for_timeout(500)
        shot(page, '00-hello')

        # onboarding
        page.locator('[data-act=obnext]').click(); page.wait_for_timeout(300)
        page.fill('#o-n1', 'Adrien')
        page.locator('[data-act=obduo]').click()
        page.fill('#o-n2', 'Léa')
        page.locator('[data-act=obg][data-arg="g2:a"]').click()
        shot(page, '01-who')
        page.locator('[data-act=obnext]').click(); page.wait_for_timeout(300)
        page.locator('[data-act=obdest][data-arg=barcelone]').click()
        page.fill('#o-date', (datetime.date.today() + datetime.timedelta(days=5)).isoformat())
        shot(page, '02-where')
        page.locator('[data-act=obnext]').click(); page.wait_for_timeout(300)
        page.locator('[data-act=obgoal][data-arg="40"]').click()
        shot(page, '03-pace')
        page.locator('[data-act=obdone]').click(); page.wait_for_timeout(600)
        shot(page, '04-path')
        print('nodes', page.locator('.node').count(), '| chip', page.locator('.chip-dest').inner_text())

        # offline: wait for the service worker, cut the network, reload
        page.wait_for_function('navigator.serviceWorker && navigator.serviceWorker.controller !== null', timeout=10000)
        ctx.set_offline(True)
        page.reload(); page.wait_for_timeout(800)
        ok_off = page.locator('.node').count() > 0
        print('OFFLINE RELOAD OK:', ok_off, '| profile:', page.locator('.avatar').first.inner_text())
        shot(page, '05-offline-reload')
        # stay offline for the whole run, like on the plane

        # sounds
        page.locator('.node.cur').click(); page.wait_for_timeout(300)
        page.locator('.sheet [data-act=go]').click(); page.wait_for_timeout(300)
        page.locator('.lt').nth(3).click(); page.wait_for_timeout(300)
        shot(page, '06-sound')
        page.mouse.click(200, 100); page.wait_for_timeout(200)
        page.locator('[data-act=back]').click(); page.wait_for_timeout(200)
        page.locator('.tab[data-arg=path]').click(); page.wait_for_timeout(300)

        # lesson 1
        page.locator('.node.cur').click(); page.wait_for_timeout(250)
        shot(page, '07-node-sheet')
        page.locator('.sheet [data-act=go]').click(); page.wait_for_timeout(300)
        seen = set()
        types = run_session(page, wrong_first=True, seen=seen, tag='L1-')
        page.wait_for_timeout(500)
        shot(page, '08-result')
        print('lesson1', types)
        page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(400)
        shot(page, '09-path-after')

        # lessons 2..4 through the path, until all exercise types were seen
        for idx in (2, 3, 4):
            page.locator(f'.node[data-arg="{idx}"]').click(); page.wait_for_timeout(200)
            page.locator('.sheet [data-act=go]').click(); page.wait_for_timeout(200)
            t = run_session(page, seen=seen, tag=f'L{idx}-')
            print(f'lesson{idx}', t)
            page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(250)
        print('exercise types seen:', sorted(x for x in seen if '-' not in x))

        # skip test on the bar lesson
        page.locator('.node[data-arg="6"]').click(); page.wait_for_timeout(200)
        page.locator('.sheet [data-act=test]').click(); page.wait_for_timeout(200)
        run_session(page, tag='T-')
        print('test result:', page.locator('.result h1').inner_text(), page.locator('.result .sub').inner_text() if page.locator('.result .sub').count() else '')
        page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(250)

        # scene: café (path index 7)
        page.locator('.node[data-arg="7"]').click(); page.wait_for_timeout(200)
        page.locator('.sheet [data-act=go]').click(); page.wait_for_timeout(300)
        sc = page.evaluate('window.VALE_DATA.scenes.find(s => s.id === "cafe")')
        ys = [l for l in sc['lines'] if l['w'] == 'y']
        for n, y in enumerate(ys):
            if n == 1:
                page.locator('.msg.them .hw').first.click(); page.wait_for_timeout(150)
                shot(page, '10-scene-hint')
                page.locator('.msg.them [data-act=tr]').last.click(); page.wait_for_timeout(150)
            texts = [t.strip() for t in page.locator('.sfoot .opt').all_text_contents()]
            idx = texts.index(y['o'][0])
            if n == 2:
                page.locator('.sfoot .opt').nth((idx + 1) % 3).click(); page.wait_for_timeout(300)
                shot(page, '11-scene-wrong')
                page.locator('.fb [data-act=scont]').click(); page.wait_for_timeout(200)
                continue
            page.locator('.sfoot .opt').nth(idx).click(); page.wait_for_timeout(900)
        page.wait_for_timeout(500)
        shot(page, '12-scene-end')
        print('scene end buttons:', page.locator('.sfoot .btn').all_text_contents())
        page.locator('.shead [data-act=quit]').click(); page.wait_for_timeout(300)

        # practice hub
        page.locator('.tab[data-arg=train]').click(); page.wait_for_timeout(300)
        shot(page, '13-train')
        if page.locator('.tcard[data-act=errors]:not(.off)').count():
            page.locator('.tcard[data-act=errors]').click(); page.wait_for_timeout(200)
            print('errors session', run_session(page, tag='E-'))
            page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(200)
            page.locator('.tab[data-arg=train]').click(); page.wait_for_timeout(200)

        # prices
        page.locator('.tcard[data-act=prices]').click(); page.wait_for_timeout(300)
        shot(page, '14-prices')
        for r in range(10):
            page.locator('.stage .opt').first.click(); page.wait_for_timeout(150)
            if r == 0:
                shot(page, '15-prices-fb')
            if page.locator('.fb [data-act=prnext]').count():
                page.locator('.fb [data-act=prnext]').click(); page.wait_for_timeout(120)
        page.wait_for_timeout(400)
        shot(page, '16-prices-end')
        page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(200)

        # hands-free audio
        page.locator('.tab[data-arg=train]').click(); page.wait_for_timeout(200)
        page.locator('.tcard[data-act=audio]').click(); page.wait_for_timeout(300)
        page.locator('[data-act=aupl]').click(); page.wait_for_timeout(1200)
        shot(page, '17-audio')
        page.wait_for_timeout(2500)
        print('audio phase text:', page.locator('.au .phase').inner_text())
        page.locator('.shead [data-act=quit]').click(); page.wait_for_timeout(200)

        # duel
        page.locator('.tab[data-arg=train]').click(); page.wait_for_timeout(200)
        page.locator('.tcard[data-act=duel]').click(); page.wait_for_timeout(300)
        shot(page, '18-duel-ready')
        for r in range(10):
            page.locator('.sfoot [data-act=dready]').click(); page.wait_for_timeout(200)
            if r == 0:
                shot(page, '19-duel-q')
            page.locator('.stage .opt').nth(r % 4).click(); page.wait_for_timeout(150)
            page.locator('.fb [data-act=dnext]').click(); page.wait_for_timeout(150)
        page.wait_for_timeout(400)
        shot(page, '20-duel-end')
        page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(200)

        # chrono (60 s)
        page.locator('.tab[data-arg=train]').click(); page.wait_for_timeout(200)
        page.locator('.tcard[data-act=chrono]').click(); page.wait_for_timeout(400)
        items_es = page.evaluate('Object.fromEntries(window.VALE_DATA.lessons.flatMap(L => L.items).map(i => [i.es, i.fr]))')
        for k in range(6):
            left = page.locator('.pairs .col:first-child .pr').all_text_contents()
            l = left[0].strip(); r = items_es.get(l)
            click_text(page, '.pairs .col:first-child .pr', l); click_text(page, '.pairs .col:last-child .pr', r)
            page.wait_for_timeout(120)
        shot(page, '21-chrono')
        page.wait_for_timeout(57000)
        shot(page, '22-chrono-end')
        page.locator('.sfoot [data-act=home]').click(); page.wait_for_timeout(200)

        # survival card
        page.locator('.tab[data-arg=card]').click(); page.wait_for_timeout(250)
        page.locator('.addcard').click(); page.wait_for_timeout(250)
        page.fill('#c-hotel', 'Arts'); page.fill('#c-addr', 'Carrer de la Marina 19, Barcelona')
        page.locator('[data-act=calg][data-arg=marisco]').click(); page.locator('[data-act=calg][data-arg=frutos]').click(); page.locator('[data-act=cdiet][data-arg=veg]').click()
        shot(page, '23-card-edit')
        page.locator('.sheet .press.btn').click(); page.wait_for_timeout(250)
        shot(page, '24-card')
        print('allergy card:', [t for t in page.locator('.scard .es').all_text_contents() if 'alérgic' in t])
        page.locator('.scard [data-act=showc]').nth(1).click(); page.wait_for_timeout(250)
        shot(page, '25-show')
        page.locator('.show [data-act=unshow]').click()

        # lexicon: favorite + pack
        page.locator('.tab[data-arg=lex]').click(); page.wait_for_timeout(250)
        page.locator('.lx-row').nth(2).click(); page.wait_for_timeout(150)
        page.locator('.lx-more [data-act=fav]').click(); page.wait_for_timeout(150)
        shot(page, '26-lex')
        page.locator('[data-act=cat][data-arg=pack]').click(); page.wait_for_timeout(150)
        print('pack rows:', page.locator('.lx-row').count())
        page.locator('[data-act=cat][data-arg=fav]').click(); page.wait_for_timeout(150)
        print('fav rows:', page.locator('.lx-row').count())

        # profile
        page.locator('.tab[data-arg=me]').click(); page.wait_for_timeout(300)
        shot(page, '27-me')
        page.evaluate('window.scrollTo(0, 900)'); page.wait_for_timeout(150)
        shot(page, '28-me-settings')
        page.locator('.tab[data-arg=path]').click(); page.wait_for_timeout(250)
        page.locator('.top .avatar').click(); page.wait_for_timeout(250)
        page.locator('[data-act=switch][data-arg=p2]').click(); page.wait_for_timeout(400)
        print('switched to:', page.locator('.top .avatar').inner_text(), '| stars', page.locator('.top .stat').inner_text())
        shot(page, '29-path-lea')
        print('scroll width', page.evaluate('[document.documentElement.scrollWidth, innerWidth]'))
        ctx.close(); browser.close()
finally:
    srv.terminate()

print('\nERRORS:' if errors else '\nno console errors', *errors[:30], sep='\n')
W = 393; cols = 8
imgs = [Image.open(s) for s in shots]
th = [im.resize((W, int(im.height * W / im.width))) for im in imgs]
H = max(t.height for t in th)
for r in range((len(th) + cols - 1) // cols):
    sheet = Image.new('RGB', (cols * W + (cols - 1) * 10, H), '#777')
    for c, t in enumerate(th[r * cols:(r + 1) * cols]):
        sheet.paste(t, (c * (W + 10), 0))
    sheet.save(OUT / f'sheet-{r + 1}.png')
print('shots', len(th), [s.stem for s in shots])
