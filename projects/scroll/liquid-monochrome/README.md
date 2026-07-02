# Liquid Monochrome

Scroll-pinned, scrub-driven liquid ink reveal that converts any React children to premium luminance grayscale.

## Quick start

```tsx
import { LiquidMonochrome } from "@/components/projects/scroll/liquid-monochrome";

<LiquidMonochrome pin scrub pinDuration={1.25}>
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
| Liquid edge | FBM noise → `clip-path` polygon |
| Framework | React 19 / Next.js 16 |

## Research summary

Evaluated GSAP ScrollTrigger, Framer `useScroll`, CSS scroll-driven animations, WebGL shaders, and SVG turbulence filters. **Chosen stack:** GSAP pin/scrub + dual DOM layers + SVG luminance filter + FBM clip-path — best balance of quality, reusability with arbitrary children, and performance without WebGL dependency.
