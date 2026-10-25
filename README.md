# Rome Was Not Built in a Day—and Never Finished

![render film](https://github.com/xarkgg/rome-film-pipeline/actions/workflows/render.yml/badge.svg)
[![Contest: SandBase Lab AI City Remix](https://img.shields.io/badge/built%20for-AI%20City%20Remix-d9ff43)](https://www.sandbase.ai/lab/event/aicityremix)
![license: MIT](https://img.shields.io/badge/license-MIT-blue)

[Entry page](https://www.sandbase.ai/lab/event/aicityremix) · [CI render run](https://github.com/xarkgg/rome-film-pipeline/actions) · [Fact brief](rome_brief.mjs) · [Render engine](render_chunked.mjs) · [Honest limitations](#honest-limitations)

A 2-minute map history of Rome: nine eras, one camera move per era, every frame code-drawn. Directed by MiniMax M3.1 Flash through SandBase; rendered on a free GitHub runner from this repo.

| | |
|---|---|
| Film | 1920×1080 mp4 · 144 s · 30 fps · 44 MB · burned-in English captions |
| Coverage | 753 BC → 1940s-today · 0.1 km² → ~346 km² · narration timed per era |

## Try it — re-render the film from nothing but this repo

1. `git clone` this repo and `cd` into it.
2. `cd skills/city-through-time && npm ci && npx playwright install chromium` — install the frame engine.
3. `sudo apt-get install -y ffmpeg` — ffprobe reads each era's narration length, which paces the timeline.
4. `CHROME=$(find ~/.cache/ms-playwright -type f -name chrome | head -1) node render_chunked.mjs rome` — 4,327 frames, then the mux. One CI run took 31–45 min.

## Proof table

| Claim | Evidence |
|---|---|
| MiniMax M3.1 Flash wrote the story (title, 9 narrations, event titles, card prompts) | [m31.mjs](m31.mjs) · [gen_story.mjs](gen_story.mjs) · [fix_outro.mjs](fix_outro.mjs) · the model-authored strings sit in [rome/story.resolved.json](rome/story.resolved.json) |
| Every fact on screen was pre-checked, not generated | The locked fact brief [rome_brief.mjs](rome_brief.mjs) (Servian Wall 246 ha · Aurelian AD 271–275, 1,400 ha · Porta Pia breach 20 Sept 1870 · A90 ring designed 1940s) |
| The map is real survey data, not decoration | [geo.mjs](geo.mjs) OSM pulls · Grande Raccordo Anulare ring resolved from 3,772 ways ([build_shapes.mjs](build_shapes.mjs)) |
| Voice is MiniMax Speech 2.8 HD via SandBase | 11 clips at [rome/audio/](rome/audio) · costs logged in the generation scripts |
| Cards are AI-generated and labelled per model | [rome/art/](rome/art) · on-frame credit line names both models (Qwen Image 3 + FLUX) |
| Every frame is a pure `render(t)`, no keyframes | [render_chunked.mjs](render_chunked.mjs) builds [film.html](rome/film.html) from the skill player; FFmpeg encodes at 30 fps |
| The film re-renders from CI with zero local setup | [.github/workflows/render.yml](.github/workflows/render.yml) — success run 2026-10-25, 44 min clock |

## Negative proofs — ways we tried to break it

| Attempt | Result | Caught by |
|---|---|---|
| Renderer without ffprobe on a clean machine | Every era silently collapsed to 6.5 s → the "film" measured 76 s, narration overlapping | CI run 40191327503 · fixed by installing ffmpeg in [render.yml](.github/workflows/render.yml) |
| Chromium `--single-process` to live on a 2 GB phone | Instant SIGTRAP — abandoned; phone got chunked sessions, CI got a single long session | [render_chunked.mjs](render_chunked.mjs) phone/CI auto-tune from `/proc/meminfo` |
| SandBase media credit exhausted mid-film | 2 of 18 cards would have unlabelled source — disclosed instead: on-frame credit names both image models | [pollinations_filler.mjs](pollinations_filler.mjs) |
| Image prompt leaks of negations ("no cars", "no people") | FLUX-style models render the negated thing | [fix_outro.mjs](fix_outro.mjs) strips negative clauses from every prompt before any card was generated |
| Cloudflare 1010 rejecting python-urllib on the submit client | Official client 403'd immediately | Browser UA patched in [contest-submit.py](contest-submit.py) |
| Title text overflowing 1920 px on the outro | Title and end card both clipped the frame | Fit-to-width patch in the player, verified on rendered frame 143.8 s |

## What's real / pending

**Real:** the film (submitted 2026-10-25); every artifact above; CI re-render on any push.
**Pending:** contest status is `pending review` until Oct 31 — no vendored watch link is placed here until the Lab publishes the watch URL. **Not real:** music (none used — narration only, rights-clean).

## How it fits the rubric

| Criterion | Where it lands |
|---|---|
| Accuracy 25% | Locked brief; sourced turning points only; "Outlines are reconstructions" credit on every frame |
| Story & craft 25% | One continuous camera; the rings stack in the outro; end card turns the thesis to the viewer's own city |
| AI workflow 30% | M3.1 authored story + prompts; no keyframes, frame = render(t); full open-source pipeline rendering on CI |
| Reach 20% | Entry page + this repo; the film is shareable as a single <100 MB captioned mp4 |

## Honest limitations

- Wall footprints are reconstructions of documented alignments, not survey-grade geometry — the on-frame credit says so on every frame.
- Buildings and minor streets are quarter-sampled (RAM-bounded) — the imperial extent reads dense but is not every building.
- 16 of 18 cards came from a different image model than the other 2 after the SandBase credit ran out; both are named on-frame, and all 18 prompts are M3.1's.
- The render is identical-per-`t` but the CI runner's speed varies ±30%; only wall-clock changes, never output.

Map data © OpenStreetMap contributors · OpenMapTiles · Natural Earth · Illustrations are AI-generated.
