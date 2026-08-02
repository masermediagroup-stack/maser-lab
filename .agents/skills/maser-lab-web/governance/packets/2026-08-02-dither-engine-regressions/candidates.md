# Candidates

Every candidate stays **pending** until a human chooses a destination.

---

## Candidate: Exemplar for dither sacred contracts

Status: pending

Sources: collector docs; engine-lessons; fix `d4d4d6f`

Scope: Agents working on `maser-dither-engine` or similar shared WebGL pipelines

Proposed destination: exemplar

Evidence strength: strong

Decision (draft — not accepted): Keep `exemplars/pr-maser-dither-engine.md` as the canonical narrative; do not invent Three.js forks.

Rationale: Article requires shipped decisions + known flaws; postmortem is the evidence.

Exceptions: Project-local AGENTS remain authoritative for day-to-day edits.

Bad example: Strip SAMPLE helpers during “cleanup.”

Good example: Extend dither module; leave VERT/SAMPLE intact; verify non-black canvas.

Open questions: None for exemplar destination.

Human choice: _awaiting_

Approver: _awaiting_

---

## Candidate: rule/webgl-context-budget

Status: pending

Sources: Materials thumbs context exhaustion

Scope: Any lab demo that mounts multiple WebGL/Three canvases

Proposed destination: rule (or resilience reference only)

Evidence strength: medium (one project incident)

Decision (draft — not accepted): Prefer CSS/static thumbs; cap live contexts; document in resilience until a second project confirms.

Rationale: Mechanical enough for agent guidance; not yet lintable.

Exceptions: Intentionally multi-view editors with documented budget.

Bad example: One live canvas per grid cell.

Good example: CSS swatches + one detail preview.

Open questions: rule vs resilience-only for first accept?

Human choice: _awaiting_

Approver: _awaiting_

---

## Candidate: Lint GLSL SAMPLE_GLSL presence

Status: pending

Sources: SAMPLE strip → compile failure

Scope: `stages.ts` / shader assembly files

Proposed destination: none (or coverage-gap)

Evidence strength: strong incident, weak lint feasibility

Decision (draft — not accepted): Do **not** add ESLint for GLSL string contents in this pass; keep project AGENTS + exemplar.

Rationale: High false-positive / brittle string matching; article says lint only when reliable.

Exceptions: Future custom checker if shader pipeline stabilizes on `main`.

Bad example: Regex lint that blocks legitimate SAMPLE refactors.

Good example: Agent verification gate + rendered demo check.

Open questions: Future eval fixture for “would the agent strip SAMPLE?”

Human choice: _awaiting_

Approver: _awaiting_

---

## Candidate: Dual-link project-isolation lint

Status: pending

Sources: Plan Phase 4; SummitPath ViewportMode imported by service-showcase

Proposed destination: lint

Evidence strength: strong (mechanical + existing `rule/project-isolation`)

Decision (draft — not accepted): Ship `lab-custom/no-cross-project-imports`; move shared `ViewportMode` to demo-chrome.

Rationale: AST-safe; concrete fix; already dual-mentioned in SKILL.md.

Exceptions: `projects/registry.ts`, `demo-host.tsx`, app demo routes importing a single product barrel.

Bad example: `service-showcase` importing SummitPath types.

Good example: Shared types in `@/components/lab/demo-chrome`.

Open questions: None.

Human choice: _awaiting_ (implemented as pending promotion in same PR for maintainer accept via decision-log)

Approver: _awaiting_
