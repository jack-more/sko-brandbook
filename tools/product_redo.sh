#!/bin/zsh
cd ~/sko-brandbook-site
O=img/products
while read slug kind; do
  label=$(python3 -c "import json;print([p for p in json.load(open('products.json')) if p['slug']=='$slug'][0]['label'])")
  spray=$(python3 -c "import json;print(int([p for p in json.load(open('products.json')) if p['slug']=='$slug'][0]['spray']))")
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  LABEL="the product is exactly the first reference, $body with its label reproduced letter for letter: the holographic shield beside the white SKO COMPOUNDS lockup, then the product name printed exactly as '$label' and nothing longer, do not expand or complete the name, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then 99% Purity and Research Use Only, holographic bands; every letter fully visible. No text anywhere except the label. Only one product."
  case $kind in
    frost) ref=img/ref2/scene/frost.jpg; a=3:4; scene="Reproduce the second reference exactly: the same product pressed into deep powder snow with snow bursting up around it, frost on the cap and shoulders, the same cold blue light, the same deep ultramarine to sky blue backdrop, the same framing";;
    pigment) ref=img/ref2/scene/powder.jpg; a=3:4; scene="Reproduce the second reference exactly: the same bed of ultramarine blue pigment powder, the same raking light, the same product lying on its side half sunk into the powder with dust on the cap and a clean label, the same framing";;
    water) ref=img/ref2/scene/water.jpg; a=3:4; scene="Reproduce the second reference exactly: the same product standing in shallow ultramarine water with hard sun caustics and a broken reflection, the same blue floor, the same framing";;
    white) ref=img/ref2/scene/white-vial.jpg; a=1:1; scene="Reproduce the second reference exactly: the same seamless pure white studio ground and backdrop, the same soft light, the same soft grey contact shadow, the same framing with generous room on every side";;
  esac
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --image $ref --aspect_ratio $a --wait --prompt "$scene; the only change is the product itself: $LABEL" > img/products/logs/$slug-$kind.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-$kind.log | head -1); echo "$slug $kind $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-$kind.png" && break; sleep 5; done
  ) &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done < img/products/redo.txt; wait; echo DONE
