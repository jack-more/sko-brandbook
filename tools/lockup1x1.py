#!/usr/bin/env python3
"""
THE 1x1 LOCKUP — generator.

The stacked lockup — shield on top, SKO COMPOUNDS beneath — centred on a
genuinely SQUARE canvas. The files were already stacked correctly, but
they sat on a 1.21:1 canvas while being called 1x1, which is the kind of
half-truth that sends someone to the wrong asset.

This is the app icon, the avatar, the profile picture: anywhere the slot
is square. Run from the repo root:  python3 tools/lockup1x1.py
"""
import subprocess, io, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG  = os.path.join(ROOT, 'img/vector/sko-mark-1c.svg')
OUT  = os.path.join(ROOT, 'img/vector')

COLOURS = {
    'white': (255, 255, 255),
    'navy':  (23, 51, 132),
    'deep':  (9, 34, 102),
}
SIZES = [2000, 1000, 512, 256, 128, 64]
FILL = 0.80          # how much of the square the artwork occupies


def lockup_alpha(width=3000):
    """The whole stacked lockup, trimmed to its ink."""
    png = subprocess.run(['rsvg-convert', '-w', str(width), '-f', 'png', SVG],
                         check=True, capture_output=True).stdout
    a = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))[..., 3]
    ys, xs = np.where(a > 8)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


if __name__ == '__main__':
    base = lockup_alpha()
    h, w = base.shape
    print(f'lockup ink {w}x{h}, aspect {w/h:.3f} — shield on top, wordmark under')
    made = 0
    for name, rgb in COLOURS.items():
        for s in SIZES:
            # fit the artwork inside FILL of the square, whichever side binds
            if w >= h:
                tw = int(round(s * FILL)); th = max(1, int(round(tw * h / w)))
            else:
                th = int(round(s * FILL)); tw = max(1, int(round(th * w / h)))
            al = Image.fromarray(base).resize((tw, th), Image.LANCZOS)
            ink = Image.new('RGBA', (tw, th), (*rgb, 0))
            ink.putalpha(al)
            sq = Image.new('RGBA', (s, s), (*rgb, 0))
            sq.paste(ink, ((s - tw) // 2, (s - th) // 2), ink)
            sq.save(os.path.join(OUT, f'lockup-1x1-{name}-{s}.png'))
            made += 1
    print(f'{made} square 1x1 lockups -> {os.path.relpath(OUT, ROOT)}')
