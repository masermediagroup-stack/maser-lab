# Governance prompts

Adapted from [Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel).

Operational tree: [`../governance/README.md`](../governance/README.md). Decision fields: [`decision-template.md`](./decision-template.md).

When the user asks to encode review feedback into lab standards, use **Govern / Intake** mode: write a packet under `governance/packets/YYYY-MM-DD-topic/` (copy `_template/`). Do **not** edit `rules.md`, lint, or exemplars in the same turn.

---

## Collector prompt

You are the collector. Gather messages, links, demo URLs, PR comments, Figma frames, and nearby context related to web UI, layout, interaction, copy, or motion decisions in this repo.

Write **raw artifacts only** into `collector.md`. Do not score candidates or propose rules.

Output:

- Source links (PR, demo, Figma, commit)
- Verbatim quotes (short)
- Related file paths
- Missing evidence (what commit, demo URL, or frame is still needed)

---

## Judge prompt

You are the judge. Validate coverage before grouping related evidence.

Separate:

- Verified facts
- Inferences
- Open questions

Group into **candidates** for guidance updates. Keep every candidate **pending**. Do not edit skill files, lint rules, or exemplars.

Also list:

- Rejected topics (with why)
- Coverage-gap proposals for `references/coverage-gaps.md`

For each candidate use:

```markdown
## Candidate: {title}
Status: pending
Sources:
Scope:
Proposed destination: (rule | reference | exemplar | lint | eval | coverage-gap | none)
Evidence strength: (weak | medium | strong)
Decision (draft — not accepted):
Rationale:
Exceptions:
Bad example:
Good example:
Open questions:
Human choice: _awaiting_
Approver: _awaiting_
```

Evidence strength:

- **weak** — single comment or single screenshot
- **medium** — repeated comments or one verified demo + review
- **strong** — multiple independent sources + verified rendered demo/commit

A weak candidate may stay pending or go to `coverage-gap` / `none` — never auto-promote.

---

## Human review

Choose for each candidate: rule, reference, exemplar, lint rule, eval, coverage gap, or no change.

Requirements to accept:

- Stable evidence (demo, PR, or repeated review comment — prefer more than one)
- Explicit scope and exceptions
- Bad and good example
- Named approver
- Narrowest destination file

After acceptance:

1. Update the narrowest file
2. Append a row to `governance/decision-log.md`
3. Run `npm run lint` in `lab/` if lint rules changed
4. Run `npm run build` in `lab/` if product code or lint plugin wiring changed

---

## Anti-patterns

- Auto-editing `rules.md` from a Govern run
- Promoting taste adjectives (`clear`, `polished`, `intuitive`) without an observable check
- Promoting one screenshot, one shipped file, or one reviewer comment alone
- Duplicating Emil / Figma / Three.js / a11y skill content into lab rules
- Treating shipped code as automatic precedent without checking current guidance
