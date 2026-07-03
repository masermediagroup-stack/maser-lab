# Implementation Guide

## Architecture

```
LiquidMonochrome (trigger)
└── stage (pinned by ScrollTrigger)
    ├── colorLayer — full-color children
    └── monoLayer — duplicate children + luminance filter + clip-path
```

## Scroll binding

`useLiquidScroll` creates a GSAP `ScrollTrigger` with:

- `pin: stage` when `pin` is true
- `scrub: 0.45` for smooth scroll coupling (no easing curve on animation)
- `end: +={pinDuration * speed + overscroll}vh`

Progress 0→1 maps directly to clip-path fill. **No timeline playback.**

## Grayscale

SVG filter with ITU-R BT.709 luminance matrix:

```
R' = G' = B' = 0.2126·R + 0.7152·G + 0.0722·B
```

This preserves perceptual contrast vs `saturate(0)` or `grayscale(1)`.

## Liquid edge

`buildLiquidClipPath()` samples FBM noise along the reveal front:

1. Base fill line from scroll progress
2. Three octaves of noise at varying scales
3. Polygon clip from edge corners through noisy samples

Updates batched via `requestAnimationFrame` in `onUpdate`.

## Performance notes

- `will-change: clip-path` on mono layer
- `contain: layout paint style` on stage
- `ResizeObserver` for dimension sync
- No `toDataURL` or canvas readback per frame

## Porting to another project

1. Copy `lab/src/components/projects/scroll/liquid-monochrome/` folder
2. Install `gsap` and `@gsap/react`
3. Call `gsap.registerPlugin(ScrollTrigger)` once in app
4. Wrap any content with `<LiquidMonochrome>`

## Tradeoffs vs alternatives

| Approach | Pros | Cons |
| --- | --- | --- |
| **Chosen: clip-path + FBM** | Works with any DOM, GPU path | Duplicates children |
| WebGL shader | Best fluid sim | Hard to wrap arbitrary React trees |
| SVG feTurbulence mask | Native filter noise | Hard to scrub fill level precisely |
| CSS scroll-driven | No JS | No pin, limited noise control |
| Framer useScroll | React-native | Weaker pin/scrub than GSAP |
