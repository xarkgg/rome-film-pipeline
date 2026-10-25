// Calls MiniMax M3.1 Flash through SandBase (OpenAI-compatible) with a browser UA,
// because SandBase's Cloudflare rejects the default node/curl UA with 403 / code 1010.
import { readFileSync } from 'node:fs'

const key = JSON.parse(readFileSync(`${process.env.HOME}/.local/share/opencode/auth.json`, 'utf8')).sandbase.key
const UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

export async function direct(prompt, { effort = 'low', maxTokens = 4000, temperature = 0.6, json = false } = {}) {
  const body = {
    model: 'minimax/minimax-m3.1-flash',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature,
    reasoning_effort: effort,
  }
  if (json) body.response_format = { type: 'json_object' }
  const res = await fetch('https://api.sandbase.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`SandBase ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const j = await res.json()
  return { content: j.choices?.[0]?.message?.content ?? '', reasoning: j.choices?.[0]?.message?.reasoning_content ?? '', usage: j.usage }
}

if (process.argv[2] === 'test') {
  const r = await direct(process.argv[3] ?? 'Say: ready', { effort: 'low', maxTokens: 200 })
  console.log('CONTENT:', r.content)
  console.log('USAGE:', JSON.stringify(r.usage))
}
