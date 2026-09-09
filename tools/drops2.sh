#!/bin/zsh
# Generate the clip BACKWARDS: start on the real photograph, lift the product
# out of frame, end on empty snow. Then reverse it. Played forward the product
# descends into the scene and every frame carries the real molecule, because
# the model is dissolving a structure it can see rather than inventing one.
cd ~/sko-brandbook-site
mkdir -p img/vid img/vid/_in img/products/logs
PROMPT="The glass vial and the chrome molecule sculpture lift straight up out of the snow together and rise out of frame, and a fine burst of snow crystals is kicked up where they were and drifts away, leaving empty snow dunes. Both objects keep their exact shape and stay rigid the whole time, nothing bends, melts or changes form. Locked-off camera, no zoom, no pan. Blue-hour alpine light, one hard low sun from the right."
one(){ local s=$1
  [ -f "img/products/web/$s-wide.jpg" ] || { echo "$s NO PHOTO"; return; }
  python3 -c "
from PIL import Image
im=Image.open('img/products/web/$s-wide.jpg').convert('RGB'); im.thumbnail((1280,1280)); im.save('img/vid/_in/$s-end.jpg',quality=92)"
  for i in 1 2 3; do
    higgsfield generate create wan3_0 --start-image "img/vid/_in/$s-end.jpg" --end-image img/vid/_in/scene.jpg \
      --duration 2 --resolution 720p --aspect_ratio 16:9 --generate-audio false --wait \
      --prompt "$PROMPT" > "img/products/logs/vid-$s.log" 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.mp4' "img/products/logs/vid-$s.log" | head -1)
    [ -n "$url" ] && curl -sL "$url" -o "img/vid/_in/$s-rev.mp4" && break
    sleep 8
  done
  [ -f "img/vid/_in/$s-rev.mp4" ] || { echo "$s FAILED"; return; }
  ffmpeg -v error -i "img/vid/_in/$s-rev.mp4" -vf reverse -an -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart -vf "reverse,scale=1280:-2" "img/vid/$s.mp4" -y
  ffmpeg -v error -i "img/vid/$s.mp4" -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -speed 3 -pix_fmt yuv420p "img/vid/$s.webm" -y
  echo "$s ok"
}
for s in "$@"; do one $s & while [ $(jobs -r | wc -l) -ge 5 ]; do sleep 2; done; done
wait; echo BATCH-DONE
