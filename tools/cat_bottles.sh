#!/bin/zsh
# one bottle, every label: the catalogue renders (same bottle, same light, printed label) -> Topaz 2x -> cut out -> web
cd ~/sko-brandbook-site; mkdir -p img/hd/_in img/hd/cat img/cut img/products/logs
python3 -c "import json;[print(p['slug']) for p in json.load(open('products.json'))]" | while read slug; do
  src="img/ref2/cat/$slug.png"; [ -f "$src" ] || continue
  [ -f "img/cut/$slug.png" ] && [ -f "img/hd/cat/$slug.png" ] && continue
  (
    python3 -c "from PIL import Image;im=Image.open('$src').convert('RGB');im.save('img/hd/_in/cat-$slug.jpg',quality=95,subsampling=0);print(im.size[0]*2,im.size[1]*2)" | read w h
    for i in 1 2 3; do higgsfield generate create topaz_image --image img/hd/_in/cat-$slug.jpg --output_width $w --output_height $h --variant CGI --wait > img/products/logs/hdcat-$slug.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.(png|jpg)' img/products/logs/hdcat-$slug.log | head -1); [ -n "$url" ] && curl -sL "$url" -o img/hd/cat/$slug.png && break; sleep 10; done
    [ -f img/hd/cat/$slug.png ] || exit 0
    python3 -c "from PIL import Image;im=Image.open('img/hd/cat/$slug.png').convert('RGB');im.save('img/hd/_in/cut-$slug.jpg',quality=95,subsampling=0)"
    for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/cut-$slug.jpg --wait > img/products/logs/cut-$slug.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/cut-$slug.log | head -1); echo "$slug $url"; [ -n "$url" ] && curl -sL "$url" -o img/cut/$slug.png && break; sleep 10; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
