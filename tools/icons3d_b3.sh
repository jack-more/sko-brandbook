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
one road "A short chrome road or ramp climbing up to the right in three-quarter view, with a small chrome flag planted at its top and deep navy edges, like a level path in a game." &
one shelf "A small deep navy display shelf unit at a three-quarter angle, two chrome shelves, with one small glass vial standing on the upper shelf." &
one missions "A thick chrome target disc standing at a three-quarter angle, concentric deep navy and chrome rings, with a chrome dart struck into its centre." &
one live "A thick chrome broadcast microphone standing upright on a chrome base, with a deep navy band around its body, at a three-quarter angle." &
one refer "Two identical thick chrome coins standing side by side and slightly overlapping, each with a shield struck into its face, one passing in front of the other." &
one stamp "A thick chrome rubber-stamp body with a deep navy handle, pressed at a three-quarter angle, with a small chrome shield on its face." &
one check "A thick solid mirror-chrome tick mark, a single check shape with real depth and bevelled edges, floating at a three-quarter angle." &
one lock "A heavy chrome padlock with a deep navy body and a thick chrome shackle, closed, at a three-quarter angle." &
one print "A framed print leaning at a three-quarter angle: a thin chrome frame around a deep navy print, standing upright." &
wait; echo BATCH3
