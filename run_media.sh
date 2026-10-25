#!/data/data/com.termux/files/usr/bin/bash
export PATH=/data/data/com.termux/files/usr/bin:$PATH
export TMPDIR=/data/data/com.termux/files/usr/tmp
export SANDBASE_API_KEY=$(python3 -c "import json,os;print(json.load(open(os.path.expanduser('~/.local/share/opencode/auth.json')))['sandbase']['key'])")
export SANDBASE_CLI=$(ls -d /data/data/com.termux/files/home/.npm/_npx/*/node_modules/@sandbaseai/cli/dist/cli.js | head -1)
LOG=/data/data/com.termux/files/home/aicityremix/logs/media.log
MARK=/data/data/com.termux/files/home/aicityremix/logs/media.done
rm -f "$MARK"; echo "START $(date -u +%H:%M:%S) cli=$SANDBASE_CLI" > "$LOG"
cd /data/data/com.termux/files/home/aicityremix/skills/city-through-time
node scripts/media.mjs /data/data/com.termux/files/home/aicityremix/rome --confirm >> "$LOG" 2>&1
echo "EXIT:$?" >> "$LOG"; echo "DONE $(date -u +%H:%M:%S)" > "$MARK"
