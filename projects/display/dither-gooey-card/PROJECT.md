# Project: Dither Gooey Card

**Slug:** `dither-gooey-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-08-13

## Design reference

- Figma: none
- Other: [liquid-gooey](https://www.npmjs.com/package/liquid-gooey) (Jakub Antalik) + Maser Dither Engine radial-pulse
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
A visitor on a marketing or product page who wants optional detail without leaving the card. Trigger is occasional (once per card).

### Job
Reveal more copy by pulling a thin grey card down; hide it by pressing the bottom. The surface should read as printed dither that turns liquid while it stretches.

### Current behavior
Greenfield. Dither engine ships as `@maser/dither-engine`. Gooey morph ships as `liquid-gooey`. They have not been composed.

### Desired outcome
A horizontal shadcn Card: heading **Learn More**, chevron, and **pull for more info**. Pull or tap-hold-and-drag opens a gooey drawer. Dither radial-pulse radiates from the type to the card edges and dissolves. Optional accent color. Press the bottom to collapse.

### Success signal
Pointer-down tracking is 1:1 (`rule/direct-manipulation-continuity`). Release is velocity-aware. Gooey is visible during drag/open, not a blurry idle filter. Text stays crisp. Reduced motion snaps height and pauses the pulse.

### Non-goals
- Not a page-level sheet, modal, or nav
- No engine shader forks or extra WebGL programs
- No second live canvas (one `SurfaceCanvas` per card)
- Not Transfer-ready on first ship (`status: building`)

## States

- [ ] default (collapsed)
- [ ] hover (pointer fine only)
- [ ] focus (keyboard on pull handle)
- [ ] active / dragging
- [ ] open
- [ ] prefers-reduced-motion
- [ ] accent color (demo control)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | `liquid-gooey` + Framer Motion springs + dither `radial-pulse` | Gooey morph on height; interruptible spring for gesture; engine pulse for print |
| Duration | Gesture is 1:1; settle ~280–400ms spring | Occasional disclosure; settle can carry light bounce from the pull |
| Easing | Spring stiffness ~380 / damping ~32; gooey bounce 0.42 | `rule/velocity-aware-gestures`; bounce only when the gesture had momentum |

## Three.js / 3D (optional)

Skip. Uses the existing WebGL2 dither pipeline via `@maser/dither-engine`, not Three.js.

| Field | Value |
| --- | --- |
| Target type | Shared dither surface inside a card |
| Renderer | WebGL2 (`SurfaceCanvas`) with Canvas2D fallback |
| Decorative? | yes — copy remains readable if the canvas fails |
| Fallback | Engine Canvas2D path |
| Mobile strategy | full, one context |
| Reduced motion | snap height; pause pulse |
| Research docs checked | liquid-gooey README; dither `radial-pulse` catalog |
| CloudAI-X skills used | none |

## Acceptance criteria

- [ ] Demo route `/demos/dither-gooey-card` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Pull-down (or tap-hold-and-drag) opens; press/click the bottom closes
- [ ] Keyboard: Enter/Space on the handle toggles
- [ ] Dither is black-and-white by default; demo can add an accent color
- [ ] Pulse expands from the heading toward the card edges and repeats
- [ ] Gooey morph is active while pulling / settling, not as an idle blur on type
- [ ] `prefers-reduced-motion` verified (demo toggle + OS)
- [ ] Component exported from `lab/src/components/projects/display/dither-gooey-card/index.ts`
- [ ] Product imports dither via `@maser/dither-engine` (no cross-slug import)

## Open decisions

- Expanded body copy is lab placeholder until a real host supplies children.
- Accent color is a demo control, not a persisted user preference.

## Accepted decisions

- Consume the engine through `@maser/dither-engine` so `rule/project-isolation` holds.
- One live `SurfaceCanvas` per card (engine context budget).
- shadcn `Card` is the content structure; `liquid-gooey` `Liquid.fill` is the grey surface.
