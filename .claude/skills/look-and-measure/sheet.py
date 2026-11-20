#!/usr/bin/env python3
"""Tiles screenshots into one contact sheet, to look at many at once (needs Pillow).

python3 .claude/skills/look-and-measure/sheet.py tests/shots/*.png -o tests/shots/sheet.png
Options: --cols (default 4), --width of each tile in pixels (default 360), --crop x0 y0 x1 y1
applied to every image first (for example around a porthole seam: --crop 680 120 920 680).
"""

import argparse

from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("images", nargs="+")
parser.add_argument("-o", "--out", required=True)
parser.add_argument("--cols", type=int, default=4)
parser.add_argument("--width", type=int, default=360)
parser.add_argument("--crop", type=int, nargs=4)
args = parser.parse_args()

GAP = 12
tiles = []
for path in args.images:
    image = Image.open(path).convert("RGB")
    if args.crop:
        image = image.crop(tuple(args.crop))
    tiles.append(image.resize((args.width, round(image.height * args.width / image.width))))

rows = [tiles[i : i + args.cols] for i in range(0, len(tiles), args.cols)]
sheet = Image.new(
    "RGB",
    (args.cols * (args.width + GAP), sum(max(t.height for t in row) + GAP for row in rows)),
    "white",
)
y = 0
for row in rows:
    for i, tile in enumerate(row):
        sheet.paste(tile, (i * (args.width + GAP), y))
    y += max(t.height for t in row) + GAP
sheet.save(args.out)
print(args.out, sheet.size)
