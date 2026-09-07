#!/bin/zsh
# all six shots for the SKUs given as args (slugs in products.json with a ref in img/ref2/cat), then web jpgs
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O/logs
for slug in "$@"; do
  name=$(python3 -c "import json,sys;print(next(p['name'] for p in json.load(open('products.json')) if p['slug']==sys.argv[1]))" $slug)
  label=$(python3 -c "import json,sys;print(next(p['label'] for p in json.load(open('products.json')) if p['slug']==sys.argv[1]))" $slug)
  CAT=img/ref2/cat/$slug.png; body="the vial"
  LABEL="the product is exactly the first reference, $body with its label unchanged: the holographic shield beside the white SKO COMPOUNDS lockup, then the product name printed exactly as '$label' and nothing longer, do not expand or complete the name, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then 99% Purity and Research Use Only, holographic bands; every letter fully visible. No text anywhere except the label. Only one product."
  for kind in primary white chrome frost pigment water; do
    [ -f "$O/$slug-$kind.png" ] && continue
    case $kind in
      primary) ar=1:1; refs=(--image $CAT); prompt="Studio product photograph. This exact glass vial from the reference stands upright, centred, on a flat matte ultramarine blue ground (International Klein Blue) that fills the whole frame, seamless, with a soft contact shadow and generous room on every side. Soft large key light from upper left. The label is exactly the reference label, unchanged: the holographic shield beside the white SKO COMPOUNDS lockup, then the product name printed exactly as '$label' and nothing longer, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then 99% Purity and Research Use Only, holographic bands; every letter fully visible. No text anywhere except the label. Only one product.";;
      white) ar=1:1; refs=(--image $CAT --image img/ref2/scene/white-vial.jpg); prompt="Reproduce the second reference exactly: the same seamless pure white studio ground and backdrop, the same soft light from above with one soft key from the upper left, the same soft grey contact shadow, the same framing with generous room on every side, the cap picking up the same faint blue reflection; the only change is the product itself: $LABEL";;
      chrome) ar=3:4; refs=(--image $CAT --image img/ref2/scene/snow-cradle.jpg); prompt="Reproduce the second reference exactly: the same sleek chrome cradle half sunk in the same blue-lit snow dunes at dusk, the same gradient sky, the same star-shaped glints on the chrome and the snow, the same framing, the product held upright in the cradle; the only change is the product itself: $LABEL";;
      frost) ar=3:4; refs=(--image $CAT --image img/ref2/scene/frost.jpg); prompt="Reproduce the second reference exactly: the same product pressed into deep powder snow with snow bursting up around it, frost on the cap and shoulders, the same cold blue light, the same deep ultramarine to sky blue backdrop, the same framing; the only change is the product itself: $LABEL";;
      pigment) ar=3:4; refs=(--image $CAT --image img/ref2/scene/powder.jpg); prompt="Reproduce the second reference exactly: the same bed of ultramarine blue pigment powder, the same raking light, the same product lying on its side half sunk into the powder with dust on the cap and a clean label, the same framing; the only change is the product itself: $LABEL";;
      water) ar=3:4; refs=(--image $CAT --image img/ref2/scene/water.jpg); prompt="Reproduce the second reference exactly: the same product standing in shallow ultramarine water with hard sun caustics and a broken reflection, the same blue floor, the same framing; the only change is the product itself: $LABEL";;
    esac
    (
      for i in 1 2 3; do higgsfield generate create nano_banana_2 --resolution 4k "${refs[@]}" --aspect_ratio $ar --wait --prompt "$prompt" > $O/logs/$slug-$kind.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' $O/logs/$slug-$kind.log | head -1); echo "$slug $kind $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-$kind.png" && break; sleep 5; done
    ) &
    while [ $(jobs -r | wc -l) -ge 5 ]; do sleep 2; done
  done
done; wait
# web jpgs, same sizes as the rest of the catalogue
python3 - "$@" <<'PY'
import sys,os
from PIL import Image
for slug in sys.argv[1:]:
    for kind in ['primary','white','chrome','frost','pigment','water']:
        src=f'img/products/{slug}-{kind}.png'; dst=f'img/products/web/{slug}-{kind}.jpg'
        if not os.path.exists(src): print('MISSING',src); continue
        im=Image.open(src).convert('RGB'); w,h=im.size
        nh=1400; nw=round(w*nh/h)
        im.resize((nw,nh),Image.LANCZOS).save(dst,quality=88,optimize=True,progressive=True); print('web',dst,(nw,nh))
PY
echo DONE
