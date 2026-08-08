# 02 — Render Pipeline

**Stable:** authoritative stage order and extension rules.  
Must match `projects/display/maser-dither-engine/AGENTS.md` and `engine/pipeline/stages.ts`.  
Related: [01](./01-ENGINE-ARCHITECTURE.md) · [03](./03-MATERIAL-SYSTEM.md) · [09](./09-PERFORMANCE.md)

## Authoritative order

```text
Animation
    ↓
Interaction
    ↓
Material UV
    ↓
Light (luminance)
    ↓
Material field (structure)
    ↓
Contrast / Bloom / Posterize
    ↓
Dither
    ↓
Grain
    ↓
Color (chroma)
    ↓
Material finish
    ↓
Final output
```

Assembled in `engine/pipeline/stages.ts` as `FRAG_SRC` from module GLSL strings. Drawn by `engine/core/SurfaceRenderer.ts`.

> User prompt diagrams sometimes list Gradient as its own stage. **In code, gradient/chroma lives in Color** after dither/grain. Do not reorder stages to match informal diagrams.

## Vertex stage (sacred)

| Item | Contract |
| --- | --- |
| Source | `VERT_SRC` in `stages.ts` |
| Technique | Fullscreen triangle via `gl_VertexID` |
| Forbidden | `in vec2 aPos` without binding a VBO in `SurfaceRenderer` |
| Incident | Sprint 6 black screen — see `docs/engine-lessons.md` |

## Stage cards

### Animation

| | |
| --- | --- |
| **Responsibilities** | Mode-blended UV offset + luminance/light modulation from timeline |
| **Inputs** | Timeline state, mode A/B params, blend, reduced-motion flag |
| **Outputs** | UV/luma modulation uniforms consumed downstream |
| **Code** | `engine/animation/` → `ANIM_GLSL` + `ProceduralAnimationController` |
| **Performance** | CPU packs once per frame; keep mode math out of per-pixel where possible |
| **Extension** | Add mode to catalog + GLSL branch; do not fork program |

### Interaction

| | |
| --- | --- |
| **Responsibilities** | Multi-light field, pointer physics, trails, ripples, state modulation |
| **Inputs** | DOM→UV pointer, lights (1–8), physics/falloff/trail/ripple configs |
| **Outputs** | Interaction field modulating luminance / UV |
| **Code** | `engine/interaction/` |
| **Performance** | Cap lights; mobile touch path must remain accurate |
| **Extension** | New interaction mode in catalog + GLSL; no material structure knobs here |

### Material UV

| | |
| --- | --- |
| **Responsibilities** | Material-specific UV warp (glass refraction, CRT curve, smoke drift) |
| **Inputs** | `uMatId`, material params pack, low-quality flag |
| **Outputs** | Warped UV for sampling light/structure |
| **Code** | `engine/material/materialGlsl.ts` (UV section) |
| **Extension** | New material ID branch; pack params in `uMatP0–P3` |

### Light

| | |
| --- | --- |
| **Responsibilities** | Illumination **luminance** field (radial / ellipse / linear / cone / organic) |
| **Inputs** | Light shapes, interaction-modulated positions, exposure-related uniforms |
| **Outputs** | Scalar luminance field |
| **Code** | `engine/lighting/` |
| **Must not** | Own palette chroma |

### Material field (structure)

| | |
| --- | --- |
| **Responsibilities** | Procedural density/structure modulating luminance |
| **Inputs** | Material ID + structure params + layer bits |
| **Outputs** | Structured luminance before tone ops |
| **Code** | `MATERIAL_GLSL` field section |
| **Layer recipe** | Enable/bypass/solo via bits — **value changes never recompile** |

### Contrast / Bloom / Posterize

| | |
| --- | --- |
| **Responsibilities** | Tone shaping before dither |
| **Inputs** | Contrast, bloom, **`uPosterization`** (canonical name — not `uPosterizeLevels`) |
| **Outputs** | Posterized/toned luminance |
| **Sacred** | Keep `SAMPLE_GLSL` posterize helper aligned with uploads |

### Dither

| | |
| --- | --- |
| **Responsibilities** | Threshold / quantization via algorithm + matrix size |
| **Inputs** | Algorithm ID, `uDitherSize` (2/4/8/32/64), Bayer/blue textures |
| **Outputs** | Dithered luminance mask / values |
| **Code** | `engine/dither/` + `SAMPLE_GLSL` (`sampleBayer`, `sampleBlue`) |
| **Sacred** | Never strip `SAMPLE_GLSL` helpers while `DITHER_GLSL` calls them |

### Grain

| | |
| --- | --- |
| **Responsibilities** | Film/surface grain overlay |
| **Code** | `engine/noise/grain.ts` + GLSL grain section |

### Color

| | |
| --- | --- |
| **Responsibilities** | Palette / gradient **chroma** applied to dithered field |
| **Inputs** | Palette, gradient mode/behavior, blend mode |
| **Outputs** | RGB |
| **Must not** | Re-own material structure via behavior chips |

### Material finish

| | |
| --- | --- |
| **Responsibilities** | Edge, sheen, CRT phosphor, chrome accents after color |
| **Code** | `MATERIAL_GLSL` finish section |

### Final output

Framebuffer → canvas. Optional CSS base plate behind component (`engine/color/basePlate.ts`) is compositor chrome, not a GLSL stage.

## Texture units (stable)

| Unit | Binding |
| --- | --- |
| 0–3 | Bayer 2 / 4 / 8 / 32 |
| 4 | Blue noise |
| 5 | Bayer 64 |
| **6** | **`uSource`** optional photo (cover-fit luminance) |

## Extension recipe

1. Add GLSL module or branch.
2. Concatenate into `FRAG_SRC` at the correct pipeline position.
3. Declare uniforms in `FRAG_HEAD`.
4. Upload from `SurfaceRenderer` with **identical names**.
5. Update `PIPELINE_STAGES` metadata if user-facing.
6. Smoke test: non-black canvas, no compile errors, material + algorithm switches.

## Performance notes

- Prefer one live context per view ([09](./09-PERFORMANCE.md)).
- `uMatLowQ` on narrow viewports.
- Layer recipe bits/uniforms only — no program relink on slider drag.

## Horizon (not tickets)

- Additional post stages (DOF, chromatic aberration) only if appended carefully without breaking dither identity.
- WebGPU port must preserve stage semantics and uniform contracts.

## Why (human)

Black screens and silent uniform zeros come from stage/order/name drift. This doc is the map agents must follow when extending look without rewriting the renderer.
