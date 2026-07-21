# Project: Text Animation Lab

**Slug:** `text-animation-lab`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-02  
**Updated:** 2026-07-21

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

## Animations (17)

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
| 17 | `tetris-pixel-text` | Tetris Pixel Text Reveal | Canvas 2D polyomino partition + kinematic fall |

## Tetris Pixel Text Reveal

Canvas 2D polyomino partition + kinematic fall into a high-density glyph mask.

### Quality & density

- **Text Density** (Coarse→Ultra, default High): logical cells-per-em — independent of display font size
- **Render Quality**: supersample factor for offscreen rasterization (2×–6×)
- **Edge Detail**: coverage threshold (Clean / Detailed / Maximum) + connectivity cleanup
- **Piece Scale**: Small / Mixed / Large connected polyomino groups (does not change glyph resolution)
- Font size grows the word; density grows cell count — not block size

### Animation

- **Animation Length** (0.8–12s, default 4s): master timeline normalizer (concurrency + stagger before naive speed-up)
- Granular motion controls live under **Advanced Motion**
- Timeline summary: requested vs calculated duration, piece count, peak concurrent

### Fonts

- Geist Pixel Square / Grid / Circle / Triangle / Line + Custom (FontFace URL)
- Fail loudly on load errors — never silent fallback mask generation

### Presets

Classic Blocks, High Definition, Fast Build, Arcade Rainbow, Slow Assembly, Glitch Build, Minimal Lock-In

### Implementation notes

- Portable package: `lab/src/components/text-animations/tetris-pixel-text/`
- **Tetris spawn:** `PieceAnimState.waiting` skips draw; per-piece `spawnY` from rotated bounds + glow + stage offset; canvas clip
- **Tetris mask:** density-driven logical cells; supersampled area coverage with ink alpha floor; **hysteresis occupancy** (core + edge-only-if-connected-to-core); stray cluster rejection
- **Tetris partition:** piece-scale profiles; exact coverage validation + flood-fill leftovers
- **Tetris timeline:** `normalizeTimeline` adapts concurrency/stagger/waypoints before clamping fall duration
- **Tetris cache:** layout key skips remask when only motion/color changes; silhouette glow at high density
- Reveal-in/out, color modes, dual seeds, reduced-motion snap, export tabs (Component / Styles / Usage / Setup)

### Acceptance criteria (Tetris)

- [x] Text Density control with High default; Ultra yields many more target cells
- [x] Font size independent of logical/render cell size
- [x] Animation Length normalizes full reveal near requested duration
- [x] Advanced Motion retains granular controls
- [x] Multi font + custom FontFace with clear errors
- [x] Exact partition coverage validation
- [x] Export includes density / duration / concurrency / font settings
- [x] “MASER MEDIA” builds from connected falling pieces (not pixel rain)
- [x] Reveal-in / reveal-out / pause / resume / replay
- [x] `prefers-reduced-motion` supported
- [x] Lint + production build pass

## Fixes (2026-07-21)

- Density / render quality / edge detail / piece scale / animation length timeline
- Multi-font + custom FontFace loader; silhouette glow at high density
- Spawn offscreen + dense coverage mask + exact partition validation

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
