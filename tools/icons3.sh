#!/bin/zsh
cd ~/sko-brandbook-site
STYLE="A single 3D icon, isolated and centred on a pure white background, front three-quarter view, soft studio light from the upper left, a faint soft contact shadow, crisp and simple, nothing else in the frame, no text or letters anywhere."
MARK="The badge is exactly the shield with the double helix from the reference, its exact outline and its exact helix, nothing added."
one(){ local name=$1 P=$2
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/scene/mark-flat.jpg --aspect_ratio 1:1 --wait --prompt "$STYLE $MARK $P" > img/products/logs/icon-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/icon-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name.png" && break; sleep 10; done
  [ -f "img/icons/_src/$name.png" ] || return
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/icon-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/icon-$name.jpg --wait > img/products/logs/iconcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/iconcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 10; done; }
one tier-emboss "The badge as a thick plaque of matte bone-white ceramic, the whole thing white, the helix blind-embossed so it reads only by its shadows. No chrome, no navy, no colour at all." &
one tier-cap "The badge as a thick plaque of matte deep navy rubberised plastic, the whole thing navy, the helix debossed into the navy so it reads only by its shadows. No chrome, no silver, no white." &
one tier-foil "The badge as a thin flat plaque of bright mirror silver foil, the whole thing silver, the helix outlined by a fine embossed line, flat and reflective like foil on paper. No navy, no colour." &
wait; echo DONE
