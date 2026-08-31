#!/usr/bin/env python3
"""
THE FLAT SHIELD — generator.

Cuts the shield on its own, flat, in the three colours the rules call
for. Run from the repo root:  python3 tools/shields.py

Why this exists: the guide says disclaimers take the flat white shield,
and that anything small or overlaid drops to flat matte blue or flat
matte white. Those cuts did not exist — the only flat assets were the
full lockup, which is the thing the rule tells you not to use small.

The shield keeps its helix knockout: that IS the mark. Only the wordmark
is removed. Everything comes off sko-mark-1c.svg, rendered once at high
resolution and stepped down, so every size is the same shape.
"""
import subprocess, io, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG  = os.path.join(ROOT, 'img/vector/sko-mark-1c.svg')
OUT  = os.path.join(ROOT, 'img/shield')

COLOURS = {
    'white': (255, 255, 255),
    'blue':  (23, 51, 132),     # SKO Blue — the matte blue cut
    'deep':  (9, 34, 102),      # Deep — for light grounds that need weight
}
SIZES = [2000, 1000, 512, 256, 128, 64, 32]


def shield_alpha(width=3000):
    """The shield on its own, antialiased, helix knockout intact.

    Split on the blank band under the shield rather than by connected
    component: the shield is three components (outline, the fill inside
    it, the helix rungs), so component-picking hands part of the mark to
    the wordmark and vice versa.
    """
    png = subprocess.run(['rsvg-convert', '-w', str(width), '-f', 'png', SVG],
                         check=True, capture_output=True).stdout
    a = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))[..., 3]
    rows = (a > 90).sum(axis=1)
    gaps, start = [], None
    for y in range(a.shape[0]):
        if rows[y] == 0:
            if start is None:
                start = y
        elif start is not None:
            if start > 0:
                gaps.append((start, y))
            start = None
    if not gaps:
        raise SystemExit('no blank band under the shield')
    cut = gaps[0][0]
    sh = a[:cut]
    ys, xs = np.where(sh > 8)
    return sh[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    base = shield_alpha()
    h, w = base.shape
    print(f'shield cut at {w}x{h}, aspect {w/h:.3f}')
    made = 0
    for name, rgb in COLOURS.items():
        for s in SIZES:
            th = s
            tw = max(1, int(round(s * w / h)))
            al = Image.fromarray(base, 'L').resize((tw, th), Image.LANCZOS)
            img = Image.new('RGBA', (tw, th), (*rgb, 0))
            img.putalpha(al)
            p = os.path.join(OUT, f'shield-{name}-{s}.png')
            img.save(p)
            made += 1
    print(f'{made} flat shields -> {os.path.relpath(OUT, ROOT)}')
