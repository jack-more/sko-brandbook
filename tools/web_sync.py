#!/usr/bin/env python3
"""img/products/<slug>-<kind>.png -> img/products/web/<slug>-<kind>.jpg (2000px) and site/manifest.json. Idempotent."""
import json,os
from PIL import Image
P=json.load(open('products.json')); man=json.load(open('site/manifest.json')); n=0
for p in P:
    s=p['slug']; kinds=man.setdefault(s,[])
    for f in os.listdir('img/products'):
        if f.startswith(s+'-') and f.endswith('.png'):
            k=f[len(s)+1:-4]
            if '-' in k and k not in('square','wide'): continue
            dst=f'img/products/web/{s}-{k}.jpg'; src='img/products/'+f
            if not os.path.exists(dst) or os.path.getmtime(dst)<os.path.getmtime(src):
                im=Image.open(src).convert('RGB'); im.thumbnail((2000,2000),Image.LANCZOS); im.save(dst,quality=88); n+=1
            if k not in kinds: kinds.append(k)
json.dump(man,open('site/manifest.json','w'),indent=1); print('web jpgs written',n)
