#!/data/data/com.termux/files/usr/bin/bash
export PATH=/data/data/com.termux/files/usr/bin:$PATH
export TMPDIR=/data/data/com.termux/files/usr/tmp
LOG=/data/data/com.termux/files/home/aicityremix/logs/stills.log
echo "START $(date -u +%H:%M:%S)" > "$LOG"
cd /data/data/com.termux/files/home/aicityremix/skills/city-through-time
PREFIX=$PREFIX NODE_OPTIONS="--require /data/data/com.termux/files/home/aicityremix/termux-shim.cjs" \
  node scripts/film.mjs /data/data/com.termux/files/home/aicityremix/rome --stills 12,45,95 --chrome $PREFIX/bin/chromium-browser >> "$LOG" 2>&1
echo "EXIT:$? $(date -u +%H:%M:%S)" >> "$LOG"
