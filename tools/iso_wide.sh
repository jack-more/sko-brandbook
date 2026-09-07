#!/bin/zsh
# 16:9 Isometrica frames with the subject inside the centre third (1:1 safe), for the module
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O img/products/logs
GL="hard low winter sun from the right throwing small star-shaped glints off every chrome edge and off the snow crystals, blue-lit snow dunes at dusk, the sky a smooth gradient from deep ink blue at the top to bright sky blue at the horizon, the horizon line at the same height across the whole frame, about two fifths up from the bottom"
python3 -c "import json;[print(p['slug'],'|',p['label'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug label spray; do
  slug=$(echo $slug|xargs); label=$(echo $label|xargs); spray=$(echo $spray|xargs)
  [ -f "img/ref2/mol/$slug.jpg" ] || continue
  [ -f "$O/$slug-wide.png" ] && continue
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  P="Wide product photograph outdoors at dusk, $GL. Composition, strict: the left third and the right third of the frame are calm empty snow and sky with nothing in them at all; every part of the subject, the whole product and the entire structure to its outermost atom, sits inside the middle third of the frame with clear margin, nothing touches or crosses into the outer thirds; the structure is scaled down as much as needed to fit. In the middle third: $body stands upright in the snow toward the left, and the molecular structure drawn in the second reference, its exact skeleton, built as a chrome machine, every bond a knurled chrome strut, every atom a hex-nut joint, all of it plain mirror chrome with no coloured atoms, stands in the snow just to its right, rising to about three times its height with its lowest joints sunk into the snow. The product is exactly the first reference with its label reproduced letter for letter, the name printed exactly '$label', the dose pill exactly as printed, 99% Purity and Research Use Only, a deep navy flip-off cap over a silver crimp; every letter fully visible. No letters on the structure. No frames, borders, panels or white bands drawn in the picture; the sky and snow run edge to edge. No text anywhere except the label. Only one product."
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --image img/ref2/mol/$slug.jpg --image img/ref2/snow.jpg --aspect_ratio 16:9 --wait --prompt "$P" > img/products/logs/$slug-wide.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-wide.log | head -1); echo "$slug wide $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-wide.png" && break; sleep 12; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
