# maser-lab-web — Skill Governance

**Scope:** Primary workflow for **all web UI** in Maser-Lab — page sections, components, forms, navigation, scroll reveals, and micro-interactions. Route 3D/WebGL to `maser-lab-threejs`.

## Load order

1. Read this file (`AGENTS.md`)
2. Read `SKILL.md` and resolve **request mode**
3. Load routed references from `references/` (see SKILL.md routing table)
4. Load project context from `projects/{category}/{slug}/PROJECT.md` when a slug is in scope
5. Chain to domain skills only when SKILL.md routes you there — do not duplicate their content

## Validation before closing work

- [ ] Mode was declared (Shape / Implement / Review / Motion-review / Harden / Transfer)
- [ ] Findings cite stable rule IDs from `references/rules.md` when applicable
- [ ] Rendered verification performed for any visual or motion change
- [ ] `projects/registry.json` updated if project status changed
- [ ] Coverage gaps noted in `references/coverage-gaps.md` when no standard exists

## Governance

- Add or change rules only after verification and explicit acceptance
- Record scope, rationale, evidence, exceptions, and bad/good examples
- Prefer the narrowest destination: canonical skill, routed reference, exemplar, lint rule, or coverage gap
- Never promote one demo or one agent run into a universal rule without evidence

## Human review loop (guidance updates)

Use the collector/judge pattern from [Vercel's product-design article](https://vercel.com/blog/teaching-agents-product-design-at-vercel):

1. **Collector** — gather PR comments, review notes, Figma links, demo URLs; write raw artifacts only
2. **Judge** — group evidence, separate facts from inferences, keep candidates pending
3. **Human** — choose: rule, reference, exemplar, lint rule, eval, coverage gap, or no change

Prompts live in `references/governance-prompts.md`.
