#!/usr/bin/env python3
"""
VIAL PROFILES AND UN-PROJECTED LABELS — generator.

Feeds the Array. For every catalogue render it measures the silhouette
(that IS the vial's profile, so it gets revolved rather than guessed) and
un-projects the label off the front-on shot into a true cylindrical wrap.

Run from the repo root:  python3 tools/labels.py [sku ...]
With no arguments it does every webp in img/cat.

Two things here were learned the hard way:

  - the label band is found by the FRACTION of each row that is label
    ink, not the row's mean colour. White type sitting on the label —
    the wordmark, the dosage pill, the icon row — drags a mean down and
    splits the band into fragments, which is what cut the nasal spray
    labels in half.

  - the back half is built from the label's own molecular linework, not
    a mirror of the front. A mirror puts a reversed wordmark on the back
    of every vial.

Multi-vial renders (bundles) are skipped: there is no single silhouette
to revolve.
"""
import sys, os, glob, json, math
import numpy as np
from PIL import Image, ImageDraw
import qrcode

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT  = os.path.join(ROOT, 'img/cat')
OUT  = os.path.join(CAT, 'label')
COA  = 'https://skocompounds.com/products'      # point at the COA endpoint when one exists


def runs(m):
    o, s = [], None
    for i, v in enumerate(m):
        if v and s is None: s = i
        elif not v and s is not None: o.append((s, i)); s = None
    if s is not None: o.append((s, len(m)))
    return o


def close_gaps(mask, gap):
    m = mask.copy()
    for a, b in runs(~m):
        if b - a <= gap and a > 0 and b < len(m): m[a:b] = True
    return m


def qr_panel(w, h):
    q = qrcode.QRCode(version=3, error_correction=qrcode.constants.ERROR_CORRECT_M,
                      box_size=1, border=0)
    q.add_data(COA); q.make(fit=True)
    mat = np.array(q.get_matrix()); n = mat.shape[0]
    pad = max(2, int(round(w * 0.085)))
    im = Image.new('RGB', (n, n), (246, 248, 252)); px = im.load()
    for y in range(n):
        for x in range(n):
            if mat[y][x]: px[x, y] = (9, 34, 102)
    im = im.resize((w - 2 * pad, h - 2 * pad), Image.NEAREST)
    panel = Image.new('RGB', (w, h), (246, 248, 252)); panel.paste(im, (pad, pad))
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=max(2, w // 14), fill=255)
    return panel, mask


def build(sku):
    a = np.array(Image.open(os.path.join(CAT, f'{sku}.webp')).convert('RGBA')).astype(float)
    al = a[..., 3]; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = .299 * r + .587 * g + .114 * b; blue = b - r
    op = al > 128; H, W = op.shape; w = op.sum(axis=1)
    ys = np.where(w > 4)[0]
    if ys.size == 0: return None
    top, bot = ys.min(), ys.max() + 1

    rowLum = np.zeros(H); frac = np.zeros(H)
    for y in range(H):
        if w[y] > 4:
            rowLum[y] = lum[y][op[y]].mean()
            frac[y] = ((blue[y] > 28) & op[y]).sum() / w[y]

    cands = [x for x in runs(close_gaps(frac > 0.25, 12)) if x[1] - x[0] > 20]
    if not cands: return None
    lt, lb = max(cands, key=lambda x: x[1] - x[0])

    band = op[lt:lb]
    cols = np.where(band.any(axis=0))[0]
    # a bundle is several vials side by side: the label band breaks into
    # separate columns. There is no one silhouette to revolve, so skip it.
    if len(runs(band.any(axis=0))) > 1: return 'multi'
    D = float(cols.max() + 1 - cols.min()); R = D / 2
    # overlapping bottles leave one contiguous band, so the column test
    # alone misses a bundle. A single vial is always far taller than it is
    # wide; anything squat is several of them measured as one.
    if (bot - top) / D < 1.6: return 'multi'
    xc = (cols.max() + 1 + cols.min()) / 2

    upL = rowLum[top:lt][w[top:lt] > 4]
    kind = 'spray' if (frac[top:lt].mean() < 0.08 and upL.size and upL.mean() > 150
                       and (bot - top) / D > 3) else 'vial'
    if kind == 'vial':
        cap = [x for x in runs((frac > 0.5) & (np.arange(H) < lt)) if x[1] - x[0] > 6]
        capBot = cap[0][1] if cap else top
        col = [x for x in runs((rowLum > 135) & (frac < 0.15) &
                               (np.arange(H) > capBot) & (np.arange(H) < lt)) if x[1] - x[0] > 5]
        cb, pb = (col[0][1] if col else capBot), capBot
    else:
        bodyTop = lt
        for y in range(lt - 1, top - 1, -1):
            if w[y] < 0.80 * D: bodyTop = y; break
        wide = [y for y in range(top, bodyTop) if w[y] > 0.72 * D]
        cb, pb = bodyTop, (min(wide) if wide else bodyTop)

    N = 96; prof = []
    for i in range(N + 1):
        y = int(round(top + (bot - 1 - top) * i / N))
        row = np.where(op[y])[0]
        prof.append([round((bot - y) / D, 4),
                     round((row.max() + 1 - row.min()) / 2 / D, 4) if row.size > 2 else 0.0])
    prof = prof[::-1]; prof[0][1] = min(prof[0][1], prof[1][1])

    TW = 1024; TH = lb - lt; src = a[lt:lb, :, :3]
    tex = np.zeros((TH, TW, 3)); LIM = math.radians(80)
    for u in range(TW):
        t = (u / (TW - 1) - 0.5) * 2 * math.pi
        if -math.pi / 2 <= t <= math.pi / 2:
            x = max(0, min(W - 1.001, xc + R * math.sin(max(-LIM, min(LIM, t)))))
            i0 = int(x); fr = x - i0
            tex[:, u] = src[:, i0] * (1 - fr) + src[:, i0 + 1] * fr
    f0, f1 = int(TW * .25), int(TW * .75)
    pl = tex[:, f0:f1].mean(axis=(0, 2))
    pl = np.convolve(np.pad(pl, 20, mode='edge'), np.ones(41) / 41., mode='valid')
    tex[:, f0:f1] *= np.clip(pl[len(pl) // 2] / np.maximum(pl, 1e-3), 0.72, 1.45)[None, :, None]
    s0, s1 = int(TW * .275), int(TW * .345)
    strip = tex[:, s0:s1].copy() * 0.86; sw = strip.shape[1]
    for i in range(f0):
        s = i % (2 * sw); c = strip[:, s] if s < sw else strip[:, 2 * sw - 1 - s]
        tex[:, f1 + i] = c; tex[:, f0 - 1 - i] = c

    im = Image.fromarray(np.clip(tex, 0, 255).astype('uint8'))
    labH = (bot - lt) / D - (bot - lb) / D
    pw = int(round(0.40 * TW / math.pi)); ph = int(round(0.40 * TH / labH))
    if 24 < pw < TW * 0.3 and ph > 24:
        panel, mask = qr_panel(pw, ph)
        im.paste(panel, (int(0.865 * TW) - pw // 2, TH // 2 - ph // 2), mask)
    im.save(os.path.join(OUT, f'{sku}.png'))

    return {'kind': kind, 'prof': prof, 'h': round((bot - top) / D, 4),
            'labTop': round((bot - lt) / D, 4), 'labBot': round((bot - lb) / D, 4),
            'colBot': round((bot - cb) / D, 4), 'capBot': round((bot - pb) / D, 4)}


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    gp = os.path.join(OUT, 'geom.json')
    meta = json.load(open(gp)) if os.path.exists(gp) else {}
    skus = sys.argv[1:] or sorted(os.path.splitext(os.path.basename(p))[0]
                                  for p in glob.glob(os.path.join(CAT, '*.webp')))
    made = skipped = 0
    for s in skus:
        r = build(s)
        if r == 'multi':
            print(f'  {s}  skipped — multiple vials, no single profile to revolve'); skipped += 1
        elif r is None:
            print(f'  {s}  skipped — no label band found'); skipped += 1
        else:
            meta[s] = r; made += 1
            print(f'  {s}  {r["kind"]:5}  h={r["h"]:.2f}  label {r["labBot"]:.2f}..{r["labTop"]:.2f}')
    json.dump(meta, open(gp, 'w'), separators=(',', ':'))
    print(f'{made} profiles written, {skipped} skipped — geom.json holds {len(meta)}')
