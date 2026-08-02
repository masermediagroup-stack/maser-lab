---
name: maser-lab-web
description: >-
  Primary workflow skill for all web UI in Maser-Lab — page sections, components,
  forms, navigation, heroes, sign-up flows, scroll reveals, loaders, and
  micro-interactions. Lab product-design entry (Vercel-style): Shape, Implement,
  Review, Copy, Harden, Transfer, and Govern/Intake. Use when shaping, building,
  auditing, polishing, rewriting copy, encoding review feedback into standards,
  or porting any client-facing web surface in this repo. Trigger on web section,
  component, form, nav, hero, sign-up, scroll reveal, animation, motion, lab
  demo, portfolio transfer, production-ready UI, or governance intake requests.
  Not for backend-only work, pure 3D/WebGL (use maser-lab-threejs), telemetry, or
  docs with no shipped UI (except governance packets and skill guidance).
---

# Maser-Lab Web

Primary workflow for **all client-facing web UI** in Maser-Lab — sections, components, forms, navigation, reveals, and motion. This skill is the lab’s **product-design entry**: skill + linters + collector→judge→human loop. Use `maser-lab-threejs` when the deliverable is canvas/WebGL/Three.js.

Build web UI that is **correct for the user, the surface, and the craft bar** — not merely present. Cover reachable states, respect accessibility, verify the rendered result, and treat motion as one quality dimension alongside layout, typography, and interaction — not the only one.

## Operating contract

- **Start with the job, not the keyframes.** Who triggers it, how often, what state changes, what must the user understand?
- **Define outcome before output.** Current behavior, desired feel, success signal, non-goals — before picking a library.
- **Use evidence, not taste.** Trace decisions to `references/rules.md`, routed skills, project acceptance criteria, exemplars, or verified adjacent demos.
- **Separate facts from decisions.** Mark assumptions and open product choices explicitly (`references/decision-template.md`).
- **Treat shipped code as evidence, not automatic precedent.** It proves what exists, not why it is correct.
- **Choose the smallest coherent intervention.** Prefer fixing timing, origin, or easing before adding new motion.
- **Verify the real surface.** Never claim visual or motion quality from code alone — run the demo in `lab/`.
- **Report loaded references.** Always list which skill refs and routed skills you loaded.

## Request modes

Resolve mode from the user's verb before acting.

| Mode | Typical request | Required behavior |
| --- | --- | --- |
| **Shape** | "Design this interaction", brief without settled motion | Frame problem, compare alternatives, define states and acceptance criteria using `decision-template.md`. Do not edit unless asked. “What could animate?” → `find-animation-opportunities`. Naming effects → `animation-vocabulary`. |
| **Implement** | "Build", "add", "create demo" | Implement smallest end-to-end change: spec → component → demo route → registry update. Sheets/gestures/springs → also load `apple-design`. |
| **Review** | "Audit", "critique", "what's wrong?" | Inspect source and rendered demo; report prioritized findings. Do not edit unless asked. |
| **Motion-review** | "Review animations", "motion pass" | Load `review-animations` (+ `STANDARDS.md`); motion-only scope; Before/After/Why + Block/Approve. |
| **Motion audit** | "Improve animations", "motion roadmap" | Load `improve-animations` (read-only plans). Do not edit source unless user later asks to execute a plan. |
| **Copy** | "Fix the copy", "rewrite labels/errors" | Edit user-facing language and accessible names only. Report structural blockers without silently redesigning. Load `references/copy.md`. |
| **Harden** | "Polish", "production-ready", edge cases | Preserve direction; fix states, a11y, reduced motion, responsive, performance. Optional `emil-design-eng` craft pass. |
| **Transfer** | "Ready for portfolio", "extract component" | Verify acceptance criteria; document API, dependencies, and porting notes. |
| **Govern / Intake** | "Encode this review into standards", "governance packet" | Collector→judge only. Write packet under `governance/packets/`. Do **not** promote rules or edit product code. |

When intent is ambiguous, use the narrowest mode. A demo URL identifies scope; it does not alone authorize edits.

## Decision authority

1. User's explicit goal and constraints
2. Project `PROJECT.md` acceptance criteria
3. This skill's `references/` and stable rule IDs
4. Routed skills (see below)
5. Verified adjacent demos in `lab/src/components/projects/`
6. General motion heuristics

## Workflow

### 1. Set scope and mode

Name target project slug (if any), demo route, and mode.

### 2. Load project context

If a slug exists, read `projects/{category}/{slug}/PROJECT.md`, `projects/registry.json`, and note its `category` from `projects/categories.json`.

### 3. Model the product / interaction decision

For Shape, Implement, Harden, or full Review, read `references/product-judgment.md` and `references/motion-judgment.md` (when motion is in scope). Write a compact brief using `references/decision-template.md` fields:

- User / trigger frequency
- Job / object / consequence
- State change
- Success signal
- Non-goals
- Reversibility and a11y requirements
- Open decisions

### 4. Map states

Inventory: default, hover, focus, active/pressed, loading, success, error, disabled, empty, reduced-motion. Only include states the component can enter.

### 5. Load routed references

| Need | Load |
| --- | --- |
| Product / flow decision | `references/product-judgment.md` + `decision-template.md` |
| Why this motion exists | `references/motion-judgment.md` |
| Copy / accessible names | `references/copy.md` |
| Extreme data / fallbacks / WebGL budget | `references/resilience.md` |
| Which lab surface am I on? | `references/surfaces.md` |
| Canonical terms | `references/glossary.md` |
| Project lifecycle & transfer | `references/project-lifecycle.md` |
| Craft, hierarchy, demo layout | `references/interface-quality.md` |
| Stable rules with IDs | `references/rules.md` |
| Reusable patterns | `references/patterns.md` |
| Which external skill owns what | `references/skill-routing.md` |
| Missing standards | `references/coverage-gaps.md` |
| Shipped examples | `exemplars/` |
| Encode review → standards | `governance/` + `references/governance-prompts.md` |

### 6. Route to domain skills (do not duplicate)

| Need | Skill |
| --- | --- |
| Shape brief / brand-first section | `maser-lab-section-shape` |
| New project wiring | `maser-lab-project-scaffold` |
| Demo shell / a11y chrome | `maser-lab-demo-chrome` |
| Transfer / product barrel | `maser-lab-export` |
| Prove PROJECT.md checkboxes | `maser-lab-acceptance-audit` |
| Breakpoints / touch QA | `maser-lab-responsive-qa` |
| Product vs lab tokens | `maser-lab-token-system` |
| Expressive frontend craft | `frontend-design`, `emil-design-eng` |
| Apple-style gestures / sheets / springs | `apple-design` |
| Component composition | `vercel-composition-patterns` |
| View Transitions API | `vercel-react-view-transitions` |
| Disney principles, small UI feedback | `micro-interactions` |
| Motion presets, Tailwind/Framer snippets | `animation-micro-interaction-pack` |
| Springs, gestures, component patterns | `ui-animation` |
| Aggressive motion code review | `review-animations` |
| Broad motion audit + plans | `improve-animations` |
| Additive motion opportunities | `find-animation-opportunities` |
| Name a motion effect | `animation-vocabulary` |
| GSAP / Framer scroll | `gsap-framer-scroll-animation` |
| CSS/motion graphics catalog | `hyperframes-animation` |
| shadcn/ui components | `shadcn` |
| Web a11y & interface guidelines | `web-design-guidelines` |
| React/Next performance | `vercel-react-best-practices` |
| Full-flow verification | `verification` |
| Find/install more skills | `find-skills` |
| Author new skills | `skill-creator` |
| Figma design refs, tokens, sync | `figma-design-workflow` |

### 7. Implement (Implement / Harden modes)

1. For **new slugs**, load `maser-lab-project-scaffold` (do not improvise paths)
2. Copy `projects/_template/` files → `projects/{category}/{slug}/` if new
3. Add entry to `projects/registry.json` with a valid `category` from `projects/categories.json`
4. Implement under `lab/src/components/projects/{category}/{slug}/` with **product-only** `index.ts` (`maser-lab-export`)
5. Build demo with `maser-lab-demo-chrome`; register in `demoRegistry`
6. Prefer catch-all `lab/src/app/demos/[slug]/page.tsx` (DemoHost) — avoid new dedicated demo pages
7. Run `npm run lint` and `npm run build` in `lab/`
8. On Harden: `maser-lab-responsive-qa` + `maser-lab-acceptance-audit`

### 8. Verify

1. Confirm acceptance criteria in `PROJECT.md`
2. Run lint and build in `lab/`
3. Render demo — exercise all listed states
4. Toggle `prefers-reduced-motion` in devtools
5. Test keyboard focus and pointer/touch
6. Run Motion-review or `review-animations` for material motion changes
7. For gesture/sheet demos: verify pointer-down response, interruptibility, and reduced-motion (`apple-design` gates)
8. Optional: `improve-animations` for a multi-file motion roadmap (plans only)

## Review output

Lead with findings by user impact:

- **P0:** blocks primary task, severe a11y failure, or harmful motion (vestibular, seizure risk)
- **P1:** misleading feedback, missing critical state, >300ms on high-frequency action, layout thrash
- **P2:** weak craft, inconsistent easing, wrong transform-origin, missing reduced-motion variant
- **P3:** minor polish

For each finding include:

1. File/line or rendered location
2. Verification status (source-only vs rendered)
3. Canonical source (`rule/*`, reference, or coverage-gap)
4. User consequence
5. Smallest concrete fix

## Govern / Intake workflow

1. Copy `governance/packets/_template/` → `governance/packets/YYYY-MM-DD-topic/`
2. Run collector → `collector.md`
3. Run judge → `judge.md` + `candidates.md` (all pending)
4. Stop. Human chooses destinations; log in `governance/decision-log.md`

## Lab standards

Stable IDs live in `references/rules.md`. Craft bar for motion reviews: `review-animations` / Emil pack — do not paste those skills here.

- Every interactive element provides feedback within 50–300ms unless high-frequency (then reduce or delete motion) — `rule/ui-duration-cap`, `rule/no-keyboard-motion`
- Animate `transform` and `opacity` only unless justified — `rule/gpu-properties-only`
- Never enter from `scale(0)` — `rule/no-scale-zero`
- Rapid/dynamic UI must be interruptible — `rule/interruptible-dynamic-motion`
- Honor `prefers-reduced-motion` — reduce movement, keep state clarity — `rule/reduced-motion-required`
- Gate hover motion behind `@media (hover: hover) and (pointer: fine)` — `rule/hover-gated`
- Popovers and anchored surfaces animate from trigger origin, not center — `rule/transform-origin-anchored`
- Drag/swipe/sheet: pointer-down, 1:1 tracking, velocity-aware release — `rule/direct-manipulation-continuity`, `rule/velocity-aware-gestures`
- Shared motion values → product tokens — `rule/motion-token-cohesion`
- No decorative motion without structural or state purpose
- Demo pages show all states side-by-side or via controls — not only the happy path — `rule/demo-all-states`
- No cross-imports between project slugs — `rule/project-isolation` (also ESLint `lab-custom/no-cross-project-imports`)
