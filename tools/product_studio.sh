#!/bin/zsh
# white-studio product shots, 1:1, per SKU: badge (white studio / chrome) and rock (white studio / blues)
# usage: product_studio.sh [slug ...]   (no args = every SKU missing a shot)
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O img/products/logs
gen(){ # slug label spray kind
  local slug=$1 label=$2 spray=$3 kind=$4
  if [ "$spray" = "1" ]; then body="the nasal spray bottle, white atomiser"; closure="its white atomiser cap"; else body="the vial"; closure="a deep navy flip-off cap over a silver crimp"; fi
  case $kind in
    badge) scene="the scene of the second reference exactly: a seamless white studio, lit flat with one soft key from the upper left, soft grey contact shadows; $body stands upright front left and the polished chrome SKO shield with the double helix stands behind it to the right, slightly larger than the product, mirror chrome with a trace of deep blue in its shadows";;
    rock)  scene="the scene of the second reference exactly: a seamless warm white paper studio, lit flat with one soft key; $body stands on top of a rough lump of matte ultramarine pigment, dry and absolute, with a scatter of the same blue powder on the paper around it; the product stands on the rock, never in it";;
  esac
  local P="Square product photograph, full-frame camera, macro lens, razor sharp, $scene. Composition: the whole product and the whole object inside the frame with clear margin on every side, nothing cut off, the product about half the frame height. The product is exactly the first reference with its label reproduced letter for letter, the name printed exactly '$label', the dose pill exactly as printed, 99% Purity and Research Use Only, $closure; every letter fully visible and in perfect focus. No frames, borders or panels drawn in the picture. No text anywhere except the label. Only one product."
  for i in 1 2 3; do
    higgsfield generate create nano_banana_2 --resolution 4k --image img/ref2/cat/$slug.png --image img/ref2/scene/$kind.jpg --aspect_ratio 1:1 --wait --prompt "$P" > img/products/logs/$slug-$kind.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-$kind.log | head -1); echo "$slug $kind $url"
    [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-$kind.png" && break; sleep 12
  done
}
want=("$@")
python3 -c "import json;[print(p['slug'],'|',p['label'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug label spray; do
  slug=$(echo $slug|xargs); label=$(echo $label|xargs); spray=$(echo $spray|xargs)
  if [ ${#want[@]} -gt 0 ] && [[ ! " ${want[@]} " =~ " $slug " ]]; then continue; fi
  for kind in badge rock; do
    [ -f "$O/$slug-$kind.png" ] && continue
    gen $slug "$label" $spray $kind &
    while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
  done
done; wait; echo DONE
