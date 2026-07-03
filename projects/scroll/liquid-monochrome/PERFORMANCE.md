# Performance Benchmarks

## Targets

| Metric | Target | Method |
| --- | --- | --- |
| Frame rate | 60 FPS desktop | DevTools Performance panel |
| Frame rate | 45+ FPS mobile | Throttled CPU 4x |
| Layout thrash | 0 per frame | Mask style writes plus SVG path attributes |
| Main thread | < 4ms mask update | rAF batching |

## Optimizations implemented

1. **rAF batching** - ScrollTrigger `onUpdate` schedules one mask paint per frame
2. **GPU clip-path** - `transform: translateZ(0)` + `will-change`
3. **CSS containment** - `contain: layout paint style` on stage
4. **Shared geometry** - Clip-path and SVG waterline use the same wave points
5. **No canvas/WebGL work** - The crest is SVG, so there is no renderer loop to dispose
6. **ResizeObserver** - Dimension cache stays synced to component bounds

## Adaptive quality (future)

- Reduce clip segments from 80 to 48 on `navigator.hardwareConcurrency < 4`
- Reduce SVG path segments on low-end devices
- Add an image-only shader texture mode for media where arbitrary DOM support is not needed

## Measured characteristics (dev environment)

- Clip-path string build: ~0.3-0.8ms per frame (80 segments)
- ScrollTrigger overhead: ~0.1ms per scroll event
- Duplicate children: 2x paint cost for wrapped content (expected)
- Waterline overlay: one SVG path per active wrapped element
