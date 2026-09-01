#!/usr/bin/env python3
"""
16:9 BROADCAST / CTV PLATES.

1920x1080, built to title-safe. Everything here obeys the system:

  - flat Field ground, edge to edge, no gradient (the Klein rule)
  - real product only — the catalogue renders, never a generated vial
  - the headline system: three lines, white, exactly ONE emphasis
  - claims from the closed register and nothing else
  - RESEARCH USE ONLY legible in every frame
  - the flat white shield, because it is a coloured ground

Run from the repo root:  python3 tools/ads16x9.py
"""
import os, math
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT  = os.path.join(ROOT, 'img/ads')
SCR  = '/private/tmp/claude-501/-Users-jackmorello-Desktop-jackmorellodotcom/9b9d2682-1414-4894-9f14-980ce9fe0866/scratchpad/fonts'
DM   = os.path.join(SCR, 'DMSans-Bold.ttf')
INTER= '/Users/jackmorello/sko-brand-build/desk/SKO_Creator_Deck_WIP/fonts/Inter-var.ttf'

W, H = 1920, 1080
SAFE = int(W * 0.075)                 # title-safe inset, 7.5% — inside the 90% box
FIELD = (36, 67, 153)                 # #244399
CARBON = (7, 9, 15)
WHITE = (255, 255, 255)
HALO  = (157, 191, 217)               # the single emphasis on a blue ground

# the closed register — nothing may be added here without ownership
CLAIMS = {
    'purity':  '99% PURITY',
    'tested':  '8× TESTED',
    'ship':    'SHIPS IN 24 HOURS',
    'city':    'BEVERLY HILLS',
    'orders':  'OVER 30,000 ORDERS SHIPPED',
    'coa':     'PUBLISHED CERTIFICATE OF ANALYSIS',
}
LEGAL = 'RESEARCH USE ONLY'
FOOTER_TOP = H - int(W * 0.075) - 92 - 24   # product art keeps out of this band
URL   = 'SKOCOMPOUNDS.COM'


def dm(px):
    f = ImageFont.truetype(DM, px)
    try: f.set_variation_by_axes([700])
    except Exception: pass
    return f

def inter(px, wt=500):
    f = ImageFont.truetype(INTER, px)
    try: f.set_variation_by_axes([wt])
    except Exception: pass
    return f


def tracked(d, xy, text, font, fill, track=0):
    """Draw with letter-spacing; PIL has none of its own."""
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += d.textlength(ch, font=font) + track
    return x - xy[0]

def tracked_w(d, text, font, track=0):
    return sum(d.textlength(c, font=font) for c in text) + track * max(0, len(text) - 1)


def vial(sku, height):
    im = Image.open(os.path.join(ROOT, f'img/cat/{sku}.webp')).convert('RGBA')
    r = height / im.height
    return im.resize((max(1, int(im.width * r)), height), Image.LANCZOS)


def badge_strip(d, img, items, x, y, font, pad=17, gap=13):
    """The claims as pills. Never as body copy — that is the rule."""
    for t in items:
        w = tracked_w(d, t, font, 1.6) + pad * 2
        h = font.size + pad
        d.rounded_rectangle([x, y, x + w, y + h], radius=h // 2,
                            fill=None, outline=(255, 255, 255, 130), width=2)
        tracked(d, (x + pad, y + (h - font.size) // 2 - 2), t, font, WHITE, 1.6)
        x += w + gap
    return x


def furniture(img, d, ground_dark=True):
    """Lockup, URL and the legal line in ONE row on the left.

    The legal line used to sit bottom-right, where the product hero lives
    in most of these layouts — so it landed on top of the vial. It is the
    one line that must be legible in every frame, so it does not get to
    depend on what else is in the composition.
    """
    lock = Image.open(os.path.join(ROOT, 'img/vector/lockup-1x1-white-2000.png')).convert('RGBA')
    lh = 92
    lock = lock.resize((int(lock.width * lh / lock.height), lh), Image.LANCZOS)
    top = H - SAFE - lh
    img.paste(lock, (SAFE, top), lock)
    x = SAFE + lock.width + 30
    f = inter(23, 500)
    x += tracked(d, (x, top + 30), URL, f, (255, 255, 255, 210), 3.2)
    d.ellipse([x + 16, top + 40, x + 22, top + 46], fill=(255, 255, 255, 130))
    tracked(d, (x + 38, top + 30), LEGAL, inter(23, 600), (255, 255, 255, 190), 3.6)


def headline(d, lines, x, y, size, emphasis=None, lead=1.02):
    """Three lines, white, exactly one word or phrase carrying the emphasis."""
    f = dm(size)
    for ln in lines:
        cx = x
        for word in ln.split(' '):
            col = HALO if (emphasis and word.strip('.,') == emphasis) else WHITE
            d.text((cx, y), word, font=f, fill=col)
            cx += d.textlength(word + ' ', font=f)
        y += int(size * lead)
    return y


# ---------------------------------------------------------------- plates
def plate_certificate():
    img = Image.new('RGB', (W, H), FIELD); d = ImageDraw.Draw(img, 'RGBA')
    v = vial('00', 760)
    img.paste(v, (W - SAFE - v.width - 40, (H - v.height) // 2 - 30), v)
    tracked(d, (SAFE, 236), 'SKO COMPOUNDS', inter(24, 600), (255, 255, 255, 180), 6)
    y = headline(d, ['READ THE', 'CERTIFICATE.', 'THEN DECIDE.'], SAFE, 292, 104, emphasis='CERTIFICATE')
    badge_strip(d, img, [CLAIMS['coa'], CLAIMS['tested']], SAFE, y + 44, inter(25, 600))
    furniture(img, d); return img


def plate_tested():
    img = Image.new('RGB', (W, H), CARBON); d = ImageDraw.Draw(img, 'RGBA')
    v = vial('11', 690)
    img.paste(v, (W - SAFE - v.width - 90, (H - v.height) // 2 - 20), v)
    tracked(d, (SAFE, 250), 'EVERY BATCH', inter(24, 600), (255, 255, 255, 175), 6)
    f = dm(310)
    d.text((SAFE - 8, 300), '8×', font=f, fill=HALO)
    wnum = d.textlength('8×', font=f)
    y = headline(d, ['TESTED.'], SAFE - 4, 300 + 330, 104)
    badge_strip(d, img, [CLAIMS['purity'], CLAIMS['coa']], SAFE, y + 40, inter(25, 600))
    furniture(img, d); return img


def plate_range():
    img = Image.new('RGB', (W, H), FIELD); d = ImageDraw.Draw(img, 'RGBA')
    tracked(d, (SAFE, 168), 'THE CATALOGUE', inter(24, 600), (255, 255, 255, 180), 6)
    headline(d, ['THIRTY-NINE COMPOUNDS.'], SAFE, 218, 92, emphasis='THIRTY-NINE')
    strip_y = 336
    badge_strip(d, img, [CLAIMS['purity'], CLAIMS['tested'], CLAIMS['ship']],
                SAFE, strip_y, inter(25, 600))
    # the row sits between the badge strip and the footer band, never across either
    vh, gap = 372, 20
    skus = ['00', '01', '02', '05', '08', '11', '13', '16']
    vs = [vial(s, vh) for s in skus]
    total = sum(v.width for v in vs) + gap * (len(vs) - 1)
    x = (W - total) // 2
    top = FOOTER_TOP - 34 - vh
    for v in vs:
        img.paste(v, (x, top), v); x += v.width + gap
    furniture(img, d); return img


def plate_ship():
    img = Image.new('RGB', (W, H), FIELD); d = ImageDraw.Draw(img, 'RGBA')
    # centre the vial in the band ABOVE the footer, not in the whole frame,
    # or it runs straight through the legal line
    v = vial('02', 612)
    img.paste(v, (SAFE + 30, SAFE + (FOOTER_TOP - SAFE - v.height) // 2), v)
    x0 = SAFE + v.width + 150
    tracked(d, (x0, 250), 'BEVERLY HILLS', inter(24, 600), (255, 255, 255, 180), 6)
    y = headline(d, ['SHIPS IN', '24 HOURS.'], x0, 306, 116, emphasis='24')
    badge_strip(d, img, [CLAIMS['orders'], CLAIMS['purity']], x0, y + 46, inter(25, 600))
    furniture(img, d); return img


def plate_line():
    img = Image.new('RGB', (W, H), FIELD); d = ImageDraw.Draw(img, 'RGBA')
    sh = Image.open(os.path.join(ROOT, 'img/shield/shield-white-2000.png')).convert('RGBA')
    shh = 520; sh = sh.resize((int(sh.width * shh / sh.height), shh), Image.LANCZOS)
    img.paste(sh, (W - SAFE - sh.width - 90, (H - shh) // 2 - 20), sh)
    tracked(d, (SAFE, 330), 'SKO COMPOUNDS', inter(24, 600), (255, 255, 255, 180), 6)
    headline(d, ['Research,', 'refined.'], SAFE, 386, 132)
    badge_strip(d, img, [CLAIMS['tested'], CLAIMS['city']], SAFE, 386 + 300, inter(25, 600))
    furniture(img, d); return img


PLATES = {
    'certificate': plate_certificate,
    'tested':      plate_tested,
    'range':       plate_range,
    'ship':        plate_ship,
    'line':        plate_line,
}

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for name, fn in PLATES.items():
        p = os.path.join(OUT, f'ad-16x9-{name}.jpg')
        fn().save(p, quality=94, subsampling=0)
        print('wrote', os.path.relpath(p, ROOT))
    print(f'\n{W}x{H} · title-safe inset {SAFE}px ({SAFE/W:.1%})')
