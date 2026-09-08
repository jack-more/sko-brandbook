#!/bin/zsh
cd ~/sko-brandbook-site
STYLE="A single 3D icon, isolated and centred on a pure white background, front three-quarter view, rendered like a piece of polished jewellery: mirror chrome and deep navy enamel, soft studio light from the upper left, a faint soft contact shadow, crisp and simple. The object fills the frame. No text or letters anywhere, nothing else in the frame."
MARK="Where the mark appears it is exactly the shield with the double helix from the first reference, its exact outline and its exact helix, nothing added."
one(){ local name=$1 P=$2
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --image img/ref2/scene/mark-flat.jpg --aspect_ratio 1:1 --wait --prompt "$STYLE $MARK $P" > img/products/logs/icon-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/icon-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/_src/$name.png" && break; sleep 10; done
  [ -f "img/icons/_src/$name.png" ] || return
  python3 -c "from PIL import Image;im=Image.open('img/icons/_src/$name.png').convert('RGB');im.thumbnail((1600,1600));im.save('img/hd/_in/icon-$name.jpg',quality=95)"
  for i in 1 2 3; do higgsfield generate create image_background_remover --image img/hd/_in/icon-$name.jpg --wait > img/products/logs/iconcut-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|webp)' img/products/logs/iconcut-$name.log | head -1); [ -n "$url" ] && curl -sL "$url" -o "img/icons/$name.png" && echo "$name ok" && break; sleep 10; done; }
one hat "A deep navy baseball cap, the object is the whole icon, with the shield-helix mark small on the front panel embroidered in chrome thread, seen from the front three-quarter." &
one pin "A small lapel pin: a chrome coin with the shield-helix mark struck into its face, on a short chrome pin with a navy enamel clutch behind it, the object is the whole icon." &
one spin "A chrome spinner wheel seen from above, eight wedges alternating deep navy enamel and mirror chrome, a small chrome pointer at the top, a chrome hub at the centre, the object is the whole icon, no marks on the wedges." &
one freeship "A small deep navy parcel box with a chrome band, a chrome paper aeroplane rising from its lid, the object is the whole icon." &
wait; echo DONE
