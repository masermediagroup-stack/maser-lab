# Project: Page Transitions Lab

**Slug:** `page-transitions-lab`  
**Category:** layout  
**Status:** building  
**Created:** 2026-07-07  
**Updated:** 2026-07-08

## Design reference

- Figma: none
- Other: Client shopping-site route transitions, product browsing, collection switching, cart/checkout movement
- Lab UI pattern: matches `text-animation-lab` gallery → detail workspace; Maser blue / white only
- Design spec: `FIGMA.md`

## Skills loaded

- `maser-lab-web` (Implement / Harden) — gallery/detail chrome, motion judgment, one-shot transition rules
- `maser-lab-threejs` (Implement) — curtain-fall WebGL scene, disposal, orthographic overlay
- References: `interface-quality.md`, `build-standards.md`, `lab-patterns-threejs.md`

## Brief

### User / trigger
Website visitors moving between pages in a client-facing shopping site. Trigger frequency is occasional to tens per session, depending on browsing depth.

### Job
Make page-to-page changes feel intentional and spatial without hiding content, delaying purchase decisions, or creating router-specific lock-in.

### Current behavior
Lab workspace with selectable transitions. Early CSS used reversible `transition` + `data-phase` toggles, which caused reverse/repeat glitches when the phase returned to idle.

### Desired outcome
A Maser-Lab-aligned gallery where each transition plays as a **one-shot** animation, settles on the destination page, can be tuned, and exports starter code — including a Three.js curtain-fall reveal.

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

| Order | Concept | Engine | Shopping-site use |
| --- | --- | --- | --- |
| 1 | Editorial Wipe | CSS | Collection → product detail |
| 2 | Product Shelf Slide | CSS | Category → category |
| 3 | Spotlight Iris | CSS | Campaign → featured product |
| 4 | Receipt Lift | CSS | Cart → checkout |
| 5 | Soft Crossfade Blur | CSS | Utility ↔ utility |
| 6 | Curtain Fall | Three.js | Branded handoff; destination painted on falling strips |

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
