// Fills in the landmark cards that SandBase image credits no longer cover,
// using Pollinations (FLUX) — free, no key. Keeps any SandBase Qwen cards
// already on disk and generates the rest from the same event prompts.
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'

const dir = new URL('./rome/', import.meta.url).pathname
const story = JSON.parse(readFileSync(dir + 'story.resolved.json', 'utf8'))
const jobs = []
for (const e of story.eras) for (const ev of e.events ?? []) {
  if (ev.image && !existsSync(dir + 'art/' + ev.image + '.jpg')) jobs.push(ev)
}
console.log(`cards on disk kept, missing = ${jobs.length}`)

const wanted = statSync(dir + 'story.resolved.json').mtime // no-op to keep imports used
for (const ev of jobs) {
  const out = dir + 'art/' + ev.image
  const url = 'https://image.pollinations.ai/prompt/' + encodeURIComponent(ev.prompt.slice(0, 480)) +
    `?width=1040&height=680&nologo=true&model=flux&seed=${4 + Math.floor(Math.random() * 99999)}`
  let ok = false
  for (let a = 1; a <= 4 && !ok; a++) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('HTTP ' + res.status)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 3000) throw new Error('too small: ' + buf.length)
      writeFileSync(out + '.raw', buf)
      execSync(`ffmpeg -y -loglevel error -i ${out}.raw -vf "scale=1040:680:force_original_aspect_ratio=increase,crop=1040:680,scale=520:340" -q:v 3 ${out}.jpg`)
      execSync(`rm -f ${out}.raw`)
      ok = true
      console.log(`ok ${ev.image}  (${buf.length}b)`)
    } catch (err) {
      console.log(`retry ${a} ${ev.image}: ${err.message}`)
      await new Promise((r) => setTimeout(r, a * 8000))
    }
  }
  if (!ok) console.log(`FAIL ${ev.image}`)
}
console.log('done')
