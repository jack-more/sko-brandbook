#!/usr/bin/env python3
"""One master, every label: every white-studio shot gets the product at the same height, centred, on the same white.
img/products/<slug>-white2.png -> img/products/web/<slug>-white.jpg (2000px 1:1). Sprays are taller, so they get a taller target."""
import json,os,sys
from PIL import Image, ImageFilter
P=json.load(open('products.json')); OUT=4000; done=[]
for p in P:
    src=f"img/hd/{p['slug']}-white2.png"
    if not os.path.exists(src): src=f"img/products/{p['slug']}-white2.png"
    if not os.path.exists(src): continue
    im=Image.open(src).convert('RGB'); w,h=im.size
    # the product is whatever is darker than the studio; the soft shadow is excluded by the threshold
    g=im.convert('L').filter(ImageFilter.GaussianBlur(2)); mask=g.point(lambda v:255 if v<205 else 0); bb=mask.getbbox()
    if not bb: continue
    x0,y0,x1,y1=bb; ph=y1-y0; pw=x1-x0
    target=OUT*(0.66 if p['spray'] else 0.60)                      # product height on the tile
    s=target/ph; nw,nh=int(w*s),int(h*s); im2=im.resize((nw,nh),Image.LANCZOS)
    cx=int((x0+x1)/2*s); cy0=int(y0*s)
    top=int(OUT*0.16); left=OUT//2-cx; up=top-cy0                    # product top at 16% of the tile
    # sample the studio white from the top-left corner of the render and pad with it
    # level the studio to pure white: the corner sample becomes 255 per channel, everything scales with it
    bg=im.getpixel((6,6)); f=[255/max(1,c) for c in bg]
    im2=im2.point([min(255,int(i*f[ch])) for ch in range(3) for i in range(256)]) if hasattr(im2,'point') else im2
    canvas=Image.new('RGB',(OUT,OUT),(255,255,255)); canvas.paste(im2,(left,up))
    canvas.save(f"img/products/web/{p['slug']}-white.jpg",quality=88); done.append(p['slug'])
print('normalised',len(done))
