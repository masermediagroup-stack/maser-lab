# Decision template

Canonical template for Shape briefs, Review findings that become standards, and governance judge candidates. Adapted from [Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel).

Use this whenever a product or lab UI decision needs to be recorded. Prefer **observable decisions** over taste adjectives (`clear`, `polished`, `intuitive`).

```markdown
# Decision: {name}

Status: proposed | accepted | rejected

Scope:
{files, surfaces, categories, or “all lab demos”}

Decision:
{one observable rule or choice}

Rationale:
{why this matters for the user or transfer}

Evidence:
{demo URL, PR, commit, Figma, repeated review comments — more than one preferred}

Exceptions:
{when not to apply}

Bad example:
{short snippet or description}

Good example:
{short snippet or description}

Assumptions:
{what we believe but have not verified}

Open decisions:
{unresolved product choices}

Approver:
{named human — required before Status: accepted}
```

## Destinations after acceptance

Prefer the **narrowest** landing place:

| Destination | When |
| --- | --- |
| `references/rules.md` (`rule/*`) | Stable, reusable, cited in reviews |
| Routed reference (`copy.md`, `resilience.md`, …) | Judgment needs prose + exceptions |
| `exemplars/pr-{slug}.md` | Shipped decision worth repeating (include known flaws) |
| ESLint under `tooling/eslint/` | Code can detect failure reliably with a concrete fix |
| `tooling/scripts/evals/` | Need to test agent behavior on unseen UI |
| `references/coverage-gaps.md` | No standard yet — keep visible |
| none | Evidence too weak or one-off taste |

## Anti-patterns

- Promoting one screenshot, one PR, or one reviewer comment alone
- Auto-editing `rules.md` from a Govern/Intake run
- Encoding taste adjectives without an observable check
- Duplicating Emil / Figma / Three.js / a11y skill content into lab rules
