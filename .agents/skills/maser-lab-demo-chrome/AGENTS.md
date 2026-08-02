# maser-lab-demo-chrome — Governance

**Scope:** Demo shells, DemoHost, shared `demo-chrome`, a11y for lab previews.

## Load order

1. `maser-lab-web`
2. This skill
3. `maser-lab-responsive-qa` on Harden

## Validation before closing

- [ ] Shared chrome has no product-slug imports
- [ ] Reduced-motion toggle has accessible name
- [ ] Demo registered in `demoRegistry`
