#!/data/data/com.termux/files/usr/bin/bash
export PATH=/data/data/com.termux/files/usr/bin:$PATH
LOG=/data/data/com.termux/files/home/aicityremix/logs/chromium_install.log
MARK=/data/data/com.termux/files/home/aicityremix/logs/chromium_install.done
rm -f "$MARK"
echo "START $(date -u +%H:%M:%S)" > "$LOG"
pkg install chromium -y >> "$LOG" 2>&1
rc=$?
echo "EXIT:$rc" >> "$LOG"
if command -v chromium >/dev/null 2>&1; then
  echo "CHROME=$(command -v chromium) $(chromium --version 2>&1 | head -1)" >> "$LOG"
fi
echo "DONE $(date -u +%H:%M:%S)" > "$MARK"
