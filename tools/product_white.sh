#!/bin/zsh
cd ~/sko-brandbook-site
O=img/products
python3 -c "import json;[print(p['slug'],'|',p['name'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug name spray; do
  slug=$(echo $slug|xargs); name=$(echo $name|xargs); spray=$(echo $spray|xargs)
  [ -f "$O/$slug-white.png" ] && continue
  if [ "$spray" = "1" ]; then body="the nasal spray bottle"; else body="the vial"; fi
  (
  for i in 1 2; do url=$(higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --image img/proof/white-vial.png --aspect_ratio 1:1 --wait --prompt "Reproduce the second reference exactly: the same seamless pure white studio ground and backdrop, the same soft light from above with one soft key from the upper left, the same soft grey contact shadow, the same framing with generous room on every side, the cap picking up the same faint blue reflection; the only change is the product itself: it is exactly the first reference, $body with its label unchanged: the holographic shield beside the white SKO COMPOUNDS lockup, then $name in large white condensed bold capitals, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then 99% Purity and Research Use Only, holographic bands; every letter fully visible. No text anywhere except the label. Only one product." 2>&1 | grep -oE 'https://[^ "]+\.png' | head -1); echo "$slug white $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-white.png" && break; done
  ) &
  while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 2; done
done; wait; echo DONE
