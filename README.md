# Rome Was Not Built in a Day—and Never Finished

Entry for **SandBase Lab "AI City Remix"** (Open·Contest `city-life`), a film about Rome directed by **MiniMax M3.1 Flash through SandBase**.

| | |
|---|---|
| Film | 1920×1080 mp4 · 144 s · 30 fps · ~44 MB · burned-in English captions |
| Direction | MiniMax M3.1 Flash (story, narrations, event titles, all image prompts) |
| Voice | MiniMax Speech 2.8 HD — 11 narration clips |
| Cards | Qwen Image 3 (2) + FLUX via Pollinations free tier (16) — every prompt written by M3.1 |
| Map | Real OpenStreetMap geometry (walls, ~21k streets incl. the Grande Raccordo Anulare) |
| Render | Headless Chrome canvas, one frame per t, FFmpeg, on GitHub Actions |

## What this repo is

The production pipeline of the film, open sourced for verification:

- `rome_brief.mjs` — the hand-written fact brief (the only facts the model may use; the film asserts nothing we did not check)
- `m31.mjs` → `gen_story.mjs`, `polish_story.mjs`, `fix_outro.mjs` — M3.1 writes and revises the story JSON (`rome/story.resolved.json`)
- `geo.mjs` / `build_shapes.mjs` — real OSM extents pulled by code; hand-traced fallbacks only where OSM has none
- `pollinations_filler.mjs` — free-tier fills after the SandBase media credit ran out (disclosed per-card)
- `render_chunked.mjs` — the frame loop: `window.render(t)` is a pure function of time; no keyframes, no hand animation
- `.github/workflows/render.yml` — the whole film re-renders from these files on a free CI runner in ~31 min

## Separation of duties

| Model wrote | Human wrote |
|---|---|
| Title, 9 narrations, event titles, card prompts, workflow lines | The fact brief (Wikipedia/Pleiades-checked), date/area corrections, the repo, the render engine adaptations |

## Honest limitations

- Buildings and minor streets are quarter-sampled and OSM-missing; the on-frame credit says "Outlines are reconstructions".
- 2 of 18 cards came from a different image model than the rest (SandBase credit exhausted at 4 pulls; the credit line discloses both models).
- Wall footprints are reconstructions of documented alignments, not survey-grade geometry.

## To re-render

```bash
git clone this repo && cd rome-film-pipeline
cd skills/city-through-time && npm ci && npx playwright install chromium
CHROME=$(find ~/.cache/ms-playwright -type f -name chrome | head -1)
sudo apt-get install -y ffmpeg   # ffprobe reads the narration lengths that pace the eras
CHROME=$CHROME node render_chunked.mjs rome   # → rome/film.mp4
```

Map data © OpenStreetMap contributors · OpenMapTiles · Natural Earth. Illustrations are AI-generated, labelled on-frame.
