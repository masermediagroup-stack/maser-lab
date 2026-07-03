# Implementation Guide

## Architecture

```text
LiquidMonochrome (trigger)
`-- stage (pinned by ScrollTrigger)
    |-- colorLayer - full-color children
    |-- monoLayer - duplicate children + luminance filter + clip-path
    `-- waterlineLayer - transparent SVG path generated from the same edge points
```

## Scroll Binding

`useLiquidScroll` creates a GSAP `ScrollTrigger` with:

- `pin: stage` when `pin` is true
- `scrub: 0.45` for smooth scroll coupling
- `start: center {lockPosition}%` unless an explicit `start` override is provided
- `end: +={pinDuration * speed + overscroll}vh`
- `revertOnUpdate: true` so the viewport lock slider rebuilds pin geometry when it changes

Progress `0 -> 1` maps directly to the clipped monochrome fill. There is no autoplay reveal timeline; the only continuous animation is the small boundary phase drift while the fill is partially visible.

## Grayscale

SVG filter with ITU-R BT.709 luminance weights:

```text
R' = G' = B' = 0.2126*R + 0.7152*G + 0.0722*B
```

This preserves perceptual contrast better than plain `grayscale(1)`.

## Waterline Edge

`buildLiquidClipPath()` now samples smooth sine waves along the reveal front:

1. Base fill line from scroll progress
2. Two low-frequency sine waves for water-like motion
3. Polygon clip from edge corners through the wave samples

The boundary is intentionally not FBM/noise-driven, because that reads as smoke.

## Hidden SVG Geometry

`buildLiquidEdgePath()` returns an SVG path from the same wave points used by `buildLiquidClipPath()`. `LiquidMonochrome` draws that path as a stage-level SVG sibling above the clipped monochrome layer.

The path is transparent. It does not draw a visible white stroke, interior fog, particles, bubbles, smoke, dots, or veins.

While the user is stationary on a partial reveal, `LiquidMonochrome` advances the shared wave phase with `requestAnimationFrame()` and reapplies both the clip polygon and SVG path. That keeps the real monochrome boundary moving like a liquid surface instead of sliding a separate decoration over a static mask.

## Performance Notes

- `will-change: clip-path` on mono layer
- `contain: layout paint style` on stage
- `ResizeObserver` for dimension sync
- Idle boundary frames only update when progress is between hidden and complete
- No canvas or WebGL work

## Porting

1. Copy `lab/src/components/projects/scroll/liquid-monochrome/`.
2. Install `gsap` and `@gsap/react`.
3. Wrap any content with `<LiquidMonochrome>`.
4. Use `lockPosition` to place the pinned element at the desired viewport line.
