// Builds the nine era outlines for the Rome film.
// OSM geometry where it exists (Aurelian ring, A90 ring); documented hand traces elsewhere.
// Areas are computed the same way the player computes them.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { radialRing, ringAreaKm2, bboxOf } from './geo.mjs'

const LAT0 = 41.8925, LON0 = 12.4853
const KX = 111320 * Math.cos((LAT0 * Math.PI) / 180), KY = 110540
const toM = ([lat, lon]) => [(lon - LON0) * KX, -(lat - LAT0) * KY]

const raw = (file) => JSON.parse(readFileSync(new URL(`./geo/${file}`, import.meta.url), 'utf8')).lines

// ── OSM rings ─────────────────────────────────────────────────────────────
// geo/aurelian.json and geo/gra.json hold radial rings computed from real OSM ways.
const aurelianRing = JSON.parse(readFileSync(new URL('./geo/aurelian.json', import.meta.url), 'utf8')).ring
const graRing = JSON.parse(readFileSync(new URL('./geo/gra.json', import.meta.url), 'utf8')).ring

// The wall as first built (AD 271-275): the northern Viarecta section is later (AD 401-403).
const cutLat = 41.9035
const cutRing = (ring) => {
  const keep = ring.filter((p) => p[0] <= cutLat)
  if (keep.length < 8) return ring
  const north = keep.reduce((a, b) => (a[0] > b[0] ? a : b))
  const first = keep[0], last = keep.at(-1)
  return [...keep, [cutLat, first[1]], [cutLat, last[1]]]
}
const aurelian271 = cutRing(aurelianRing)

// ── hand traces ───────────────────────────────────────────────────────────
// Roma Quadrata: the summit plateau of the Palatine.
const quadrata = [
  [41.88490, 12.48560], [41.88560, 12.48480], [41.88670, 12.48510], [41.88750, 12.48590],
  [41.88760, 12.48730], [41.88690, 12.48860], [41.88580, 12.48880], [41.88490, 12.48780],
]

// Servian Wall (early 4th century BC). Anchors on the surviving OSM fragments
// (Aventine 41.8803/12.4827, Palatine 41.8806/12.4882, Porta Esquilina 41.8965/12.4868,
// Torre delle Milizie 41.9018/12.5010, Lateran 41.8928/12.5006, north Esquiline 41.9063/12.4943).
const servian = [
  [41.87950, 12.47700], [41.88030, 12.48269], [41.88150, 12.48620], [41.88400, 12.48660],
  [41.88720, 12.48760], [41.88880, 12.48560], [41.89060, 12.48330], [41.89300, 12.48250],
  [41.89460, 12.48500], [41.89646, 12.48675], [41.89950, 12.49200], [41.90180, 12.50100],
  [41.90338, 12.50025], [41.89900, 12.50300], [41.89279, 12.50054], [41.88850, 12.49900],
  [41.88450, 12.49250], [41.88061, 12.48824], [41.88044, 12.48206], [41.87950, 12.47700],
]

// Republic (c. 100 BC): the city has run past the old wall.
const republic = [
  [41.87950, 12.47700], [41.88030, 12.48269], [41.87900, 12.48800], [41.88300, 12.49000],
  [41.88850, 12.49900], [41.89279, 12.50054], [41.89850, 12.50400], [41.90338, 12.50025],
  [41.90634, 12.49431], [41.90900, 12.49300], [41.91050, 12.48700], [41.90800, 12.48000],
  [41.90300, 12.47600], [41.89850, 12.47200], [41.89300, 12.47000], [41.88800, 12.47000],
  [41.88400, 12.47400], [41.87950, 12.47700],
]

// Imperial Rome (c. AD 100-130): the million-person city. It is the Aurelian ring
// plus the parts of the city the later wall left outside: the northern Campus Martius
// (up to the Via Flaminia) and the Trastevere on the far bank of the Tiber.
const inflate = (ring) => {
  const n = ring.length
  const c = ring.reduce((s, p) => [s[0] + p[0] / n, s[1] + p[1] / n], [0, 0])
  return ring.map((p, i) => {
    const a = (-Math.PI + ((i + 0.5) / n) * 2 * Math.PI) * 180 / Math.PI
    let f = 1
    if (a > 45 && a < 135) f = 1.30        // north: the Campus Martius bulges out
    else if (a >= 135 && a < 205) f = 1.26 // west: the Trastevere
    else if (a >= 205 && a < 250) f = 1.10 // south-west: the Emporium
    return [+(c[0] + (p[0] - c[0]) * f).toFixed(5), +(c[1] + (p[1] - c[1]) * f).toFixed(5)]
  })
}
const imperial = inflate(aurelianRing)

// The Leonine wall (finished 1483): the Vatican and the Borgo.
const leonine = [
  [41.90350, 12.44680], [41.90280, 12.45280], [41.89900, 12.45180], [41.89580, 12.45420],
  [41.89560, 12.46000], [41.89820, 12.46480], [41.90220, 12.46660], [41.90400, 12.46200],
  [41.90480, 12.45350],
]

const shapes = {
  quadrata: [quadrata],
  servian: [servian],
  republic: [republic],
  imperial: [imperial],
  aurelian271: [aurelian271],
  aurelian403: [aurelianRing],
  leonine: [leonine],
  portaPia: [aurelianRing],
  modern: [graRing],
}

const out = {}
for (const [k, polys] of Object.entries(shapes)) {
  const area = polys.reduce((s, p) => s + ringAreaKm2(p), 0)
  out[k] = { polygons: polys.map((p) => p.map(([a, b]) => [a, b])), areaKm2: +area.toFixed(2), bbox: bboxOf(polys.flat()), points: polys.flat().length }
  console.log(k.padEnd(12), 'pts=' + String(out[k].points).padStart(4), 'area=' + String(out[k].areaKm2).padStart(7), 'km2')
}
writeFileSync(new URL('./geo/era_shapes.json', import.meta.url), JSON.stringify(out, null, 1))
console.log('\nwrote geo/era_shapes.json')
