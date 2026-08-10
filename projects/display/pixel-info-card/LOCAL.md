# Local notes — Pixel Info Card

## Status

**Grilling complete** (2026-08-10). `PROJECT.md` is implementation-ready. Say **Implement** to build.

## Grilling summary

- Portable `PixelInfoCard` + Blobby demo (blue sliders, Reset, Export)
- Dark/light via `theme` prop + sun/moon top-right in demo
- Maser blue `#10a4ff` accents in dark only; light uses white on black surfaces
- 64px squircle; label `Info`; centered card; canvas overlay + DOM plate
- Mid-flight retarget with ease-out cubic; focus card ↔ trigger
- Demo body: fixed TypeScript explainer paragraph

## Implement order

1. Scaffold `lab/.../display/pixel-info-card/`
2. `use-pixel-info-machine` + `pixel-assemble-canvas`
3. `pixel-info-card.tsx` (product, both themes)
4. Demo shell (Blobby + theme toggle + sliders + export drawer)
5. `demoRegistry` + registry `building`
6. Render verify: open/close, interrupt, themes, reduced-motion, 320/1280
