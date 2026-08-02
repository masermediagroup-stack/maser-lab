# Project: Page Transitions Lab

**Slug:** `page-transitions-lab`  
**Category:** layout  
**Status:** building  
**Created:** 2026-07-07  
**Updated:** 2026-07-08

## Design reference

- Figma: none
- Other: Generic site route transitions (landing → article wireframe previews)
- Lab UI pattern: matches `text-animation-lab` gallery → detail workspace; Maser blue / white only
- Design spec: `FIGMA.md`

## Skills loaded

- `maser-lab-web` (Implement / Harden) — gallery/detail chrome, motion judgment, one-shot transition rules
- `maser-lab-threejs` (Implement) — curtain-fall WebGL scene, disposal, orthographic overlay
- References: `interface-quality.md`, `build-standards.md`, `lab-patterns-threejs.md`

## Brief

### User / trigger
Website visitors moving between pages (landing → article). Trigger frequency is occasional to tens per session.

### Job
Make page-to-page changes feel intentional and spatial without hiding content or creating router-specific lock-in.

### Current behavior
Lab workspace with selectable transitions. Early CSS used reversible `transition` + `data-phase` toggles, which caused reverse/repeat glitches when the phase returned to idle.

### Desired outcome
A Maser-Lab-aligned gallery where each transition plays as a **one-shot in → out** animation (cover/exit, then reveal destination), settles on the destination page, can be tuned, and exports starter code — including Curtain Fall (strips fall in to cover, then fall out downward).

### Success signal
Each transition can be selected, replayed without reverse bounce, tuned, and exported. Curtain Fall responds to a live curtain-count slider. Preview chrome stays Maser blue / white with no fluff copy.

### Non-goals
- Full app router integration for a specific client stack
- Real page data fetching / html2canvas of live DOM
- Replacing each target site's navigation logic

## States

- [x] gallery default
- [x] detail selected
- [x] transition rest (settled current page)
- [x] transition running (one-shot)
- [x] previous / next page swap on complete
- [x] tuned settings
- [x] code export drawer
- [x] prefers-reduced-motion
- [x] WebGL unavailable (curtain falls back via reduced CSS path / empty canvas shell)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Engine (CSS) | `@keyframes` + `animation-fill-mode: forwards` | Prevents reverse playback when status returns to rest. |
| Engine (3D) | Three.js orthographic planes + CanvasTexture | Destination page painted to canvas; UV strips fall as curtains. |
| State model | `rest` → `running` → swap page → `rest` | Incoming layer mounts only while running; remount via `playKey`. |
| Duration | 240–1600ms by effect | Commercial nav vs editorial / curtain reveals. |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` / ease-out cubic | Decelerated entry without spring bounce. |
| Properties | `transform`, `opacity`, `clip-path`, `filter` (CSS); mesh `position.y` (Three) | Compositor-friendly; filter reserved for soft crossfade. |

## Transition concepts

| Order | Concept | Engine | Preview use |
| --- | --- | --- | --- |
| 1 | Editorial Wipe | CSS | Landing → article |
| 2 | Product Shelf Slide | CSS | Landing → article |
| 3 | Spotlight Iris | CSS | Landing → article |
| 4 | Receipt Lift | CSS | Landing → article |
| 5 | Soft Crossfade Blur | CSS | Landing → article |
| 6 | Curtain Fall | Three.js | Landing → article; strips cover then fall out |
| 7 | Pixel Wormhole | Three.js | Landing → article; pixels → wormhole → reassemble |

### Preview chrome
- Fake browser bar path stays on the **from** route until the cover phase fully seals the viewport, then swaps to the **to** path
- Stage content is a wireframe landing page (nav + hero) → wireframe article page (nav + journal body)

### Pixel Wormhole
- Corners → center glowing pixel dissolve, suck into dark hole with camera zoom, destination pixels emit and reassemble
- Color modes: preserve page colors, solid A, gradient A→B, white glow
- Same Three.js visualization on mobile and desktop when WebGL is available (CSS fallback only if WebGL is missing)
- Curtain Fall is unchanged — separate transition entry

## Acceptance criteria

- [x] Demo route `/demos/page-transitions-lab` renders gallery + detail workspace
- [x] UI matches Maser-Lab monochrome pattern (text-animation-lab)
- [x] Five CSS transitions play one-shot without reverse/repeat glitches
- [x] Curtain Fall uses destination-painted strips (CSS) + Three.js overlay on desktop
- [x] Curtain Fall visible on mobile while playing (no blank stage)
- [x] Mobile layout: stage → actions → controls → notes; full page scrollable
- [x] Replay / reset / export controls work
- [x] `prefers-reduced-motion` collapses travel / curtain physics
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Component exported from `lab/src/components/projects/layout/page-transitions-lab/index.ts`

## Research notes (Curtain Fall)

- Official docs checked: `WebGLRenderer`, `OrthographicCamera`, `PlaneGeometry`, `CanvasTexture`, `MeshBasicMaterial`, texture disposal
- Destination content is painted via 2D canvas (no html2canvas dependency) so the lab stays portable
- Shared material + per-strip UV remap avoids cloning textures per curtain
- Disposal on unmount: geometries, material, texture, renderer, rAF, resize listener

## Open decisions

- Which client router should get the first production adapter: Next.js App Router, Remix, Shopify Hydrogen, or a plain React shell?
- Should production Curtain Fall capture real route DOM (html2canvas / View Transitions API) instead of a painted stand-in?
