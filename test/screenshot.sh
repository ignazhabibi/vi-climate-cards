#!/bin/sh
# Render the test page with headless Chrome.
# Usage: test/screenshot.sh <out.png> <card-width-px> [query] [window-height-px]
#   query: m=heat|dhw|byp|mixed|idle, dark=1, card=rf (refrigerant card),
#          se=1 (entity header with status items), st=1 (template header),
#          info=1 (open the explanation dialog)
#   window height defaults to width + 120; the narrow layout (below 600 px)
#   needs about 2 * width + 120.
# Example: test/screenshot.sh "$PWD/out/card.png" 760 "m=dhw&dark=1"
# Pass an absolute output path: the script changes into test/page.
set -e
cd "$(dirname "$0")/page"
out="$1"
width="${2:-760}"
query="$3"
height="${4:-$((width + 120))}"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --virtual-time-budget=4000 --window-size=$((width + 40)),$height \
  --screenshot="$out" "file://$PWD/index.html?w=$width&$query" >/dev/null 2>&1
echo "$out"
