#!/usr/bin/env python3
"""
THE WOVEN SHIELD — generator.

Regenerates img/system/woven-*.jpg from the vector master. Run from the
repo root:  python3 tools/weave.py

The first version of this clipped the weave point by point: each strand
was tested against the shield and cut where it left. That is why the
edges were chewed — every strand ended in a jagged stub, and anything the
test let through sat outside the silhouette as debris.

This draws the weave whole, edge to edge, and then multiplies it by the
shield's own antialiased alpha rendered straight from sko-mark-1c.svg.
The mask defines the silhouette, not the strand endpoints, so the edge is
exactly the shield's edge — and nothing can escape it.
"""
import subprocess, math, io, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SVG  = os.path.join(ROOT, 'img/vector/sko-mark-1c.svg')
OUT  = os.path.join(ROOT, 'img/system')

BLUE  = (23, 51, 132)      # SKO Blue
DEEP  = (9, 34, 102)       # Deep
HALO  = (157, 191, 217)    # Halo
FIELD = (36, 67, 153)      # Field
PAPER = (255, 255, 255)

SS = 3                     # supersample; the edge quality lives here


def render_svg(w):
    """The mark at width w, as RGBA. Alpha is antialiased by cairo."""
    png = subprocess.run(
        ['rsvg-convert', '-w', str(w), '-f', 'png', SVG],
        check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert('RGBA')


def split(mark):
    """Shield and wordmark, as float alpha in 0..1.

    Split on the empty band between them, not by connected component. By
    component the shield is three pieces — the outline ring, the fill
    inside it, and the helix rungs — so picking one and calling the rest
    "wordmark" hands a whole second shield to the wordmark slot. The
    lockup is stacked, so a row of blank pixels is the honest boundary.
    """
    a = np.array(mark)[..., 3].astype(np.float32) / 255.0
    H = a.shape[0]
    rows = (a > 0.35).sum(axis=1)
    gaps, start = [], None
    for y in range(H):
        if rows[y] == 0:
            if start is None:
                start = y
        elif start is not None:
            if start > 0:
                gaps.append((start, y))
            start = None
    if not gaps:
        raise SystemExit('no gap between shield and wordmark')
    cut = gaps[0][0] + (gaps[0][1] - gaps[0][0]) // 2

    shield = np.zeros_like(a); shield[:cut] = a[:cut]
    word = np.zeros_like(a);  word[cut:] = a[cut:]

    # the shield carries the helix as a knockout; fill it, because the
    # weave is what goes inside — the knockout is not part of the silhouette
    solid = ndimage.binary_fill_holes(shield > 0.35)
    solid = ndimage.binary_closing(solid, np.ones((9, 9)))
    filled = np.maximum(shield, solid.astype(np.float32))
    # keep cairo's antialiased pixels on the outer edge of the filled shape
    edge = ndimage.binary_dilation(solid, np.ones((3, 3))) & ~solid
    filled[edge] = np.maximum(filled[edge], shield[edge])
    return filled, word


def strand(dr, p0, ang, length, pitch, amp, colour, wide, phase, rungs_to):
    """One helix strand: a sine along a straight axis. Returns its points
    so the partner strand can be rung to it."""
    ca, sa = math.cos(ang), math.sin(ang)
    pts = []
    n = max(8, int(length / 3))
    for i in range(n + 1):
        t = i / n
        s = t * length
        off = math.sin(s / pitch * 2 * math.pi + phase) * amp
        pts.append((p0[0] + ca * s - sa * off, p0[1] + sa * s + ca * off))
    dr.line(pts, fill=colour, width=wide, joint='curve')
    if rungs_to is not None:
        step = max(2, n // 22)
        for i in range(0, n + 1, step):
            a, b = pts[i], rungs_to[i]
            d = math.hypot(a[0] - b[0], a[1] - b[1])
            if d < amp * 0.55:          # foreshorten to nothing at a crossing
                continue
            dr.line([a, b], fill=colour, width=max(1, wide // 3))
    return pts


def weave(W, H, ink, back, gap):
    """The lattice, drawn edge to edge with no regard for the shield."""
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    diag = math.hypot(W, H) * 1.25
    pitch = gap * 1.9
    amp = gap * 0.26
    wide = max(2, int(gap * 0.10))

    for sign, colour, w in ((-1, back, max(2, int(wide * 0.78))), (+1, ink, wide)):
        ang = math.radians(56) * sign
        ca, sa = math.cos(ang), math.sin(ang)
        # step perpendicular to the strand direction across the whole frame
        px, py = -sa, ca
        for k in range(-int(diag / gap), int(diag / gap) + 1):
            ox = W / 2 + px * k * gap - ca * diag / 2
            oy = H / 2 + py * k * gap - sa * diag / 2
            a = strand(dr, (ox, oy), ang, diag, pitch, amp, colour, w, 0.0, None)
            strand(dr, (ox, oy), ang, diag, pitch, amp, colour, w,
                   0.42 * 2 * math.pi, a)
    return img


def build(name, size, ground, ink, back, wordmark, mark_h=0.62):
    W, H = size
    canvas = Image.new('RGB', (W, H), ground)
    sw, sh = W * SS, H * SS

    # the mark, rendered big enough that the shield fills mark_h of the frame
    probe = render_svg(1200)
    pa, pw = split(probe)
    ys, xs = np.where(pa > 0.05)
    shield_frac = (ys.max() - ys.min()) / probe.size[1]

    target_shield_px = H * SS * mark_h
    svg_w = int(1200 * (target_shield_px / (shield_frac * probe.size[1])) / (1200 / probe.size[0]))
    svg_w = max(600, min(9000, svg_w))
    mark = render_svg(svg_w)
    shield, word = split(mark)

    ys, xs = np.where(shield > 0.05)
    s_h = ys.max() - ys.min() + 1
    s_w = xs.max() - xs.min() + 1

    field = weave(sw, sh, ink, back, s_w / 7.0)
    fa = np.array(field).astype(np.float32)

    # place the shield mask into the supersampled frame
    mask = np.zeros((sh, sw), np.float32)
    ox = (sw - s_w) // 2
    oy = int(sh * (0.50 if not wordmark else 0.40) - s_h / 2)
    crop = shield[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    y0, x0 = max(0, oy), max(0, ox)
    y1, x1 = min(sh, oy + s_h), min(sw, ox + s_w)
    mask[y0:y1, x0:x1] = crop[y0 - oy:y1 - oy, x0 - ox:x1 - ox]

    # THE WHOLE POINT: the shield's own alpha is the silhouette
    fa[..., 3] *= mask
    woven = Image.fromarray(fa.astype(np.uint8), 'RGBA').resize((W, H), Image.LANCZOS)
    canvas.paste(woven, (0, 0), woven)

    if wordmark:
        wys, wxs = np.where(word > 0.05)
        wcrop = word[wys.min():wys.max() + 1, wxs.min():wxs.max() + 1]
        wimg = np.zeros((*wcrop.shape, 4), np.uint8)
        wimg[..., 0], wimg[..., 1], wimg[..., 2] = ink
        wimg[..., 3] = (wcrop * 255).astype(np.uint8)
        wi = Image.fromarray(wimg, 'RGBA')
        tw = int(s_w * 0.86 / SS)
        wi = wi.resize((tw, max(1, int(tw * wcrop.shape[0] / wcrop.shape[1]))), Image.LANCZOS)
        canvas.paste(wi, ((W - wi.width) // 2, int(H * 0.74)), wi)

    return canvas


SIZES = {'2400': (2400, 1500), '1x1': (1200, 1200), '9x16': (1080, 1920)}
CUTS = {
    'woven-blue':  dict(ground=FIELD, ink=PAPER,  back=HALO,  wordmark=True),
    'woven-white': dict(ground=PAPER, ink=BLUE,   back=(150, 172, 214), wordmark=True),
    'woven-field': dict(ground=FIELD, ink=PAPER,  back=HALO,  wordmark=False, mark_h=0.80),
}

if __name__ == '__main__':
    for cut, kw in CUTS.items():
        for tag, size in SIZES.items():
            img = build(cut, size, **kw)
            p = os.path.join(OUT, f'{cut}-{tag}.jpg')
            img.save(p, quality=93, subsampling=0)
            print('wrote', os.path.relpath(p, ROOT), img.size)
