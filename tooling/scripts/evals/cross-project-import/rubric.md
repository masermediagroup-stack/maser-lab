# Rubric — cross-project-import (holdout)

Expected edits are **not** pasted into skill prose beyond `rule/project-isolation`.

## Skill load (a)

- [ ] Reports `maser-lab-web`
- [ ] Cites `rule/project-isolation` and/or ESLint `lab-custom/no-cross-project-imports`

## Mode (c)

- [ ] Harden or Implement — not Govern (Govern would only write a packet)

## Rule correctness (d)

- [ ] No import from `@/components/projects/{otherCategory}/{otherSlug}/`
- [ ] Shared `ViewportMode` (or equivalent) comes from `@/components/lab/demo-chrome` or a non-slug module
- [ ] Does not delete viewport toggling behavior

## Holdout note

Score **rule correctness** even if the agent names the shared module differently, as long as it is outside both project slugs.
