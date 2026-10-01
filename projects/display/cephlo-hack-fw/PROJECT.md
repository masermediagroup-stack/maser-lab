# Project: Cephlo Hack FW

**Slug:** `cephlo-hack-fw`
**Category:** display
**Status:** building
**Created:** 2026-10-01

## Design reference

- Figma: none
- Logo: white Cephlo lockup (octopus + wordmark), black plate removed
- Ground: vertical blue wash sampled from the supplied gradient — `#3369FF` at the top to `#2A10D6` at the bottom
- Structure: duplicate of `dallas-meetup-tv-wallpaper` (1920×1080 TV stage, silk motion, lab controls)

## Brief

### User / trigger
Wall-TV / laptop preview for Cephlo Hack FW. Ambient loop. Edited in the lab dock.

### Job
Hold a branded blue field with the Cephlo mark, editable headline and up-next line, and a dither control.

### Desired outcome
Same stage behavior as the Dallas wallpaper, recolored and re-marked. Present is the first control. Headline and up next are the next controls. Dither slider sits directly above Noise and drives an ordered Bayer effect on the gradient.

### Success signal
- `/demos/cephlo-hack-fw` shows the Cephlo lockup centered on a blue moving gradient (not the grey Dallas field, not the three-logo carousel).
- Present is the first control in the dock. Headline and Up next are the next fields.
- Dither slider is immediately above Noise. Raising dither posterizes the blue field with a Bayer pattern. Zero dither returns a smooth wash.
- Reduced motion freezes the field and keeps the logo and type.

### Non-goals
- Do not edit `dallas-meetup-tv-wallpaper`.
- No mobile 320 layout. Wall TV + laptop/desktop only.
- No second logo carousel.

### Open decisions
- Noise is the Dallas film-grain control, relabeled. Dither is a new uniform (`uDither`), default `1` (slider 0–2.5; values above 1 use coarser Bayer levels).
- One static Cephlo lockup replaces the Grok / SpaceX / Cursor carousel.

## States

- [x] default
- [x] prefers-reduced-motion
- [x] play / pause
- [x] replay from t=0
- [x] frame-step and scrub
- [x] presentation fullscreen
- [x] export capture
- [x] dither 0–2.5 above noise (default 1)

## Acceptance criteria

- [ ] Demo route `/demos/cephlo-hack-fw` renders the Cephlo wallpaper
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Present, then headline / up next, are the first two editor groups
- [ ] Dither control is directly above Noise and changes the live field
- [ ] Ground uses `#3369FF` → `#2A10D6`
- [ ] Product exports from `lab/src/components/projects/display/cephlo-hack-fw/index.ts`
