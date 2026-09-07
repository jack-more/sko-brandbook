#!/bin/zsh
# 1:1 Isometrica frames made from each wide frame: same scene, everything fits the square
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O img/products/logs img/ref2/wide
python3 -c "import json;[print(p['slug'],'|',p['label'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug label spray; do
  slug=$(echo $slug|xargs); label=$(echo $label|xargs); spray=$(echo $spray|xargs)
  [ -f "$O/$slug-wide.png" ] || continue
  [ -f "$O/$slug-square.png" ] && continue
  python3 -c "from PIL import Image;im=Image.open('$O/$slug-wide.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/ref2/wide/$slug.jpg',quality=90)"
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  P="Reproduce the second reference exactly as a square photograph: the same snow, the same sky gradient, the same light and glints, the same product and the same chrome structure with the same shape, now composed to fit a square frame: $body stands upright in the snow left of centre, its full width inside the frame with clear snow to its left, never touching or crossing the frame edge, and the whole structure stands to its right, every atom of it inside the frame with clear margin on all sides, both scaled down as needed so nothing is cut off. The product is exactly the first reference with its label reproduced letter for letter, the name printed exactly '$label', the dose pill exactly as printed, 99% Purity and Research Use Only; every letter fully visible. Flawless mirror chrome, no hex nuts, no bolts. No frames or bands drawn in the picture. No text anywhere except the label. Only one product."
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --image img/ref2/wide/$slug.jpg --aspect_ratio 1:1 --wait --prompt "$P" > img/products/logs/$slug-square.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-square.log | head -1); echo "$slug square $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-square.png" && break; sleep 12; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
