import { direct } from './m31.mjs'
import { TOPLEVEL_PROMPT, ERAS, CITY, RULES, THESIS } from './rome_brief.mjs'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const shapes = JSON.parse(readFileSync(new URL('./geo/era_shapes.json', import.meta.url), 'utf8'))

const j = async (prompt, opts) => {
  const r = await direct(prompt, opts)
  const t = r.content.trim()
  const start = t.indexOf('{'), end = t.lastIndexOf('}')
  if (start < 0 || end < 0) throw new Error('no JSON in reply: ' + t.slice(0, 300))
  return JSON.parse(t.slice(start, end + 1))
}

const top = await j(TOPLEVEL_PROMPT, { effort: 'medium', maxTokens: 3000, temperature: 0.7 })
console.log('=== TOP LEVEL ===\n' + JSON.stringify(top, null, 1))

const out = { version: 1, city: CITY, title: top.title, intro: top.intro, outro: top.outro, endCard: top.endCard, eras: [] }

for (const e of ERAS) {
  const p = `You are directing one beat of a documentary film about the history of Rome, told on a live map of the modern city.

${THESIS}

This beat is printed on screen as: ${e.year} — ${e.label}

These are the verified facts for this beat, and the only facts you may use:
${e.facts.map((f) => '- ' + f).join('\n')}

This beat shows these two objects on the map, with these fixed positions:
${e.events.map((ev, i) => `${i + 1}. ${ev.title} at ${JSON.stringify(ev.at)}`).join('\n')}

Write ONLY this JSON:
{
  "narration": "<1-2 spoken sentences, 130-210 characters>",
  "stat": "<one short fact, 60 characters max>",
  "events": [
    { "title": "<label for the first object, 48 characters max>", "prompt": "<one period-correct scene, 400 characters max>" },
    { "title": "<label for the second object, 48 characters max>", "prompt": "<one period-correct scene, 400 characters max>" }
  ]
}

${RULES}`
  const r = await j(p, { effort: 'low', maxTokens: 3000, temperature: 0.6 })
  const era = {
    year: e.year,
    label: e.label,
    narration: r.narration,
    stat: r.stat ?? '',
    color: e.color,
    shape: { polygons: shapes[e.shapeKey].polygons },
    events: e.events.map((ev, i) => ({
      at: ev.at,
      title: r.events?.[i]?.title ?? ev.title,
      prompt: r.events?.[i]?.prompt ?? ev.prompt,
      image: `rome-${e.key}-${i + 1}`,
    })),
  }
  out.eras.push(era)
  console.log(`\n=== ${e.year} ${e.label} === (${r.narration.length} chars)`)
  console.log(r.narration)
  console.log(`[${r.stat}]`)
  for (const ev of era.events) console.log(' *', ev.title, '::', ev.prompt)
}

mkdirSync(new URL('./rome/', import.meta.url), { recursive: true })
writeFileSync(new URL('./rome/story.json', import.meta.url), JSON.stringify(out, null, 1))
writeFileSync(new URL('./story.m3.json', import.meta.url), JSON.stringify(out, null, 1))
const total = out.eras.reduce((s, e) => s + e.narration.length, 0)
console.log(`\nwrote rome/story.json — total narration ${total} chars (~${~(total / 15).toFixed(0)}s of speech)`)
