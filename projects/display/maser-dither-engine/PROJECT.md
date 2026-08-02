# Project: Maser Dither Engine

**Slug:** `maser-dither-engine`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-28  
**Product kind:** lab

## Design reference

- Figma: none
- Other: Creative-software shell (Figma / Rive / Spline / Linear inspired)
- Design spec: `FIGMA.md`

## Brief

### User / trigger
Lab designers exploring procedural dither materials across many UI adapters.

### Job
Provide a scalable **Maser Lab material-engine module** — shared renderer, component playgrounds, materials, presets, and docs — as the reference architecture for future engines (Glass, Grain, Liquid, CRT, …).

### Brand signal
**Maser Dither Engine** title + live dither material in playgrounds.

### Desired outcome
Feels like a professional design tool: overview first, left sidebar navigation, dedicated component pages — not a single card with an endless slider list.

### Non-goals
- Not rewriting the WebGL pipeline (extracted, not replaced)
- Not a general UI kit outside dither materials
- Not physically accurate refraction / environment maps (abstractions only)

## Architecture

```text
Overview · Components · Materials · Presets · Playground · Documentation
Shared engine/ (WebGL2 + Canvas2D) ← all adapters
```

## States

- [x] default (overview)
- [x] component playground
- [x] materials / presets / docs views
- [x] reduced motion
- [x] favorites / recent (persisted)

## Acceptance criteria

- [x] Demo route `/demos/maser-dither-engine` opens overview (not raw controls)
- [x] Left sidebar with search, favorites, recent, keyboard shortcuts 1–6
- [x] 12 component playgrounds share one renderer API
- [x] Grouped collapsible controls with persisted open state
- [x] Materials + presets catalogs
- [x] Product-only barrel; engine not rewritten
- [x] Modular procedural animation system (16 modes, blend, timeline)
- [x] Mode-specific controls adapt in Animation panel
- [x] Procedural interaction & multi-light engine (modes, physics, trails, ripples)
- [x] Accurate DOM→UV pointer tracking + mobile touch path
- [x] Interaction panel in playground
- [x] Procedural color / gradient / palette / blend system
- [x] Live editable component content
- [x] Dither sizes 2 / 4 / 8 / 32 / 64 visually distinct
- [x] Sprint 6 procedural materials (10 core + monochrome) with distinct structure
- [x] Material browser + comparison + contextual controls + layer recipe
- [x] `npm run lint` / `npm run build` pass

## Sprint 1 — Procedural Animation Engine

**Architecture**

- `engine/animation/` — types, mode catalog, Timeline, ModeBlender, ProceduralAnimationController, GLSL helpers
- Shared FRAG samples mode A/B with smoothstep blend; aspect-corrected UV
- Layers: ambient + distortion (shader) · interaction tug · lighting modulation · CPU damp unchanged
- UI: `shell/AnimationPanel.tsx` inside playground Animation group

**Modes** — Linear H/V, Diagonal, Radial Pulse, Ripple, Wave, Spiral, Orbit, Breathing, Bloom, Noise Drift, Flow Field, Magnetic, Aurora, Turbulence, Lava Lamp

**Timeline** — Play / Pause / Restart / Reverse / Loop / Ping Pong / Playback Speed / Time Scale + blend duration

## Sprint 2 — Procedural Interaction & Lighting Engine

**Architecture**

- `engine/interaction/` — types, mode catalog, PointerPhysics, InteractionController, GLSL helpers
- DOM→UV conversion fixes prior cursor drift (y flipped for WebGL)
- Multi-light pack (1–8) + falloff / trails / ripples / hold / release
- Pointer states: idle, hover, down, hold, release, exit
- UI: `shell/InteractionPanel.tsx` inside playground Interaction group
- Animation system from Sprint 1 unchanged (parallel uniforms)

**Modes** — Follow, Spring, Magnetic, Sticky, Gravity, Repel, Orbit Pointer, Elastic, Pressure, Ripple, None

### Notes for Sprint 3

- Particle burst release (future-ready hook already in release behaviors)
- Scrollbar / nav light presets as first-class light templates
- Gesture recognition (swipe velocity → material shear)
- Per-component interaction presets
- Visual regression for pointer accuracy
- Optional WebGPU path later — keep WebGL2 contracts stable

## Sprint 3 — Procedural Material System (Lighting, Color & Materials)

**Architecture**

- `engine/color/` — types, palettes, behaviors, ColorMaterialController, COLOR_GLSL
- Shared FRAG composes RGB via `matComposeColor` after dither/grain (renderer unchanged)
- Soft-bound UV + larger light travel so procedural lights cross the full material
- Animation mode strengths increased for clearer personality separation
- Dither progression: 2×2 · 4×4 · 8×8 · 32×32 · 64×64 (16×16 removed)
- Live content editing via `content?: Partial<ComponentContent>` on every adapter
- UI: `MaterialPanel` (Palette Studio) + `ContentEditor` in playground

**Palettes** — Monochrome, Blueprint, Aurora, Ocean, Paper, Chrome, Sunset, Heat Map, Terminal, Matrix, Pearl, Acid, Infrared, Smoke, Forest, Cyberpunk, Electric Blue, Graphite, Velvet

**Behaviors** — Paper, Ink, Plastic, Velvet, Metal, Smoke, Fog, Cloud, Glass (foundation)

**Blend modes** — Normal, Multiply, Screen, Overlay, Soft/Hard Light, Difference, Exclusion, Color Dodge, Luminosity

### Notes for Sprint 4

- Layered materials / multi-pass compositing
- Outline + edge-tint as first-class outline stage
- Per-light color pickers in InteractionPanel
- Gesture shear + particle burst polish
- Visual regression suite for palettes + dither sizes
- Optional WebGPU path with stable uniform contracts

## Lighting hierarchy fix (pre–Sprint 4)

**Problem** — Color gradient and interaction ambient were acting as the luminance field, reading as a flat wash with dither piled on one edge.

**Separation**

| System | Owner | Role |
| --- | --- | --- |
| Color gradient | `engine/color` | Chroma / palette only |
| Procedural illumination | `engine/lighting` | Light-shape luminance field |
| Dither density | FRAG + `uLsDitherResponse` | Denser in dark outer ring |
| Bloom | `lightBloomMask` + `uBloom` | Concentrated on bright core |

**Light shapes** — Radial · Ellipse · Linear · Cone · Organic  
**Lighting presets** — Center Bloom · Offset Spotlight · Wide Ambient  
**Print Density** — defaults to centered radial bloom (`light` on preset + `DEFAULT_LIGHT_SHAPE`)

## Sprint 5 — Control Architecture Audit & Dither Algorithm System

**Mode:** Implement  
**Skills loaded:** `maser-lab-web` (Implement)

### Pipeline order (authoritative)

Procedural animation → Interaction modulation → **Material UV** → Light shape luminance → **Material structure** → Contrast/bloom/posterize → **Dither algorithm** → Grain → Color compose → **Material finish**

### Control consolidation (summary)

| Action | Controls |
| --- | --- |
| **Removed from UI** | `depth` (never sampled), duplicate Material Soft Edge as distinct from UV Soft Clamp placement |
| **Merged** | `cursorInfluence` × Interaction `influence` → single **Pointer Influence** (Interaction owns; no multiply) |
| **Renamed** | Animation Speed → Master Time Scale; Dither Size → Matrix Size; Pixel Density → Render Density; Bloom Radius → Bloom Spread; Blue Noise → Bayer Blue-Noise Mix; Soft Edge → UV Soft Clamp |
| **Moved to Advanced** | Timeline Playback/Time Scale, scroll influence, bloom spread, shadow/highlight, grain noise scale/speed, UV soft clamp, opacity, seed, posterization, render density, most material tone props |
| **Contextual** | Dither algo-specific sliders; Animation mode params; Interaction physics when mode ≠ None |
| **Wired (were placebo)** | Material Tone Gate / Softness / Noise Scatter; Accent / Edge / Noise tints; UV Soft Clamp → `softClamp01` |

### Dither algorithms

Ordered Bayer · Blue Noise · Random Threshold · Clustered Dot · Halftone · Posterized · Hybrid · Animated Threshold · Line Screen · Crosshatch

**Matrix sizes:** 2 / 4 / 8 / 32 / 64 — 16×16 not restored (no dedicated LUT; prior `size < 40` mapped to 32, so 16 was never distinct). Preset `poster-16` → **`poster-32`**.

**Spatial semantics**

| Control | Meaning |
| --- | --- |
| Matrix Size | Bayer LUT complexity |
| Pattern Scale | On-screen pattern period |
| Render Density | Internal sampling resolution |

### UI

- Basic / Advanced density modes (visibility only — same values)
- `DitherPanel` + algorithm comparison workspace
- Per-control reset · panel Live/Bypass · tooltips (`PARAM_TOOLTIPS`)
- Panels: Preset · Content · **Material** · Animation · Interaction · Lighting · Color · Dither · Finish · Export

### Migration

See `engine/dither/migrate.ts` (`DEPRECATED_KEYS`, `migrateParamsBlob`, `migratePreset`).

## Sprint 6 — Material System Expansion & Layered Composition

**Goal:** Transform material presets into a procedural material platform with distinct structure, lighting response, and interaction — not palette swaps.

### Architecture

- `engine/material/` — types, catalog (families), pack, MaterialController, MATERIAL_GLSL
- Uniforms: `uMatId`, `uMatStructAmt`, `uMatIxResp`, `uMatLowQ`, `uMatP0–P3`, `uMatLayerBits`
- Pipeline: Animation → Interaction → **Material UV** → Light → **Material field** → Contrast/Bloom/Posterize → Dither → Grain → Color → **Material finish**
- Color panel no longer selects “material behaviors” — structure is owned by the Material panel (Sprint 5 consolidation preserved)

### Core materials (ready)

Monochrome · Paper · Ink · Velvet · Metal · Smoke · Fog · Cloud · Glass · Chrome · CRT

Families: Print · Soft Surface · Hard Surface · Atmospheric · Digital

### Layer recipe

Base → Gradient → Structure → Light → Dither → Grain → Interaction → Edge → Bloom → Finish (max 10). Advanced: enable / bypass / solo. No shader recompile on value changes.

### UI

- Materials browser: live thumbs, family filters, search, favorites, detail, side/swipe/A-B compare
- Playground Material panel: contextual controls + Advanced layers
- 10 material-focused presets (Warm Newsprint → Green Phosphor CRT)

### Performance & a11y

Tiers: lightweight / standard / advanced. Mobile `lowQuality` reduces FBM octaves. CRT flicker muted under reduced motion.

### Docs

`docs/sprint6-materials.md` · `docs/engine-lessons.md` (postmortem) · project `AGENTS.md` + `engine/AGENTS.md`

### Incident note (engine load)

Sprint 6 briefly broke all surfaces by (1) switching VERT to `aPos` without a VBO and (2) stripping `SAMPLE_GLSL` helpers still required by dither. Fixed by restoring the Sprint 5 vertex path + full SAMPLE block and using CSS Materials thumbs. **Do not regress** — see `docs/engine-lessons.md`.

### Sprint 7 recommendations

- Deeper frosted/clear glass variants with background sampling when available
- Ceramic / newsprint / brushed aluminum as first-class IDs beyond presets
- Canvas2D approximate material fields
- Persist material + layer recipe in localStorage with presets
- Visual regression: materials × components × dither algorithms
- Optional environment-band LUT for chrome without full cubemaps

### Sprint 5 leftover recommendations (still open)

- Canvas2D parity for non-Bayer algorithms
- Log-mapped sliders for radius / exposure / pattern scale
- Persist full `DitherEngineConfig` blobs (not only panel open state)
- Visual regression suite for algorithms × matrix sizes
