#!/bin/zsh
cd ~/sko-brandbook-site
STYLE="A single hero 3D game asset, one object only, isolated and centred on a pure white background, in three-quarter perspective and tilted slightly in space like the silver coin in the reference image. The object has real volume and thickness, crisp bevelled edges, hard specular highlights and soft studio light from the upper left, and a faint contact shadow under it. Rendered like a collectible item in a video game inventory screen: heavy, dimensional, physically present, photoreal materials. Deep navy enamel and mirror chrome are the only metals. The object fills the frame. No text, no letters, no numbers anywhere, nothing else in the frame."
one(){ local name=$1 P=$2
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/scene/token-ref.jpg --resolution 4k --aspect_ratio 1:1 --wait --prompt "$STYLE $P" > img/products/logs/i3d-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/i3d-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name-3d.png" && break; sleep 8; done
  [ -f "img/icons/_src/$name-3d.png" ] || { echo "$name FAILED"; return; }
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name-3d.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/i3d-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/i3d-$name.jpg --wait > img/products/logs/i3dcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/i3dcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 8; done; }
one vial "A single small pharmaceutical glass vial standing upright, clear glass with a deep navy label band and a deep navy flip-off cap over a silver crimp." &
one vials "Two small pharmaceutical glass vials standing side by side, clear glass with deep navy label bands and deep navy flip-off caps over silver crimps, one slightly behind the other." &
one tokens "A short stack of four thick mirror-chrome coins lying on each other, slightly fanned so the milled edges of each coin are visible, the top coin catching a hard highlight." &
one box "A closed deep navy presentation box with a chrome band around it and a chrome clasp, a hard-edged rectangular box seen from a high three-quarter angle." &
one box-open "An open deep navy presentation box seen from a high three-quarter angle, its lid raised, chrome-lined interior with dark foam seating, empty." &
one ribbon "A closed deep navy gift box tied with a wide mirror-chrome ribbon and a crisp chrome bow on top." &
one freeship "A deep navy parcel box with a chrome band, and a small mirror-chrome paper aeroplane banking away above it." &
one shipping "A deep navy parcel box with a chrome band and a chrome tape strip across its lid, seen from a high three-quarter angle." &
wait; echo BATCH1
