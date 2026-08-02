# Maser-Lab Three.js — Agent Network

Governance for Three.js, shader, 3D, and advanced interaction work in Maser-Lab (Tyler Vea / MaserMedia).

## Load order

1. Read this file
2. Read `SKILL.md` and declare request mode
3. Load agent brief(s) from `references/agents/`
4. Load `projects/{category}/{slug}/PROJECT.md` when in scope
5. Chain CloudAI-X skills — do not duplicate content

## Specialized agents (Maser-Lab)

| Agent | Brief | When to use |
| --- | --- | --- |
| **Three.js Research** | `references/agents/research.md` | Before implementation; renderer/material/path decisions |
| **Three.js Implementation** | `references/agents/implementation.md` | Building scenes, hooks, demo routes |
| **Shader Systems** | `references/agents/shader-systems.md` | GLSL, uniforms, procedural backgrounds, post-processing shaders |
| **3D Environment** | `references/agents/environment.md` | Hero worlds, product stages, atmospheric scenes |
| **Interaction UX** | `references/agents/interaction-ux.md` | Pointer, scroll, keyboard, CTA clarity |
| **Performance & Fallback** | `references/agents/performance-fallback.md` | FPS, mobile GPU, cleanup, static fallbacks |
| **Documentation & Memory** | `references/agents/documentation-memory.md` | After milestones; capture reusable patterns |
| **Skill Discovery** | `references/agents/skill-discovery.md` | Project start; `/find-skills` |

## Cross-lab roles (existing skills)

| Role | Primary owner | When |
| --- | --- | --- |
| Motion design | `review-animations`, `ui-animation` | Motion craft pass on 3D-adjacent UI |
| Design systems | `figma-design-workflow`, `shadcn` | Tokens, Figma sync, component states |
| Frontend architecture | `vercel-react-best-practices` | RSC boundaries, bundle size, dynamic import |
| Accessibility | `web-design-guidelines` | Focus, reduced motion, semantic structure |
| Responsive QA | `verification` | E2E after demo stable |
| Client adaptation | Documentation agent + `client-portfolio.md` | Brand swap, service-business simplification |
| Portfolio presentation | SummitPath-style `PROJECT.md` identity block | Case study, demo chrome |
| Hallucination detection | Research agent — cite threejs.org pages checked | Any new API or pattern |
| Token efficiency | Loop discipline in `SKILL.md` | Iteration passes |

## Agent schema

Each brief in `references/agents/` includes:

- **Name** — display name
- **Purpose** — responsibility
- **When to use** — triggers
- **Inputs** — what it needs
- **Outputs** — deliverables
- **Checks** — verification list
- **Files to update** — documentation targets
- **Loop commands** — `/loop`, `/loop-status`, etc.

## Typical flow

```text
Skill Discovery → Research → Shape (optional) → Implement
  → Interaction UX review → Performance & Fallback
  → Documentation & Memory → Transfer
```

Use `/loop` between Implement and Harden for visual tuning.

## Validation before closing Three.js work

- [ ] Research agent outputs archived in `PROJECT.md` or project notes
- [ ] Quality gates in `references/quality-gates.md` satisfied
- [ ] `references/threejs-notes.md` updated if new patterns emerged
- [ ] No open P0/P1 from Performance or Interaction UX agents
