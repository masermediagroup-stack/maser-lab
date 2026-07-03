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
Create a premium, scroll-scrubbed liquid ink reveal that converts content to cinematic monochrome — pinned until complete, fully reversible.

### Current behavior
Greenfield — no prior implementation.

### Desired outcome
Organic turbulent liquid edge rising over content; luminance-based grayscale; 60fps; reusable `<LiquidMonochrome>` wrapper.

### Success signal
- Section pins on enter
- Scroll scrubs reveal 0→100% with no autoplay
- Reverse scroll restores color identically
- Reduced motion: instant state change, no pin

### Non-goals
- WebGL shader path (future enhancement)
- Lenis integration (optional future)
- Autoplay or timeline playback

## States

- [x] default (scroll scrub)
- [ ] hover (N/A — scroll-driven)
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
| Liquid edge | FBM noise + clip-path polygon | GPU-friendly, works with any children |
| Duration | Scroll-linked | User controls pace |

## Acceptance criteria

- [x] Demo route `/demos/liquid-monochrome` renders hero, image, cards, full-width
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: scroll pin, scrub, reverse verified in browser
- [ ] `prefers-reduced-motion` verified
- [x] Component exported from `lab/src/components/projects/scroll/liquid-monochrome/index.ts`

## Open decisions

- WebGL shader variant for even higher fidelity edges (documented in FUTURE.md)
