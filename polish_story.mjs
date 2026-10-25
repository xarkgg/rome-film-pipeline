// Revision + polish pass. M3.1 still writes every line of narration and every prompt;
// this script asks it to fix the specific problems found in the fact-check, then
// applies deterministic cleanups (prompt tails, title case) and validates the schema.
import { direct } from './m31.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
import { ERAS } from './rome_brief.mjs'

const story = JSON.parse(readFileSync(new URL('./rome/story.json', import.meta.url), 'utf8'))
const j = async (prompt, opts) => {
  const r = await direct(prompt, opts)
  const t = r.content.trim()
  const s = t.indexOf('{'), e = t.lastIndexOf('}')
  if (s < 0 || e < 0) throw new Error('no JSON: ' + t.slice(0, 200))
  return JSON.parse(t.slice(s, e + 1))
}

const FIXES = {
  quadrata: {
    why: 'The sentence repeats "plough" twice in a row. Say it once.',
    ask: 'Rewrite the narration so the plough is mentioned once only. Keep every fact and the same meaning.',
  },
  imperial: {
    why: '"beyond the walls built to contain it" is confusing, because the Aurelian Walls were built later. The point is that the city had already outgrown the walls that would later be built around it.',
    ask: 'Rewrite the narration so it is clear the city had outgrown any wall built later. Keep the million people, Trajan and Hadrian. Keep it under 210 characters.',
  },
  aurelian: {
    why: '"made the shrinking city smaller" is clumsy. The point is the wall cut through settled ground and left part of the city outside it.',
    ask: 'Rewrite the narration so it says plainly that the wall left part of the city outside it, and that the city inside was smaller than a century before. Under 200 characters.',
  },
  leonine: {
    why: 'The narration does not mention that Rome itself had shrunk to almost nothing by 1483, which is what the map shows in this beat.',
    ask: 'Rewrite the narration so it opens with Rome being tiny by this point (a few thousand people inside a shell of empty wall), then turns to the new Roman-style wall around the Vatican. Under 210 characters. Do not call it the fourth wall.',
  },
}

for (const era of ERAS) {
  const fix = FIXES[era.key]
  if (!fix) continue
  const current = story.eras.find((e) => e.label === era.label)
  const p = `Rewrite one narration line of a documentary film about the history of Rome, told on a map of the modern city.

Current line: "${current.narration}"

Problem: ${fix.why}

Verified facts you may use:
${era.facts.map((f) => '- ' + f).join('\n')}

${fix.ask}
Rules:
- 1-2 spoken sentences, 130-210 characters, plain spoken English, burned into the film as a subtitle.
- No years in the line - the year is already printed on screen. Write any number as it is spoken.
- Use only the facts above. Return ONLY this JSON: { "narration": "<the new line>" }`
  let r
  for (let attempt = 0; attempt < 3; attempt++) {
    try { r = await j(p, { effort: 'low', maxTokens: 3000, temperature: 0.5 }); break } catch (e) { console.log('retry', era.key, e.message.slice(0, 60)); await new Promise((r2) => setTimeout(r2, 4000)) }
  }
  if (!r) { console.log(`--- ${era.label}: no revision`); continue }
  const next = r.narration?.trim()
  if (next && next.length <= 300) {
    console.log(`\n--- ${era.label} (${current.narration.length} -> ${next.length} chars)`)
    console.log('OLD:', current.narration)
    console.log('NEW:', next)
    current.narration = next
  } else {
    console.log(`\n--- ${era.label}: revision rejected (length ${next?.length ?? 0})`)
  }
}

// ── deterministic cleanups ────────────────────────────────────────────────
// 1. Image models read negative instructions as content. Strip them.
const NEG = /\s*,?\s*(with\s+)?no\s+(lettering|text|modern objects|people|roads|buildings|portraits)[^.]*\.?$/i
const cleanPrompt = (s) => s
  .replace(NEG, '')
  .replace(/\s*,?\s*but\s+no\s+[^.]*\.?$/i, '')
  .replace(/\s*\.\s*$/, '')
  .trim()

// 2. Sentence case for event titles, except all-caps artefacts.
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/\b([A-Z])([a-z]+)\b/g, (m) => m).replace(/,\s+([A-Z])/g, (m, c) => ', ' + c.toUpperCase())

for (const e of story.eras) {
  for (const ev of e.events ?? []) {
    const before = ev.prompt
    ev.prompt = cleanPrompt(ev.prompt)
    ev.title = titleCase(ev.title)
    if (before !== ev.prompt) console.log(`prompt cleaned: "${before}" -> "${ev.prompt}"`)
  }
}

// 3. Title punctuation: keep the em dash but make it clean.
story.title.en = story.title.en.replace(/\s*-\s*and\s+/, ' and ')
story.title.sub = story.title.sub
story.endCard.sub = story.endCard.sub

// 4. Validate the same rules the skill's resolver validates.
const problems = []
const str = (s, max) => typeof s === 'string' && s.trim().length > 0 && s.length <= max
if (story.version !== 1) problems.push('version')
if (!str(story.title.en, 80)) problems.push('title.en')
if (!str(story.intro, 200)) problems.push('intro ' + story.intro.length)
if (!str(story.outro, 200)) problems.push('outro ' + story.outro.length)
if (!str(story.endCard.title, 60)) problems.push('endCard.title')
if (!str(story.endCard.sub, 80)) problems.push('endCard.sub')
if (story.eras.length < 4 || story.eras.length > 12) problems.push('eras count')
for (const [i, e] of story.eras.entries()) {
  if (!str(e.year, 24)) problems.push(`eras[${i}].year`)
  if (!str(e.label, 40)) problems.push(`eras[${i}].label`)
  if (!str(e.narration, 300)) problems.push(`eras[${i}].narration ${e.narration.length}`)
  if (e.stat !== undefined && !str(e.stat, 60)) problems.push(`eras[${i}].stat ${e.stat.length}`)
  if (!/^#[0-9a-f]{6}$/i.test(e.color)) problems.push(`eras[${i}].color`)
  if (!e.shape?.polygons?.length) problems.push(`eras[${i}].shape`)
  if ((e.events ?? []).length > 2) problems.push(`eras[${i}].events`)
  for (const [k, ev] of (e.events ?? []).entries()) {
    if (!str(ev.title, 48)) problems.push(`eras[${i}].events[${k}].title ${ev.title.length}`)
    if (!str(ev.prompt, 400)) problems.push(`eras[${i}].events[${k}].prompt ${ev.prompt.length}`)
    if (!/^[a-z0-9-]{1,40}$/.test(ev.image)) problems.push(`eras[${i}].events[${k}].image`)
  }
}
console.log('\nvalidation:', problems.length ? problems : 'clean')

const speech = story.eras.reduce((s, e) => s + e.narration.length, 0)
console.log('narration chars:', speech, '~', Math.round(speech / 15), 's of speech')
console.log('title:', story.title.en, '|', story.title.sub)
console.log('endCard:', story.endCard.title, '|', story.endCard.sub)

writeFileSync(new URL('./rome/story.json', import.meta.url), JSON.stringify(story, null, 1))
console.log('\nwrote rome/story.json')
