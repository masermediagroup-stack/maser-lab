# Governance prompts

Adapted from [Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel).

## Collector prompt

You are the collector. Gather messages, links, demo URLs, PR comments, and Figma frames related to micro-interaction or motion decisions in this repo.

Write **raw artifacts only**. Do not score candidates or propose rules.

Output:

- Source links
- Verbatim quotes (short)
- Related file paths
- Missing evidence (what commit or demo URL is needed)

## Judge prompt

You are the judge. Validate coverage before grouping related evidence.

Separate:

- Verified facts
- Inferences
- Open questions

Group into **candidates** for guidance updates. Keep every candidate **pending**. Do not edit skill files.

For each candidate:

```markdown
## Candidate: {title}
Status: pending
Sources:
Scope:
Proposed destination: (rule | reference | exemplar | lint | eval | coverage-gap | none)
Evidence strength: (weak | medium | strong)
Open questions:
```

## Human review

Choose for each candidate: rule, reference, exemplar, lint rule, eval, coverage gap, or no change.

Requirements to accept:

- Stable evidence (demo, PR, or repeated review comment)
- Explicit scope and exceptions
- Bad and good example
- Named approver

After acceptance, update the narrowest file and run `npm run lint` in `lab/` if lint rules changed.
