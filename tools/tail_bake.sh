#!/bin/bash
# Bake the catalogue still into the last 0.3s of each HD clip so the cut to the
# still is photo-to-photo. Sources come from img/vid/_pre_tail (untouched originals).
set -e
cd ~/sko-brandbook-site
for s in bpc-157 tb-500 ghk-cu nad semax glutathione tesamorelin mots-c; do
  for spec in "1920 1080  18 28" "960 540 -m 20 32"; do
    set -- $spec
    if [ "$3" = "-m" ]; then W=$1; H=$2; suf=-m; CRF=$4; VCRF=$5; else W=$1; H=$2; suf=""; CRF=$3; VCRF=$4; fi
    FC="[1:v]scale=${W}:${H}:flags=lanczos,format=yuv420p,fps=30[st];[0:v]scale=${W}:${H}:flags=lanczos,fps=30,format=yuv420p[cl];[cl][st]xfade=transition=fade:duration=0.3:offset=1.7[v]"
    ffmpeg -v error -y -i "img/vid/_pre_tail/${s}.mp4" -loop 1 -t 0.6 -i "img/products/web/hd/${s}-wide.jpg" \
      -filter_complex "$FC" -map "[v]" -an -c:v libx264 -preset slow -crf "$CRF" -profile:v high -pix_fmt yuv420p -movflags +faststart "img/vid/${s}${suf}.mp4"
    ffmpeg -v error -y -i "img/vid/${s}${suf}.mp4" -an -c:v libvpx-vp9 -b:v 0 -crf "$VCRF" -row-mt 1 -deadline good -cpu-used 2 "img/vid/${s}${suf}.webm"
  done
  echo "$s $(ffprobe -v error -show_entries format=duration -of csv=p=0 img/vid/$s.mp4 | cut -c1-4)s"
done
