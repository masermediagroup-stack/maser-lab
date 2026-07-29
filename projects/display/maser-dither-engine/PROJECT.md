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
- Not shipping every material as ready (stubs reserved)
- Not a general UI kit outside dither materials

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
