#!/usr/bin/env python3
"""
THE COMPOUND — the label's molecular linework, cut as an asset.

What is printed on the pack is a skeletal molecule, not a honeycomb: a
column of fused flat-top hexagons up the left edge of the label, a
branching chain with atom nodes down the right, both fading toward the
centre so the type sits on clear navy. It is foil on the pack. Here it
is redrawn to a grid — bond length L, 120 degree joints, stroke L/24,
atom radius L/10 — so it holds at any size and recolours to any cut.

Writes
  img/vector/sko-compound.svg            the composition, 16:9, faded, currentColor
  img/vector/sko-compound-fragments.svg  the two fragments unfaded, for placing by hand
  img/pattern/compound-{white,halo,blue,deep}-2400.png   transparent overlays
  img/pattern/compound-on-field-{2400,1x1,9x16}.jpg      system plates

Run from the repo root:  python3 tools/compound.py
"""
import os, math, subprocess, io
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VEC  = os.path.join(ROOT, 'img/vector'); PAT = os.path.join(ROOT, 'img/pattern')
COL  = {'white': '#FFFFFF', 'halo': '#9DBFD9', 'blue': '#173384', 'deep': '#092266'}
FIELD = (36, 67, 153)

S3 = math.sqrt(3)

def hexv(cx, cy, L):
    """flat-top hexagon: vertex k at angle 60k, so 0=right, 3=left, top edge 4-5"""
    return [(cx + L * math.cos(math.radians(60 * k)), cy + L * math.sin(math.radians(60 * k))) for k in range(6)]

def column(L):
    """left fragment: hexes fused on their horizontal edges, side bonds off
    alternating vertices with an atom on the end — what the label does"""
    segs, dots = [], []
    for k in range(-3, 4):
        v = hexv(0, k * S3 * L, L)
        for i in range(6): segs.append((v[i], v[(i + 1) % 6]))
        # bonds leave the left/right vertices horizontally, alternating sides
        if k % 2 == 0:
            a, b = v[3], (v[3][0] - L, v[3][1]); segs.append((a, b)); dots.append(b)
        else:
            a, b = v[0], (v[0][0] + L, v[0][1]); segs.append((a, b)); dots.append(b)
        if k % 3 == 0: dots.append(v[0] if k % 2 == 0 else v[3])
    return segs, dots

def branch(L):
    """right fragment: one ring with a zigzag chain leaving each end, atoms on
    alternate joints and every terminal"""
    segs, dots = [], []
    v = hexv(0, 0, L)
    for i in range(6): segs.append((v[i], v[(i + 1) % 6]))
    def chain(start, dirs):
        p = start
        for j, ang in enumerate(dirs):
            q = (p[0] + L * math.cos(math.radians(ang)), p[1] + L * math.sin(math.radians(ang)))
            segs.append((p, q))
            if j % 2 == 1: dots.append(q)
            p = q
        dots.append(p)
    chain(v[5], [-60, -120, -60, -120, -60])          # up from the upper-right vertex
    chain(v[1], [60, 120, 60, 120, 60, 120])          # down from the lower-right vertex
    chain(v[4], [180, 240])                           # a short stub off the upper-left
    chain(v[2], [180])                                # and one off the lower-left
    dots += [v[4], v[2]]
    return segs, dots

def draw(segs, dots, L, ox, oy, colour, op=1):
    sw, r = L / 24, L / 10
    p = ' '.join(f'M{a[0]+ox:.1f} {a[1]+oy:.1f}L{b[0]+ox:.1f} {b[1]+oy:.1f}' for a, b in segs)
    c = ''.join(f'<circle cx="{d[0]+ox:.1f}" cy="{d[1]+oy:.1f}" r="{r:.1f}"/>' for d in dots)
    return (f'<g opacity="{op}" fill="{colour}" stroke="{colour}" stroke-width="{sw:.2f}" '
            f'stroke-linecap="round" stroke-linejoin="round"><path fill="none" d="{p}"/>{c}</g>')

def composition(W, H, colour, fade=True):
    """the two fragments at the edges of a W×H frame, fading toward the centre"""
    L = H / 9.5 if W >= H else W / 9.2
    segs_l, dots_l = column(L); segs_r, dots_r = branch(L)
    lx, rx = W * 0.105, W * 0.885
    if W < H: lx, rx = W * 0.09, W * 0.91
    defs = ''
    if fade:
        defs = (f'<defs><linearGradient id="fl" x1="0" x2="1"><stop offset="0.35" stop-color="#fff"/>'
                f'<stop offset="1" stop-color="#000"/></linearGradient>'
                f'<linearGradient id="fr" x1="1" x2="0"><stop offset="0.35" stop-color="#fff"/>'
                f'<stop offset="1" stop-color="#000"/></linearGradient>'
                f'<mask id="ml"><rect x="0" y="0" width="{W*0.5}" height="{H}" fill="url(#fl)"/></mask>'
                f'<mask id="mr"><rect x="{W*0.5}" y="0" width="{W*0.5}" height="{H}" fill="url(#fr)"/></mask></defs>')
    body = (f'<g mask="url(#ml)">{draw(segs_l, dots_l, L, lx, H/2, colour)}</g>'
            f'<g mask="url(#mr)">{draw(segs_r, dots_r, L, rx, H/2 - L*0.6, colour)}</g>') if fade else \
           (draw(segs_l, dots_l, L, lx, H/2, colour) + draw(segs_r, dots_r, L, rx, H/2 - L*0.6, colour))
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'{defs}{body}</svg>')

def fragments_svg(colour):
    L = 100
    sl, dl = column(L); sr, dr = branch(L)
    W, H = 1400, 1500
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'{draw(sl, dl, L, 380, H/2, colour)}{draw(sr, dr, L, 1000, H/2 - 60, colour)}</svg>')

def render(svg, w):
    png = subprocess.run(['rsvg-convert', '-w', str(w), '-f', 'png'], input=svg.encode(),
                         check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert('RGBA')

def plate(W, H, name, lock_frac, op=0.62):
    img = Image.new('RGB', (W, H), FIELD)
    ov = render(composition(W, H, '#FFFFFF'), W)
    a = ov.getchannel('A').point(lambda v: int(v * op)); ov.putalpha(a)
    img.paste(ov, (0, 0), ov)
    lock = Image.open(os.path.join(VEC, 'lockup-1x1-white-2000.png')).convert('RGBA')
    lw = int(W * lock_frac); lock = lock.resize((lw, int(lock.height * lw / lock.width)), Image.LANCZOS)
    img.paste(lock, ((W - lw) // 2, (H - lock.height) // 2), lock)
    p = os.path.join(PAT, f'compound-on-field-{name}.jpg'); img.save(p, quality=94, subsampling=0)
    print('wrote', os.path.relpath(p, ROOT))

def wallpaper():
    """the DON'T: hexagons everywhere, no atoms, no fade — wallpaper"""
    W, H, L = 2400, 1500, 110
    segs = []
    for row in range(-1, 11):
        for col in range(-1, 18):
            cx = col * 1.5 * L; cy = row * S3 * L + (S3 * L / 2 if col % 2 else 0)
            v = hexv(cx, cy, L)
            for i in range(6): segs.append((v[i], v[(i + 1) % 6]))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{draw(segs, [], L, 0, 0, "#FFFFFF")}</svg>'
    img = Image.new('RGB', (W, H), FIELD); ov = render(svg, W)
    ov.putalpha(ov.getchannel('A').point(lambda v: int(v * 0.55))); img.paste(ov, (0, 0), ov)
    p = os.path.join(PAT, 'dont-wallpaper.jpg'); img.save(p, quality=90); print('wrote', os.path.relpath(p, ROOT))

if __name__ == '__main__':
    os.makedirs(PAT, exist_ok=True)
    open(os.path.join(VEC, 'sko-compound.svg'), 'w').write(composition(2400, 1500, 'currentColor'))
    open(os.path.join(VEC, 'sko-compound-fragments.svg'), 'w').write(fragments_svg('currentColor'))
    print('wrote img/vector/sko-compound.svg, sko-compound-fragments.svg')
    for name, hexc in COL.items():
        im = render(composition(2400, 1500, hexc), 2400)
        p = os.path.join(PAT, f'compound-{name}-2400.png'); im.save(p)
        print('wrote', os.path.relpath(p, ROOT), im.size)
    plate(2400, 1500, '2400', 0.22)
    plate(1200, 1200, '1x1', 0.40)
    plate(1080, 1920, '9x16', 0.50)
    wallpaper()
