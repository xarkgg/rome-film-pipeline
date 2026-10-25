#!/data/data/com.termux/files/usr/bin/bash
export PATH=/data/data/com.termux/files/usr/bin:$PATH
export TMPDIR=/data/data/com.termux/files/usr/tmp
LOG=/data/data/com.termux/files/home/aicityremix/logs/resolve.log
MARK=/data/data/com.termux/files/home/aicityremix/logs/resolve.done
rm -f "$MARK"; echo "START $(date -u +%H:%M:%S)" > "$LOG"
cd /data/data/com.termux/files/home/aicityremix/skills/city-through-time
node scripts/resolve.mjs /data/data/com.termux/files/home/aicityremix/rome >> "$LOG" 2>&1
echo "EXIT:$?" >> "$LOG"; echo "DONE $(date -u +%H:%M:%S)" > "$MARK"
