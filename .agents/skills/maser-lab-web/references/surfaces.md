# Surfaces

Router for which lab surface is in scope and which skills/refs to load. Prefer this over inventing a parallel skill.

| Surface | Load when | Canonical owners |
| --- | --- | --- |
| **Section** | Heroes, sign-up, marketing blocks | `maser-lab-section-shape` → `product-judgment` → `interface-quality` |
| **Chrome** | Nav, tabs, menus, demo shell | `maser-lab-demo-chrome` → `web-design-guidelines` |
| **Form / input** | Fields, validation, submit | `copy.md` → `web-design-guidelines` → `shadcn` |
| **Feedback** | Toasts, loaders, progress | `patterns.md` → `micro-interactions` |
| **Scroll / reveal** | Scroll-driven sections | `gsap-framer-scroll-animation` / `hyperframes-animation` + reduced-motion |
| **Motion craft** | Diff review of animation | `review-animations` (+ STANDARDS) |
| **Gesture / sheet** | Drag, drawers, springs | `apple-design` |
| **WebGL / Three** | Canvas 3D scenes | `maser-lab-threejs` |
| **Shared dither / surface engine** | `maser-dither-engine` | Project + `engine/AGENTS.md` (not Three.js) |
| **Transfer** | Ready for portfolio | `maser-lab-acceptance-audit` → `maser-lab-export` |
| **Governance** | Encode standards | `governance/` + Govern mode |

## Persistence

Choose surface persistence to match importance: ephemeral feedback vs sticky chrome vs full-page section. Prefer inline disclosure before modals.

## Isolation

Project code under `lab/src/components/projects/{category}/{slug}/` must not import other slugs — `rule/project-isolation`.
