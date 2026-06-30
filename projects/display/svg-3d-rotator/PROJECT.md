# Project: SVG 3D Rotator

**Slug:** `svg-3d-rotator`  
**Category:** display  
**Status:** building  
**Created:** 2026-06-30

## Design reference

- Figma: none
- Other: Twitch Rivals casual quest logo — thick matte extruded SVG rotating in gradient card

## Brief

### User / trigger
Portfolio and marketing sites showcasing brand logos as sculpture-like 3D displays.

### Job
Transform any SVG into a convincing pseudo-3D extruded object with continuous rotation, premium lighting, and full prop customization.

### Desired outcome
Side view reads as thin slice; front view reveals full logo. Feels heavy, slow, museum-quality — not a spinner.

## States

- [x] default — auto-rotate
- [x] hover — speed boost, glow, scale (when enabled)
- [x] paused — autoRotate false
- [x] prefers-reduced-motion — static front-facing pose

## Acceptance criteria

- [ ] Demo route `/demos/svg-3d-rotator` renders placeholder logo
- [ ] `npm run lint` and `npm run build` pass
- [ ] Extrusion visible at oblique angles
- [ ] Component exported from `index.ts`
