# Project: Blobby Rotation Loader

**Slug:** `blobby-rotation-loader`  
**Category:** feedback  
**Status:** building  
**Created:** 2026-06-30

## Design reference

- Figma: none
- Other: Mobile Maser-Lab screenshots — rotating superellipse arc with blur and chromatic aberration
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Designers and developers tuning a decorative loading indicator; viewed during wait states or in Maser-Lab.

### Job
Communicate ongoing activity through a morphable, rotating blob shape. Bottom sliders let users explore blur, corner roundness, superellipse power, and chromatic aberration intensity.

### Current behavior
Greenfield — no loader in lab feedback category.

### Desired outcome
Silhouettes match reference frames at default and extreme slider values. Controls feel like the reference app (yellow tracks, white thumbs, black field).

### Success signal
Three calibration presets visually align with reference screenshots. Sliders update the canvas live without jank.

### Non-goals
WebGL shader port, localStorage persistence, Figma sync.

## States

- [x] default — rotating loader with default params
- [ ] hover (pointer fine only) — N/A for loader canvas
- [x] focus — slider focus rings
- [ ] active / pressed — slider drag
- [x] loading — continuous rotation (primary state)
- [ ] success
- [ ] error
- [ ] disabled — paused prop
- [x] prefers-reduced-motion — freeze or ultra-slow rotation

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + rAF | Real-time param morphing; no new deps |
| Duration | Continuous ~2s/rev | Decorative loader exception to ui-duration-cap |
| Easing | Linear rotation | Steady indeterminate progress feel |

## Acceptance criteria

- [ ] Demo route `/demos/blobby-rotation-loader` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified in browser
- [ ] Component exported from `lab/src/components/projects/feedback/blobby-rotation-loader/index.ts`

## Open decisions

- Color controls exposed as optional collapsible panel in demo (v1.1 UI, v1 API hooks)
