# Project: Liquid Monochrome Reveal

**Slug:** `liquid-monochrome`  
**Category:** scroll  
**Status:** building  
**Created:** 2026-06-30

## Design reference

- Figma: none
- Reference: Apple product pages, Linear, Vercel, Stripe scroll interactions
- Design spec: N/A

## Brief

### User / trigger
Visitors scrolling through hero, image, card, or feature sections on marketing/product pages.

### Job
Create a premium, scroll-scrubbed liquid ink reveal that converts content to cinematic monochrome - pinned until complete, fully reversible.

### Current behavior
Greenfield - no prior implementation.

### Desired outcome
Smooth liquid mask rising over content; luminance-based grayscale; no visible stroke or smoke; 60fps; reusable `<LiquidMonochrome>` wrapper.

### Success signal
- Section pins on enter
- Scroll scrubs reveal 0->100% with no autoplay
- Reverse scroll restores color identically
- Reduced motion: instant state change, no pin

### Non-goals
- Full DOM-to-texture rasterization.
- Lenis integration (optional future)
- Autoplay or timeline playback

## States

- [x] default (scroll scrub)
- [ ] hover (N/A - scroll-driven)
- [ ] focus (children retain focus)
- [ ] active / pressed
- [ ] loading
- [ ] success
- [ ] error
- [ ] disabled (`disabled` prop)
- [x] prefers-reduced-motion (snap, no pin)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | GSAP ScrollTrigger | Industry standard for pin + scrub |
| Grayscale | SVG feColorMatrix BT.709 | Perceptual luminance, not desaturate |
| Liquid edge | Sine wave + clip-path polygon | Actual DOM mask, works with any children |
| Liquid formation | Transparent SVG path from shared edge geometry | Keeps the animated mask boundary liquid without a visible white stroke, dots, smoke, or offset |
| Lock line | `center {lockPosition}%` | Slider-controllable pin line from top to bottom of viewport |
| Duration | Scroll-linked | User controls pace |

## Acceptance criteria

- [x] Demo route `/demos/liquid-monochrome` renders hero, image, cards, full-width
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: scroll pin, scrub, reverse verified in browser
- [ ] `prefers-reduced-motion` verified
- [ ] Lock-position slider verified at top, center, and bottom viewport lines
- [ ] Transparent SVG geometry stays aligned with the monochrome boundary
- [x] Component exported from `lab/src/components/projects/scroll/liquid-monochrome/index.ts`

## Open decisions

- Image-only shader texture mode remains optional future work for higher fidelity rasterized media.
