# Three.js Quality Gates

A Three.js, shader, 3D, or advanced interaction project is **not complete** until all items below are satisfied or explicitly documented as deferred.

## Direction and approach

- [ ] Visual direction is clear
- [ ] UX purpose is clear
- [ ] Three.js approach is justified in `PROJECT.md`
- [ ] Official Three.js docs checked for APIs used
- [ ] CloudAI-X skills checked where relevant

## Function

- [ ] Scene renders in demo route
- [ ] Interactions work (pointer, scroll, or documented N/A)
- [ ] Motion is smooth on desktop target
- [ ] Responsive behavior checked
- [ ] Mobile behavior checked or simplified
- [ ] `prefers-reduced-motion` considered

## Resilience

- [ ] Fallback implemented or documented
- [ ] Performance risks reviewed (Performance agent)
- [ ] Loading/placeholder state for async assets

## Code quality

- [ ] Modular structure (scene vs UI)
- [ ] Shader/material logic documented
- [ ] Disposal and listener cleanup verified
- [ ] `npm run lint` passes in `lab/`
- [ ] `npm run build` passes in `lab/`

## Documentation

- [ ] `PROJECT.md` updated
- [ ] Research archived (if applicable)
- [ ] `references/threejs-notes.md` updated if new patterns
- [ ] Skills and loops used documented
- [ ] Client adaptation notes added
- [ ] Portfolio usage notes added
- [ ] Assumptions and missing items listed

## Lab integration

- [ ] `projects/registry.json` entry correct
- [ ] Demo registered in `registry.ts`
- [ ] Status reflects review state (`review` → `ready` only after gates pass)

## Severity

- **P0** — Broken demo, no fallback, WebGL crash, a11y blocker
- **P1** — Major perf issue, mobile broken, missing reduced-motion
- **P2** — Polish, documentation gaps

No open P0/P1 before `ready` status.
