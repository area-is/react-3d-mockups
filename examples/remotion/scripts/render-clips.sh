#!/usr/bin/env bash
# Render the looping clips (src/clips) and encode each one for posting:
#   out/clips/<name>.mp4   H.264, silent, for Reddit/X/LinkedIn video uploads
#   out/clips/<name>.gif   for READMEs, comments and anywhere video is not allowed
#   out/clips/<name>.webp  animated WebP, the same loop at a fraction of the GIF's size
#
#   scripts/render-clips.sh                  every clip
#   scripts/render-clips.sh TurnClip FoldClip  just those
set -euo pipefail
cd "$(dirname "$0")/.."

CLIPS=("$@")
[ ${#CLIPS[@]} -eq 0 ] && CLIPS=(TurnClip FoldClip TrioClip PhonesClip)
CONCURRENCY=${CONCURRENCY:-2}
mkdir -p out/clips

for clip in "${CLIPS[@]}"; do
  name=$(echo "$clip" | sed -E 's/Clip$//; s/([a-z])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')
  master="out/clips/$name.master.mp4"
  npx remotion render "$clip" "$master" --concurrency="$CONCURRENCY" --crf=14 --log=error

  width=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$master")
  height=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$master")
  # Square clips go out at 720, wide ones at 960: big enough for a feed, small enough to load.
  gif_width=$([ "$width" = "$height" ] && echo 720 || echo 960)

  ffmpeg -v error -y -i "$master" -an -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "out/clips/$name.mp4"
  ffmpeg -v error -y -i "$master" -vf "fps=20,scale=${gif_width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle" -loop 0 "out/clips/$name.gif"
  ffmpeg -v error -y -i "$master" -vf "fps=30,scale=${gif_width}:-1:flags=lanczos" -c:v libwebp_anim -q:v 82 -compression_level 6 -loop 0 "out/clips/$name.webp"
  rm "$master"
  ls -lh "out/clips/$name".{mp4,gif,webp}
done
