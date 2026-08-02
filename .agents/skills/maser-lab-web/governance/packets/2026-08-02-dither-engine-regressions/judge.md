# Judge — pending candidates

**Mode:** Govern / Intake  
Validate coverage before grouping. Separate facts from inferences. Keep every candidate **pending**. Do **not** edit skill files.

## Coverage check

- [x] Collector sources reviewed
- [x] Related files opened or noted as missing
- [x] Demo / commit evidence present or listed as missing (branch-local; missing on `main`)

## Verified facts

- Sprint 6 combined VERT `aPos` rewrite without VBO + stripped `SAMPLE_GLSL` → black / non-compiling engine
- Materials page with ~11 live WebGL thumbs exhausted context budget
- Project AGENTS already encodes hard constraints R1–R7 in engine-lessons
- Exemplar `pr-maser-dither-engine.md` drafted from the same evidence

## Inferences

- These constraints are strong enough for lab-wide WebGL hygiene when building shared multi-surface engines, but **not** all apply to every Three.js hero
- Dual-encoding as both exemplar + optional `rule/*` is appropriate; lint cannot AST-check GLSL sacred symbols reliably today

## Open questions

- Promote narrow `rule/webgl-context-budget` now, or keep under `references/resilience.md` until more projects hit the same failure?
- Should sacred VERT / SAMPLE become `rule/*` IDs or stay project-local AGENTS until the slug lands on `main`?

## Rejected topics (not candidates)

| Topic | Why rejected |
| --- | --- |
| “Make all shaders prettier” | Taste adjective; no evidence packet |
| Replace engine with Three.js ShaderMaterial | Contradicts project contract; out of scope |
| Auto-edit `rules.md` from this packet | Judge must not promote |

## Coverage-gap proposals

- Shared WebGL multi-canvas context budget as a lab-wide resilience note (partially covered in `references/resilience.md`)
- GLSL sacred-symbol lint — not AST-safe in current tooling; keep agent rule / project AGENTS
