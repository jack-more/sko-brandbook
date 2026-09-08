#!/bin/zsh
cd ~/sko-brandbook-site
STYLE="A single hero 3D game asset, isolated and centred on a pure white background, in dramatic three-quarter perspective and tilted in space exactly like the silver coin in the second reference: a THICK ROUND MEDAL with real depth, a visible machined edge with fine milling, deep bevels, a raised relief face, hard specular highlights and soft studio light from the upper left, a faint contact shadow below. Rendered like a collectible medal in a video game inventory screen. The medal fills the frame at a slight angle so both its face and its edge are visible. No text, no letters, no numbers anywhere, nothing else in the frame."
MARK="The face carries exactly the shield with the double helix from the first reference, its exact outline and its exact helix, struck into the metal in deep relief, nothing added."
one(){ local name=$1 P=$2
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/scene/mark-flat.jpg --image img/ref2/scene/token-ref.jpg --resolution 4k --aspect_ratio 1:1 --wait --prompt "$STYLE $MARK $P" > img/products/logs/b3d-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/b3d-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name-3d.png" && break; sleep 10; done
  [ -f "img/icons/_src/$name-3d.png" ] || { echo "$name FAILED"; return; }
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name-3d.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/b3d-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/b3d-$name.jpg --wait > img/products/logs/b3dcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/b3dcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 10; done; }
one tier-foil "The medal is thin bright silver leaf over a pale core: a FLAT MATTE brushed silver face with fine horizontal brush grain and almost no reflection, and only the raised shield is bright mirror foil, so the shield glints and the field around it stays dull and papery. Cool neutral silver, no dark reflections anywhere." &
one tier-chrome "The medal is heavy solid liquid mirror chrome, a true mirror: the face carries hard black-to-white reflection bands, a dark horizon line reflected across it and blown white highlights, like polished car chrome. Much darker and more contrasty than a plain silver coin, deep near-black reflections in the recesses." &
one tier-pigment "The medal is thick mirror chrome whose recessed field is packed with dense matte ultramarine blue pigment powder, so the flat field reads as saturated velvety blue and the raised chrome shield rises clean and bright out of it. A few loose grains of blue pigment sit on the milled chrome edge. Round medal, not a shield-shaped plaque." &
wait; echo DONE
