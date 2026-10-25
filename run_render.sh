#!/data/data/com.termux/files/usr/bin/bash
export PATH=/data/data/com.termux/files/usr/bin:$PATH
export TMPDIR=/data/data/com.termux/files/usr/tmp
LOG=/data/data/com.termux/files/home/aicityremix/logs/render.log
echo "START $(date -u +%H:%M:%S)" > "$LOG"
cd /data/data/com.termux/files/home/aicityremix
NODE_OPTIONS="--require /data/data/com.termux/files/home/aicityremix/termux-shim.cjs" \
  node render_chunked.mjs /data/data/com.termux/files/home/aicityremix/rome >> "$LOG" 2>&1
echo "EXIT:$? $(date -u +%H:%M:%S)" >> "$LOG"
echo "DONE $(date -u +%H:%M:%S)" > /data/data/com.termux/files/home/aicityremix/logs/render.done
