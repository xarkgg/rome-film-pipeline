import { fetchWays } from './geo.mjs'

const NAMES = '^(Porta del Popolo|Porta Pinciana|Porta Salaria$|Porta Salaria Vecchia|Porta Pia|Porta Nomentana|Porta Tiburtina|Porta Maggiore|Porta San Giovanni|Porta San Lorenzo|Porta Santa Bibiana|Porta Capena|Porta San Sebastiano|Porta San Paolo|Porta Ostiense|Porta Portuensis|Mura Aureliane|Mura Serviane|Mura Leonine|Muro Torto|Torre delle Milizie)$'
const { lines, els } = fetchWays(NAMES, '41.85,12.40,41.97,12.58')
const seen = new Map()
for (const l of lines) {
  const mid = l[Math.floor(l.length / 2)]
  const p = [+(mid[0].toFixed(5)), +(mid[1].toFixed(5))]
  seen.set(p.join(','), p)
}
const byName = new Map()
for (const e of els) {
  const n = e.tags?.name
  if (!n) continue
  if (!e.geometry) continue
  const mid = e.geometry[Math.floor(e.geometry.length / 2)]
  const key = n
  if (!byName.has(key)) byName.set(key, [])
  byName.get(key).push([+(mid.lat.toFixed(5)), +(mid.lon.toFixed(5))])
}
for (const [n, pts] of byName) {
  const lats = pts.map((p) => p[0]), lons = pts.map((p) => p[1])
  console.log(`${n.padEnd(24)} n=${String(pts.length).padStart(3)}  lat ${Math.min(...lats).toFixed(5)}..${Math.max(...lats).toFixed(5)}  lon ${Math.min(...lons).toFixed(5)}..${Math.max(...lons).toFixed(5)}`)
  if (pts.length <= 3) for (const p of pts) console.log('      ', p.join(', '))
}
