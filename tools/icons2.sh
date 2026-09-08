#!/bin/zsh
# subject-first icons: no mark reference, the object is the whole icon
cd ~/sko-brandbook-site; mkdir -p img/icons/_src img/hd/_in
STYLE="A single 3D icon, isolated and centred on a pure white background, front three-quarter view, rendered like a piece of polished jewellery: mirror chrome and deep navy enamel, soft studio light from the upper left, a faint soft contact shadow, crisp and simple. The object fills the frame. No shield, no logo, no emblem, no text or letters anywhere, nothing else in the frame."
one(){ local name=$1 P=$2
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --aspect_ratio 1:1 --wait --prompt "$STYLE $P" > img/products/logs/icon-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/icon-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name.png" && break; sleep 10; done
  [ -f "img/icons/_src/$name.png" ] || return
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/icon-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/icon-$name.jpg --wait > img/products/logs/iconcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/iconcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 10; done; }
while IFS='|' read name P; do one "$name" "$P" & while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done; done <<'LIST'
tokens|A short neat stack of three thick chrome coins with milled edges, the top coin plain and polished, a fourth coin leaning against the stack.
box|A closed rigid gift box in deep navy enamel with a slim chrome band around the lid seam and a small square chrome plate on the lid.
box-open|An open deep navy gift box with its lid tilted back, three tiny clear glass vials with navy caps standing in navy foam inside.
ribbon|A closed deep navy gift box tied with a flat chrome ribbon that crosses the lid and knots once on top.
vial|A single small clear glass laboratory vial, a deep navy flip-off cap over a silver crimp, a plain deep navy label band with no text.
vials|Two small clear glass laboratory vials side by side, deep navy flip-off caps over silver crimps, plain deep navy label bands with no text.
stamp|A round chrome hand stamp with a navy enamel handle, seen from the side at an angle, its round face pressed onto a small white square card.
mystery|A closed deep navy cube with a thin seam of bright chrome light glowing around its lid, sitting on a small chrome plinth.
sticker|A small sheet of four round silver foil stickers on white backing paper, one sticker peeling up at a corner.
shipping|A small deep navy shipping box with chrome corner guards and a single chrome snowflake on its side.
print|A rolled poster with chrome end caps, a deep navy enamel band around its middle, lying at an angle.
road|A short chrome staircase of three rising steps, the top step capped in deep navy enamel, seen from the side.
missions|A chrome archery target of three concentric rings with a deep navy enamel bullseye and a small chrome arrow in the centre.
shelf|A small chrome wall shelf with two tiny closed deep navy gift boxes sitting on it.
golden|A single small clear glass laboratory vial with a polished chrome flip-off cap and a plain deep navy label band, a soft chrome glow around the cap, no text.
LIST
wait; echo DONE
