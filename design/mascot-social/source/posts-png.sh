#!/bin/zsh
# Renders posts/*.svg (listed in posts/list.txt) to exact-size PNGs via Quick Look:
# pads each post into a square, renders, then crops back. Also writes 600px JPEG previews.
set -e
cd "$(dirname "$0")/posts"
rm -rf png preview tmp && mkdir -p png preview tmp
while read f w h S; do
  node -e '
const fs=require("fs");const [f,w,h,S]=process.argv.slice(1);
const s=fs.readFileSync(f+".svg","utf8");
fs.writeFileSync(`tmp/${f}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${s.replace(/^<svg /,`<svg x="${(S-w)/2}" y="${(S-h)/2}" `)}</svg>`);' "$f" "$w" "$h" "$S"
  qlmanage -t -s $S -o tmp tmp/$f.svg >/dev/null 2>&1
  sips -c $h $w tmp/$f.svg.png --out png/$f.png >/dev/null
  sips -s format jpeg -s formatOptions 82 -Z $(( h > w ? 900 : 640 )) png/$f.png --out preview/$f.jpg >/dev/null
done < list.txt
rm -rf tmp
ls png | wc -l
