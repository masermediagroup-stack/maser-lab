# Liquid Monochrome

Scroll-pinned, scrub-driven liquid ink reveal that converts any React children to premium luminance grayscale with an animated liquid mask boundary.

## Quick start

```tsx
import { LiquidMonochrome } from "@/components/projects/scroll/liquid-monochrome";

<LiquidMonochrome pin scrub pinDuration={1.25}>
  <YourHeroOrImage />
</LiquidMonochrome>
```

```tsx
<LiquidMonochrome lockPosition={50} liquidShader>
  <YourHeroOrImage />
</LiquidMonochrome>
```

## Demo

`/demos/liquid-monochrome`

## Documentation

- [API](./API.md)
- [Implementation guide](./IMPLEMENTATION.md)
- [Motion notes](./MOTION.md)
- [Performance](./PERFORMANCE.md)
- [Browser compatibility](./BROWSER_COMPAT.md)
- [Future enhancements](./FUTURE.md)

## Stack

| Layer | Technology |
| --- | --- |
| Scroll pin/scrub | GSAP ScrollTrigger |
| Grayscale | SVG `feColorMatrix` (BT.709) |
| Liquid edge | Sine wave to `clip-path` polygon |
| Liquid boundary | Sine-wave clip-path driven by the same hidden SVG geometry |
| Framework | React 19 / Next.js 16 |

## Research summary

Evaluated GSAP ScrollTrigger, Framer `useScroll`, CSS scroll-driven animations, WebGL shaders, and SVG turbulence filters. **Chosen stack:** GSAP pin/scrub + dual DOM layers + SVG luminance filter + sine-wave clip-path + hidden SVG geometry path. The visible effect is the moving monochrome boundary itself, with no white stroke.
