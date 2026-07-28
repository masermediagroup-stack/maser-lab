# Project: Maser Surface Engine

**Slug:** `maser-surface-engine`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-28  
**Product kind:** lab

## Design reference

- Figma: none
- Other: Editorial monochrome / engineered dither philosophy (original engine — not a Tripwire clone)
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Lab designers and engineers exploring procedural materials; pointer moves over the Surface Card media region frequently during tuning.

### Job
Prove a reusable **procedural graphics engine** that generates premium monochrome materials for web surfaces — first demo: an interactive card whose media slot is driven by the engine.

### Brand signal
**Maser Surface Engine** wordmark + the live dithered material plane. If nav is removed, the material and engine name still own the viewport.

### First viewport contents (max)
- Brand: Maser Surface Engine
- Headline: Procedural monochrome materials
- Support: Engineered tonal density for interfaces
- CTA: Card button (Explore)
- Visual: Dithered material media plane (primary)

### Current behavior
Greenfield.

### Desired outcome
Feels like a premium graphics framework: modular pipeline, realtime uniforms, subtle alive cursor response — not a filter toy or retro pixel kit.

### Success signal
Material updates at ~60 FPS from controls; dither reads as continuous tone at viewing distance; cursor influence is heavily damped and never gimmicky.

### Non-goals
- Not a UI kit
- Not cloning Tripwire or any third-party dither UI
- No CRT/scanline nostalgia, no chunky pixel-art Bayer
- No dramatic card tilt / spring overshoot
- Future materials (liquid, glass, etc.) are registry stubs only in v1

## States

- [x] default
- [x] hover (pointer fine — soft light/bloom shift in media)
- [x] focus (card button + control focus rings)
- [x] active / pressed (button)
- [ ] loading — N/A
- [ ] success — N/A
- [ ] error — N/A (WebGL fallback to Canvas2D)
- [ ] disabled — N/A
- [x] prefers-reduced-motion (freeze time + pointer influence)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | rAF + exponential damp (engine); framer-motion unused for material | No spring overshoot; GPU uniforms |
| Duration | Continuous damp ~120–180ms feel | Heavily damped, never snaps |
| Easing | `1 - exp(-λΔt)` | Natural approach to targets |

## Three.js / 3D (optional)

| Field | Value |
| --- | --- |
| Target type | Procedural material / shader surface (2D fullscreen triangle) |
| Renderer | WebGL2 primary; Canvas2D fallback |
| Decorative? | no — material is the product |
| Fallback | Canvas2D software Bayer path |
| Mobile strategy | full with DPR clamp ≤2 |
| Reduced motion | paused grain/time; zero cursor influence |
| Research docs checked | WebGL2 fundamentals (custom — no Three.js scene) |
| CloudAI-X skills used | maser-lab-threejs capability helpers only |

## Acceptance criteria

- [x] Demo route `/demos/maser-surface-engine` renders card + material controls
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Pipeline stages 1–8 present and tunable
- [ ] WebGL primary; Canvas2D fallback exists
- [ ] Cursor influence damped; reduced-motion freezes animation
- [ ] Product exported from `index.ts` (Demo not in barrel)
- [ ] No React setState on every animation frame

## Open decisions

- Future materials remain stubs until separate Implement passes
