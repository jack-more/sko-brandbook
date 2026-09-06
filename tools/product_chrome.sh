#!/bin/zsh
cd ~/sko-brandbook-site
O=img/products
python3 -c "import json;[print(p['slug'],'|',p['label'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug label spray; do
  slug=$(echo $slug|xargs); label=$(echo $label|xargs); spray=$(echo $spray|xargs)
  [ -f "$O/$slug-chrome.png" ] && continue
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --image img/ref2/scene/snow-cradle.jpg --aspect_ratio 3:4 --wait --prompt "Reproduce the second reference exactly: the same sleek chrome cradle half sunk in the same blue-lit snow dunes at dusk, the same gradient sky, the same star-shaped glints on the chrome and the snow, the same framing, the product held upright in the cradle; the only change is the product itself: it is exactly the first reference, $body with its label reproduced letter for letter: the holographic shield beside the white SKO COMPOUNDS lockup, then the product name printed exactly as '$label' and nothing longer, do not expand or complete the name, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then the remaining label text exactly as on the reference; every letter fully visible. No text anywhere except the label. Only one product." > img/products/logs/$slug-chrome.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-chrome.log | head -1); echo "$slug chrome $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-chrome.png" && break; sleep 5; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
