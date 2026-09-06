#!/bin/zsh
# THE CHROME WALL — generate the studio plates from the reference wall.
# The reference is img/edition3/wall-ref.jpg: ribbed brushed chrome, lit cool cyan from above and warm
# blush low right, shot straight on. Every plate here keeps that wall, that light and that framing;
# what changes is what stands in front of it. Run from the repo root. Outputs land in img/edition3/.
cd ~/sko-brandbook-site
O=img/edition3; mkdir -p $O/logs
WALL="Reproduce the first reference exactly: a wall of vertical ribbed brushed chrome panels, wide flat brushed faces with narrow raised beads between them, shot straight on in a photo studio, lit by a cool cyan softbox from above that fades to neutral silver by the middle and a warm blush light low on the right, fine brushed-metal grain, no seams, no logos, no text anywhere"
gen(){ # name aspect prompt [extra --image ...]
  local name=$1 aspect=$2 prompt=$3; shift 3
  [ -f "$O/$name.png" ] && return
  for i in 1 2 3; do
    higgsfield generate create nano_banana_2 --image $O/wall-ref.jpg "$@" --aspect_ratio $aspect --wait --prompt "$prompt" > $O/logs/$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' $O/logs/$name.log | head -1); echo "$name $url"
    [ -n "$url" ] && curl -sL "$url" -o "$O/$name.png" && break; sleep 5
  done
}
# 1. the empty wall, wide and tall — the ground the site and the book stand on
gen wall-wide 16:9 "$WALL. Nothing in front of it. Edge to edge chrome."
gen wall-9x16 9:16 "$WALL. Nothing in front of it. Edge to edge chrome."
# 2. the wall with the floor: real snow, blue in the shade, lit at the crest, a low drift across the bottom third
gen wall-snow-wide 16:9 "$WALL, and at its foot a low drift of real snow across the bottom third of the frame, blue in the shadows, white where the light catches the crest, fine sparkle in the crust, a few flakes hanging in the air, sparse; the snow meets the chrome in a soft shadow. Nothing else in the frame."
gen wall-snow-9x16 9:16 "$WALL, and at its foot a low drift of real snow across the bottom third of the frame, blue in the shadows, white where the light catches the crest, fine sparkle in the crust, a few flakes hanging in the air, sparse; the snow meets the chrome in a soft shadow. Nothing else in the frame."
# 3. the hero: the bottle standing in the snow in front of the wall, right of centre, room for type on the left
gen hero-chrome-snow 16:9 "$WALL, a low drift of real snow across the bottom third, blue in the shadows, sparkle in the crust. Standing in the snow, right of centre, sunk a little into the drift, is exactly the second reference, the vial with its label reproduced letter for letter, every letter fully visible, its reflection faint in the snow crust, one soft glint on the cap. The left half of the frame is empty wall. No text anywhere except the label. Only one product." --image img/ref2/cat/bpc-157.png
# 4. the set: five vials in a row in the snow, the centre one nearest
gen array-chrome-snow 21:9 "$WALL, a low drift of real snow across the bottom third. Standing in a row in the snow, evenly spaced, the centre one slightly nearer and taller, are five of exactly the second reference, the vial with its label reproduced letter for letter on each, their reflections faint in the snow crust. No text anywhere except the labels." --image img/ref2/cat/bpc-157.png
echo DONE
