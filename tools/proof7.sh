#!/bin/zsh
cd ~/sko-brandbook-site
R=img/ref2; O=img/proof
LABEL="the label exactly as in the first reference image: navy label, holographic shield with a helix, the white wordmark SKO above COMPOUNDS, then 99% Purity and Research Use Only, holographic bands top and bottom, faint molecular linework on the label; every letter fully visible and unchanged; silver crimp cap with a blue flip-off top; clear glass vial"
gen() { n=$1; a=$2; p=$3; shift 3
  args=(); for r in "$@"; do args+=(--image "$r"); done
  url=$(higgsfield generate create nano_banana_2 "${args[@]}" --aspect_ratio "$a" --wait --prompt "$p" 2>&1 | grep -oE 'https://[^ "]+\.png' | head -1)
  echo "$n $url"; [ -n "$url" ] && curl -sL "$url" -o "$O/$n.png"; }
W="a seamless pure white studio ground and backdrop, no horizon line, soft even light from above with one soft key from the upper left, a soft grey contact shadow"
gen white-vial 1:1 "Studio product photograph. This exact glass vial stands upright, centred, on $W. The chrome cap picks up a faint ultramarine blue reflection from off-frame, the only colour in the picture besides the label. Generous room around the vial on every side. $LABEL. No text anywhere except the label. Only one vial." $R/vial.png &
gen white-cradle 3:4 "Studio product photograph. A sleek chrome cradle, one continuous flowing mirror-polished form like the second reference, no bolts, no seams, holds this exact glass vial perfectly upright in its curve, on $W. The chrome reflects the white ground and a faint ultramarine blue from off-frame in its shadows. $LABEL. No text anywhere except the label. Only one vial. No other objects." $R/vial.png $R/chromecar.jpg &
gen white-badge 3:4 "Studio product photograph. A large chrome shield emblem with a double helix in relief, the exact shape of the shield on the label, mirror-polished with smooth bevelled edges, standing upright on $W; this exact glass vial stands upright in front of it and to the left of its centre so its reflection is not visible. The chrome reflects white and a faint ultramarine blue from off-frame. $LABEL. No text anywhere except the label, no lettering on the emblem. Only one vial." $R/vial.png $R/chromehearts.jpg &
gen white-pile 3:4 "Studio product photograph. A loose conical pile of ultramarine blue pigment powder (International Klein Blue), matte and absolute, on $W; this exact glass vial stands upright pressed into the top of the pile, a dusting of blue pigment on the base of the glass, the label clean. The blue is the only colour in the picture. $LABEL. No text anywhere except the label. Only one vial." $R/vial.png $R/klein-rock.jpg &
wait; ls -la $O | grep white
