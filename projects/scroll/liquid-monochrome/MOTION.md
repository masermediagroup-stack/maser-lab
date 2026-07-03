# Motion Documentation

## Interaction model

**Mode:** Scroll-scrubbed, pinned section (Implement + Harden)

The user scrolls; the section pins at the selected viewport lock line; scroll delta drives reveal progress. On completion, pin releases and normal scroll resumes. Scrolling up reverses the liquid front with the same wave field.

## Principles applied

| Principle | Implementation |
| --- | --- |
| No autoplay reveal | `scrub: true`, no `duration` tweens |
| No cheap easing | `ease: none` implicit in scrub |
| Premium feel | Smooth waterline waves, not smoke/noise |
| Liquid formation | Animated mask boundary with no visible stroke |
| Reversible | Progress = f(scroll), bijective |
| Cinematic | Luminance mono, soft viscosity |

## Edge behavior

- Primary sine wave provides the rolling waterline
- Secondary sine wave adds a smaller ripple
- Phase shifts with scroll and a small idle clock, so the boundary keeps moving while the user pauses
- Hidden SVG geometry uses the same edge points as the mask, so the tracked boundary stays aligned
- The idle phase updates the clip-path and hidden SVG path together; no white stroke is rendered

## Lock line

When `start` is not provided, `lockPosition` maps to `ScrollTrigger.start = center {lockPosition}%`:

- `0` pins when the element center reaches the top of the viewport
- `50` pins in the middle of the viewport
- `100` pins near the bottom of the viewport

## Reduced motion

When `prefers-reduced-motion: reduce`:

- Pin disabled
- Scrub disabled
- Progress snaps: 0 below 50% scroll, 1 above
- The boundary follows the snapped mask state and does not run idle animation

## Rule references

- MIL-SCROLL-01: Scroll-driven effects must scrub, not autoplay
- MIL-A11Y-02: Honor `prefers-reduced-motion`
