#!/bin/sh
# Renders the app icon (brand/icon.svg) to the files the web app manifest, iOS and browsers use.
# Requires rsvg-convert (librsvg). Run from the repository root: sh brand/make-icons.sh
set -eu
out=public/icons
mkdir -p "$out"
rsvg-convert -w 512 -h 512 brand/icon.svg -o "$out/icon-512.png"
rsvg-convert -w 192 -h 192 brand/icon.svg -o "$out/icon-192.png"
rsvg-convert -w 180 -h 180 brand/icon.svg -o "$out/apple-touch-icon.png"
cp brand/icon.svg "$out/favicon.svg"
# Maskable: the same art at 80 %, so all of it stays inside the safe circle (radius 40 %) that
# Android may crop to, while the blue still fills the whole square.
sed 's|<g id="art">|<g id="art" transform="translate(51.2 51.2) scale(0.8)">|' brand/icon.svg |
  rsvg-convert -w 512 -h 512 -o "$out/icon-maskable-512.png"
echo "icons written to $out"
