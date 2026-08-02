# Engine lessons — do not regress

Postmortem notes for agents working on `maser-dither-engine`. Full contract: `projects/display/maser-dither-engine/AGENTS.md` + `engine/AGENTS.md`.

## Incident: Sprint 6 engine black screen (fixed)

**Symptom:** Demo routes rendered blank/black; console showed shader compile errors (or silent no-draw).

**Root causes (combined):**

1. **Vertex rewrite without VBO** — `VERT_SRC` switched to `in vec2 aPos` while `SurfaceRenderer` still drew a `gl_VertexID` triangle with no attribute buffer. Nothing rasterized.
2. **Gutted `SAMPLE_GLSL`** — helpers `sampleBayer` / `sampleBlue` / posterize remaps removed from `stages.ts` while `DITHER_GLSL` still called them → WebGL compile failure → `createProgram` throws → no program.
3. **Secondary: context exhaustion** — Materials page mounted ~11 live WebGL canvases as thumbnails; browsers hit context limits and starve the main demo.

**Fix pattern (commit era `d4d4d6f`):**

- Restore Sprint 5 `VERT_SRC` (`gl_VertexID` + `POS[]` triangle).
- Restore full `FRAG_HEAD` + `SAMPLE_GLSL`; re-integrate `MATERIAL_GLSL` stages without deleting dither helpers.
- Materials thumbs → CSS swatches; keep a single live preview in the detail pane.

## Rules derived (encode in AGENTS)

| # | Rule |
| --- | --- |
| R1 | Never change vertex attribute layout without updating `SurfaceRenderer` bind/draw in the same commit. |
| R2 | Never remove or rename `SAMPLE_GLSL` symbols consumed by dither/color modules. |
| R3 | Keep uniform names byte-identical between `FRAG_HEAD` and `SurfaceRenderer` uploads (`uPosterization`). |
| R4 | Cap live WebGL contexts in UI chrome; grids use static/CSS previews. |
| R5 | Extend shared pipeline; do not fork per-adapter shader strings. |
| R6 | Material owns structure; Color owns chroma; do not re-add Color behavior chips (Sprint 5). |
| R7 | After any `stages.ts` edit, verify rendered non-black canvas before claiming done. |

## What we have been building

Shared **procedural surface engine** for Maser brand UI:

- **Lighting** = luminance geometry
- **Color** = palette / gradient
- **Dither** = algorithmic quantization (Bayer, blue-noise, halftone families, matrix sizes through 64)
- **Material (Sprint 6)** = Paper / Ink / Velvet / Metal / Smoke / Fog / Cloud / Glass / Chrome / CRT (+ monochrome) with UV warp, structure field, finish pass, layer recipe (enable/bypass/solo)
- **Interaction + animation** = parallel uniform streams into the same fragment program
- **Adapters** = hero / card / button / etc. all share `SurfaceCanvas` + controllers

Mental model: **one program, many controllers, clear ownership** — not a pile of one-off shaders.

## Safe change recipes

**Add material:** types → catalog → pack → GLSL branches → optional preset. Do not touch VERT or SAMPLE.

**Add dither algorithm:** dither module + catalog; only extend SAMPLE if new textures; upload in renderer.

**Add control:** one panel owner; controller tick → uniform; no duplicate in another panel.

**UI-only work:** Prefer not opening `stages.ts` at all.

## Related docs

- `docs/sprint5-control-audit.md` — control ownership
- `docs/sprint6-materials.md` — material platform
- `PROJECT.md` — sprint history + ACs
