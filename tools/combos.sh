#!/bin/zsh
cd ~/sko-brandbook-site
O=img/products; mkdir -p $O img/products/logs
GL="hard low winter sun from the right throwing small star-shaped glints off every chrome edge and off the snow crystals, blue-lit snow dunes at dusk, the sky a smooth gradient from deep ink blue at the top to bright sky blue at the horizon"
# name | parts (catalogue slugs)
cat <<'LIST' | while IFS='|' read name parts; do
metabolic-reference|sko-trz tesamorelin mots-c
b-nad-mots-c|nad mots-c
b-ss-31-mots-c|ss-31 mots-c
b-semax-selank|semax selank
b-kpv-ghk-cu|kpv ghk-cu
b-kpv-ghk-cu-glutathione|kpv ghk-cu glutathione
LIST
  name=$(echo $name|xargs); [ -f "$O/combo-$name.png" ] && continue
  args=(); n=0; ord=("first" "second" "third" "fourth"); hold=""
  for s in ${=parts}; do args+=(--image img/ref2/cat/$s.png); n=$((n+1)); done
  args+=(--image img/ref2/snow.jpg)
  case $n in
    2) hold="it holds two vials upright, one in each open chrome hand, presenting them to the camera: the first reference in its left hand and the second reference in its right";;
    3) hold="it holds three vials upright: the first reference in its left hand, the second reference in its right hand, and the third reference seated in a chrome cradle built into its chest";;
    4) hold="it holds four vials upright: the first reference in its left hand, the second reference in its right hand, and the third and fourth references seated side by side in a chrome cradle built into its chest";;
  esac
  P="Product photograph outdoors at dusk, $GL. A colossal chrome machine like a transformer robot's torso and arms, built from thick machined struts, hex joints, pistons and plates, kneeling in the snow, at least ten times the height of a vial, so that each vial is small in its hand, about the length of one of its fingers, the whole machine filling the frame; $hold, every label facing the camera and fully readable, each vial exactly its reference with its label reproduced letter for letter, a deep navy flip-off cap over a silver crimp. No head with a face, no eyes; the machine reads as engineered hardware, not a character. No text anywhere except the labels. Exactly $n vials."
  (
    for i in 1 2 3; do higgsfield generate create nano_banana_2 --resolution 4k "${args[@]}" --aspect_ratio 4:3 --wait --prompt "$P" > img/products/logs/combo-$name.log 2>&1 < /dev/null; url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/combo-$name.log | head -1); echo "$name combo $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/combo-$name.png" && break; sleep 12; done
  ) &
  while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 2; done
done; wait; echo DONE
