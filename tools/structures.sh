#!/bin/zsh
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O img/products/logs
GL="hard low winter sun from the right throwing small star-shaped glints off every chrome edge and off the snow crystals, blue-lit snow dunes at dusk, the sky a smooth gradient from deep ink blue at the top to bright sky blue at the horizon"
python3 -c "import json;[print(p['slug'],'|',p['label'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug label spray; do
  slug=$(echo $slug|xargs); label=$(echo $label|xargs); spray=$(echo $spray|xargs)
  [ -f "img/ref2/mol/$slug.jpg" ] || continue
  [ -f "$O/$slug-structure.png" ] && continue
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  P="Product photograph outdoors at dusk, $GL. The molecular structure drawn in the second reference, its exact skeleton, the same bonds, rings and branches in the same arrangement, is built as a chrome machine standing in the snow: every bond a thick machined chrome strut with a knurled collar at each end, every atom a polished chrome hex-nut joint, the whole structure engineered like precision equipment, about four times the height of the product, its lowest joints sunk into the snow. The product stands upright in the snow at its base: exactly the first reference, $body with its label reproduced letter for letter, the product name printed exactly as '$label', the dose pill exactly as printed, a deep navy flip-off cap over a silver crimp; every letter fully visible. No letters on the structure. No text anywhere except the label. Only one product."
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --image img/ref2/mol/$slug.jpg --image img/ref2/snow.jpg --aspect_ratio 3:4 --wait --prompt "$P" > img/products/logs/$slug-structure.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-structure.log | head -1); echo "$slug structure $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-structure.png" && break; sleep 12; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
