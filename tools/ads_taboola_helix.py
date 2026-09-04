#!/usr/bin/env python3
"""
TABOOLA PLATES ON THE HELIX — full 16:9, complete 1:1.

The feed shows a 16:9 and crops it to the centre square, so:
  - inside the square (x 420..1500): the vial, the headline, the claim
    line, the lockup and the legal — everything pertinent
  - right wing: the chrome helix, with the compound linework running
    off the edge (from the cover render)
  - left wing: the compound column (from the compound master)
All three sit on the same flat Field blue, so they read as one frame.
Native rule holds: nothing readable under 56px at 1920.

Run from the repo root:  python3 tools/ads_taboola_helix.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'img/ads/taboola-helix'); os.makedirs(OUT, exist_ok=True)
DM   = '/private/tmp/claude-501/-Users-jackmorello-Desktop-jackmorellodotcom/9b9d2682-1414-4894-9f14-980ce9fe0866/scratchpad/fonts/DMSans-Bold.ttf'
INTER= '/Users/jackmorello/sko-brand-build/desk/SKO_Creator_Deck_WIP/fonts/Inter-var.ttf'
W, H = 1920, 1080
SQ0, SQ1 = (W - H) // 2, (W - H) // 2 + H          # 420 .. 1500, the 1:1 crop
WHITE = (255, 255, 255); HALO = (157, 191, 217)

def dm(px):
    f = ImageFont.truetype(DM, px)
    try: f.set_variation_by_axes([700])
    except Exception: pass
    return f
def inter(px, wt=600):
    f = ImageFont.truetype(INTER, px)
    try: f.set_variation_by_axes([wt])
    except Exception: pass
    return f
def tw(d, t, f, k=0): return sum(d.textlength(c, font=f) for c in t) + k * max(0, len(t) - 1)
def tracked(d, xy, t, f, fill, k):
    x, y = xy
    for c in t: d.text((x, y), c, font=f, fill=fill); x += d.textlength(c, font=f) + k
def wrap(d, words, f, maxw):
    lines, cur = [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines
def fit_headline(d, text, maxw, maxlines=3):
    for px in range(124, 76, -4):
        lines = wrap(d, text.split(' '), dm(px), maxw)
        if len(lines) <= maxlines and all(d.textlength(l, font=dm(px)) <= maxw for l in lines):
            return px, lines
    return 76, wrap(d, text.split(' '), dm(76), maxw)

def feather_left(im, px):
    """alpha ramp on the left edge so a pasted crop never shows a seam"""
    a = np.array(im.getchannel('A'), dtype=float)
    ramp = np.clip(np.arange(im.width) / px, 0, 1)[None, :]
    im.putalpha(Image.fromarray((a * ramp).astype('uint8')))
    return im
def feather_right(im, px):
    a = np.array(im.getchannel('A'), dtype=float)
    ramp = np.clip((im.width - 1 - np.arange(im.width)) / px, 0, 1)[None, :]
    im.putalpha(Image.fromarray((a * ramp).astype('uint8')))
    return im

def keyed(path, ground):
    """cut a subject off its flat ground: alpha from colour distance, so
    the shadow comes with it as a darker, partly-transparent blue"""
    a = np.array(Image.open(path).convert('RGB')).astype(float)
    # key against the plate's OWN ground, not the frame's: two renders of
    # 'the same blue' differ by enough to key the whole image as subject
    g = a[40:140, 40:140].reshape(-1, 3).mean(axis=0)
    dist = np.linalg.norm(a - g, axis=2)
    alpha = np.clip((dist - 6) / 40, 0, 1)
    # premultiplied colour so the soft edge does not fringe
    out = np.dstack([a, alpha[..., None] * 255]).astype('uint8')
    im = Image.fromarray(out)
    # box the solid glass, then allow a margin for the soft shadow it casts
    solid = alpha > 0.95
    # the glass is the tall thing; the shadow is wide but short, so pick the
    # columns where the solid mask runs a good part of the height
    cover = solid.mean(axis=0); cols = np.where(cover > 0.22)[0]
    x0, x1 = cols.min(), cols.max() + 1
    rows = np.where(solid[:, x0:x1].any(axis=1))[0]; y0, y1 = rows.min(), rows.max() + 1
    bw, bh = x1 - x0, y1 - y0
    return im.crop((max(0, x0 - int(bw * 0.06)), max(0, y0 - int(bh * 0.02)),
                    min(im.width, x1 + int(bw * 0.34)), min(im.height, y1 + int(bh * 0.10))))

# ---- the frame ------------------------------------------------------
helix = Image.open(os.path.join(ROOT, 'img/gen/helix-compound-1.png')).convert('RGB')
blue = tuple(int(v) for v in np.array(helix)[60:120, 60:120].reshape(-1, 3).mean(axis=0))
hw, hh = helix.size
# right wing: the helix at the render's own scale, placed by its centre so
# it sits in the wing (x~1690), the compound trailing off the right edge
HELIX_CX = 0.685                                   # where the helix is in the render
START = 0.55
sc = H / hh
crop = helix.crop((int(hw * START), 0, hw, hh)).resize((int((hw - hw * START) * sc), H), Image.LANCZOS).convert('RGBA')
crop = feather_left(crop, 120)
CROP_X = int(1690 - (HELIX_CX - START) * hw * sc)
# left wing: the compound column
comp = Image.open(os.path.join(ROOT, 'img/gen/compound-chrome-1.png')).convert('RGB')
cw, ch = comp.size
col = comp.crop((0, 0, int(cw * 0.22), ch)).resize((int(W * 0.22), H), Image.LANCZOS).convert('RGBA')
col = feather_right(col, 90)
# the vial: the safe bottle cutout (real alpha), with a contact shadow drawn
# under it so it stands on the Field instead of floating in it
def vial_with_shadow(height):
    v = Image.open(os.path.join(ROOT, 'img/ads/_safe-bottle.png')).convert('RGBA')
    a = np.array(v.getchannel('A')); ys, xs = np.where(a > 8)
    v = v.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    v = v.resize((int(v.width * height / v.height), height), Image.LANCZOS)
    pad = int(v.width * 0.28)
    canvas = Image.new('RGBA', (v.width + pad * 2, height + int(height * 0.08)), (0, 0, 0, 0))
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    cx, cy = canvas.width // 2 + int(v.width * 0.18), height - int(height * 0.01)
    sd.ellipse([cx - int(v.width * 0.95), cy - int(height * 0.035), cx + int(v.width * 0.95), cy + int(height * 0.035)],
               fill=(6, 16, 60, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(int(height * 0.028)))
    canvas.alpha_composite(sh)
    canvas.alpha_composite(v, (pad, 0))
    return canvas
vial = vial_with_shadow(640)

lock = Image.open(os.path.join(ROOT, 'img/vector/lockup-1x1-white-2000.png')).convert('RGBA')
lh = 112; lock = lock.resize((int(lock.width * lh / lock.height), lh), Image.LANCZOS)

PLATES = [
    ('refined',  'Research, refined.',                 'BEVERLY HILLS · 8× TESTED',        'refined'),
    ('secret',   "Beverly Hills' most trusted secret.", 'OVER 38,000 ORDERS SHIPPED',       'secret.'),
    ('tested',   'Every batch. 8× tested.',            'BEVERLY HILLS · 99% PURITY',       '8×'),
    ('ships',    'Ships in 24 hours.',                 'OVER 38,000 ORDERS SHIPPED',       '24'),
    ('rated',    'Rated 4.8 on Trustpilot.',           '431 REVIEWS · 8× TESTED',          '4.8'),
]

VX = SQ0 + 28                      # vial column, fully inside the square
TX = VX + vial.width + 22          # type column
TMAX = 1470 - TX                   # and must clear the helix

for key, head, sub, emph in PLATES:
    img = Image.new('RGB', (W, H), blue)
    img.paste(col, (0, 0), col)
    img.paste(crop, (CROP_X, 0), crop)
    img.paste(vial, (VX, H - 52 - vial.height), vial)
    d = ImageDraw.Draw(img, 'RGBA')

    px, lines = fit_headline(d, head, TMAX)
    f = dm(px); lead = int(px * 1.02)
    subf = inter(56, 600); subk = 3
    if tw(d, sub, subf, subk) <= TMAX: subs = [sub]
    elif '·' in sub: subs = [x.strip() for x in sub.split('·')]
    else: subs = wrap(d, sub.split(' '), subf, TMAX)
    block = len(lines) * lead + 30 + 64 * len(subs)
    y = (H - 60 - lh - 40 - block) // 2 + 10        # centred in the band above the furniture
    for ln in lines:
        x = TX
        for word in ln.split(' '):
            colr = HALO if word.strip('.,') == emph.strip('.,') else WHITE
            d.text((x, y), word, font=f, fill=colr); x += d.textlength(word + ' ', font=f)
        y += lead
    y += 30
    for s in subs:
        tracked(d, (TX, y), s, subf, (255, 255, 255, 235), subk); y += 64

    fy = H - 60 - lh
    img.paste(lock, (TX, fy), lock)
    lf = inter(34, 600)
    tracked(d, (TX + lock.width + 30, fy + 18), 'SKOCOMPOUNDS.COM', lf, (255, 255, 255, 220), 4)
    tracked(d, (TX + lock.width + 30, fy + 64), 'RESEARCH USE ONLY', lf, (255, 255, 255, 200), 4)

    img.save(os.path.join(OUT, f'taboola-helix-{key}.jpg'), quality=94, subsampling=0)
    img.crop((SQ0, 0, SQ1, H)).save(os.path.join(OUT, f'taboola-helix-{key}-1x1.jpg'), quality=94, subsampling=0)
    print(f'{key:8} headline {px}px x {len(lines)}   type x {TX}..{TX+TMAX}')
