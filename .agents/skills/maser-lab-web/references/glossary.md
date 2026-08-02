# Glossary

Canonical lab terms. Prefer these names in PROJECT.md, reviews, and agent reports.

| Term | Meaning |
| --- | --- |
| **DemoHost** | Shared demo route shell at `lab/src/app/demos/[slug]/` |
| **demoRegistry** | Registry mapping slugs to demo modules |
| **Product barrel** | Project `index.ts` exporting only transfer-ready components (no demo chrome) |
| **Shape** | Mode: frame problem and acceptance criteria without editing (unless asked) |
| **Implement** | Mode: smallest end-to-end build |
| **Review** | Mode: prioritized findings; no edits unless asked |
| **Copy** | Mode: user-facing strings / accessible names only |
| **Harden** | Mode: preserve direction; fix states, a11y, responsive, motion safety |
| **Transfer** | Mode: prove ACs and document porting |
| **Govern / Intake** | Mode: collector→judge packet; no rule promotion |
| **rule/** | Stable rule ID in `references/rules.md` |
| **Exemplar** | Documented shipped decision (with known flaws) under `exemplars/` |
| **Coverage gap** | Known missing standard in `coverage-gaps.md` |
| **Decision packet** | `governance/packets/YYYY-MM-DD-topic/` intake |
| **Material (product)** | Decision that changes task/default/scope/consequence/states |
| **Material (dither engine)** | Procedural structure module — not palette chroma (`engine/material` vs `engine/color`) |
| **Sacred VERT** | Dither engine fullscreen triangle via `gl_VertexID` (no attribute VBO today) |
| **SAMPLE_GLSL** | Shared dither sampling helpers; must not be stripped |
| **Lab tokens** | `--lab-*` shell tokens; product must not require them to render |

Do not invent parallel names for the same concept.
