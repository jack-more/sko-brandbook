#!/bin/zsh
# Re-render a hero wide shot at the house framing. The third reference is a
# known-good frame; the vial must match its size and position, which is what
# stops the model drifting to a tiny distant bottle.
cd ~/sko-brandbook-site
GL="hard low winter sun from the right throwing small star-shaped glints off every chrome edge and off the snow crystals, blue-lit snow dunes at dusk, the sky a smooth gradient from deep ink blue at the top to bright sky blue at the horizon, the horizon line at the same height across the whole frame, about two fifths up from the bottom"
one(){ local slug=$1 label=$2 body=$3
  P="Wide product photograph outdoors at dusk, shot on a full-frame camera with a macro lens, razor sharp, $GL. FRAMING IS FIXED BY THE THIRD REFERENCE IMAGE: copy its camera distance and its composition exactly. $body stands upright in the snow at the same place and at the SAME SIZE as the vial in that third reference: it is large and close to camera, its body filling from just above the bottom edge of the frame to a little over halfway up, roughly HALF THE FRAME HEIGHT. It must not be small, must not be distant, must not sit on the horizon. Its printed label is fully legible, the name printed exactly '$label', the dose pill exactly as printed, 99% Purity and Research Use Only. To its right, the molecular structure drawn in the second reference, its exact skeleton, built as a sculpture of liquid mirror chrome standing in the snow, rising to about one and a half times the product's height: every atom a smooth polished chrome sphere with one fine machined seam, every bond a thick polished chrome rod with a faint brushed collar at each end, no bolts, no threads, no coloured atoms, flawless mirror chrome reflecting the sky and snow. The left third of the frame is calm empty snow and sky. No letters on the structure. No frames, borders or panels. No text anywhere except the label. Only one product."
  for i in 1 2 3; do
    higgsfield generate create nano_banana_2 --resolution 4k --image img/ref2/cat/$slug.png --image img/ref2/mol/$slug.jpg --image img/ref2/scene/wide-ref.jpg --aspect_ratio 16:9 --wait --prompt "$P" > img/products/logs/$slug-wide.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/$slug-wide.log | head -1)
    [ -n "$url" ] && curl -sL "$url" -o "img/products/$slug-wide.png" && break; sleep 10
  done
  [ -f "img/products/$slug-wide.png" ] || { echo "$slug FAILED"; return; }
  python3 -c "
from PIL import Image
im=Image.open('img/products/$slug-wide.png').convert('RGB')
w=im.copy(); w.thumbnail((2000,2000)); w.save('img/products/web/$slug-wide.jpg',quality=90)
im.save('img/products/web/hd/$slug-wide.jpg',quality=92)"
  echo "$slug ok"
}
python3 -c "
import json
P={p['slug']:p for p in json.load(open('products.json'))}
import sys
for s in sys.argv[1:]:
    p=P[s]; print(s, p['label'], 'spray' if p['spray'] else 'vial')
" "$@" | while read slug label kind; do
  if [ "$kind" = "spray" ]; then body="A NASAL SPRAY BOTTLE with a white ribbed pump and tall white nozzle, never a vial"; else body="The vial"; fi
  one "$slug" "$label" "$body" &
  while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done
done; wait; echo DONE
