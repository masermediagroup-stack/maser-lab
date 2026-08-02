---
name: maser-lab-acceptance-audit
description: >-
  Honesty gate for Maser-Lab PROJECT.md checkboxes vs real code. Use before
  status bumps (building→review, review→ready), during Review closeout, or when
  acceptance criteria look overclaimed. Diffs reduced-motion, exports, e2e, and
  docs against implementation.
---

# Maser-Lab Acceptance Audit

Treat checked boxes as **claims**. Prove or uncheck them. Blocks false `ready`.

Load in Review / Harden / Transfer. Chain `maser-lab-export` for barrel claims.

## When to load

| Trigger | Action |
| --- | --- |
| Before registry status change | Full audit |
| Review mode closeout | Score ACs |
| Suspected doc drift | Targeted claim check |
| "Is this ready?" | Pass/fail gate |

## Procedure

### 1. Collect claims

From `projects/{category}/{slug}/PROJECT.md`:

- States checklist (esp. `prefers-reduced-motion`)
- Acceptance criteria
- Motion review / QA notes marked Pass

From `projects/registry.json`: `status`

From `TRANSFER.md`: completeness (placeholders?)

### 2. Prove each claim in code

| Claim type | How to verify |
| --- | --- |
| Component exported from `index.ts` | Read barrel; must export **product**, not only Demo |
| `prefers-reduced-motion` | Grep product for `prefers-reduced-motion`, `useReducedMotion`, `data-reduced-motion`; confirm behavior, not just a comment |
| Demo route renders states | Open `/demos/{slug}`; exercise controls |
| Lint/build | `npm run lint` && `npm run build` in `lab/` |
| Motion review clean | Open P0/P1 from prior review; else run Motion-review |
| E2E green | Run Playwright if specs exist; selectors must match DOM |

### 3. Compare registry vs PROJECT status

Statuses must match. If PROJECT says `review` and registry says `building`, fix one.

### 4. Output

```markdown
## Acceptance audit — {slug}

**Registry status:** …
**Verdict:** pass | fail (block ready) | pass-with-P2

| Claim | Marked | Evidence | Result |
| --- | --- | --- | --- |
| Export from index.ts | [x] | exports Demo only | FAIL |
| prefers-reduced-motion | [x] | no matches in package | FAIL |
| … | | | |

### Required doc fixes
- Uncheck: …
- Or implement: …

### Severity
| Pri | Issue |
| --- | --- |
| P0 | False export readiness |
| P1 | Reduced-motion claimed, unimplemented |
```

## Hard fails (cannot set `ready`)

- Product missing from `index.ts` while AC checked
- Reduced-motion AC checked with zero implementation
- TRANSFER.md still template placeholders
- Failing or stale e2e presented as green without update
- Lint/build failing

## Soft fails (P2 — fix or document)

- FIGMA.md missing when design refs exist
- Coverage-gaps stale relative to repo (e.g. ui primitives claimed unbootstrapped)
- Incomplete states inventory for building projects

## Known drift patterns (watch list)

1. **MakeYourDay** — export AC checked; barrel Demo-only
2. **Blobby** — reduced-motion state checked; no motion media query / hook in package
3. **SummitPath e2e** — aria-label selectors stale vs component
4. **coverage-gaps.md** — shadcn ui "pending" while `lab/src/components/ui/` exists

## After audit

- Update PROJECT.md checkboxes to match reality
- Or implement missing behavior, then re-audit
- Only then change `registry.json` status

## Related

- `maser-lab-export`
- `maser-lab-demo-chrome` (a11y labels for e2e)
- `rule/reduced-motion-required` in maser-lab-web rules
- `verification`
