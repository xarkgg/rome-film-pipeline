import { direct } from './m31.mjs'
import { readFileSync, writeFileSync } from 'node:fs'

const story = JSON.parse(readFileSync(new URL('./rome/story.json', import.meta.url), 'utf8'))
const j = async (prompt, opts) => {
  const r = await direct(prompt, opts)
  const t = r.content.trim()
  const s = t.indexOf('{'), e = t.lastIndexOf('}')
  if (s < 0 || e < 0) throw new Error('no JSON: ' + t.slice(0, 200))
  return JSON.parse(t.slice(s, e + 1))
}

const p = `Rewrite the closing narration of a documentary film about the history of Rome, told on a map of the modern city.

Current line: "${story.outro}"

The problem: the film ends on Rome alone. The judges reward a film that makes the viewer feel the story is about THEIR city too, not just the one on screen. The viewer might be from anywhere - Lagos, Delhi, São Paulo, Tokyo - and the point of the proverb is that no city was built in a day and no city is finished.

Rewrite the line so it:
- lands the film's thesis (Rome was never finished; walls move, ring roads follow, the city keeps building),
- turns to the viewer directly in the last clause, telling them the same is true of their own city,
- stays in 1-2 spoken sentences, 130-200 characters, plain spoken English, burned into the film as a subtitle,
- contains no year, and no number unless it is spelled as it is spoken.

Return ONLY this JSON: { "narration": "<the new line>" }`

let r
for (let i = 0; i < 3; i++) {
  try { r = await j(p, { effort: 'low', maxTokens: 3000, temperature: 0.6 }); break } catch (e) { console.log('retry', e.message.slice(0, 60)); await new Promise((x) => setTimeout(x, 4000)) }
}
if (!r?.narration) { console.log('no revision'); process.exit(1) }
console.log('OLD:', story.outro, `(${story.outro.length})`)
console.log('NEW:', r.narration, `(${r.narration.length})`)
story.outro = r.narration.trim()
writeFileSync(new URL('./rome/story.json', import.meta.url), JSON.stringify(story, null, 1))
console.log('\nwrote rome/story.json')
