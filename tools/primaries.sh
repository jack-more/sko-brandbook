#!/bin/zsh
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O
python3 -c "import json;[print(p['slug'],'|',p['name'],'|',int(p['spray'])) for p in json.load(open('products.json'))]" | while IFS='|' read slug name spray; do
  slug=$(echo $slug|xargs); name=$(echo $name|xargs); spray=$(echo $spray|xargs)
  [ -f "$O/$slug-primary.png" ] && continue
  if [ "$spray" = "1" ]; then body="this exact nasal spray bottle"; else body="this exact glass vial"; fi
  (
  for i in 1 2; do url=$(higgsfield generate create nano_banana_2 --image img/ref2/cat/$slug.png --aspect_ratio 1:1 --wait --prompt "Studio product photograph. $body from the reference stands upright, centred, on a flat matte ultramarine blue ground (International Klein Blue) that fills the whole frame, seamless, with a soft contact shadow and generous room on every side. Soft large key light from upper left. The label is exactly the reference label, unchanged: the holographic shield beside the white SKO COMPOUNDS lockup, then $name in large white condensed bold capitals, then the dose in a small hexagonal holographic pill exactly as printed on the reference, then 99% Purity and Research Use Only, holographic bands; every letter fully visible. No text anywhere except the label. Only one product." 2>&1 | grep -oE 'https://[^ "]+\.png' | head -1); echo "$slug primary $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$slug-primary.png" && break; done
  ) &
  while [ $(jobs -r | wc -l) -ge 5 ]; do sleep 2; done
done; wait; ls $O | grep -c primary
