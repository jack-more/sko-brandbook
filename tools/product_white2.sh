#!/bin/zsh
# the white studio shot, re-rolled from each SKU's own badge render so the vial, its proportions and the light match the set
cd ~/sko-brandbook-site; O=img/products; mkdir -p $O/_drift img/products/logs img/ref2/badge
python3 -c "import json;[print(p['slug'],'|',p['label'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug label spray; do
  slug=$(echo $slug|xargs); label=$(echo $label|xargs); spray=$(echo $spray|xargs)
  [ -f "$O/$slug-badge.png" ] || continue
  [ -f "$O/$slug-white2.png" ] && continue
  python3 -c "from PIL import Image;im=Image.open('$O/$slug-badge.png').convert('RGB');im.thumbnail((1400,1400));im.save('img/ref2/badge/$slug.jpg',quality=88)"
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; closure="its white atomiser cap"; else body="the vial"; closure="a deep navy flip-off cap over a silver crimp"; fi
  P="Square product photograph. Reproduce the product from the second reference exactly: the same $body, the same proportions, the same label, the same soft key from the upper left and the same soft grey contact shadow, in the same seamless white studio, but now completely alone: remove the chrome shield and everything else, so the product stands centred on white with clear margin on every side and nothing else in the frame. The product is exactly the first reference with its label reproduced letter for letter, the name printed exactly '$label', the dose pill exactly as printed, 99% Purity and Research Use Only, $closure; every letter fully visible and in perfect focus. White is pure and even, never grey. No text anywhere except the label. Only one product."
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --resolution 4k --image img/ref2/cat/$slug.png --image img/ref2/badge/$slug.jpg --aspect_ratio 1:1 --wait --prompt "$P" > img/products/logs/$slug-white2.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-white2.log | head -1); echo "$slug white2 $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-white2.png" && break; sleep 12; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
