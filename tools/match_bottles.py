#!/usr/bin/env python3
"""Every cut-out bottle at the same exposure: match each one's luminance (mean and spread over its opaque pixels) to BPC-157's.
img/cut/<slug>.png -> img/products/web/<slug>-cut.png (1600px). Glass stays glass: alpha is untouched."""
import json,os
from PIL import Image, ImageStat
P=json.load(open('products.json'))
def stats(im):
    l=im.convert('L'); a=im.split()[3]; s=ImageStat.Stat(l,mask=a.point(lambda v:255 if v>200 else 0)); return s.mean[0],s.stddev[0]
ref=Image.open('img/cut/bpc-157.png').convert('RGBA'); rm,rs=stats(ref); n=0
for p in P:
    src=f"img/cut/{p['slug']}.png"
    if not os.path.exists(src): continue
    im=Image.open(src).convert('RGBA'); m,sd=stats(im)
    g=rs/max(1,sd); g=max(.8,min(1.25,g)); off=rm-m*g; off=max(-40,min(40,off))
    lut=[max(0,min(255,int(i*g+off))) for i in range(256)]
    r,gg,b,a=im.split(); im=Image.merge('RGBA',(r.point(lut),gg.point(lut),b.point(lut),a))
    bb=im.getbbox(); im=im.crop(bb) if bb else im; im.thumbnail((1600,1600)); im.save(f"img/products/web/{p['slug']}-cut.png",optimize=True); n+=1
print('matched',n,'ref mean/sd',round(rm),round(rs))
