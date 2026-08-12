# Local notes — Pixel Info Card

## Status

**Implement complete** (2026-08-10). Demo at `/demos/pixel-info-card`.

## Motion polish — collapse reassemble (2026-08-12)

Pixels reassemble into nothing at the origin (no mini-squircle blob). After a
short empty beat, the DOM squircle comes toward the viewer from that same
point (`perspective` + `translateZ` + scale 0.06→1, ease-in-out).

- Merge shrinks footprints to 0 while still spread; alpha fades on arrival so
  stacked dots cannot form a solid plate
- Rest beat: vanish ends at `collapseT` 0.40; squircle starts at 0.42
- Last 58% wall-clock is squircle enter (first segment is linear so merge
  is not rushed into a blob + long black pause)
- Icon/label lag the plate (`SQUIRCLE_CHROME_REVEAL_AT`)

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
