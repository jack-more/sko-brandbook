#!/bin/zsh
cd ~/sko-brandbook-site
mkdir -p img/icons/_src img/hd/_in img/products/logs
STYLE="A single hero 3D game asset, isolated and centred on a pure white background, in dramatic three-quarter perspective and tilted in space exactly like the silver coin in the second reference: the object has real thickness and a visible machined edge, deep bevels, a raised relief face, hard specular highlights and soft studio light from the upper left, a faint contact shadow below. Rendered like a collectible medal in a video game inventory screen: heavy, dimensional, physically present. The object fills the frame at a slight angle so both its face and its edge are visible. No text, no letters, no numbers anywhere, nothing else in the frame."
MARK="The face carries exactly the shield with the double helix from the first reference, its exact outline and its exact helix, struck into the metal in deep relief, nothing added."
one(){ local name=$1 P=$2
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/scene/mark-flat.jpg --image img/ref2/scene/token-ref.jpg --resolution 4k --aspect_ratio 1:1 --wait --prompt "$STYLE $MARK $P" > img/products/logs/b3d-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/b3d-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name-3d.png" && break; sleep 10; done
  [ -f "img/icons/_src/$name-3d.png" ] || { echo "$name FAILED"; return; }
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name-3d.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/b3d-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/b3d-$name.jpg --wait > img/products/logs/b3dcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/b3dcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 10; done; }
one tier-emboss "The whole object is a thick medal of matte bone-white ceramic, chalky and unpolished, the shield blind-embossed into it so the relief reads only through shadow. The lowest tier: plain, pale, no metal." &
one tier-cap "The whole object is a thick medal of deep navy anodised metal, satin finish, the shield pressed into it with crisp bright edges catching the light." &
one tier-foil "The whole object is a thick medal of bright polished silver foil-stamped metal, mirror bright on the raised shield, brushed on the flat, a milled edge around the rim." &
one tier-chrome "The whole object is a thick medal of heavy liquid mirror chrome, fully reflective, the shield standing proud of the face in deep relief, hard white specular bands across it." &
one tier-pigment "The whole object is a thick chrome medal whose recessed field is filled with dense ultramarine blue pigment, the raised chrome shield rising clean out of the blue, a few grains of loose blue pigment on its edge." &
one tier-bracelet "The whole object is a heavy championship bracelet: a thick chunky chrome chain-link band curving in space, with a large chrome shield plate as its centrepiece standing proud, the shield in deep relief on the plate. Like a poker world series bracelet." &
wait; echo DONE
