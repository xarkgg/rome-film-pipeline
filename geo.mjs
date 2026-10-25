// Fetches OSM geometry for Rome's historic outlines and computes the same radial ring
// the skill's resolver uses, so hand-modified eras stay on real geometry.
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

const UA = 'sandbase-lab-city-through-time/0.1 (+https://www.sandbase.ai/lab)'
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]
const DIR = new URL('./geo/', import.meta.url).pathname
mkdirSync(DIR, { recursive: true })

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

export function overpass(query) {
  for (let pass = 0; pass < 3; pass++) {
    for (const m of MIRRORS) {
      const r = spawnSync('curl', ['-sS', '-m', '240', '-A', UA, '-H', 'Accept: application/json', '--data-urlencode', `data=${query}`, m], { maxBuffer: 1 << 30 })
      const body = r.stdout?.toString() ?? ''
      try { const j = JSON.parse(body); if (Array.isArray(j.elements)) return j.elements } catch {}
    }
    sleep(15000 * (pass + 1))
  }
  throw new Error('all overpass mirrors failed')
}

export function fetchWays(nameRegex, bbox = '41.75,12.25,42.10,12.80') {
  const slug = createHash('sha1').update(nameRegex + bbox).digest('hex').slice(0, 10)
  const file = join(DIR, `raw_${slug}.json`)
  if (existsSync(file)) {
    const c = JSON.parse(readFileSync(file, 'utf8'))
    return { lines: c.lines, els: c.els }
  }
  const q = `[out:json][timeout:180];(way["name"~"${nameRegex}",i](${bbox});relation["name"~"${nameRegex}",i](${bbox}););out geom qt;`
  const els = overpass(q)
  const lines = []
  for (const e of els) {
    if (e.type === 'way' && e.geometry) lines.push(e.geometry.map((g) => [g.lat, g.lon]))
    if (e.type === 'relation') for (const m of e.members ?? []) if (m.geometry) lines.push(m.geometry.map((g) => [g.lat, g.lon]))
  }
  writeFileSync(file, JSON.stringify({ lines, els }))
  return { lines, els }
}

const LAT0 = 41.8925, LON0 = 12.4853
const KX = 111320 * Math.cos((LAT0 * Math.PI) / 180), KY = 110540
export const toM = ([lat, lon]) => [(lon - LON0) * KX, (lat - LAT0) * KY]
const toLL = ([x, y]) => [+(LAT0 + y / KY).toFixed(5), +(LON0 + x / KX).toFixed(5)]

/** Identical to scripts/resolve.mjs radialRing. */
export function radialRing(pointsLL, bins = 160) {
  const pts = pointsLL.map(toM)
  const c = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
  const r = new Array(bins).fill(0)
  for (const [x, y] of pts) {
    const i = Math.floor(((Math.atan2(y - c[1], x - c[0]) + Math.PI) / (2 * Math.PI)) * bins) % bins
    r[i] = Math.max(r[i], Math.hypot(x - c[0], y - c[1]))
  }
  if (r.filter(Boolean).length < bins / 6) return null
  const med = r.map((_, i) => { const w = []; for (let k = -6; k <= 6; k++) { const v = r[(i + k + bins) % bins]; if (v) w.push(v) } w.sort((x, y) => x - y); return w[w.length >> 1] ?? 0 })
  for (let i = 0; i < bins; i++) if (r[i] > med[i] * 1.3) r[i] = med[i] * 1.3
  for (let i = 0; i < bins; i++) {
    if (!r[i]) {
      let a = i, b = i
      while (!r[(a - 1 + bins) % bins]) a--
      while (!r[(b + 1) % bins]) b++
      const ra = r[(a - 1 + bins) % bins], rb = r[(b + 1) % bins]
      for (let k = a; k <= b; k++) r[k] = ra + (rb - ra) * ((k - a + 1) / (b - a + 2))
    }
  }
  const sm = r.map((r_, i) => (r[(i - 1 + bins) % bins] + 2 * r_ + r[(i + 1) % bins]) / 4)
  return sm.map((d, i) => { const a = -Math.PI + ((i + 0.5) / bins) * 2 * Math.PI; return toLL([c[0] + d * Math.cos(a), c[1] + d * Math.sin(a)]) })
}

export function ringAreaKm2(ring) {
  const p = ring.map(toM)
  return Math.abs(p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1] }, 0)) / 2e6
}

export function bboxOf(ring) {
  const lats = ring.map((p) => p[0]), lons = ring.map((p) => p[1])
  return { latMin: Math.min(...lats), latMax: Math.max(...lats), lonMin: Math.min(...lons), lonMax: Math.max(...lons) }
}

/** Fetch + ring + cache. */
export function ringFor(slug, nameRegex) {
  const file = join(DIR, `${slug}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, 'utf8'))
  const { lines, els } = fetchWays(nameRegex)
  const n = lines.reduce((s, l) => s + l.length, 0)
  const ring = n >= 30 ? radialRing(lines.flat()) : null
  const out = { slug, nameRegex, pointCount: n, elementCount: els.length, ring }
  if (ring) out.areaKm2 = +ringAreaKm2(ring).toFixed(2), out.bbox = bboxOf(ring)
  writeFileSync(file, JSON.stringify(out, null, 1))
  return out
}

if (process.argv[2] === 'build') {
  for (const [slug, re] of [['servian', '^Mura Serviane$'], ['aurelian', '^Mura Aureliane$'], ['leonine', 'Mura Leonin'], ['gra', '^Grande Raccordo Anulare$']]) {
    const r = ringFor(slug, re)
    console.log(slug, 'pts=' + r.pointCount, 'ring=' + (r.ring ? 'yes' : 'no'), 'area=' + (r.areaKm2 ?? '-'), 'km2', r.bbox ? JSON.stringify(r.bbox) : '')
  }
}
