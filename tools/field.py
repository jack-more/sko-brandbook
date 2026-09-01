#!/usr/bin/env python3
"""
FIELD PLATES — generator.

The field pages were showing the chrome bevelled cut as the exemplar,
which contradicts the rules on the pages either side of them: the flat
white mark is what goes on a coloured ground. These plates are the flat
white lockup on flat Field blue, rendered from sko-mark-1c.svg so the
edge is the vector's own.

Run from the repo root:  python3 tools/field.py
"""
import subprocess, io, os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG  = os.path.join(ROOT, 'img/vector/sko-mark-1c.svg')
OUT  = os.path.join(ROOT, 'img/system')

FIELD = (36, 67, 153)      # Field #244399 — flat, edge to edge
WHITE = (255, 255, 255)

SIZES = {'2400': (2400, 1500), '1x1': (1200, 1200), '9x16': (1080, 1920)}


def mark_alpha(width=3000):
    png = subprocess.run(['rsvg-convert', '-w', str(width), '-f', 'png', SVG],
                         check=True, capture_output=True).stdout
    a = np.array(Image.open(io.BytesIO(png)).convert('RGBA'))[..., 3]
    ys, xs = np.where(a > 8)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


if __name__ == '__main__':
    base = mark_alpha()
    h, w = base.shape
    made = []
    for tag, (W, H) in SIZES.items():
        canvas = Image.new('RGB', (W, H), FIELD)
        # the mark holds a generous margin — the field is the subject too
        frac = 0.52 if tag != '9x16' else 0.62
        tw = int(W * frac)
        th = max(1, int(round(tw * h / w)))
        if th > H * 0.62:
            th = int(H * 0.62); tw = max(1, int(round(th * w / h)))
        al = Image.fromarray(base).resize((tw, th), Image.LANCZOS)
        ink = Image.new('RGBA', (tw, th), (*WHITE, 0))
        ink.putalpha(al)
        canvas.paste(ink, ((W - tw) // 2, (H - th) // 2), ink)
        p = os.path.join(OUT, f'mark-on-field-{tag}.jpg')
        canvas.save(p, quality=94, subsampling=0)
        made.append(os.path.relpath(p, ROOT))
    for m in made:
        print('wrote', m)
