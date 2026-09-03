# Project: Heatmap

**Slug:** `heatmap-poster`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-03

## Design reference

- Figma: none
- Other: Paper heatmap field (image-as-shape, contour + two blurs, intensity wave). Not the rainbow LUT. Not `@paper-design/shaders-react`.
- Design spec: `design.md` in this folder (canonical primitives, copy, refusals)

## Brief

### User / trigger
A designer in maser-lab uploads a photo or a logo and reads the public preview.

### Job
A poster where heat follows the silhouette shape. Inner/outer glow and contour push a wave through the mark. If a photo of a person is treated as a person (depth, mass, shadows-as-hot), it failed.

### Current behavior
Poster chrome and IR ramp are locked. Field was subject-mass / depth. This pass swaps the field.

### Desired outcome
Upload → silhouette (logo ink, or photo ink-on-Ground) → Paper RGB pack once → vgpu wave through our three IR stops. Knobs stay in the rail.

### Success signal
A logo heats as the mark. A photo heats as a silhouette stamp, not as clothes and shadows. No spinner. Reading always resolves. Poster does not move.

### Non-goals
Dallas meetup. Cafe orange. Paper rainbow. Generated-face hero. Drag-and-drop slop. A fourth color stop. Knobs on the poster. Contour/glow knobs. Depth Anything. Subject-mass. `@paper-design/shaders-react`. Geist.

## States

- [ ] empty (no image)
- [ ] reading (silhouette + pack, in-flight only)
- [ ] field heat (vgpu, or Canvas 2D if the adapter fails) — silent fallback
- [ ] pack / GPU error — poster still renders Ground; no status line
- [ ] file error
- [ ] too big
- [ ] 9:16 / A4
- [ ] Heat / Mid / Ground / Speed / Wave
- [ ] prefers-reduced-motion (wave holds)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | vgpu WGSL + CSS overlay | GPU field; labels stay CSS |
| Duration | wave is continuous | Speed / Wave already drive it |
| Easing | Paper heat + traveling band | Shape field, not a mask swap |

## Three.js / 3D (optional)

Skip. vgpu WebGPU, not Three.js. Canvas 2D fallback if `init()` fails. Never lock the heat canvas to 2D before trying vgpu.

## Acceptance criteria

- [ ] Demo route `/demos/heatmap-poster` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] `prefers-reduced-motion` holds the wave
- [ ] Component exported from `lab/src/components/projects/display/heatmap-poster/index.ts`
- [ ] Tokens named only in `design.md`

## Open decisions

None that block the look. Contour / innerGlow / outerGlow are locked at 0.5 — not knobs.

## Accepted decisions

See `design.md`. Steal Paper’s field, keep our poster and IR ramp. Subject-read is off.
