#!/bin/zsh
# the bottle alone, cut out: img/hd/<slug>-white2.png (or the 2k render) -> img/cut/<slug>.png -> img/products/web/<slug>-cut.png (1600px) + manifest kind 'cut'
cd ~/sko-brandbook-site; mkdir -p img/cut img/hd/_in img/products/logs
python3 -c "import json;[print(p['slug']) for p in json.load(open('products.json'))]" | while read slug; do
  [ -f "img/cut/$slug.png" ] && continue
  src="img/hd/$slug-white2.png"; [ -f "$src" ] || src="img/products/$slug-white2.png"; [ -f "$src" ] || continue
  python3 -c "from PIL import Image;im=Image.open('$src').convert('RGB');im.thumbnail((3000,3000));im.save('img/hd/_in/$slug-cut.jpg',quality=95)"
  (for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/$slug-cut.jpg --wait > img/products/logs/cut-$slug.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/cut-$slug.log | head -1); echo "$slug $url"; [ -n "$url" ] && curl -sL "$url" -o "img/cut/$slug.png" && break; sleep 10; done) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait
python3 - <<'PY'
import json,os
from PIL import Image
man=json.load(open('site/manifest.json')); n=0
for f in os.listdir('img/cut'):
    if not f.endswith('.png'): continue
    slug=f[:-4]; im=Image.open('img/cut/'+f).convert('RGBA'); bb=im.getbbox(); im=im.crop(bb) if bb else im
    im.thumbnail((1600,1600)); im.save(f'img/products/web/{slug}-cut.png',optimize=True); n+=1
    if 'cut' not in man.setdefault(slug,[]): man[slug].append('cut')
json.dump(man,open('site/manifest.json','w'),indent=1); print('cutouts',n)
PY
echo DONE
