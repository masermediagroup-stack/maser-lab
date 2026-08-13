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
Reveal more copy by pulling a thin card down; hide it by pressing the bottom. The surface should read as a solid card that turns liquid while it stretches.

### Current behavior
Greenfield drawer using `liquid-gooey`. Dither engine was removed so motion and layout can be tuned in isolation.

### Desired outcome
A horizontal shadcn Card: heading **Learn More**, with a centered gooey drip and chevron as the only pull affordance. Grab the arrow to open. Host can set card background and text color. Press the bottom to collapse. Stretch cannot go below the collapsed fill.

### Success signal
Pointer-down tracking is 1:1 (`rule/direct-manipulation-continuity`). Release is velocity-aware. Gooey is visible during drag/settle, not a blurry idle filter. Stretch is GPU `scaleY` (`rule/gpu-properties-only`). Text stays on the fill — height cannot go below collapsed. Reduced motion snaps.

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
| Library | `liquid-gooey` + Framer Motion springs | Gooey morph on GPU `scaleY`; interruptible spring for gesture |
| Duration | Gesture is 1:1; settle ~280–400ms spring | Occasional disclosure; settle can carry light bounce from the pull |
| Easing | Spring stiffness ~380 / damping ~32; gooey bounce 0.42 | `rule/velocity-aware-gestures`; bounce only when the gesture had momentum |
| Min size | Hard clamp at collapsed height | Fill never pulls off the heading |
| Drip | Fixed center Y; arrow rotates | Droplet does not travel to the open footer |

## Three.js / 3D (optional)

Skip. Solid CSS fill via `liquid-gooey` `Liquid.fill`. No canvas.

## Acceptance criteria

- [ ] Demo route `/demos/dither-gooey-card` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Pull-down starts only from the arrow/droplet hit area
- [ ] Press/click the bottom closes; drag cannot shrink below collapsed height
- [ ] Keyboard: Enter/Space on the drip toggles
- [ ] Drip stays centered; chevron flips on open without traveling to the footer
- [ ] No dither canvas or `@maser/dither-engine` import in this slug
- [ ] Demo can change card background and text color
- [ ] Pull-hint copy is absent; drip + chevron is the affordance
- [ ] Gooey morph is active while pulling / settling, not as an idle blur on type
- [ ] `prefers-reduced-motion` verified (demo toggle + OS)
- [ ] Component exported from `lab/src/components/projects/display/dither-gooey-card/index.ts`

## Open decisions

- Expanded body copy is lab placeholder until a real host supplies children.
- Colors are a demo / host control, not a persisted user preference.
- Slug remains `dither-gooey-card` even though the engine is no longer in this component.

## Accepted decisions

- shadcn `Card` is the content structure; `liquid-gooey` `Liquid.fill` is the colored surface.
- Center drip with chevron replaces “pull for more info” copy.
- Stretch uses compositor `scaleY` (counter-scaled content so type does not squash).
- Pull gesture is drip-only; collapsed height is a hard floor.
