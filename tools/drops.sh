#!/bin/zsh
# One 2s clip per compound. The start frame is the empty alpine scene, the END
# frame is that compound's own photograph, so the clip lands on the still exactly.
cd ~/sko-brandbook-site
mkdir -p img/vid img/vid/_in img/products/logs
PROMPT="A glass vial and a chrome molecule model drop down together into fresh snow and settle upright, kicking up a fine burst of snow crystals that drifts and clears. Locked-off camera, no zoom, no pan, no camera move. Blue-hour alpine light, one hard low sun from the right."
one(){ local s=$1
  [ -f "img/vid/$s.webm" ] && { echo "$s exists"; return; }
  [ -f "img/products/web/$s-wide.jpg" ] || { echo "$s NO PHOTO"; return; }
  python3 -c "
from PIL import Image
im=Image.open('img/products/web/$s-wide.jpg').convert('RGB'); im.thumbnail((1280,1280)); im.save('img/vid/_in/$s-end.jpg',quality=92)"
  for i in 1 2 3; do
    higgsfield generate create wan3_0 --start-image img/vid/_in/scene.jpg --end-image "img/vid/_in/$s-end.jpg" \
      --duration 2 --resolution 720p --aspect_ratio 16:9 --generate-audio false --wait \
      --prompt "$PROMPT" > "img/products/logs/vid-$s.log" 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.mp4' "img/products/logs/vid-$s.log" | head -1)
    [ -n "$url" ] && curl -sL "$url" -o "img/vid/_in/$s-raw.mp4" && break
    sleep 8
  done
  [ -f "img/vid/_in/$s-raw.mp4" ] || { echo "$s FAILED"; return; }
  ffmpeg -v error -i "img/vid/_in/$s-raw.mp4" -an -c:v libx264 -profile:v main -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart -vf "scale=1280:-2" "img/vid/$s.mp4" -y
  ffmpeg -v error -i "img/vid/_in/$s-raw.mp4" -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -speed 3 -pix_fmt yuv420p "img/vid/$s.webm" -y
  echo "$s ok"
}
for s in "$@"; do one $s & done
wait
