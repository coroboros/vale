#!/usr/bin/env python3
"""The measures behind Bagage's design choices (needs Pillow for ink and similar).

measure.py ink a.png b.png        how much darker than its background each image is
measure.py contrast '#4b5675' '#fffaf3'
measure.py similar a.png b.png …  how alike icons look at a glance (12 × 12), lower is better
measure.py seams                  scene lines that would show a step in the porthole's loop
"""

import itertools
import math
import re
import statistics
import sys
from pathlib import Path


def ink(paths):
    from PIL import Image

    for path in paths:
        image = Image.open(path).convert("RGB")
        width, height = image.size
        background = sum(image.getpixel((width - 4, 4))) / 3
        data = image.tobytes()
        dark = sum(max(0, background - (data[i] + data[i + 1] + data[i + 2]) / 3) for i in range(0, len(data), 3)) / 255
        print(f"{path}: {round(dark)} dark-pixel equivalents against {background:.0f}")


def luminance(hex_color):
    rgb = [int(hex_color.lstrip("#")[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def contrast(a, b):
    high, low = sorted([luminance(a), luminance(b)], reverse=True)
    print(f"{a} on {b}: {(high + 0.05) / (low + 0.05):.2f}:1")


def similar(paths):
    from PIL import Image

    def vector(path):
        image = Image.open(path)
        mask = image.split()[-1] if image.mode == "RGBA" else image.convert("L").point(lambda v: 255 - v)
        values = [v / 255 for v in mask.resize((12, 12), Image.BOX).tobytes()]
        norm = math.sqrt(sum(v * v for v in values)) or 1
        return [v / norm for v in values]

    vectors = {path: vector(path) for path in paths}
    pairs = {(a, b): sum(x * y for x, y in zip(vectors[a], vectors[b])) for a, b in itertools.combinations(paths, 2)}
    closest = max(pairs, key=pairs.get)
    print(f"mean {statistics.mean(pairs.values()):.3f}, closest {pairs[closest]:.3f}: {closest[0]} and {closest[1]}")


def points(d):
    tokens = re.findall(r"[MLCQSTHVZ]|-?\d+(?:\.\d+)?", d)
    out, cmd, x, y, i = [], None, 0.0, 0.0, 0
    sizes = {"M": 2, "L": 2, "T": 2, "C": 6, "Q": 4, "S": 4, "H": 1, "V": 1}
    while i < len(tokens):
        if tokens[i].isalpha():
            cmd, i = tokens[i], i + 1
            continue
        size = sizes.get(cmd, 0)
        values = tokens[i : i + size]
        if not size or len(values) < size or any(v.isalpha() for v in values):
            break
        values = [float(v) for v in values]
        if cmd == "H":
            x = values[0]
        elif cmd == "V":
            y = values[0]
        else:
            x, y = values[-2], values[-1]
        out.append((x, y))
        i += size
    return out


def seams():
    for path in sorted(Path("src/ui/scenery").glob("[a-z][a-z].tsx")):
        scene, edges = "-", {}
        for number, line in enumerate(path.read_text().splitlines(), 1):
            if match := re.match(r"^  ([a-z]+): \{$", line):
                scene = match.group(1)
            for d in re.findall(r'd="([^"`]+)"', line):
                found = [] if re.search(r"[a-y]", d) else points(d)
                if not found:
                    continue
                xs = [x for x, _ in found]
                at_zero = min((y for x, y in found if x == 0), default=None)
                at_end = min((y for x, y in found if x == 360), default=None)
                where = f"{path}:{number} {scene}"
                if at_zero is not None and at_end is not None:
                    if abs(at_zero - at_end) >= 0.5:
                        print(f"{where}: y = {at_zero:g} at x = 0 but {at_end:g} at x = 360")
                elif at_zero is not None and min(xs) == 0 and at_zero < 172:
                    edges.setdefault(scene, []).append(("left", at_zero, where))
                elif at_end is not None and max(xs) == 360 and at_end < 172:
                    edges.setdefault(scene, []).append(("right", at_end, where))
        for marks in edges.values():
            for side, height, where in marks:
                other = "right" if side == "left" else "left"
                if not any(s == other and abs(h - height) < 0.5 for s, h, _ in marks):
                    print(f"{where}: cut at the {side} edge (y = {height:g}), nothing meets it on the {other}")


if __name__ == "__main__":
    command, rest = sys.argv[1], sys.argv[2:]
    {"ink": lambda: ink(rest), "contrast": lambda: contrast(*rest), "similar": lambda: similar(rest), "seams": seams}[
        command
    ]()
