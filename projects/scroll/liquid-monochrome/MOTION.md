# Motion Documentation

## Interaction model

**Mode:** Scroll-scrubbed, pinned section (Implement + Harden)

The user scrolls; the section pins; scroll delta drives reveal progress. On completion, pin releases and normal scroll resumes. Scrolling up reverses the liquid front with identical noise field (phase derived from scroll position).

## Principles applied

| Principle | Implementation |
| --- | --- |
| No autoplay | `scrub: true`, no `duration` tweens |
| No cheap easing | `ease: none` implicit in scrub |
| Premium feel | FBM turbulence, multi-octave edge |
| Reversible | Progress = f(scroll), bijective |
| Cinematic | Luminance mono, soft viscosity |

## Edge behavior

- Primary FBM at 55% weight — large rolling waves
- Secondary at 30% — medium turbulence
- Tertiary at 15% — fine grain
- Phase shifts with scroll (`progress * 4π + scroll * 0.002`) for subtle edge life

## Reduced motion

When `prefers-reduced-motion: reduce`:

- Pin disabled
- Scrub disabled
- Progress snaps: 0 below 50% scroll, 1 above

## Rule references

- MIL-SCROLL-01: Scroll-driven effects must scrub, not autoplay
- MIL-A11Y-02: Honor `prefers-reduced-motion`
