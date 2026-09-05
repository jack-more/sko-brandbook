#!/bin/zsh
# three proof frames for the ultramarine/chrome direction
cd ~/sko-brandbook-site
R=img/ref2; O=img/proof
LABEL="the label exactly as in the first reference image: navy label, holographic shield with a helix, the white wordmark SKO above COMPOUNDS, then 99% Purity and Research Use Only, holographic bands top and bottom, faint molecular linework on the label; every letter fully visible and unchanged; silver crimp cap with a blue flip-off top; clear glass vial"
gen() { # name aspect prompt refs...
  n=$1; a=$2; p=$3; shift 3
  args=(); for r in "$@"; do args+=(--image "$r"); done
  url=$(higgsfield generate create nano_banana_2 "${args[@]}" --aspect_ratio "$a" --wait --prompt "$p" 2>&1 | grep -oE 'https://[^ "]+\.png' | head -1)
  echo "$n $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$n.png"
}
gen hand 3:4 "Studio product photograph. A liquid-mirror chrome hand, polished like the second reference, holds this exact glass vial upright between thumb and fingers, offering it toward the camera; the hand and forearm rise from the bottom edge. Flat matte ultramarine blue ground (International Klein Blue) filling the whole frame, seamless, no horizon. The chrome reflects the blue ground so its shadows go deep blue and its highlights go white. Hard single key light from upper left, crisp specular edges. $LABEL. No text anywhere except the label. No other objects." $R/vial.png $R/hand-chrome.jpg &
gen powder 3:4 "Studio product photograph, top-down at a slight angle, like the second reference. This exact glass vial lies on its side, half sunk into a thick bed of ultramarine blue pigment powder (International Klein Blue); the powder is fine and matte and holds the impression of the vial; a light dusting of blue pigment on the glass shoulder and cap, but the label is clean and fully readable. Hard raking light from the left casting a long sharp shadow across the powder. Everything in frame is the same blue except the vial. $LABEL. No text anywhere except the label." $R/vial.png $R/powder-bottle.jpg &
gen rock 3:4 "Studio product photograph. This exact glass vial stands upright on top of a rough chunk of pure ultramarine blue pigment (International Klein Blue), a rock of dry matte pigment like the second reference, with a little loose blue pigment dust around its base. Seamless off-white studio ground and backdrop, soft even light, a soft contact shadow under the rock. The blue is absolute and matte; the vial is glass and chrome against it. $LABEL. No text anywhere except the label." $R/vial.png $R/klein-rock.jpg &
wait; ls -la $O
