# 01 — Engine Architecture

**Stable contracts** for how the Dither Engine is structured.  
Related: [02-RENDER-PIPELINE](./02-RENDER-PIPELINE.md) · [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md) · `engine/AGENTS.md`

Code root: `lab/src/components/projects/display/maser-dither-engine/`

## Mental model

```text
DemoHost
  └── DitherEngineApp          ← LAB SHELL (not packaged)
        ├── Pages / Studio
        └── Adapters
              └── SurfaceCanvas          ← PRODUCT
                    └── SurfaceRenderer  ← PRODUCT (WebGL2)
                          └── stages.ts VERT+FRAG (single program)
                                Controllers pack uniforms each frame
```

**Rule:** one shared GLSL program drives all surface adapters. Controllers pack CPU state into uniforms; the fragment pipeline owns look.

## Layer map

| Layer | Path | Packaged? | Owns |
| --- | --- | --- | --- |
| Core renderer | `engine/core/` | Yes | `SurfaceRenderer`, `createProgram`, `UniformStore`, `AnimationLoop` |
| Pipeline assembly | `engine/pipeline/stages.ts` | Yes | `VERT_SRC`, `FRAG_SRC`, `SAMPLE_GLSL`, `PIPELINE_STAGES` |
| Animation | `engine/animation/` | Yes | Timeline, modes, `ANIM_GLSL` |
| Interaction | `engine/interaction/` | Yes | Pointer physics, multi-lights, `INTERACTION_GLSL` |
| Lighting | `engine/lighting/` | Yes | Luminance geometry only |
| Color | `engine/color/` | Yes | Palette / gradient chroma only |
| Material | `engine/material/` | Yes | Structure / UV / finish by material ID |
| Dither | `engine/dither/` | Yes | Algorithms + matrix size |
| Noise | `engine/noise/` | Yes | Grain helpers |
| Fallback | `engine/fallback/` | Yes | Canvas2D when WebGL unavailable |
| Preview | `engine/preview/ThumbBlitEngine.ts` | Lab utility | One shared context → JPEG thumbs |
| React bridge | `react/SurfaceCanvas.tsx` | Yes | Mount renderer; `sourceUrl` → tex unit 6 |
| Adapters | `components/adapters/` | Yes | UI shapes over shared engine |
| Catalogs | `components/registry.ts`, `materials/`, `presets/` | Yes (data) | Metadata + defaults |
| Projects store | `projects/` | Lab | Snapshots, history, `.mde.json` |
| Shell | `shell/`, `shell/studio/` | **No** | Creative-software UI |
| Tokens | `tokens.css` | Product tokens only | No `--lab-*` in package |
| Barrel | `index.ts` | Trim for package | Today still re-exports `DitherEngineApp` — freeze must separate |

## Ownership matrix (stable)

| System | Owns | Must not own |
| --- | --- | --- |
| `engine/lighting` | Luminance geometry | Palette chroma |
| `engine/color` | Palette / gradient chroma | Material structure / behavior chips as structure |
| `engine/dither` | Algorithm threshold / quantization | Cursor×influence multiply hacks |
| `engine/material` | Procedural structure / UV / finish | Duplicate exposure/density from Color |
| `engine/interaction` | Pointer physics + multi-lights | Material fiber/scanline params |
| `engine/animation` | UV / ambient timeline modulation | Material ID selection |
| `engine/pipeline/stages.ts` | Single VERT + FRAG program | Per-adapter shader forks |

## Runtime architecture

1. Adapter mounts `SurfaceCanvas` with material / dither / content props.
2. Controllers (`ProceduralAnimationController`, `InteractionController`, `MaterialController`, `ColorMaterialController`, …) produce uniform payloads.
3. `SurfaceRenderer` uploads uniforms + textures, draws fullscreen triangle.
4. Optional `uSource` (unit 6) for photo dither.
5. On unmount: dispose GL resources.

## Configuration & persistence (lab)

| Key | Role |
| --- | --- |
| `mde:projects:v1` | User projects + dock + workspace prefs |
| `mde:panels:v2` | Collapsed control groups |
| `mde:favorites:v1` / `mde:recent:v1` | Component favorites/recent |
| `mde:material-favorites:v1` | Material favorites |
| Hash routes | overview, components, materials, presets, studio, playground, docs |

Upload blob `sourceUrl` persistence across project save is **open** (v0.8). See [DEVELOPMENT-ROADMAP](./DEVELOPMENT-ROADMAP.md).

## Export boundary (stable product intent)

```text
PACKAGE (future PACKAGE_NAME)
  engine/ + react/ + adapters + product tokens + module CSS

LAB ONLY
  shell/ + DemoHost chrome + --lab-* tokens + project library UI
```

Details: [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md).

## Recommended boundaries

- **Do** extend `stages.ts` by concatenating GLSL modules in pipeline order.
- **Do** add materials via types → catalog → pack → GLSL (see `engine/AGENTS.md` checklist).
- **Do not** spawn N live WebGL contexts for gallery thumbs.
- **Do not** put structure controls back on Color “behavior” chips (`docs/sprint5-control-audit.md`).
- **Do not** treat horizon ideas ([11](./11-V2-FUTURE.md)) as permission to rewrite `SurfaceRenderer`.

## Technical debt (current)

| Debt | Severity | Notes |
| --- | --- | --- |
| Public barrel still exports `DitherEngineApp` | High for npm | Split product vs lab entry before freeze |
| Canvas2D parity for non-Bayer | Medium | Not v1.0 required |
| Upload persistence | Medium | v0.8 |
| Legacy `MATERIAL_BEHAVIORS` in color API | Medium | Keep out of structure UI |
| Legacy `engine/materials/MonochromeMaterial.ts` | Low | Prefer `engine/material/` |
| Visual regression suite | Medium | v0.9 foundation |
| AC text “12 playgrounds” vs 11 adapters | Low | Docs drift after hero→section-background merge |

## Refactoring opportunities (incremental only)

1. Product/lab barrel split (`index.ts` vs `lab-entry.ts`).
2. Promote ceramic / newsprint / brushed aluminum from presets → first-class material IDs (post-v1.0 unless needed).
3. Log-mapped sliders for radius / exposure / pattern scale.
4. Optional chrome env-band LUT (no full cubemaps).

## Horizon (not tickets)

- WebGPU path keeping uniform contracts stable.
- Node material editor / shader graph ([11](./11-V2-FUTURE.md)).
- Multi-engine shared host contracts (v1.5+).

Any horizon work needs an explicit migration section in [DEVELOPMENT-ROADMAP](./DEVELOPMENT-ROADMAP.md) before touching sacred paths.

## Why (human)

Architecture docs exist so agents stop reconstructing “one program / many controllers” from sprint archaeology — and so export stays clean while the lab shell keeps evolving.
