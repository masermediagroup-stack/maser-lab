# Engine AGENTS — Sacred Contracts

Path: `lab/src/components/projects/display/maser-dither-engine/engine/`

Read this **before** editing `pipeline/stages.ts`, `core/SurfaceRenderer.ts`, or any `*Glsl.ts` module.

## Single program

- **Entry:** `pipeline/stages.ts` exports `VERT_SRC` + `FRAG_SRC`.
- **Consumer:** `core/SurfaceRenderer.ts` compiles once via `createProgram(gl, VERT_SRC, FRAG_SRC)`.
- **Draw path:** Fullscreen triangle, **no mesh attributes** today.

## Sacred: vertex shader

```glsl
// CORRECT — uses gl_VertexID, no VBO required
vec2 p = POS[gl_VertexID];
```

**Forbidden without matching renderer work:**

```glsl
// BROKEN if SurfaceRenderer has no aPos buffer
in vec2 aPos;
```

Incident: Sprint 6 briefly switched VERT to `aPos` without binding a buffer → black canvas everywhere.

## Texture units

| Unit | Binding |
| --- | --- |
| 0–3 | Bayer 2 / 4 / 8 / 32 |
| 4 | Blue noise |
| 5 | Bayer 64 |
| **6** | **`uSource`** optional photo (cover-fit luminance) |

## Sacred: SAMPLE_GLSL

`SAMPLE_GLSL` in `stages.ts` **must** keep (at minimum):

- `hash21`
- `sampleBayer` (routes `uBayer2/4/8/32/64` via `uDitherSize`)
- `sampleBlue`
- `softClamp01` / `remapContrast` / posterize helper using **`uPosterization`**

`engine/dither/ditherGlsl.ts` (`DITHER_GLSL`) **calls** these. Stripping SAMPLE helpers while leaving DITHER intact → compile failure → engine dead.

When adding a sampler:

1. Add helper to `SAMPLE_GLSL` (or a new module concatenated **before** `DITHER_GLSL`).
2. Upload any new textures/uniforms in `SurfaceRenderer`.
3. Extend `FRAG_HEAD` with matching `uniform` declarations.

## Sacred: uniform name alignment

| Concept | GLSL + JS name | Do not rename to |
| --- | --- | --- |
| Posterize levels | `uPosterization` | `uPosterizeLevels` |
| Dither matrix size | `uDitherSize` | — |
| Material pack | `uMatId`, `uMatStructAmt`, `uMatIxResp`, `uMatLowQ`, `uMatP0–P3`, `uMatLayerBits` | ad-hoc per-material uniforms that require recompile |

`SurfaceRenderer` maintains a uniform location map from string names. Renaming in GLSL without updating the upload list silently zeros values or fails link.

## Module ownership

```text
animation/     → ANIM_GLSL + ProceduralAnimationController
interaction/   → INTERACTION_GLSL + InteractionController
lighting/      → LIGHT_GLSL (luminance field)
material/      → MATERIAL_GLSL + MaterialController (structure/UV/finish)
color/         → COLOR_GLSL + ColorMaterialController (chroma only)
dither/        → DITHER_GLSL + algorithm catalog
core/          → SurfaceRenderer, SurfaceCanvas, createProgram
pipeline/      → stages.ts (assemble only — do not fork programs)
fallback/      → Canvas2D path when WebGL unavailable
```

## Material extension checklist

1. `material/types.ts` — ID + index
2. `material/catalog.ts` — definition, `supportedControls`, family, tier
3. `material/pack.ts` — pack into `uMatP0–P3`
4. `material/materialGlsl.ts` — UV / field / finish branches
5. Wire through `SurfaceCanvas` → `uploadMaterial` (already present)
6. Optional: preset in `presets/catalog.ts`
7. **Do not** add Color-panel behavior chips for structure

## Performance / context

- Prefer **one** live WebGL surface per view.
- Materials gallery: CSS swatches in grids; live preview only in detail/compare panes.
- Mobile: `SurfaceCanvas` sets `uMatLowQ` / lowQuality when narrow viewport.
- Always dispose GL resources on unmount (`SurfaceRenderer` cleanup).

## Smoke test after shader edits

```bash
cd lab && npm run dev
# Open /demos/maser-dither-engine
# Confirm non-black surface + no "Shader compile error" in console
```

If the canvas is black: **stop**. Diff `VERT_SRC`, `SAMPLE_GLSL`, `FRAG_HEAD`, and `SurfaceRenderer` uniform list against the last known-good commit before adding features.
