# maser-lab-export — Governance

**Scope:** Transfer readiness and product public API for all Maser-Lab projects.

## Load order

1. `maser-lab-web` (Transfer mode)
2. This skill
3. `maser-lab-acceptance-audit` if ACs look overclaimed
4. `maser-lab-token-system` when copying tokens

## Validation before closing

- [ ] Product-only `index.ts` (or lab portable path documented)
- [ ] `TRANSFER.md` has no template placeholders
- [ ] Registry status not `ready` until audit passes
