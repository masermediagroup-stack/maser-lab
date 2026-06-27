# Motion judgment

Use before proposing or approving material motion changes.

## Brief template

Fill this internally (or in `PROJECT.md` for Shape mode):

```markdown
User / actor:
Trigger frequency: (once / occasional / tens per day / 100+ per day)
Current behavior:
Desired outcome:
Success signal:
Non-goals:
State change:
Reversibility:
A11y notes:
Open decisions:
```

## Frequency guide

| Frequency | Motion default |
| --- | --- |
| 100+ / day (keyboard shortcuts, nav toggles) | No animation or instant opacity only |
| Tens / day | ≤150ms, no bounce |
| Occasional | Standard 150–250ms |
| First-time / rare | Can add delight; still ≤300ms for UI chrome |

## Justified motion (must answer "why")

1. **Spatial consistency** — element moved; motion shows where it went
2. **State indication** — on/off, loading, success, error
3. **Feedback** — confirm input received
4. **Explanation** — reveal cause-effect (expand, dismiss direction)
5. **Prevent jarring change** — bridge two visual states

"Looks cool" on a high-frequency control is **not** sufficient.

## Material vs mechanical

**Material** (requires this brief): new interaction pattern, changed default timing, new library, scroll-linked motion, gesture behavior.

**Mechanical** (rules + lint): token swap, fix typo in duration, apply existing pattern from `patterns.md`.

## Alternatives (Shape mode)

Compare at least two approaches when material:

- CSS only vs WAAPI vs Framer Motion vs GSAP
- Spring vs ease
- Continuous vs snap (pose-to-pose)

Document tradeoffs: bundle size, interruptibility, SSR, a11y.
