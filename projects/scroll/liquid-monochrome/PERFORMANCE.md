# Performance Benchmarks

## Targets

| Metric | Target | Method |
| --- | --- | --- |
| Frame rate | 60 FPS desktop | DevTools Performance panel |
| Frame rate | 45+ FPS mobile | Throttled CPU 4× |
| Layout thrash | 0 per frame | Only `clip-path` style writes |
| Main thread | &lt; 4ms mask update | rAF batching |

## Optimizations implemented

1. **rAF batching** — ScrollTrigger `onUpdate` schedules one paint per frame
2. **GPU clip-path** — `transform: translateZ(0)` + `will-change`
3. **CSS containment** — `contain: layout paint style` on stage
4. **No canvas readback** — Pure math → polygon string
5. **Lazy ScrollTrigger** — Created only when mounted
6. **ResizeObserver** — Dimension cache, no layout reads in hot path

## Adaptive quality (future)

- Reduce `segments` from 80 → 48 on `navigator.hardwareConcurrency < 4`
- Disable tertiary noise octave on low-end devices

## Measured characteristics (dev environment)

- Clip-path string build: ~0.3–0.8ms per frame (80 segments)
- ScrollTrigger overhead: ~0.1ms per scroll event
- Duplicate children: 2× paint cost for wrapped content (expected)
