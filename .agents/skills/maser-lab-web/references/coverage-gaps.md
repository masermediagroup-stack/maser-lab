# Coverage gaps

Areas without a lab standard yet. Agents should flag new gaps here; humans accept before promoting to `rules.md`.

| Gap | Notes |
| --- | --- |
| 3D / WebGL micro-interactions | Covered by `maser-lab-threejs` + CloudAI-X `threejs-*` skills; HyperFrames for seek-driven only — see `.agents/skills/maser-lab-threejs/references/threejs-notes.md` |
| Sound / haptic feedback | Out of scope unless project spec requires; `apple-design` discusses haptics — do not add by default |
| Page transitions (route-level) | Prefer `vercel-react-view-transitions` + project decision; no single canonical pattern yet |
| Automated motion evals | Fixtures exist in `tooling/scripts/evals/` but no CI runner yet |
| Dark/light motion tokens | Per-project for now; see `maser-lab-token-system` + `rule/motion-token-cohesion` |
| Lottie vs CSS decision tree | Partial via hyperframes; needs exemplar |
| Shared demo chrome decoupling | `maser-lab-demo-chrome` standard exists; `demo-chrome.tsx` still couples SummitPath viewport types/classes — implement fix under Harden |
| Product-only barrels | `maser-lab-export` standard exists; most project `index.ts` files still re-export demos — migrate per project |
| Project-local verify skill | Prefer pstack `/create-verification-skill` when available locally; until then use `verification` + Playwright |
| Apple-style gesture QA checklist | `apple-design` gives principles; lab lacks a rendered QA matrix for sheets/drawers (pointer capture, velocity, rubber-band, reduced motion) — promote after first verified project |
| Motion opportunity workflow | Emil `find-animation-opportunities` is installed; Shape/Harden should always include rejected candidates when proposing additive motion |
| Animation vocabulary sync | `animation-vocabulary` mirrors Emil’s glossary; no lab-local mirror — route to the skill rather than forking terms |

## Closed / corrected

| Former gap | Status |
| --- | --- |
| Shared `lab/src/components/ui/` primitives not bootstrapped | **Closed** — shadcn primitives live under `lab/src/components/ui/` |
| No Shape / scaffold / export / acceptance skills | **Closed** — `maser-lab-section-shape`, `maser-lab-project-scaffold`, `maser-lab-export`, `maser-lab-acceptance-audit`, `maser-lab-demo-chrome`, `maser-lab-responsive-qa`, `maser-lab-token-system` |

When you hit a gap, document the decision in the project `PROJECT.md` and propose a rule via the governance loop.
