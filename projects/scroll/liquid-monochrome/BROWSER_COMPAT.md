# Browser Compatibility

## Supported

| Browser | Min version | Notes |
| --- | --- | --- |
| Chrome | 90+ | Full support |
| Safari | 15.4+ | `-webkit-clip-path` included |
| Firefox | 90+ | Full support |
| Edge | 90+ | Chromium-based |

## Features used

| Feature | Fallback |
| --- | --- |
| `clip-path: polygon()` | Required — no IE support |
| SVG `feColorMatrix` | Static grayscale via CSS `filter: grayscale(1)` if needed |
| GSAP ScrollTrigger | Intersection-based static progress |
| `ResizeObserver` | Window resize listener |

## Reduced motion

All major browsers support `prefers-reduced-motion` media query.

## Touch scrolling

Native touch scroll drives ScrollTrigger identically to wheel/trackpad.

## Known limitations

- Very old Safari (&lt;15.4): clip-path on overflow hidden may clip incorrectly
- Duplicate children: interactive state only on color layer (by design)
- Heavy nested video: consider wrapping static poster images instead
