# Project: Text Animation Lab

**Slug:** `text-animation-lab`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-02

## Purpose

Black-and-white shadcn/ui text animation playground for Maser-Lab. Preview 11 reusable text animation effects, tune settings on a detail page, replay/reset animations, and export production-ready component usage snippets.

Intended for Tyler's portfolio, MaserMedia sections, client landing pages, hero/CTA blocks, and internal animation systems.

## Gallery behavior

- Route: `/demos/text-animation-lab`
- Shows all 11 animations in a responsive grid (1 / 2 / 3 columns)
- Each card includes title, live preview with **Maser Media**, short description, and **Enter Animation**
- Gallery cards do not include controls or code export
- Previews auto-replay on an interval for continuous gallery motion

## Detail page behavior

- Local state switches from gallery → selected animation detail (no extra routing)
- Includes back button, title, description, large preview frame, editable text, grouped controls, Replay, Reset, and **Load / Export Code**
- Controls update the preview live
- Scroll Line Reveal uses an internal scroll host in the preview frame

## Code drawer behavior

- Opens from the right via shadcn Sheet
- Shows animation name, current settings summary, dependency notes (GSAP where applicable), and a component usage snippet reflecting current prop values
- **Copy code** writes the snippet to clipboard
- Export excludes lab chrome — only the animation component import/usage

## Animations (11)

| # | ID | Title | Approach |
| --- | --- | --- | --- |
| 1 | `typing` | Typing Animation | React state + interval |
| 2 | `letter-flip-frame` | Individual Letter Flip Frame | CSS keyframes + 3D transform |
| 3 | `poured-text` | Poured Text Curve | CSS keyframes + curved offsets |
| 4 | `stroke-fill-glow` | Stroke to Fill Glow | CSS text-stroke + keyframes |
| 5 | `random-letter-fade` | Random Letter Fade In | CSS keyframes + seeded order |
| 6 | `directional-letter-flip` | Directional Letter Flip | CSS 3D transforms |
| 7 | `cursor-ascii-reveal` | Cursor ASCII Reveal | Pointer events + opacity reveal |
| 8 | `glyph-scan-reveal` | Glyph Scan Reveal | Canvas mask sampling + scan reconstruction |
| 9 | `glide-text` | Glide Text | CSS translate keyframes |
| 10 | `scale-anchor` | Scale Anchor Text | CSS scale keyframes + transform-origin |
| 11 | `scroll-line-reveal` | GSAP Scroll Line Reveal | GSAP ScrollTrigger |

## Controls by animation

### 1. Typing
- Text, typing speed, start delay, cursor on/off, cursor blink speed, ease, loop

### 2. Letter Flip Frame
- Text, flip speed, stagger, flip axis (X/Y/Z), perspective, ease, direction

### 3. Poured Text
- Text, speed, curve intensity, stagger, vertical/horizontal offset, blur, ease

### 4. Stroke Fill Glow
- Text, stroke/fill duration, glow intensity/radius, word stagger, stroke width, ease

### 5. Random Letter Fade
- Text, fade speed, stagger, random order, randomness amount, blur, ease

### 6. Directional Letter Flip
- Text, direction (top/bottom/left/right), flip speed, stagger, perspective, rotation, ease

### 7. Cursor ASCII Reveal
- Text, reveal radius/softness/speed, ASCII density, noise, hover mode, press mode

### 8. Glyph Scan Reveal
- Text, source mode (text/SVG), SVG source, cell size, font family/weight, foreground intensity, background density, scan direction, scan speed, decay, jitter, symbol set
- Text mode defaults to Google Fonts `Geist Pixel`, waits for the webfont before drawing, then rasterizes editable text into an offscreen mask
- SVG mode rasterizes inline SVG, SVG fragments, or path data into the mask; SVG source is never mounted into the DOM

### 9. Glide Text
- Text, direction, glide distance, speed, stagger, blur, ease

### 10. Scale Anchor
- Text, scale start/end, speed, stagger, ease, anchor point (9 options)

### 11. Scroll Line Reveal
- Text (multiline), scroll start/end, scrub, line stagger, reveal direction, blur, opacity fade, pin section

## shadcn/ui components used

Button, Card, Slider, Switch, Select, Input, Textarea, Sheet, Badge, Label, Separator, ScrollArea

## Animation libraries

- **Primary:** CSS animations + React state
- **GSAP:** `gsap` + `ScrollTrigger` for scroll line reveal only (already in lab dependencies)

## Files created

```text
lab/src/components/text-animations/          # 11 animation components + shared CSS
lab/src/components/projects/display/text-animation-lab/
  TextAnimationLab.tsx
  AnimationGallery.tsx
  AnimationCard.tsx
  AnimationDetail.tsx
  AnimationPreview.tsx
  AnimationControls.tsx
  CodeExportDrawer.tsx
  animation-registry.ts
  code-generators.ts
  types.ts
  utils.ts
  tokens.css
  index.ts
projects/display/text-animation-lab/PROJECT.md
```

## Design QA notes

- Monochrome palette: black background, white primary text, neutral muted secondary
- Dark cards with subtle white/10 borders
- Gallery grid responsive at 640px and 1024px
- Detail layout stacks controls below preview on mobile; side panel on desktop
- Minimal decoration — no gradients in chrome (preview frame uses subtle dark gradient only)

## Motion QA notes

- All animations honor `prefers-reduced-motion` (instant/static fallback)
- Gallery auto-replay every 8s
- Replay increments `playKey` to restart CSS/JS animations
- ASCII reveal supports hover (desktop) and press/drag (touch)
- Glyph scan reveal plays once, settles on the reconstructed mask, replays only from `playKey`, supports text and SVG mask sources, and falls back to a static final mask for reduced motion
- Scroll reveal uses embedded scroll container in gallery cards

## Accessibility notes

- Contrast meets monochrome WCAG targets for UI text
- Controls have labels; buttons have visible text
- ASCII reveal is interactive on touch via press mode — not hover-only on mobile
- Reduced motion respected across animations

## Known limitations (MVP)

- Code export generates usage snippets, not standalone packages
- Scroll reveal pin section is best tested on the detail page with page scroll; gallery uses embedded scroller
- Stroke-fill glow uses `-webkit-text-stroke` (WebKit-friendly; verify target browsers)
- Gallery scroll preview is abbreviated compared to full-page scroll context

## Future improvements

- Per-animation preset saves
- Copy individual prop groups
- Dedicated sub-routes for shareable animation URLs
- Framer Motion variants for spring-based effects
- E2E tests for gallery → detail → export flow
- Token export for portfolio theming

## Reusable patterns

- Central `animation-registry.ts` drives gallery, controls, and export from one source
- `playKey` replay pattern for CSS-driven animations
- Grouped control definitions mapped to shadcn inputs
- `generateExportCode()` reflects live settings

## Portfolio / client usage

Copy animation components from `lab/src/components/text-animations/` into target projects. Use exported snippets from the drawer as the integration starting point. Swap preview text and tune props per brand voice.

## Acceptance criteria

- [x] Gallery shows all 11 effects with "Maser Media" / per-effect defaults
- [x] Each card has title + Enter Animation
- [x] Detail page: preview, text input, controls, replay, reset, export drawer
- [x] Glyph Scan Reveal supports text mode, SVG mode, replay, and export-safe SVG props
- [x] shadcn/ui monochrome interface
- [x] Responsive layout
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Rendered verification in browser

## Open decisions

- Whether to add URL-based deep links for individual animations in v2
