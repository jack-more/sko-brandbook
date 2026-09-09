# -*- coding: utf-8 -*-
"""Where does the type belong on THIS photograph?

Reads the picture, tries several block shapes, and returns the calmest place
large enough to hold the type, plus the ink colour that patch needs.
Composed page by page, not stamped in a corner.
"""
from PIL import Image, ImageFilter
import numpy as np

# (width, height) as fractions of the frame: a wide banner, a squarer block, a tall column
SHAPES = [(0.42,0.26),(0.36,0.30),(0.30,0.36),(0.46,0.20),(0.26,0.44)]

def analyse(path, pad=0.035, grid=30, shapes=None):
    im = Image.open(path).convert('RGB')
    small = im.resize((400, int(400*im.height/im.width)), Image.LANCZOS)
    a = np.asarray(small).astype(np.float32)
    w = np.array([0.2126,0.7152,0.0722])
    lum = a @ w
    blur = np.asarray(small.filter(ImageFilter.GaussianBlur(7))).astype(np.float32) @ w
    detail = np.abs(lum - blur)
    H, W = lum.shape
    def integ(x): return np.pad(np.cumsum(np.cumsum(x,0),1), ((1,0),(1,0)))
    Id, Il, Il2 = integ(detail), integ(lum), integ(lum**2)

    best = None
    for bw, bh in (shapes or SHAPES):
        bwp, bhp = int(bw*W), int(bh*H)
        if bwp >= W or bhp >= H: continue
        N = bwp*bhp
        def box(I,y,x): return I[y+bhp,x+bwp]-I[y,x+bwp]-I[y+bhp,x]+I[y,x]
        px, py = int(pad*W), int(pad*H)
        for y in np.linspace(py, H-bhp-py, grid).astype(int):
            for x in np.linspace(px, W-bwp-px, grid).astype(int):
                d = box(Id,y,x)/N
                m = box(Il,y,x)/N
                v = max(0.0, box(Il2,y,x)/N - m*m)**0.5
                # calm first; a mild pull to the frame edge; wider blocks preferred
                edge = min(x, W-bwp-x)/W + min(y, H-bhp-y)/H
                score = d*4.0 + v*1.6 + edge*5.0 + (0.42-bw)*6.0
                if best is None or score < best[0]:
                    best = (score, x, y, bw, bh, d, m, v, bwp, bhp, W, H)
    score,x,y,bw,bh,d,m,v,bwp,bhp,W,H = best
    calm = (d < 3.0 and v < 14.0)
    return {
        'left': round(x/W,4), 'top': round(y/H,4),
        'w': bw, 'h': bh,
        'align': 'right' if (x+bwp/2)/W > 0.55 else 'left',
        'detail': round(float(d),2), 'lum': round(float(m),1), 'spread': round(float(v),2),
        'ink': 'light' if m < 120 else 'dark',
        'calm': calm,
    }
