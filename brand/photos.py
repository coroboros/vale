#!/usr/bin/env python3
"""Fetches the destination photos of the « Imagine » step from Wikimedia Commons and renders them.

src/ui/photos.json lists, for each destination, the Commons file, the point to keep when cropping
(focus: 0 is the left edge, 1 the right edge), the alt text and, when part of the frame must go
(a date stamp, a border), the part to keep (frame: left, top, right, bottom, as fractions). `fetch` downloads each file and
copies its author, license and file page from Commons into the list, so the credit shown under a
photo always matches Commons. `render` writes the WebP files the app serves from public/photos/.

Requires Python 3.10+, Pillow for `render`, and access to commons.wikimedia.org.
Run from the repository root: python3 brand/photos.py fetch render
"""

import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

LIST = Path("src/ui/photos.json")
CACHE = Path(".cache/photos")
OUT = Path("public/photos")
API = "https://commons.wikimedia.org/w/api.php"
# Wikimedia's policy: every client sends a User-Agent that names it and says how to reach its authors.
AGENT = "BagagePhotos/1.0 (https://github.com/coroboros/vale)"
# Licenses that allow reuse in the app with a credit. Anything else (NC, ND, GFDL only) stops the run.
FREE = re.compile(r"^(CC0|Public domain|CC BY(-SA)? \d\.\d)", re.IGNORECASE)
# 3840 px is one of the thumbnail widths Commons serves; the portrait crop needs the height.
SOURCE_WIDTH = 3840
# The smaller widths serve the welcome page's postcards: at 800 px a photo weighs 57 % less than
# at 1280 (docs/UX.md, « The welcome page »).
WIDTHS = (480, 800, 1280, 1920)
PORTRAIT_HEIGHT = 1920
# Low enough to keep each file near 200 KB; the frosted card and scrim hide what compression costs.
QUALITY = 56


def get(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": AGENT})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                raise
            time.sleep(5 * 2**attempt)
    raise AssertionError("unreachable")


def plain(markup: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", markup))).strip()


def pages(files: list[str]) -> dict[str, dict]:
    found: dict[str, dict] = {}
    for start in range(0, len(files), 50):
        batch = files[start : start + 50]
        query = urllib.parse.urlencode(
            {
                "action": "query",
                "format": "json",
                "formatversion": "2",
                "prop": "imageinfo",
                "iiprop": "url|size|extmetadata",
                "iiurlwidth": SOURCE_WIDTH,
                "iiextmetadatafilter": "Artist|LicenseShortName|LicenseUrl",
                "titles": "|".join(f"File:{name}" for name in batch),
            }
        )
        data = json.loads(get(f"{API}?{query}"))["query"]
        renamed = {item["from"]: item["to"] for item in data.get("normalized", [])}
        by_title = {page["title"]: page for page in data["pages"]}
        for name in batch:
            found[name] = by_title[renamed.get(f"File:{name}", f"File:{name}")]
    return found


def fetch(photos: dict[str, dict]) -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    found = pages([photo["file"] for photo in photos.values()])
    for key, photo in photos.items():
        page = found[photo["file"]]
        if page.get("missing"):
            sys.exit(f"{key}: no such file on Commons: {photo['file']}")
        info = page["imageinfo"][0]
        meta = info["extmetadata"]
        license_name = meta["LicenseShortName"]["value"]
        if not FREE.match(license_name):
            sys.exit(f"{key}: {license_name} does not allow reuse")
        photo["author"] = plain(meta["Artist"]["value"])
        photo["license"] = license_name
        photo["licenseUrl"] = meta.get("LicenseUrl", {}).get("value", "")
        photo["source"] = info["descriptionurl"]
        target = CACHE / f"{key}.jpg"
        if not target.exists():
            try:
                target.write_bytes(get(info.get("thumburl", info["url"])))
            except urllib.error.HTTPError:
                target.write_bytes(get(info["url"]))
            time.sleep(1)
        print(f"{key}: {photo['author']} ({license_name})")
    LIST.write_text(json.dumps(photos, ensure_ascii=False, indent=2) + "\n")


def crop(image, ratio: float, focus: float):
    width, height = image.size
    if width / height > ratio:
        kept = round(height * ratio)
        left = min(max(round(focus * width - kept / 2), 0), width - kept)
        return image.crop((left, 0, left + kept, height))
    kept = round(width / ratio)
    top = (height - kept) // 2
    return image.crop((0, top, width, top + kept))


def render(photos: dict[str, dict]) -> None:
    from PIL import Image

    OUT.mkdir(parents=True, exist_ok=True)
    for key, photo in photos.items():
        image = Image.open(CACHE / f"{key}.jpg").convert("RGB")
        if "frame" in photo:
            left, top, right, bottom = photo["frame"]
            image = image.crop((round(left * image.width), round(top * image.height), round(right * image.width), round(bottom * image.height)))
        focus = photo["focus"]
        # Landscape screens see the whole frame, kept between 4:3 and 16:9 so no file is wasted width.
        ratio = min(max(image.width / image.height, 4 / 3), 16 / 9)
        landscape = crop(image, ratio, focus)
        for width in WIDTHS:
            size = (width, round(width / ratio))
            landscape.resize(size, Image.LANCZOS).save(OUT / f"{key}-{width}.webp", quality=QUALITY, method=6)
        # Phones held upright get their own 9:16 crop around the focus, so the landmark stays in view.
        portrait = crop(image, 9 / 16, focus)
        height = min(PORTRAIT_HEIGHT, portrait.height)
        size = (round(height * 9 / 16), height)
        portrait.resize(size, Image.LANCZOS).save(OUT / f"{key}-portrait.webp", quality=QUALITY, method=6)
        print(f"{key}: rendered")


def main() -> None:
    steps = sys.argv[1:] or ["fetch", "render"]
    photos = json.loads(LIST.read_text())
    for step in steps:
        {"fetch": fetch, "render": render}[step](photos)


if __name__ == "__main__":
    main()
