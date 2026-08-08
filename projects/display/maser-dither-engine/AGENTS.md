# Maser Dither Engine — Agent Contract

**Slug:** `maser-dither-engine` · **Category:** `display` · **Demo:** `/demos/maser-dither-engine`  
**Code:** `lab/src/components/projects/display/maser-dither-engine/`  
**PR / branch:** surface-engine work on `cursor/webdesign-maser-surface-engine-*`

This project is a **shared procedural WebGL2 surface engine** (not Three.js). Load `maser-lab-web` + this file first. Use `maser-lab-threejs` only for general WebGL hygiene (dispose, reduced motion, context budget) — do **not** replace this engine with Three.js `ShaderMaterial` demos.

## Mandatory reads before editing

1. Repo [`docs/roadmap/README.md`](../../../docs/roadmap/README.md) — task read-order, stable vs horizon, stub promotion
2. This file
3. `lab/.../engine/AGENTS.md` — sacred shader + uniform contracts
4. `docs/engine-lessons.md` — Sprint 6 black-screen postmortem (do not repeat)
5. Roadmap docs for the change type (see table below) + `PROJECT.md` for ACs
6. Sprint notes under `docs/sprint*.md` are **historical archive** only — active planning is `docs/roadmap/`

### Roadmap reads by change type

| Change | Also read |
| --- | --- |
| Shader / pipeline | `docs/roadmap/02-RENDER-PIPELINE.md`, `01-ENGINE-ARCHITECTURE.md` |
| Materials | `docs/roadmap/03-MATERIAL-SYSTEM.md` |
| Adapters / components | `docs/roadmap/04-COMPONENT-SYSTEM.md`, `06-EXPORT-SYSTEM.md` |
| Lab mobile / studio shell | `docs/roadmap/05-MOBILE-WORKSPACE.md` (lab-only; not packaged) |
| Export / npm / TRANSFER | `docs/roadmap/06-EXPORT-SYSTEM.md` |
| Milestones / priority | `docs/roadmap/DEVELOPMENT-ROADMAP.md` |
| Assets / presets / future engines | Matching stub `07`–`08` / `11` — **promote stub in same PR when shipping code** |

**Stable contracts win.** Horizon ideas in `docs/roadmap/11-V2-FUTURE.md` never authorize rewriting `SurfaceRenderer`, leaving `gl_VertexID`, or stripping `SAMPLE_GLSL`.

## What this engine is

One shared GLSL program (`engine/pipeline/stages.ts`) drives **all** surface adapters (hero, card, button, badge, etc.). Controllers pack CPU state into uniforms; the fragment pipeline owns look.

| System | Owns | Must not own |
| --- | --- | --- |
| `engine/lighting` | Luminance geometry (light shape) | Palette chroma |
| `engine/color` | Palette / gradient chroma | Material structure / “behavior” chips |
| `engine/dither` | Algorithm threshold / quantization | Cursor×influence multiply hacks |
| `engine/material` | Procedural structure / UV / finish by material ID | Duplicate exposure/density from Color |
| `engine/interaction` | Pointer physics + multi-lights | Material fiber/scanline params |
| `engine/animation` | UV / ambient timeline modulation | Material ID selection |
| `engine/pipeline/stages.ts` | Single VERT + FRAG program | Per-adapter shader forks |

**Pipeline order (authoritative):**  
Animation → Interaction → **Material UV** → Light → **Material field** → Contrast / Bloom / Posterize → Dither → Grain → Color → **Material finish**

## Hard constraints (never violate)

1. **Do not rewrite the WebGL renderer** (`SurfaceRenderer`) unless fixing a proven compile/link bug with a minimal diff.
2. **Do not change the vertex path** away from `gl_VertexID` fullscreen triangle unless you also bind a VBO/`aPos` in `SurfaceRenderer`. Attribute-based VERT without buffer = black canvas.
3. **Do not strip `SAMPLE_GLSL`** helpers (`sampleBayer`, `sampleBlue`, posterize, remaps). `DITHER_GLSL` depends on them. Missing helpers = shader compile failure = engine dead.
4. **Keep `FRAG_HEAD` uniforms aligned** with `SurfaceRenderer` uploads. Canonical posterize uniform is `uPosterization` (not `uPosterizeLevels`).
5. **Do not reintroduce Sprint 5 duplicate controls** (cursor×influence multiply; Color “behavior” chips that own structure; Basic/Advanced ownership drift). See `docs/sprint5-control-audit.md`.
6. **Do not invent isolated shader demos** — extend the shared `stages.ts` program only.
7. **WebGL context budget:** Materials browser thumbs must stay **CSS swatches** (or one shared preview). Do not spawn a live canvas per material (~11 contexts kill browsers).
8. **Layer recipe value changes never recompile** the program — only bits/uniforms.

## How to add work safely

| Change | Touch | Verify |
| --- | --- | --- |
| New dither algorithm | `engine/dither/*` + `SAMPLE_GLSL` if new samplers | Compile + Playground algorithm switch |
| New material | `engine/material/` (types → catalog → pack → GLSL) + optional preset | Materials detail live preview + Playground |
| Source image dither | `uSource` unit 6; `SurfaceRenderer.setSourceImage`; `SurfaceCanvas` `sourceUrl` | Upload in Content panel → non-black dithered photo |
| New control | One owning panel only; wire through controller → uniform | No duplicate slider elsewhere |
| New adapter | Reuse `SurfaceCanvas` / existing adapters; pass `material` + `sourceUrl` | Demo Components page |
| Pipeline stage | Append GLSL modules into `FRAG_SRC` order; update `PIPELINE_STAGES` | Black-screen check after HMR |

## Verification gate (required for any engine/shader edit)

Before claiming success:

1. Open `/demos/maser-dither-engine` — Overview and Playground must show a lit dithered surface (not black / blank).
2. Switch material IDs and dither algorithms — no console `Shader compile error`.
3. Toggle reduced motion — CRT flicker muted; surfaces still render.
4. Materials page — thumbs are CSS; detail pane may have **one** live canvas.
5. `npm run lint` + `npm run build` in `lab/`.

Source-only review is **not** enough for this project.

## Built so far (memory for agents)

| Sprint | Shipped |
| --- | --- |
| 1 | Procedural animation controller + GLSL |
| 2 | Interaction / multi-light pointer physics |
| 3 | Color material / palettes (chroma) |
| 4 | Lighting hierarchy fix (luminance vs chroma) |
| 5 | Control consolidation; dither algorithm module; matrix sizes 2/4/8/32/64 |
| 6 | `engine/material/` (10 core + mono); layer recipe; Materials UI; material presets |

**Core materials:** Monochrome, Paper, Ink, Velvet, Metal, Smoke, Fog, Cloud, Glass, Chrome, CRT.

## Skills report template

When working this slug, report loaded:

- `maser-lab-web` (mode: …)
- `docs/roadmap/README.md` (+ numbered docs for the change)
- `projects/display/maser-dither-engine/AGENTS.md`
- `lab/.../engine/AGENTS.md`
- optional: `docs/engine-lessons.md`; sprint docs as historical archive only
