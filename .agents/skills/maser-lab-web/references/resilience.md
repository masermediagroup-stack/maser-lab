# Resilience

Load when reviewing or hardening extreme content, narrow viewports, network-ish failure UI, WebGL/canvas, or long lists.

## Required checks

- Long titles, large numbers, empty strings, and sparse data do not break layout
- Constrained width (320) and wide (1280) — `maser-lab-responsive-qa`
- Touch targets usable; no hover-only critical actions — `rule/hover-gated`
- `prefers-reduced-motion` keeps state clarity — `rule/reduced-motion-required`
- Recoverable errors preserve user input when forms are involved
- Loading does not trap focus or orphan labels

## WebGL / canvas (lab)

- Capability probe + static/CSS fallback when decorative
- Dispose GPU resources on unmount
- Cap live WebGL contexts in UI chrome (grids use CSS thumbs; one live preview) — see dither engine exemplar
- Mobile: simplify or `lowQuality` paths when documented in `PROJECT.md`

## Extreme data

- Truncate with accessible full text (title attribute or disclosure), or wrap deliberately
- Lists: stagger caps (see `patterns.md`); do not animate unbounded item counts
- Localization / RTL risk: avoid baked-in directional assumptions in critical chrome

## Route out

- Breakpoint matrix → `maser-lab-responsive-qa`
- Three.js gates → `maser-lab-threejs` quality gates
- Performance → `vercel-react-best-practices`
