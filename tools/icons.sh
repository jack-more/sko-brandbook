#!/bin/zsh
# The icon set: one style, every reward. 3D, chrome + navy enamel, isolated on white, front three-quarter, cut out.
cd ~/sko-brandbook-site; mkdir -p img/icons/_src img/hd/_in
STYLE="A single 3D icon, isolated and centred on a pure white background, front three-quarter view, rendered like a piece of polished jewellery: mirror chrome with deep navy enamel, soft studio light from the upper left, a faint soft contact shadow, crisp and simple, nothing else in the frame, no text or letters anywhere."
MARK="Where the mark appears it is exactly the shield with the double helix from the first reference, its exact outline and its exact helix, nothing added."
one(){ local name=$1 P=$2
  [ -f "img/icons/$name.png" ] && return
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/scene/mark-flat.jpg --aspect_ratio 1:1 --wait --prompt "$STYLE $MARK $P" > img/products/logs/icon-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/icon-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name.png" && break; sleep 10; done
  [ -f "img/icons/_src/$name.png" ] || return
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/icon-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/icon-$name.jpg --wait > img/products/logs/iconcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/iconcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 10; done; }
while IFS='|' read name P; do one "$name" "$P" & while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done; done <<'LIST'
tier-emboss|The shield-helix mark as a thick badge cast in matte white ceramic, the helix in gentle relief, the quietest material.
tier-cap|The shield-helix mark as a thick badge in deep navy matte enamel with a slim chrome rim, the helix pressed into the navy.
tier-foil|The shield-helix mark as a thick badge in bright mirror silver foil, flat and reflective, the helix outlined.
tier-chrome|The shield-helix mark as a heavy solid cast chrome badge, the helix in high relief, deep reflections.
tier-pigment|The shield-helix mark as a cast chrome badge sitting in a small rough lump of ultramarine blue pigment.
tier-bracelet|A small chrome championship bracelet, cuban links, the shield-helix mark in navy enamel at its centre, coiled, jewel-set.
token|A thick chrome coin with the shield-helix mark struck into its face, a milled edge, standing on edge.
tokens|A short neat stack of three chrome coins with the shield-helix mark on the top face.
box|A small closed rigid gift box in deep navy with a slim chrome band and the shield-helix mark in chrome on the lid.
box-open|A small open deep navy gift box with the lid up, three tiny clear glass vials with navy caps seated inside in navy foam.
ribbon|A small closed deep navy gift box tied with a flat chrome ribbon and a single knot on top.
vial|A single small clear glass laboratory vial with a deep navy flip-off cap and a navy label band, no text on the label.
vials|Two small clear glass laboratory vials with deep navy flip-off caps and navy label bands, side by side, no text.
stamp|A round chrome stamp seal, the shield-helix mark in relief on its face, seen from above at an angle.
live|A chrome ring like a broadcast signal, a small navy enamel dot at its centre, two thin chrome arcs either side.
code|A chrome key card with the shield-helix mark in navy enamel and a row of small navy squares like a code.
mystery|A closed deep navy cube with soft chrome light leaking from a thin seam around its lid, the shield-helix mark in chrome on top.
ticket|A chrome admission ticket, a navy enamel stripe, a small shield-helix mark, a perforated edge.
refer|Two chrome shield-helix badges linked by a short chrome chain.
sticker|A small sheet of three silver foil shield-helix stickers, one peeled at a corner.
shipping|A small navy cold-shipping box with a chrome snowflake on its side and chrome corner guards.
print|A rolled chrome-edged poster tube in deep navy with the shield-helix mark on its cap.
lock|A small chrome padlock with a navy enamel face and the shield-helix mark on it.
check|A chrome check mark in a navy enamel circle.
golden|A single small clear glass vial with a polished chrome cap and a navy label band, a soft chrome glow around the cap, no text.
road|A short chrome path of three rising steps with a navy enamel top on the highest step.
missions|A chrome target of three rings with a navy enamel bullseye.
shelf|A small chrome shelf with two tiny deep navy gift boxes on it.
LIST
wait; echo DONE
