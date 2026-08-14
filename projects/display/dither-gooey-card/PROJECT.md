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
A horizontal shadcn Card: heading **Learn More**, with a centered drip and chevron as the only pull affordance. The droplet is part of the card and travels with the opening edge. Grab the arrow to open or close. Host can set card background and text color. Stretch cannot go below the collapsed fill.

### Success signal
Pointer-down tracking is 1:1 (`rule/direct-manipulation-continuity`). Release is velocity-aware. Stretch is GPU `scaleY` + drip `translateY` (`rule/gpu-properties-only`) so the pull stays at 60fps. Text stays on the fill — height cannot go below collapsed. Reduced motion snaps.

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
| Drip | GPU `translateY` on the visual bottom edge | Droplet is part of the card and travels with open/close; chevron flips in the droplet |

## Three.js / 3D (optional)

Skip. Solid CSS fill on the shell and drip. No canvas.

## Acceptance criteria

- [ ] Demo route `/demos/dither-gooey-card` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Pull-down starts only from the arrow/droplet hit area
- [ ] Arrow is the only close control (no “press to close” footer); drag cannot shrink below collapsed height
- [ ] Keyboard: Enter/Space on the drip toggles
- [ ] Drip stays horizontally centered and travels with the card’s bottom edge; chevron flips on open
- [ ] No dither canvas or `@maser/dither-engine` import in this slug
- [ ] Demo can change card background and text color
- [ ] Pull-hint copy is absent; drip + chevron is the affordance
- [ ] Stretch uses compositor transforms (no per-frame SVG filter measurement)
- [ ] Demo Fullscreen / focus mode lets mobile pull without scrolling the page
- [ ] `prefers-reduced-motion` verified (demo toggle + OS)
- [ ] Component exported from `lab/src/components/projects/display/dither-gooey-card/index.ts`

## Open decisions

- Expanded body copy is lab placeholder until a real host supplies children.
- Colors are a demo / host control, not a persisted user preference.
- Slug remains `dither-gooey-card` even though the engine is no longer in this component.

## Accepted decisions

- shadcn `Card` is the content structure; CSS `--dgc-fill` is the colored surface.
- Center drip with chevron is the only affordance (no footer close copy).
- Stretch uses compositor `scaleY` (counter-scaled content so type does not squash); the drip uses `translateY` so it rides the opening edge.
- Pull gesture is drip-only; collapsed height is a hard floor.
- Demo Fullscreen is lab chrome, not a product prop.
