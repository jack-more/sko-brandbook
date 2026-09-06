#!/bin/zsh
# frost, pigment, water, machine for every SKU that has a primary but is missing shots
cd ~/sko-brandbook-site
O=img/products
GLINT="hard low winter sun from the right throwing small star-shaped specular glints off every chrome edge and off the snow crystals"
python3 -c "import json;[print(p['slug'],'|',p['name'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug name spray; do
  slug=$(echo $slug|xargs); name=$(echo $name|xargs); spray=$(echo $spray|xargs)
  CAT=img/ref2/cat/$slug.png
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  LABEL="the product is exactly the first reference, $body with its label unchanged: the holographic shield beside the white SKO COMPOUNDS lockup, then $name in large white condensed bold capitals, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then 99% Purity and Research Use Only, holographic bands; every letter fully visible. No text anywhere except the label. Only one product."
  for kind in frost pigment water; do
    [ -f "$O/$slug-$kind.png" ] && continue
    case $kind in
      frost) ref=img/proof/frost.png; scene="the same product pressed into deep powder snow with snow bursting up around it, frost on the cap and shoulders, the same cold blue light, the same deep ultramarine to sky blue backdrop, the same framing";;
      pigment) ref=img/proof/powder.png; scene="the same bed of ultramarine blue pigment powder, the same raking light, the same product lying on its side half sunk into the powder with dust on the cap and a clean label, the same framing";;
      water) ref=img/proof/water.png; scene="the same product standing in shallow ultramarine water with hard sun caustics and a broken reflection, the same blue floor, the same framing";;
      machine) ref=img/proof/gimbal.png; scene="the same large sleek chrome gimbal, rings inside rings on a flowing base, on the same flat matte ultramarine blue ground, the same soft key light, the same framing, the product held upright at the centre of the inner ring";;
    esac
    (
      for i in 1 2; do url=$(higgsfield generate create nano_banana_2 --image $CAT --image $ref --aspect_ratio 3:4 --wait --prompt "Reproduce the second reference exactly: $scene; the only change is the product itself: $LABEL" 2>&1 | grep -oE 'https://[^ "]+\.png' | head -1); echo "$slug $kind $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-$kind.png" && break; done
    ) &
    while [ $(jobs -r | wc -l) -ge 5 ]; do sleep 2; done
  done
done; wait; echo DONE; ls $O/*.png | wc -l
