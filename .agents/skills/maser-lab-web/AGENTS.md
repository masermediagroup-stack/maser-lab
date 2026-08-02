# maser-lab-web — Skill Governance

**Scope:** Primary workflow for **all web UI** in Maser-Lab — page sections, components, forms, navigation, scroll reveals, and micro-interactions. Route 3D/WebGL to `maser-lab-threejs`. This skill is the lab’s **product-design entry** (Vercel-style): skill + linters + collector→judge→human loop.

## Load order

1. Read this file (`AGENTS.md`)
2. Read `SKILL.md` and resolve **request mode** (including **Govern / Intake** and **Copy**)
3. Load routed references from `references/` (see SKILL.md routing table)
4. Load project context from `projects/{category}/{slug}/PROJECT.md` when a slug is in scope
5. If slug is `maser-dither-engine`, also load `projects/display/maser-dither-engine/AGENTS.md` and `lab/.../engine/AGENTS.md` before any `engine/` edits
6. For Govern / Intake: load `references/governance-prompts.md` + `governance/README.md`; write a packet — do **not** promote rules
7. Chain to domain skills only when SKILL.md routes you there — do not duplicate their content

## Validation before closing work

### All modes

- [ ] Mode was declared (Shape / Implement / Review / Motion-review / Motion audit / Copy / Harden / Transfer / Govern)
- [ ] Report which skill references and routed skills were loaded
- [ ] Findings cite stable rule IDs from `references/rules.md` when applicable
- [ ] Assumptions and open decisions marked via `references/decision-template.md`
- [ ] Coverage gaps noted in `references/coverage-gaps.md` when no standard exists

### Shape

- [ ] Decision template fields filled (job, outcome, non-goals, open decisions)
- [ ] No silent product assumptions

### Implement / Harden

- [ ] Evidence or exemplar cited when reusing a pattern
- [ ] Emil motion skills routed (not duplicated) when motion is in scope — see `references/skill-routing.md`
- [ ] Rendered verification performed for any visual or motion change
- [ ] `projects/registry.json` updated if project status changed

### Review / Motion-review

- [ ] Findings use P0–P3 with location, verification status, `rule/*` or coverage-gap, user consequence, smallest fix
- [ ] No drive-by invention of universal rules

### Copy

- [ ] Only user-facing strings / accessible names edited
- [ ] Structural blockers reported without silent redesign

### Govern / Intake

- [ ] Packet written under `governance/packets/`
- [ ] Collector raw artifacts only; judge candidates all `pending`
- [ ] **No** edits to `rules.md`, lint, or exemplars in the same Govern turn

### Transfer

- [ ] Acceptance audit + export; new standards go through a Govern packet first

## Mode exit gates (summary)

| Mode | Must produce | Must not |
| --- | --- | --- |
| Shape | Decision brief + open decisions | Code edits unless asked |
| Implement | Smallest coherent change + loaded-refs report | Absorb unrelated review findings |
| Review | Prioritized findings with sources | Silent rule promotion |
| Copy | Copy-only diff | Layout/interaction redesign |
| Harden | State/a11y/responsive fixes | New product direction |
| Transfer | Proven ACs + TRANSFER.md | False-checked ACs |
| Govern | Pending packet | Editing guidance files |

## Governance

- Add or change rules only after verification and **human** acceptance
- Record scope, rationale, evidence, exceptions, and bad/good examples (`decision-template.md`)
- Prefer the narrowest destination: canonical skill, routed reference, exemplar, lint rule, eval, or coverage gap
- Never promote one demo, one agent run, or one review comment into a universal rule alone
- Operational loop: `governance/README.md` + `references/governance-prompts.md`

## Human review loop (guidance updates)

Use the collector/judge pattern from [Vercel's product-design article](https://vercel.com/blog/teaching-agents-product-design-at-vercel):

1. **Collector** — gather PR comments, review notes, Figma links, demo URLs; write raw artifacts only
2. **Judge** — group evidence, separate facts from inferences, keep candidates pending
3. **Human** — choose: rule, reference, exemplar, lint rule, eval, coverage gap, or no change
4. **Log** — append to `governance/decision-log.md` when accepted or rejected

Prompts live in `references/governance-prompts.md`. Packet tree: `governance/packets/`.
