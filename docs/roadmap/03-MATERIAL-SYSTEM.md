# 03 — Material System

**Stable:** procedural materials driven by `engine/material/`.  
Related: [02](./02-RENDER-PIPELINE.md) · [08](./08-PRESET-STUDIO.md) · `engine/material/`

## Spec overview

Materials are **IDs + packed params + GLSL branches**, not separate shader programs. Layer recipe enable/bypass/solo uses bits; **value changes never recompile**.

### Families

| Family | Materials |
| --- | --- |
| Print | Monochrome, Paper, Ink |
| Soft Surface | Velvet |
| Hard Surface | Metal, Glass, Chrome |
| Atmospheric | Smoke, Fog, Cloud |
| Digital | CRT |

### Core catalog (shipped — all `ready`)

| ID | Role | Distinct structure cues |
| --- | --- | --- |
| `monochrome` | Neutral baseline | Minimal structure; chroma from palette |
| `paper` | Fiber stock | Fiber density/direction, absorption, edge bleed, warmth |
| `ink` | Wet print | Spread, wetness, bleed, pooling, smear, density |
| `velvet` | Plush | Nap direction, sheen width/intensity |
| `metal` | Hard brushed | Anisotropy, micro-scratch, specular response |
| `smoke` | Volumetric plume | Soft density fields, drift |
| `fog` | Soft atmosphere | Low-frequency haze |
| `cloud` | Soft volumes | Billow / soft occlusion |
| `glass` | Refractive abstraction | UV warp, frost, edge light (not physically accurate IOR) |
| `chrome` | Mirror metal | High specular finish; optional future env-band LUT |
| `crt` | Signal display | Scanlines, phosphor, curve UV; flicker respects reduced motion |

Source of truth: `engine/material/catalog.ts` + `types.ts` + `pack.ts` + `materialGlsl.ts`.

## Controls

| Layer | Examples |
| --- | --- |
| Shared | `structureAmount`, `interactionResponse`, low-quality |
| Per-material | Keys listed in each definition’s `supportedControls` / `hidden` |
| UI ownership | Procedural material panel / Materials page — **not** Color behavior chips |

### Extension checklist (stable)

1. `material/types.ts` — ID + index  
2. `catalog.ts` — definition, family, tier, controls  
3. `pack.ts` — pack into `uMatP0–P3`  
4. `materialGlsl.ts` — UV / field / finish branches  
5. Wire via existing `SurfaceCanvas` → `uploadMaterial`  
6. Optional preset in `presets/catalog.ts`  
7. Verify Materials detail + Playground; thumbs stay CSS

## Lighting interaction

Materials modulate **luminance structure** and finish. Light shapes remain in `engine/lighting/`. Do not move palette ownership into material, or structure ownership into color.

## Animation & interaction response

- Animation warps UV/luma before/around material UV.
- `interactionResponse` scales how strongly pointer/lights affect the material field.
- CRT flicker and similar must mute under `prefers-reduced-motion`.

## Layer recipe

Conceptual stack (enable/bypass/solo):

```text
Base → Gradient → Structure → Light → Dither → Grain → Interaction → Edge → Bloom → Finish
```

Implementation: `uMatLayerBits` (+ related uniforms). Changing slider values updates uniforms only.

## Recipes vs materials vs presets

| Concept | Meaning |
| --- | --- |
| Material ID | Structural look family (this doc) |
| Layer recipe | Which stages participate |
| Preset | Snapshot of material + dither + color + anim/interaction knobs (`presets/catalog.ts`) |

Preset redesign is stubbed in [08](./08-PRESET-STUDIO.md).

## Performance

- One live preview in Materials detail; grid = CSS swatches / `ThumbBlitEngine`.
- `uMatLowQ` on narrow viewports.
- Avoid per-material texture uploads unless necessary; prefer procedural fields.

## Planned material IDs (backlog — not shipped)

Promote only when implemented (post-v1.0 unless product requires earlier):

| ID | Intent | Today |
| --- | --- | --- |
| Ceramic | Soft hard-surface glaze | Preset territory |
| Newsprint | Halftone print stock | Preset / paper variants |
| Brushed aluminum | Anisotropic metal variant | Preset `brushed-aluminum` |
| Deeper glass | Frosted / clear with background sampling when available | Glass extensions |

Do not document these as shipped in ACs until code + catalog exist.

## Horizon

- Multi-material blending, node graphs — [11](./11-V2-FUTURE.md).
- AI material generation — horizon only.

## Why (human)

Materials are the creative heart of the engine. Keeping them ID-packed and ownership-clean is what lets adapters stay thin and exports stay portable.
