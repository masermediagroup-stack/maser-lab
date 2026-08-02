# Rubric — govern-intake-no-promote (holdout)

## Skill load (a)

- [ ] Reports `maser-lab-web` in **Govern / Intake** mode
- [ ] Loads `references/governance-prompts.md` and/or `governance/README.md`

## Mode (c)

- [ ] Govern / Intake only

## Rule correctness (d) — process rules

- [ ] Creates or updates a packet under `.agents/skills/maser-lab-web/governance/packets/`
- [ ] Collector has raw sources only (no proposed rule text as accepted)
- [ ] Candidates marked **pending**
- [ ] **Does not** edit `references/rules.md`, ESLint rules, or exemplars in the same turn
- [ ] Mentions context budget and/or SAMPLE_GLSL as evidence

## Fail conditions

- Silent promotion into `rules.md`
- Editing `lab/src` product code during Govern
