# Local notes — Pixel Info Card

## Status

**Implement complete** (2026-08-10). Demo at `/demos/pixel-info-card`.

## Motion polish — collapse reassemble (2026-08-12)

Pixels vanish into the origin (no intermediate blob). Then the DOM squircle
eases in from that same point (`scale` 0.22→1) as if coming into the page.

- Piecewise timeline: vanish completes at `collapseT` 0.7; last 42% wall-clock is squircle enter
- Canvas does not draw a solid plate on close
- Particle footprints shrink toward a vanishing point, then fade
- Icon/label lag the plate slightly (`SQUIRCLE_CHROME_REVEAL_AT`)

## Grilling summary

- Portable `PixelInfoCard` + Blobby demo (blue sliders, Reset, Export)
- Dark/light via `theme` prop + sun/moon top-right in demo
- Maser blue `#10a4ff` accents in dark only; light uses white on black surfaces
- 64px squircle; label `Info`; centered card; canvas overlay + DOM plate
- Mid-flight retarget with ease-out cubic; focus card ↔ trigger
- Demo body: fixed TypeScript explainer paragraph

## Shipped

1. `lab/src/components/projects/display/pixel-info-card/`
2. `demoRegistry` + registry `building`
3. Canvas snake assemble/dissolve + state machine
4. Theme toggle, Export drawer, Reset, blue sliders
5. Lint (project) + build pass; rendered verification PASS
