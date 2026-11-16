#!/bin/sh
# Renders the app icon to the PNG sizes the web app manifest and iOS expect.
# Requires rsvg-convert (librsvg). Run from the repository root: sh brand/make-icons.sh
set -eu
out=public/icons
mkdir -p "$out"
rsvg-convert -w 512 -h 512 brand/icon.svg -o "$out/icon-512.png"
rsvg-convert -w 192 -h 192 brand/icon.svg -o "$out/icon-192.png"
rsvg-convert -w 180 -h 180 brand/icon.svg -o "$out/apple-touch-icon.png"
cp brand/icon.svg "$out/favicon.svg"
echo "icons written to $out"
