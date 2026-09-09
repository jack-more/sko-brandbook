#!/bin/zsh
cd ~/sko-brandbook-site
GL="hard low winter sun from the right throwing small star-shaped glints off every chrome edge and off the snow crystals, blue-lit snow dunes at dusk, the sky a smooth gradient from deep ink blue at the top to bright sky blue at the horizon, the horizon line at the same height across the whole frame, about two fifths up from the bottom"
one(){ local slug=$1 label=$2
  P="Wide product photograph outdoors at dusk, shot on a full-frame camera with a macro lens, razor sharp, $GL. Composition, strict: the left third and the right third of the frame are calm empty snow and sky with nothing in them at all; the whole subject sits inside the middle third with clear margin. In the middle third: a NASAL SPRAY BOTTLE stands upright in the snow toward the left, large in the frame, about half the frame height. It is exactly the product in the first reference: a slim cylindrical bottle with a WHITE RIBBED PLASTIC NASAL SPRAY PUMP and a tall white actuator nozzle on top, not a cap and not a crimp. It is a spray bottle, never a vial, never a flip-off cap, never a silver crimp, never a stopper. Its printed label reproduced letter for letter, the name printed exactly '$label', the dose pill exactly as printed, 99.9% Purity and For Research Use Only, every letter fully visible, in perfect focus. Below the dose pill there are exactly three small round icons in a row, and the words under them read exactly '10ML VOLUME', '100 SPRAYS PER BOTTLE' and 'PREMIUM QUALITY', spelled correctly, legible and sharp, no invented or garbled words anywhere on the label. To its right, the molecular structure drawn in the second reference, its exact skeleton, built as a sculpture of liquid mirror chrome standing in the snow, rising to about one and a half times the bottle's height: every atom a smooth polished chrome sphere with one fine machined seam, every bond a thick polished chrome rod with a faint brushed collar at each end, no bolts, no threads, no coloured atoms, flawless mirror chrome reflecting the blue sky and the snow. No letters on the structure. No frames, borders or panels; sky and snow run edge to edge. No text anywhere except the label. Only one product."
  for i in 1 2 3; do
    higgsfield generate create nano_banana_2 --resolution 4k --image img/ref2/cat/$slug.png --image img/ref2/mol/$slug.jpg --image img/ref2/snow.jpg --aspect_ratio 16:9 --wait --prompt "$P" > img/products/logs/$slug-wide.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-wide.log | head -1)
    [ -n "$url" ] && curl -sL "$url" -o "img/products/$slug-wide.png" && break; sleep 10
  done
  [ -f "img/products/$slug-wide.png" ] || { echo "$slug FAILED"; return; }
  python3 -c "
from PIL import Image
im=Image.open('img/products/$slug-wide.png').convert('RGB')
w=im.copy(); w.thumbnail((2000,2000)); w.save('img/products/web/$slug-wide.jpg',quality=90)
h=im.copy(); h.save('img/products/web/hd/$slug-wide.jpg',quality=92)"
  echo "$slug ok"
}
one selank-spray SELANK &
one semax-spray SEMAX &
wait; echo DONE
