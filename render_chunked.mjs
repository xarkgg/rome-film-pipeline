// Chunked renderer for this 2GB device. Same artifact as film.mjs, but the ~4300
// frame loop is split into short browser sessions with RAM-recovery pauses and the
// frames are stored on disk, then assembled into the same silent mp4 + narration mix.
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = dirname(fileURLToPath(import.meta.url))
const dir = resolve(process.argv[2] ?? join(ROOT, 'rome'))
const skill = join(ROOT, 'skills/city-through-time')
const req = createRequire(join(skill, 'scripts', 'noop.js'))
const chrome = process.env.CHROME ?? '/data/data/com.termux/files/usr/bin/chromium-browser'
const FPS = 30, CHUNK = 60, PAUSE = 30
const ARGS = ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--js-flags=--max-old-space-size=200', '--disable-features=site-per-process']
const pkgFile = (name, sub) => {
  for (const base of req.resolve.paths(name) ?? []) { const f = join(base, name, sub); if (existsSync(f)) return f }
  throw new Error(`${name}/${sub} not found`)
}
const { feature } = req('topojson-client')

const story = JSON.parse(readFileSync(join(dir, 'story.resolved.json'), 'utf8'))
const ffprobe = (f) => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' }).stdout)
story.eras.forEach((e, i) => { const a = join(dir, 'audio', `era${i}.mp3`); e.duration = existsSync(a) ? Math.max(6.5, +(ffprobe(a) + 1.6).toFixed(2)) : 7.5 })
const photos = {}
for (const e of story.eras) for (const ev of e.events ?? []) {
  ev.image ??= ev.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
  const f = join(dir, 'art', `${ev.image}.jpg`)
  if (existsSync(f)) photos[ev.image] = 'data:image/jpeg;base64,' + readFileSync(f).toString('base64')
}
story.photos = Object.fromEntries(Object.keys(photos).map((k) => [k, { credit: 'AI illustration' }]))
story.credits ??= `Map data © OpenStreetMap contributors · OpenMapTiles · Natural Earth · Outlines are reconstructions${Object.keys(photos).length ? ' · Illustrations are AI-generated' : ''}`
const topo = JSON.parse(readFileSync(pkgFile('world-atlas', 'land-110m.json'), 'utf8'))
const mini = join(dir, 'basemap.mini.json')
if (!existsSync(mini)) {
  const b = JSON.parse(readFileSync(join(dir, 'basemap.json'), 'utf8'))
  b.buildings = (b.buildings ?? []).filter((_, i) => i % 4 === 0)
  writeFileSync(mini, JSON.stringify(b))
}
const html = readFileSync(join(skill, 'assets/player.html'), 'utf8')
  .replace('/*D3ARRAY*/', () => readFileSync(pkgFile('d3-array', 'dist/d3-array.min.js'), 'utf8'))
  .replace('/*D3GEO*/', () => readFileSync(pkgFile('d3-geo', 'dist/d3-geo.min.js'), 'utf8'))
  .replace('/*STORY*/null', () => JSON.stringify(story))
  .replace('/*LAND*/null', () => JSON.stringify(feature(topo, topo.objects.land)))
  .replace('/*BASE*/null', () => (existsSync(mini) ? readFileSync(mini, 'utf8') : 'null'))
  .replace('/*PHOTOS*/null', () => JSON.stringify(photos))
writeFileSync(join(dir, 'film.html'), html)
const url = 'file://' + join(dir, 'film.html')

const { chromium } = req('playwright-core')
const open = async () => {
  const br = await chromium.launch({ executablePath: chrome, args: ARGS })
  const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } })
  const errors = []
  pg.on('pageerror', (e) => errors.push(e.message))
  return { br, pg, errors }
}
const { br: br0, pg: pg0, errors } = await open()
await pg0.goto(url)
await pg0.evaluate(() => window.ready)
const T = await pg0.evaluate(() => window.DURATION)
await br0.close()
if (errors.length) { console.error('player errors:', errors); process.exit(1) }
const frames = Math.round(T * FPS)
console.log(`T=${T.toFixed(2)}s frames=${frames} chunks=${Math.ceil(frames / CHUNK)}`)

const framesDir = join(dir, 'frames')
mkdirSync(framesDir, { recursive: true })
for (let a = 0; a < frames; a += CHUNK) {
  const b = Math.min(frames, a + CHUNK)
  const { br, pg, errors: errs } = await open()
  await pg.goto(url)
  await pg.evaluate(() => window.ready)
  for (let f = a; f < b; f++) {
    await pg.evaluate((t) => window.render(t), f / FPS)
    await pg.locator('canvas').screenshot({ path: join(framesDir, `f${String(f).padStart(5, '0')}.png`), type: 'png' })
  }
  await br.close()
  if (errs.length) { console.error('player errors:', errs); process.exit(1) }
  console.log(`chunk ${a}-${b - 1} ok ${new Date().toISOString().slice(11, 19)}`, { flush: true })
  if (b < frames) await new Promise((r) => setTimeout(r, PAUSE * 1000))
}

const silent = join(dir, 'film.silent.mp4')
const asm = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2', '-framerate', String(FPS), '-start_number', '0', '-i', join(framesDir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'medium', '-movflags', '+faststart', silent], { stdio: 'inherit' })
if (asm.status !== 0) { console.error('assemble failed'); process.exit(1) }

const starts = []; { let t = 8; for (const e of story.eras) { starts.push(t); t += e.duration } }
const end = starts[starts.length - 1] + story.eras[story.eras.length - 1].duration
const clips = [['intro', 0.8], ...story.eras.map((_, i) => [`era${i}`, starts[i] + 0.5]), ['outro', end + 0.8]].filter(([k]) => existsSync(join(dir, 'audio', `${k}.mp3`)))
const out = join(dir, 'film.mp4')
if (!clips.length) { spawnSync('mv', [silent, out]); console.log(`film done: ${T.toFixed(1)}s · 0 clips`); process.exit(0) }
const inputs = clips.flatMap(([k]) => ['-i', join(dir, 'audio', `${k}.mp3`)])
const filter = clips.map(([, d], i) => `[${i + 1}:a]adelay=${Math.round(d * 1000)}|${Math.round(d * 1000)}[a${i}];`).join('') + clips.map((_, i) => `[a${i}]`).join('') + `amix=inputs=${clips.length}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad[aout]`
const mux = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...inputs, '-filter_complex', filter, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', out])
if (mux.status !== 0) { console.error('mix failed'); process.exit(1) }
spawnSync('rm', ['-f', silent])
console.log(`film done: ${T.toFixed(1)}s · ${clips.length} clips`)
rmSync(framesDir, { recursive: true, force: true })
process.exit(0)
