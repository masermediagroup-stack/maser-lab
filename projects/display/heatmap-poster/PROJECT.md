# Project: Heatmap

**Slug:** `heatmap-poster`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-03

## Design reference

- Figma: none
- Other: Paper heatmap at vshaders.com (structure only — contour + two blurs). Not the LUT.
- Design spec: `design.md` in this folder (canonical primitives, copy, refusals)

## Brief

### User / trigger
A designer in maser-lab uploads a picture and reads the public preview.

### Job
A poster where heat follows the subject. Near mass is hot. If a photo of a person heats the shadows, it failed.

### Current behavior
Greenfield.

### Desired outcome
Upload → fallback heat immediately → depth swap on the mask only when the field is confident. Knobs stay in the rail.

### Success signal
Random photos heat the subject. Logos and line drawings stay on luma+edge. No spinner. Reading always resolves.

### Non-goals
Dallas meetup. Cafe orange. Paper rainbow. Generated-face hero. Drag-and-drop slop. A fourth color stop. Knobs on the poster.

## States

- [ ] empty (no image)
- [ ] reading (in-flight only)
- [ ] fallback heat (no-WebGPU or discarded depth) — silent
- [ ] depth heat (confident field) — mask cross-fade only
- [ ] model error — poster still renders; Rough read. Depth is off on this browser.
- [ ] file error
- [ ] too big
- [ ] 9:16 / A4
- [ ] Heat / Mid / Ground / Speed / Wave
- [ ] prefers-reduced-motion (wave holds; swap snaps)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | vgpu WGSL + CSS overlay | GPU field; labels stay CSS |
| Duration | mask mix ~180ms, no pre-delay | Settle the swap; do not hide it |
| Easing | mix() in the shader | Mask only |

## Three.js / 3D (optional)

Skip. vgpu WebGPU, not Three.js. Canvas 2D fallback if `init()` fails.

## Acceptance criteria

- [ ] Demo route `/demos/heatmap-poster` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] `prefers-reduced-motion` holds the wave
- [ ] Component exported from `lab/src/components/projects/display/heatmap-poster/index.ts`
- [ ] Tokens named only in `design.md`

## Open decisions

None that block the look. Depth variance gate value is an implementation constant (`DEPTH_VARIANCE_MIN`), chosen empirically — see the PR.

## Accepted decisions

See `design.md`. Elite Pixel Guy is the look source.
