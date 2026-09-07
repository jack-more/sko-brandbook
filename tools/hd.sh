#!/bin/zsh
# Topaz CGI 2x for every plate that gets blown up. img/products/<x>.png or img/edition3/<x>.png -> img/hd/<x>.png
# usage: hd.sh file [file ...]
cd ~/sko-brandbook-site; mkdir -p img/hd img/products/logs
one(){ local src=$1 name=$(basename ${1%.*})
  [ -f "img/hd/$name.png" ] && return
  mkdir -p img/hd/_in; local up="img/hd/_in/$name.jpg"
  read w h < <(python3 -c "from PIL import Image;im=Image.open('$src').convert('RGB');im.save('$up',quality=95,subsampling=0);print(im.size[0]*2,im.size[1]*2)")
  for i in 1 2 3; do higgsfield generate create topaz_image --image "$up" --output_width $w --output_height $h --variant CGI --wait > img/products/logs/hd-$name.log 2>&1 < /dev/null
    url=$(grep -oE 'https://[^ "]+\.(png|jpg)' img/products/logs/hd-$name.log | head -1); echo "$name $url"; [ -n "$url" ] && curl -sL "$url" -o "img/hd/$name.png" && break; sleep 10; done; }
for f in "$@"; do one "$f" & while [ $(jobs -r | wc -l) -ge 4 ]; do sleep 2; done; done; wait; echo DONE
