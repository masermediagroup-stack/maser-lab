# Local notes — Pixel Info Card

## Status

**Implement complete** (2026-08-10). Demo at `/demos/pixel-info-card`.

## Motion polish — collapse reassemble (2026-08-12)

Ending felt jerky when pixels reformed the squircle. Fixes:

- Squircle grow: `easeInOutCubic` → `easeOutQuint` (carry merge momentum, settle)
- Collapse machine easing: `easeInOutCubic` (avoid double ease-out crawl on final frames)
- Soft plate intro + longer swarm fade so pixels melt into the plate
- Continuous particle positions (no integer snap mid-flight); footprints swell on merge
- Timeline: expand starts earlier with soft overlap; DOM chrome reveals later (`SQUIRCLE_DOM_REVEAL_GROW` 0.58)

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
