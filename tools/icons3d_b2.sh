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
one hat "A deep navy baseball cap resting at a three-quarter angle, structured crown, chrome eyelets, a small chrome shield emblem embroidered on the front panel." &
one pin "A small chrome lapel pin: a thick chrome disc with a shield struck into it, mounted on a short chrome post with a deep navy enamel clutch behind it." &
one spin "A thick prize wheel standing at a three-quarter angle: eight wedges alternating deep navy enamel and mirror chrome, a chrome hub at the centre and a chrome pointer at the top, with visible depth on its rim." &
one sticker "A small square sheet of mirror-chrome foil stickers, one corner peeling up to show the sticker lifting off the backing sheet, lying at a three-quarter angle." &
one ticket "A thick chrome admission ticket with a perforated stub and a punched hole, a deep navy band across it, floating at a three-quarter angle." &
one code "A thick deep navy plastic card with a chrome edge and a chrome chip, floating at a three-quarter angle, like a redeemable gift card." &
one mystery "A closed cube-shaped deep navy box with chrome edges and a chrome question-mark-free plain chrome medallion set into its lid, seen from a high three-quarter angle." &
one golden "A single pharmaceutical glass vial standing upright, filled with liquid gold, with a polished gold cap and a gold label band, glowing warm against the white." &
wait; echo BATCH2
