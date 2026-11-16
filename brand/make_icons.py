"""Render the app icon SVG to the PNG sizes iOS and the web manifest need."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
src = Path(sys.argv[1]).resolve(); out = Path(sys.argv[2]).resolve(); out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1024, 'height': 1024})
    pg.set_content(f'<html><body style="margin:0">{src.read_text()}</body></html>'.replace('<svg ', '<svg width="1024" height="1024" ', 1))
    pg.screenshot(path=str(out / 'icon-1024.png'), clip={'x': 0, 'y': 0, 'width': 1024, 'height': 1024})
    b.close()
im = Image.open(out / 'icon-1024.png').convert('RGB')
for name, size in [('icon-512.png', 512), ('icon-192.png', 192), ('apple-touch-icon.png', 180)]:
    im.resize((size, size), Image.LANCZOS).save(out / name, optimize=True)
(out / 'icon-1024.png').unlink()
print('icons:', sorted(f.name for f in out.iterdir()))
