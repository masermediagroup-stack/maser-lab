# Product-design / motion eval fixtures

Holdout fixtures for testing whether agents load `maser-lab-web` and apply lab rules on unseen (or partially documented) interfaces.

## Rubric dimensions (score separately)

| Dimension | Pass criteria | Fail does **not** imply |
| --- | --- | --- |
| **(a) Skill load** | Agent reports loading `maser-lab-web` + listed refs | Rule follow |
| **(b) Rule citation** | Findings or edits cite relevant `rule/*` IDs | Pixel match to `after/` |
| **(c) Mode** | Declared mode matches the prompt (Review vs Implement vs Govern) | — |
| **(d) Rule correctness** | Fix satisfies the rubric rule checks | Similarity to shipped `after/` code |

Article insight: **failing to load the skill ≠ failing to follow a rule** — record both scores.

## Structure (per fixture)

```text
tooling/scripts/evals/{fixture-name}/
├── prompt.md        # agent brief
├── before/          # starting code
├── after/           # expected direction (not a gold paste into the skill)
└── rubric.md        # rule IDs + skill-load checks
```

## Offline run checklist

1. Copy `before/` into a scratch tree (do not commit agent output here).
2. Give the agent only `prompt.md` + `before/` (not `after/` or rubric answers pasted into skill text).
3. Score with `rubric.md` and `rules-checklist.json`.
4. Log: skill-load Y/N · mode · cited rules · rule-correct Y/N · notes.

CI runner: **not yet** — keep offline until fixtures are stable.

## Index

| Fixture | Holdout? | Primary rules |
| --- | --- | --- |
| [transition-all-button](./transition-all-button/) | No | `rule/no-transition-all` |
| [cross-project-import](./cross-project-import/) | Yes | `rule/project-isolation` |
| [govern-intake-no-promote](./govern-intake-no-promote/) | Yes | Govern mode (no `rules.md` edit) |
