# Lab product-design governance

Operationalizes the collector → judge → human loop from [Teaching agents product design at Vercel](https://vercel.com/blog/teaching-agents-product-design-at-vercel) inside `maser-lab-web`.

## Roles

| Role | Who | May do | Must not |
| --- | --- | --- | --- |
| Collector | Agent (Govern mode) | Gather links, quotes, paths | Score or propose rules |
| Judge | Agent (Govern mode) | Group evidence into pending candidates | Edit `rules.md` / lint / exemplars |
| Approver | Human (lab maintainer) | Accept / reject / choose destination | — |

## Cadence

- After each meaningful **Review** or **Harden** PR that produces repeatable feedback
- Or weekly intake when comments / Figma notes pile up
- Manual or agent-triggered — no Slack bot / cron required in this pass

## Inputs

- GitHub PR review threads and cloud-agent notes
- Figma links and design comments
- Demo URLs (`/demos/{slug}`)
- Project `LOCAL.md` / `PROJECT.md` open decisions
- Known regressions (e.g. dither engine sacred contracts)

## Outputs

1. Packet under `packets/YYYY-MM-DD-topic/`
2. Human choices on each candidate
3. Entry in [`decision-log.md`](./decision-log.md)
4. Update to the **narrowest** destination file
5. `npm run lint` / `npm run build` in `lab/` if lint changed

## Destinations

See [`../references/decision-template.md`](../references/decision-template.md).

## Packet layout

```text
packets/
  _template/
    collector.md
    judge.md
    candidates.md
  YYYY-MM-DD-topic/
    collector.md
    judge.md
    candidates.md
```

Copy `_template/` when starting a Govern / Intake run.

## Removal

Rules that stop helping are rejected with a decision-log entry. Treat guidance as product — review and test each change.
