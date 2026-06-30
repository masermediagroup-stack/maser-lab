# Coverage gaps

Areas without a lab standard yet. Agents should flag new gaps here; humans accept before promoting to `rules.md`.

| Gap | Notes |
| --- | --- |
| 3D / WebGL micro-interactions | Covered by `maser-lab-threejs` + CloudAI-X `threejs-*` skills; HyperFrames for seek-driven only — see `.agents/skills/maser-lab-threejs/references/threejs-notes.md` |
| Sound / haptic feedback | Out of scope unless project spec requires |
| Page transitions (route-level) | No canonical pattern; decide per portfolio target |
| Shared `lab/src/components/ui/` primitives | Not bootstrapped; shadcn install pending |
| Automated motion evals | Fixtures exist in `tooling/scripts/evals/` but no CI runner yet |
| Dark/light motion tokens | Per-project for now |
| Lottie vs CSS decision tree | Partial via hyperframes; needs exemplar |

When you hit a gap, document the decision in the project `PROJECT.md` and propose a rule via the governance loop.
