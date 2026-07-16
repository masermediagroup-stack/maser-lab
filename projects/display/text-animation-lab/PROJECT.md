# Project: Text Animation Lab

**Slug:** `text-animation-lab`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-02  
**Updated:** 2026-07-16

## Purpose

Black-and-white shadcn/ui text animation workspace for Maser-Lab. Preview reusable text animation effects, tune settings on a detail page, replay/reset animations, and export production-ready **In** and **Out** component usage snippets separately.

Intended for Tyler's portfolio, MaserMedia sections, client landing pages, hero/CTA blocks, and internal animation systems.

## Skills loaded

- `maser-lab-web` (Implement / Harden)
- `maser-lab-threejs` (3D text flip)
- `gsap-framer-scroll-animation` (scroll line reveal)
- `vercel-react-best-practices` (dynamic three import, cleanup)

## Gallery behavior

- Route: `/demos/text-animation-lab`
- Shows all animations in a responsive grid (1 / 2 / 3 columns)
- Each card includes title, live preview with **Maser Media**, short description, and **Enter Animation**
- Gallery cards do not include controls or code export
- Previews auto-replay on an interval for continuous gallery motion

## Detail page behavior

- Local state switches from gallery → selected animation detail (no extra routing)
- Includes back button, title, description, large preview frame, editable text, grouped controls, Replay, Reset, and **Load / Export Code**
- Controls update the preview live; **Animation phase** toggles In/Out for supported effects
- Scroll Line Reveal uses an internal scroll host in the preview frame (scroll inside the frame)

## Code drawer behavior

- Opens from the right via shadcn Sheet
- Tabs for **In animation** and **Out animation** when `supportsOutAnimation` is true
- Shows animation name, current settings summary, dependency notes, and a component usage snippet with `phase="in" | "out"`
- **Copy code** writes the active snippet to clipboard
- Export excludes lab chrome — only the animation component import/usage

## Animations (16)

| # | ID | Title | Approach |
| --- | --- | --- | --- |
| 1 | `typing` | Typing Animation | React state + interval |
| 2 | `letter-flip-frame` | Individual Letter Flip Frame | CSS keyframes + 3D transform |
| 3 | `poured-text` | Poured Text Curve | CSS keyframes + curved offsets |
| 4 | `stroke-fill-glow` | Stroke to Fill Glow | CSS text-stroke color → fill → glow |
| 5 | `random-letter-fade` | Random Letter Fade In | CSS keyframes + seeded order |
| 6 | `directional-letter-flip` | Directional Letter Flip | CSS 3D transforms |
| 7 | `cursor-ascii-reveal` | Cursor ASCII Reveal | Pointer events + opacity reveal |
| 8 | `glyph-scan-reveal` | Glyph Scan Reveal | Canvas mask sampling + scan reconstruction |
| 9 | `glide-text` | Glide Text | CSS translate keyframes |
| 10 | `scale-anchor` | Scale Anchor Text | CSS scale keyframes + transform-origin |
| 11 | `scroll-line-reveal` | GSAP Scroll Line Reveal | GSAP ScrollTrigger + embedded scroller |
| 12 | `mask-clip-reveal` | Mask Clip Reveal | Overflow mask + translate |
| 13 | `text-scramble-reveal` | Text Scramble Decode | Glyph scramble settle |
| 14 | `blur-focus-reveal` | Blur Focus Reveal | Blur + tracking tighten |
| 15 | `underline-draw-reveal` | Underline Draw Reveal | Word rise + underline scaleX |
| 16 | `text-flip-3d` | 3D Text Flip Reveal | Three.js CanvasTexture planes + CSS fallback |

## Fixes (2026-07-16)

- **Stroke Fill Glow:** stroke color now animates from transparent → white before fill/glow (correct in animation)
- **GSAP Scroll Line Reveal:** embedded scroller spacers + single staggered tween + `ScrollTrigger.refresh()` so scrub actually fires
- **Export:** separate In / Out snippets via `phase` prop

## Acceptance criteria

- [x] Gallery shows all effects with "Maser Media" / per-effect defaults
- [x] Stroke in animation draws outline before fill
- [x] Scroll line reveal works in gallery + detail embedded hosts
- [x] Export drawer offers In and Out snippets for supported effects
- [x] Three.js 3D text flip with WebGL fallback
- [x] Missing production effects added (mask clip, scramble, blur focus, underline draw)
- [x] `npm run lint` passes
- [x] `npm run build` passes
- [x] Rendered verification in browser

## Portfolio / client usage

Copy animation components from `lab/src/components/text-animations/` into target projects. Export **In** and **Out** snippets separately, then wire `phase` (or remount with `playKey`) on route enter/leave.
