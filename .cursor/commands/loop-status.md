# Loop Status Command

Inspect active loop state, progress, and failure signals.

## Usage

`/loop-status [--watch]`

## What to Report

1. **Active loop pattern** — fixed interval (`/loop 5m ...`) or dynamic self-paced loop; sentinel name if known
2. **Current phase** — Research / Implement / Harden / loop iteration N
3. **Last successful checkpoint** — last completed gate (lint, build, visual pass)
4. **Failing checks** — build errors, lint, open P0/P1 findings
5. **Estimated drift** — tasks added vs plan; token-heavy loops without quality gain
6. **Recommended intervention** — continue / pause / stop

## How to Inspect

- Check background shell terminals for `AGENT_LOOP_TICK_*` or `AGENT_LOOP_WAKE_*` sentinels
- Review recent `/loop` output and open todos
- Run `npm run lint` and `npm run build` in `lab/` if implementation phase
- For Three.js work, load `.agents/skills/maser-lab-threejs/references/quality-gates.md`

## Watch Mode

When `--watch` is present, refresh status periodically and surface state changes (new failures, completed gates, loop stopped).

## No Active Loop

If no loop is running, report:

- Current project phase from `PROJECT.md` or conversation
- Open quality gates
- Whether `/loop` would help (shader tuning, perf pass, build fix)

## Three.js projects

Also check: WebGL fallback status, mobile pass, disposal cleanup, research docs cited.
