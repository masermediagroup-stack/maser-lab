# Future Enhancements

## High fidelity

- [x] **Aligned hidden SVG geometry** - transparent path shares the same geometry as the clip mask
- [ ] **Image-only WebGL texture mode** - shader on textured plane for media-only usage
- [ ] **React Three Fiber variant** - consider only if future scenes need R3F composition
- [ ] **Displacement map** - pre-baked turbulence texture for lower CPU
- [ ] **DOM capture mode** - optional, heavier rasterization path for arbitrary children if true texture-space distortion becomes required

## Scroll integration

- [ ] **Lenis smooth scroll** - sync ScrollTrigger with Lenis instance
- [ ] **CSS scroll-timeline** - progressive enhancement path without GSAP

## Quality of life

- [ ] **`useLiquidMonochrome` hook** - headless progress for custom renders
- [ ] **Adaptive segments** - auto-reduce polygon count on mobile
- [ ] **Single-child mode** - `mode="image"` avoids duplicate DOM for `<img>` only
- [ ] **Shader fallback detection** - feature test + graceful degrade

## Creative

- [ ] Duotone output (mono + accent channel)
- [ ] Custom luminance weights (e.g. Kodak Tri-X curve)
- [ ] Radial/circular reveal directions
- [ ] Multi-stop reveal (pause points in timeline)
