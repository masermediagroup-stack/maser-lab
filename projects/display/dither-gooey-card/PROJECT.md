# Project: Dither Gooey Card

**Slug:** `dither-gooey-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-08-13

## Design reference

- Figma: none
- Other: [liquid-gooey](https://www.npmjs.com/package/liquid-gooey) (Jakub Antalik)
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
A visitor on a marketing or product page who wants optional detail without leaving the card. Trigger is occasional (once per card).

### Job
Reveal more copy by pulling a thin card down; hide it with the same arrow. The surface should read as a solid card that stretches on the compositor.

### Current behavior
Greenfield drawer using `liquid-gooey`. Dither engine was removed so motion and layout can be tuned in isolation.

### Desired outcome
A horizontal shadcn Card: heading **Learn More**, with a chevron on the card fill as the only pull affordance. A gooey bulge is part of the fill silhouette (not a second disc). Grab the arrow to open or close. Host can set card background and text color. Stretch cannot go below the collapsed fill. Fullscreen preview uses the viewport edges.

### Success signal
Pointer-down tracking is 1:1 (`rule/direct-manipulation-continuity`). Release is velocity-aware. Stretch is GPU `scaleY` on a **static** gooey silhouette (`rule/gpu-properties-only`) so the pull stays at 60fps — the SVG filter is not remeasured per frame. Text and the chevron sit unfiltered on the fill. Height cannot go below collapsed. Reduced motion snaps and drops the gooey blobs.

### Non-goals
- Not a page-level sheet, modal, or nav
- No dither / WebGL surface in this slug
- Not Transfer-ready on first ship (`status: building`)

## States

- [ ] default (collapsed)
- [ ] hover (pointer fine only)
- [ ] focus (keyboard on drip / arrow)
- [ ] active / dragging
- [ ] open
- [ ] prefers-reduced-motion
- [ ] background + text color (demo control)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Framer Motion springs + GPU `scaleY` / `translateY` | SVG gooey filters were measuring every frame (~15fps on mobile). Compositor transforms stay 1:1 with the pointer |
| Duration | Gesture is 1:1; settle ~280–400ms spring | Occasional disclosure; settle can carry light bounce from the pull |
| Easing | Spring stiffness ~380 / damping ~32 | `rule/velocity-aware-gestures`; bounce only when the gesture had momentum |
| Min size | Hard clamp at collapsed height | Fill never pulls off the heading |
| Gooey | Static SVG blur/contrast on fill blobs; GPU `scaleY` the filtered bitmap | Filter stays cached; extra blobs merge into the card instead of a second button disc |
| Arrow | Transparent hit target + chevron on the fill | No circular handle on top of the card; chevron flips with open progress |

## Three.js / 3D (optional)

Skip. Solid CSS fill on a static gooey silhouette. No canvas.

## Acceptance criteria

- [ ] Demo route `/demos/dither-gooey-card` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Pull-down starts only from the arrow hit area
- [ ] Arrow is the only close control (no “press to close” footer); drag cannot shrink below collapsed height
- [ ] Keyboard: Enter/Space on the arrow toggles
- [ ] Chevron sits on the card fill (no second circle); flips on open; travels with the bottom edge
- [ ] No dither canvas or `@maser/dither-engine` import in this slug
- [ ] Demo can change card background and text color
- [ ] Pull-hint copy is absent; on-card chevron is the affordance
- [ ] Stretch uses compositor transforms; gooey filter is static (no per-frame SVG measurement)
- [ ] Demo Fullscreen / focus mode is edge-to-edge on mobile and lets pull without scrolling the page
- [ ] `prefers-reduced-motion` verified (demo toggle + OS)
- [ ] Component exported from `lab/src/components/projects/display/dither-gooey-card/index.ts`

## Open decisions

- Expanded body copy is lab placeholder until a real host supplies children.
- Colors are a demo / host control, not a persisted user preference.
- Slug remains `dither-gooey-card` even though the engine is no longer in this component.

## Accepted decisions

- shadcn `Card` is the content structure; CSS `--dgc-fill` is the colored surface.
- On-card chevron is the only affordance (no footer close copy, no second handle disc).
- Stretch uses compositor `scaleY` on a static gooey fill (counter-scaled content so type does not squash).
- Pull gesture is arrow-only; collapsed height is a hard floor.
- Demo Fullscreen is lab chrome (`fillViewport`); not required of product hosts.
