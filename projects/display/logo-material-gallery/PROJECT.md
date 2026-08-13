# Project: Logo Material Gallery

**Slug:** `logo-material-gallery`  
**Category:** display  
**Status:** building  
**Created:** 2026-08-13

## Design reference

- Figma: none
- Other: Uploaded Maser stacked-MM logomark (two rounded M characters, sky `#0096FF` over navy `#004B70`)
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
A designer or director opening the lab demo to judge how the Maser mark reads in physical materials, then exporting a still for a deck or site.

### Job
Present the logomark as a gallery of six sculptures. Clicking a work opens a quiet studio to inspect, tune lighting, and export a transparent PNG.

### Current behavior
Greenfield.

### Desired outcome
The first viewport feels like a gallery wall, not a parameter tool. The logo is the only color. Chrome is small, uppercase, and monochrome. Export drops a high-res PNG with no background.

### Success signal
Six distinct materials are readable at a glance while slowly turning. Studio controls stay secondary. PNG export composites cleanly on light and dark slides.

### Non-goals
- GLTF/HDR authoring pipeline
- Color picker / custom shader graph
- Orbit gizmo, grid, or HDRI preview ball
- Replacing the lab home or other project slugs

## Brand signal

If the lab back link is removed, the stacked MM sculptures and the catalog captions (WOOD / GLASS / …) still identify this as a Maser mark gallery.

## First viewport contents (max)

- Brand: stacked MM logomark in six materials
- Headline: `MATERIAL GALLERY` (small, uppercase)
- Support: none on the wall (purpose lives in the demo control line)
- CTA: click a card
- Visual: 2×3 (or 2×3 wrapping) black-field cards

## Section map (one job each)

1. Gallery wall — compare six materials
2. Studio — inspect one material and export

## States

- [ ] default (gallery, six rotating marks)
- [ ] hover (pointer fine only — card lift)
- [ ] focus (keyboard focus ring on cards and studio controls)
- [ ] active / pressed (card enter studio)
- [ ] studio (full-stage + side placard)
- [ ] paused spin
- [ ] exporting
- [ ] export success (live region)
- [ ] WebGL unavailable (static SVG cards)
- [ ] prefers-reduced-motion (no spin, no hover lift; studio still usable)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Three.js `WebGLRenderer` + CSS transform/opacity | Turntable is the exhibit; UI chrome stays ≤200ms |
| Duration | Turntable continuous ~0.18 rad/s; UI 160–200ms | Museum pace, not a loader |
| Easing | UI: `cubic-bezier(0.23, 1, 0.32, 1)` | `rule/ui-duration-cap` |

## Three.js / 3D

| Field | Value |
| --- | --- |
| Target type | Interactive object (extruded logomark) + multi-view gallery |
| Renderer | WebGL (`WebGLRenderer`, alpha, ACES Filmic) |
| Decorative? | no — 3D is the product; SVG fallback when WebGL is missing |
| Fallback | Static stacked-MM SVG in each card |
| Mobile strategy | 2-column grid; DPR clamp 1.5; studio panel stacks below |
| Reduced motion | Pause turntable; keep ¾ camera pose |
| Research docs checked | [WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer), [ExtrudeGeometry](https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry), [Shape](https://threejs.org/docs/#api/en/extras/core/Shape), [MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial), [PMREMGenerator](https://threejs.org/docs/#api/en/extras/PMREMGenerator), [multiple elements example](https://threejs.org/examples/#webgl_multiple_elements) |
| CloudAI-X skills used | threejs-fundamentals, threejs-geometry, threejs-materials, threejs-lighting, threejs-textures |

## Research summary

Single `WebGLRenderer` with scissor/viewport views (official multiple-elements pattern) so six live thumbs share one context. Logomark is a round-capped polyline extruded with `ExtrudeGeometry` (not a textured plane). PBR via `MeshStandardMaterial` / `MeshPhysicalMaterial` plus a procedural `RoomEnvironment` PMREM — no remote HDR. Glass uses transmission + IBL; export clears alpha to 0 and snapshots the drawing buffer.

## Docs checked

- [https://threejs.org/docs/#api/en/renderers/WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer) — `setScissorTest`, `setViewport`, `preserveDrawingBuffer`, `outputColorSpace`
- [https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry](https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry) — depth, bevel, `UVGenerator`
- [https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial) — transmission, anisotropy, clearcoat, `envMapIntensity`
- [https://threejs.org/examples/#webgl_multiple_elements](https://threejs.org/examples/#webgl_multiple_elements) — one renderer, many DOM-tracked views
- [https://threejs.org/docs/#api/en/extras/PMREMGenerator](https://threejs.org/docs/#api/en/extras/PMREMGenerator) — local IBL from `RoomEnvironment`

## CloudAI-X skills checked

- threejs-fundamentals — renderer, camera, dispose, clock
- threejs-geometry — Shape / ExtrudeGeometry
- threejs-materials — Physical glass, metal, clearcoat
- threejs-lighting — key directional + hemisphere; IBL
- threejs-textures — Data/canvas textures, color space, wrapping

## Recommended implementation path

WebGLRenderer + scissor gallery; shared extruded MM geometry; six procedural PBR materials; RoomEnvironment PMREM; studio is the same renderer with one full-stage view.

## Risks

- Six views × 60fps — mitigate with one context, DPR clamp, skip offscreen scissors
- Glass on black can read as a hole — bevel + IBL + key light required
- Depth slider rebuilds geometry — dispose previous `BufferGeometry`
- Anisotropy needs tangents — `computeTangents()` after extrude

## Fallbacks

- No WebGL: SVG mark + caption, studio export disabled
- Texture init failure: untextured Physical/Standard with color only

## Mobile strategy

Two columns, smaller canvas DPR, studio placard below the stage, 44px controls.

## Reduced-motion strategy

Honor OS `prefers-reduced-motion` and the demo toggle. Freeze rotation; do not animate card hover.

## Client & portfolio adaptation

### Tyler's personal portfolio

Case-study stills and a full-bleed gallery section. Keep the black wall; swap the mark path.

### MaserMedia portfolio

Primary showcase for the MM mark. Brand blues appear only in the Gradient material and the source SVG.

### Client websites

| Field | Notes |
| --- | --- |
| Reusable | Engine, scissor gallery, studio placard, PNG export |
| Brand-specific | Centerline path, material catalog, captions |
| Tokenizable | `--lmg-*` colors, type, spin default |
| Content swappable | `createMaserMCenterline()` / SVG asset |
| Visual rules | Black field, mono chrome, logo is the only color |
| Performance limits | One WebGL context; texture 512; no postprocessing |

## Acceptance criteria

- [x] Demo route `/demos/logo-material-gallery` renders gallery + studio states
- [x] Six materials: wood, glass, gradient, brushed steel, marble, gold
- [x] Card click opens studio with material switcher, spin + pause, scale, depth, key light, environment intensity, export, reset
- [x] Export PNG is high-res with transparent background (2048 RGBA, corners alpha 0)
- [x] Typography small uppercase; UI monochrome except the logo
- [x] `npm run build` passes in `lab/`
- [x] Gallery files pass `eslint` (full `lab` lint still reports pre-existing `pixel-info-card` hook errors)
- [x] `prefers-reduced-motion` verified
- [x] Component exported from `lab/src/components/projects/display/logo-material-gallery/index.ts`

## Open decisions

- Exact centerline vs a pixel-trace of the upload — **assumed** geometric reconstruction of the stacked rounded MM (documented in `create-logo-geometry.ts`)
- Export pixel size default **2048** square
- Camera distance **7.35** / FOV **28** so the stacked mark fits 3:4 cards without cropping

## Accepted decisions

- Product kind: **app** (gallery + studio). Portable unit is `LogoMaterialGallery`, not the demo shell.
- One WebGL context (scissor views), never six canvases.
- `RoomEnvironment` instead of CDN HDR files.
