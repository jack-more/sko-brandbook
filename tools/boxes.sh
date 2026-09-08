#!/bin/zsh
cd ~/sko-brandbook-site; mkdir -p img/loyalty img/products/logs
STUDIO="Product photograph in a seamless white studio, soft key from the upper left, a soft grey contact shadow, razor sharp. Pure white seamless ground, nothing else in the frame, no text or letters anywhere except where stated."
MARK="The mark is exactly the shield with the double helix from the first reference, its exact outline and its exact helix, nothing added, no letters."
run(){ local name=$1 P=$2 ar=${3:-4:3}
  for i in 1 2 3; do higgsfield generate create nano_banana_2 --resolution 4k --image img/ref2/scene/mark-flat.jpg --image img/ref2/cat/bpc-157.png --image img/ref2/scene/white-vial.jpg --aspect_ratio $ar --wait --prompt "$P" > img/products/logs/box-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.png' img/products/logs/box-$name.log | head -1); echo "$name $url"
    [ -n "$url" ] && curl -sL "$url" -o "img/loyalty/box-$name.png" && break; sleep 12; done; }

run sealed "$STUDIO A single closed rigid gift box in deep navy matte board, the lid slightly oversized with a crisp shadow gap, sitting square to camera and turned a few degrees. On the lid, dead centre, the shield-helix mark is foil-stamped in mirror silver, small, about a fifth of the lid width. $MARK A narrow band of holographic foil runs around the base of the lid like the band on the product label. No other text or logo, nothing else in the frame." &
run open "$STUDIO A rigid deep navy gift box, open, the lid leaning behind it, seen from slightly above. Inside, three lyophilised glass vials are seated upright in precisely cut deep navy foam, each vial exactly the product in the second reference with its printed label, clear glass, deep navy flip-off cap over a silver crimp. A small white card rests in the lid, and the shield-helix mark is blind-embossed into that card. $MARK Nothing else in the frame." &
run ribbon "$STUDIO A single closed rigid gift box in deep navy matte board tied with a flat mirror-chrome ribbon that crosses the lid and knots once, the ribbon reading as polished metal foil rather than fabric. On the lid the shield-helix mark is foil-stamped in mirror silver beneath the ribbon. $MARK Nothing else in the frame, no text." &
run stack "$STUDIO Three closed rigid gift boxes in deep navy matte board stacked square, largest at the bottom, each lid carrying the shield-helix mark foil-stamped in mirror silver. $MARK The stack is lit so each lid edge catches a bright line. Nothing else in the frame, no text." &
wait; echo DONE
