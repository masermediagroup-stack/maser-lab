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

## Routed judgment gates

Do not paste upstream skills here — load them when a gate fires.

### Emil frequency / purpose gate

From `find-animation-opportunities` / `emil-design-eng`. Every proposed motion must pass:

1. **Frequency** — safe for how often it is seen? (100+/day or keyboard → reject)
2. **Purpose** — spatial, state, feedback, explanation, or anti-jarring?
3. **Speed** — fits ≤300ms UI budget (or documented exception)?
4. **Function** — helps the user complete the job?

If any fail → do not animate. Cap additive suggestions; include rejected candidates when using `find-animation-opportunities`.

### Apple gesture gate

From `apple-design`. For drag/swipe/sheet/spring UI:

1. Pointer-down response (not wait-for-release)?
2. 1:1 tracking with grab offset?
3. Interruptible / retargetable from current value?
4. Velocity handoff into settle?
5. Rubber-banded boundaries?
6. Reduced-motion equivalent (cross-fade / static, not slide/spring)?

### Review vs audit vs implement

| Intent | Skill |
| --- | --- |
| Diff / craft verdict | `review-animations` |
| Codebase roadmap + plans | `improve-animations` |
| Recipes / implementation | `ui-animation` (+ domain packs) |
| Name the effect | `animation-vocabulary` |
