# Motion eval fixtures

Holdout fixtures for testing whether agents apply lab guidance on unseen interfaces.

## Structure (per fixture)

```text
tooling/scripts/evals/{fixture-name}/
├── before/          # starting code
├── after/           # expected direction (not necessarily identical)
└── rubric.md        # rule IDs that must be satisfied
```

## Usage

1. Agent edits `before/` state
2. Judge checks against `rubric.md` and `rules-checklist.json`
3. Score rule correctness separately from similarity to `after/`

## Creating fixtures

Seed from projects that reach `ready` status. Keep expected edits out of the skill text (holdout).

_No fixtures yet._
