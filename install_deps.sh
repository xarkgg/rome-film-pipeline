#!/data/data/com.termux/files/usr/bin/bash
export PATH=/data/data/com.termux/files/usr/bin:$PATH
LOG=/data/data/com.termux/files/home/aicityremix/logs/npm_ci.log
MARK=/data/data/com.termux/files/home/aicityremix/logs/npm_ci.done
rm -f "$MARK"
echo "START $(date -u +%H:%M:%S)" > "$LOG"
cd /data/data/com.termux/files/home/aicityremix/skills/city-through-time || exit 1
npm ci --no-audit --no-fund >> "$LOG" 2>&1
echo "EXIT:$?" >> "$LOG"
echo "DONE $(date -u +%H:%M:%S)" > "$MARK"
