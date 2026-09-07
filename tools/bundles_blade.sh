#!/bin/zsh
# bundles: the loaded blade with the compounds' molecules behind it
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O img/products/logs
GL="hard low winter sun from the right throwing small star-shaped glints off every chrome edge and off the snow crystals, blue-lit snow dunes at dusk, the sky a smooth gradient from deep ink blue at the top to bright sky blue at the horizon"
labels() { python3 -c "import json;m={p['slug']:p['label'] for p in json.load(open('products.json'))};print(m['$1'])"; }
cat <<'LIST' | while IFS='|' read name parts; do
metabolic-reference|sko-trz tesamorelin mots-c
b-nad-mots-c|nad mots-c
b-ss-31-mots-c|ss-31 mots-c
b-semax-selank|semax selank
b-kpv-ghk-cu|kpv ghk-cu
b-kpv-ghk-cu-glutathione|kpv ghk-cu glutathione
LIST
  name=$(echo $name|xargs); [ -f "$O/bundle-$name.png" ] && continue
  args=(); n=0; desc=""; mols=""; k=0
  for s in ${=parts}; do args+=(--image img/ref2/cat/$s.png); n=$((n+1)); done
  for s in ${=parts}; do if [ -f img/ref2/mol/$s.jpg ]; then args+=(--image img/ref2/mol/$s.jpg); k=$((k+1)); fi; done
  args+=(--image img/ref2/snow.jpg)
  i=0; ords=(first second third fourth fifth sixth)
  for s in ${=parts}; do i=$((i+1)); l=$(labels $s); desc="$desc the ${ords[$i]} reference printed exactly '$l',"; done
  mref=$((n+1)); mdesc="the molecular structures drawn in references $mref onward, one sculpture per structure, each exact in its skeleton"
  P="Product photograph outdoors at dusk, camera above the scene at about forty degrees, shot razor sharp, $GL. In the foreground a swept chrome blade like a jet fin lies flat and level on the snow, mirror-polished with sharp faceted edges and a row of five round machined bores in its top face, its surface clean; exactly $n vials, and no more than $n, stand upright with their bases seated in the first $n bores, labels facing the camera, each reproduced letter for letter from its reference, the holographic shield beside the white wordmark reading exactly SKO over COMPOUNDS,$desc the dose pill exactly as printed, then '99% Purity' and 'Research Use Only', deep navy caps over silver crimps; the remaining bores are empty. Behind the blade, standing in the snow, $k sculptures of liquid mirror chrome: $mdesc, every atom a smooth polished chrome sphere with a fine machined seam, every bond a thick polished rod, no hex nuts, no bolts, each about twice a vial's height, flawless chrome reflecting the sky, nothing else on the ground. No hub, no bolt, no pivot. No text anywhere except the labels. $n vials total."
  (
    for t in 1 2 3; do higgsfield generate create nano_banana_2 --resolution 4k "${args[@]}" --aspect_ratio 4:3 --wait --prompt "$P" > img/products/logs/bundle-$name.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/bundle-$name.log | head -1); echo "$name $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/bundle-$name.png" && break; sleep 12; done
  ) &
  while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 2; done
done; wait; echo DONE
