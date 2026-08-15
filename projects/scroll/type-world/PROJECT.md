# Project: TYPE WORLD

**Slug:** `type-world`  
**Category:** scroll  
**Status:** building  
**Created:** 2026-08-14  
**Kind:** section

## Design reference

- Figma: none
- Other: Editorial still — warm-white field (`#FAFAF7`), saturated royal-blue high-contrast serif quote, generous negative space. No cards, gloss, gradients, or dashboard chrome.
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
A visitor scrolling a marketing or portfolio page. They enter a pinned typographic stage, then drag the object (mouse or horizontal touch) to turn it.

### Job
Make editorial type feel like a physical world: at rest it reads as a quiet magazine spread; in motion it reveals that the same sentence exists twice around an invisible sphere.

### Brand signal
If lab chrome is removed: cream field, royal-blue Instrument Serif quote, empty space. No other UI required.

### First viewport contents (max)

- Brand: the quote itself
- Headline: `the world is designed. / you get to design / what comes next.`
- Support: optional microcopy `drag to turn the world` (dismisses after first drag)
- CTA: none
- Visual: typographic sphere (glyphs only)

### Section map (one job each)

1. TYPE WORLD — scroll-reveal + drag-rotate spherical quote

### Current behavior
Greenfield.

### Desired outcome
A genuine `SphereGeometry` whose visible surface is a transparent `CanvasTexture` of the quote, duplicated at 0° and 180° longitude. CSS-sticky 100svh stage inside ~170svh. Fast scale reveal with overshoot. Weighted drag with decaying inertia. Invisible sphere body.

### Success signal
Resting frame reads as flat editorial type. ~90° shows fragments. ~180° shows the same composition, not mirrored. Scroll reverse deflates coherently. Vertical touch still scrolls the page.

### Non-goals
- Flat DOM `rotateY`, word carousels, back-to-back planes, CSS fake globes
- Glossy materials, lighting, atmosphere, post-processing
- Permanent settings dashboard on the artwork
- Free tumble / OrbitControls
- `scale(0)` (use ~0.001; documented brand-moment exception to `rule/no-scale-zero`)

## States

- [x] default (full-size editorial rest after reveal)
- [x] hover (grab cursor, pointer fine)
- [x] active / pressed (grabbing cursor + ~1.015 grip scale)
- [x] scroll reveal (0.001 → overshoot → 1, first ~25% of section)
- [x] inertia settle after release
- [x] hint dismissed after first successful drag
- [x] prefers-reduced-motion (full scale, no inflate, inertia off)
- [x] WebGL unavailable (static serif quote)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Three.js + React Three Fiber `useFrame` | Real sphere + texture; high-frequency transforms stay off React state |
| Scroll | CSS sticky + scroll-progress ref (not GSAP pin) | Matches requested 170svh / 100svh structure; liquid-monochrome pin is a different job |
| Reveal | First 20–30% of section progress; cubic inflate + short overshoot | Decisive, not a hero zoom |
| Drag | Pointer → target yaw/pitch → damped actual; release velocity × friction | Weighted, not 1:1 slippery |
| Pitch | Clamped ±20° | Prevents upside-down globe |
| Reduced motion | Skip reveal + inertia | `rule/reduced-motion-required` |

## Three.js / 3D

| Field | Value |
| --- | --- |
| Target type | Interactive object + scroll-driven scale |
| Renderer | WebGL via R3F `Canvas` (`WebGLRenderer`) |
| Decorative? | no — 3D is the piece; static quote fallback if WebGL missing |
| Fallback | Centered Instrument Serif quote on the same cream field |
| Mobile strategy | `touch-action: pan-y`; horizontal intent captures rotation; DPR clamp; 64×48 sphere on narrow viewports |
| Reduced motion | Full scale immediately; no inflate; no coast |
| Research docs checked | [SphereGeometry](https://threejs.org/docs/#api/en/geometries/SphereGeometry), [CanvasTexture](https://threejs.org/docs/#api/en/textures/CanvasTexture), [MeshBasicMaterial](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial), [Texture](https://threejs.org/docs/#api/en/textures/Texture), [SRGBColorSpace](https://threejs.org/docs/#api/en/constants/Textures) |
| CloudAI-X skills used | threejs-fundamentals, threejs-geometry, threejs-textures, threejs-materials, threejs-interaction |

## Research summary

Unlit `MeshBasicMaterial` + transparent `CanvasTexture` is the correct path: no lights, no PBR, glyphs define the silhouette via `alphaTest` + `FrontSide`. Two identical quote compositions packed into the left/right halves of a 2:1 texture map to 180° longitude each. Default SphereGeometry UV places u=0.25 on +Z, so the first copy faces a camera on +Z without a UV flip; the second copy at u=0.75 becomes readable after yaw π and is not mirrored because we still sample the outside of the mesh. Low FOV (~28°) and origin-centered framing keep the rest state near-editorial. R3F already exists in the lab (kinetic-perspective-bars); do not add a second renderer stack.

## Skills loaded

- `maser-lab-web` (Implement)
- `maser-lab-threejs` (Research + Implementation + Interaction UX + Performance)
- `maser-lab-project-scaffold`
- `maser-lab-demo-chrome`
- `maser-lab-export` (product-only barrel)
- `maser-lab-token-system`
- `maser-lab-section-shape` (brief fields)
- `threejs-fundamentals`, `threejs-textures`, `threejs-materials`, `threejs-interaction`
- `gsap-framer-scroll-animation` (sticky/scrub patterns; CSS sticky chosen over GSAP pin)
- `vercel-react-best-practices` (dynamic `ssr: false`, no rAF in React state)
- `web-design-guidelines` (SR quote, reduced motion)

## Acceptance criteria

- [x] Demo route `/demos/type-world` renders the section and listed states
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified
- [x] Component exported from `lab/src/components/projects/scroll/type-world/index.ts`
- [ ] Quote readable at ~0° and ~180°, not mirrored on the second side
- [ ] Vertical page scroll still works on touch
- [ ] Scroll reverse deflates the sphere
- [ ] No existing lab experiments changed

## Open decisions

- None blocking. Font: Instrument Serif via `next/font/google` (lab has Instrument Sans only; no existing editorial serif).

## Accepted decisions

- Category `scroll` — the sticky reveal is the section job; the sphere is the object inside it.
- Product kind: **section** (portable `TypeWorld` + tokens).
- Exception to `rule/no-scale-zero`: reveal starts at `0.001` (not 0) as an explicit brand moment; reduced-motion skips it.
- Demo chrome: editorial bar + collapsed Parameters `<details>` instead of `DemoControlBar`, so dark lab chrome does not sit on the cream field. Reduced-motion control still uses `aria-label="Toggle reduced motion"`.
