# Project: TYPE WORLD

**Slug:** `type-world`  
**Category:** scroll  
**Status:** building  
**Created:** 2026-08-14  
**Kind:** section

## Design reference

- Figma: none
- Other: Editorial still — warm-white field (`#FAFAF7`), commanding Geist quote with a slow three-stop pigment gradient (`#1047C9` → `#6B42FF` → `#E052A0`). No cards, gloss, bloom, or dashboard chrome on the artwork.
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
A visitor on a marketing, portfolio, or chrome surface. The typographic globe is already at rest; they drag it (mouse or horizontal touch) to turn it.

### Job
Make editorial type feel like a physical world: at rest it reads as a quiet magazine spread; in motion it reveals that the same sentence exists twice around an invisible sphere. Portable enough to drop into a full stage, a corner, or a nav slot — the mesh fits its canvas.

### Brand signal
If lab chrome is removed: cream field, royal-blue Geist quote, empty space. No other UI required.

### First viewport contents (max)

- Brand: the quote itself
- Headline: `the world is designed. / you get to design / what comes next.`
- Support: optional microcopy `drag to turn the world` (dismisses after first drag)
- CTA: none
- Visual: typographic sphere (glyphs only)

### Section map (one job each)

1. TYPE WORLD — rest-state spherical quote (drag to turn)

### Current behavior
Greenfield.

### Desired outcome
A genuine `SphereGeometry` whose visible surface is a transparent glyph-alpha `CanvasTexture` of the quote, duplicated at 0° and 180° longitude. The object mounts at full rest scale (no scroll inflate). Hosts size it by giving `.type-world` a height; the sphere fits the canvas. Weighted drag with decaying inertia. Invisible sphere body.

### Success signal
Resting frame reads as flat editorial type as soon as the canvas is in view. ~90° shows fragments. ~180° shows the same composition, not mirrored. Vertical touch still scrolls the page.

### Non-goals
- Flat DOM `rotateY`, word carousels, back-to-back planes, CSS fake globes
- Glossy materials, lighting, atmosphere, post-processing
- Permanent settings dashboard on the artwork
- Free tumble / OrbitControls

## States

- [x] default (full-size editorial rest on mount)
- [x] hover (grab cursor, pointer fine)
- [x] active / pressed (grabbing cursor + ~1.015 grip scale)
- [x] inertia settle after release
- [x] hint dismissed after first successful drag
- [x] prefers-reduced-motion (gradient freeze, inertia off)
- [x] WebGL unavailable (static Geist quote)
- [x] demo light / dark stage (Leva Appearance → Mode)
- [x] demo fill viewport (Leva Appearance → Fill viewport; Escape exits)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Three.js + React Three Fiber `useFrame` | Real sphere + texture; high-frequency transforms stay off React state |
| Scroll | None — rest scale on mount | Reuse in corners / nav; demo still has lead/after copy |
| Drag | Pointer → target yaw/pitch → damped actual; drag right follows right; drag down follows down | Weighted grab, not inverted |
| Gradient | Shader UV palette × glyph alpha; phase in `useFrame` | Independent of rotation; no canvas uploads |
| Pitch | Clamped ±20° | Prevents upside-down globe |
| Reduced motion | Freeze gradient; no coast | `rule/reduced-motion-required` |

## Three.js / 3D

| Field | Value |
| --- | --- |
| Target type | Interactive object (canvas-fit scale) |
| Renderer | WebGL via R3F `Canvas` (`WebGLRenderer`) |
| Decorative? | no — 3D is the piece; static quote fallback if WebGL missing |
| Fallback | Centered Geist quote on the same cream field |
| Mobile strategy | `touch-action: pan-y`; horizontal intent captures rotation; DPR clamp; 64×48 sphere on narrow viewports |
| Reduced motion | Freeze gradient; no coast |
| Research docs checked | [SphereGeometry](https://threejs.org/docs/#api/en/geometries/SphereGeometry), [CanvasTexture](https://threejs.org/docs/#api/en/textures/CanvasTexture), [ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial), [Texture](https://threejs.org/docs/#api/en/textures/Texture), [SRGBColorSpace](https://threejs.org/docs/#api/en/constants/Textures) |
| CloudAI-X skills used | threejs-fundamentals, threejs-geometry, threejs-textures, threejs-materials, threejs-shaders, threejs-interaction |

## Research summary

Unlit `ShaderMaterial` × glyph-alpha `CanvasTexture` is the correct path: the canvas is a static white mask (never repainted for motion); a 3-stop cosine palette travels in UV via `uPhase` in `useFrame`. No lights, no PBR, no bloom. Glyphs define the silhouette via alpha discard + `FrontSide`. Two identical quote compositions packed into the left/right halves of a 2:1 texture map to 180° longitude each. Default SphereGeometry UV places u=0.25 on +Z, so the first copy faces a camera on +Z without a UV flip; the second copy at u=0.75 becomes readable after yaw π and is not mirrored because we still sample the outside of the mesh. Low FOV (~24°) and origin-centered framing keep the rest state near-editorial. Sphere fit targets ~86% vw on mobile / ~40% vw on desktop. R3F already exists in the lab (kinetic-perspective-bars); do not add a second renderer stack.

## Skills loaded

- `maser-lab-web` (Implement)
- `maser-lab-threejs` (Research + Implementation + Interaction UX + Performance)
- `maser-lab-project-scaffold`
- `maser-lab-demo-chrome`
- `web-design-guidelines` (SR quote, reduced motion, dark-stage contrast)
- `maser-lab-export` (product-only barrel)
- `maser-lab-token-system`
- `maser-lab-section-shape` (brief fields)
- `threejs-fundamentals`, `threejs-textures`, `threejs-materials`, `threejs-shaders`, `threejs-interaction`
- `gsap-framer-scroll-animation` (not used — rest-scale object, no pin)
- `vercel-react-best-practices` (dynamic `ssr: false`, no rAF in React state)
- `web-design-guidelines` (SR quote, reduced motion)

## Acceptance criteria

- [x] Demo route `/demos/type-world` renders the section and listed states
- [x] Type-world files: `tsc --noEmit` and `eslint src/components/projects/scroll/type-world` pass (`npm run lint` for the whole lab still fails on pre-existing `pixel-info-card` `set-state-in-effect`)
- [x] `npm run build` includes `/demos/type-world`
- [x] `prefers-reduced-motion` / demo toggle: freeze gradient, no coast
- [x] Component exported from `lab/src/components/projects/scroll/type-world/index.ts`
- [x] Quote readable at ~0° and ~180°, not mirrored on the second side
- [x] Vertical page scroll still works on touch; horizontal drag turns the sphere
- [x] Drag right moves the grabbed surface right; drag down moves it down on both the front and 180° copies
- [x] Glyph-only animated gradient; cream field unchanged
- [x] Leva Gradient folder: Color 1–3, Speed, Angle, Spread, Reverse — live, no remount
- [x] Gradient continues while the sphere rotates; both 0° and 180° copies share one UV material
- [x] Sphere is at rest scale on mount (no scroll inflate); host height sizes the canvas
- [x] Desktop rest scale ~40% of stage width (mobile still ~86%)
- [x] Leva Appearance: Light/Dark stage (page + sphere field + panel), Fill viewport (no page scroll; Escape exits)
- [x] Fill viewport on touch: vertical drag pitches the sphere (no pan-y handoff); drag down follows the finger
- [x] No existing lab experiments changed (liquid-monochrome still renders)
- [ ] Motion review: no open P0/P1 findings (not run as a separate Review mode)

## Open decisions

- None blocking. Font: Geist via `next/font/google` (same face as the lab shell).

## Accepted decisions

- Category `scroll` remains for registry continuity; the product is a rest-scale object (canvas-fit), not a sticky inflate.
- Product kind: **section** (portable `TypeWorld` + tokens). Hosts size it with `.type-world` height — full stage, corner, or nav slot.
- No `rule/no-scale-zero` exception: there is no reveal from near-zero. `minScale` is only a numeric floor for grip/fit.
- Pitch is a camera-right nod composed after yaw (`qPitch * qYaw`), so the back copy is not inverted. Drag down follows on both faces. Fill viewport sets `captureVerticalDrag` so touch is not limited to left/right.
- Demo chrome: editorial bar + Leva. Appearance folder owns Light/Dark (stage + Leva theme + `TypeWorld` field) and Fill viewport. Reduced-motion control still uses `aria-label="Toggle reduced motion"`. Glyph color is a 3-stop UV shader gradient; canvas stays a static alpha mask.
