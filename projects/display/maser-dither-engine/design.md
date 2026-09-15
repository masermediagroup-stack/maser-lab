# Design notes — Maser Dither Engine (Lab craft cut)

No Figma file. This is the Lab brief for assessors and agents.

## Stack (why not Three.js)

The product is a **shared WebGL2 fullscreen-triangle pipeline** (`engine/pipeline/stages.ts` + `SurfaceRenderer`). One GLSL program dithers every adapter. Three.js `ShaderMaterial` would fork programs, add a scene graph we do not need, and violate the sacred `gl_VertexID` / `SAMPLE_GLSL` contracts. Canvas2D is fallback only.

## Lab standing

- Display room: **The Lab**. Repo stays `maser-lab`.
- Demo chrome knobs live in `maser-dither-engine-demo.tsx`, not the product barrel.
- Shared Lab chrome: opaque left rail on desktop; product owns the first screen on phone; knobs under the fold.
- Studio (`DitherEngineApp`) remains a lab-only authoring shell, opened from a dock control. Do not transfer `shell/`.

## Assessor cut (what to look at)

Route: `/demos/maser-dither-engine`

1. Full-bleed dither field (default) — lit, non-black.
2. Dock knobs: adapter, material, palette, algorithm, matrix size, pattern scale, grain, bloom, reduced motion, reset, studio.
3. Reduced motion: OS `prefers-reduced-motion` or dock toggle — CRT flicker muted, timeline paused, surface still visible.
4. Offscreen / tab hidden: animation loop stops (no rAF). DPR capped at 2.
5. One live WebGL context on the craft cut (adapters swap; do not grid live thumbs).

## Product vs lab

Portable: `engine/`, `react/SurfaceCanvas`, adapters, export. See `TRANSFER.md`.
Not portable: demo CSS, `DemoControlMenu` knobs, studio shell.
