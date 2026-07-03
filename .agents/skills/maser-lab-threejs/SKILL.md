---
name: maser-lab-threejs
description: >-
  Maser-Lab entry point for Three.js, shaders, WebGL/WebGPU, 3D environments,
  particle systems, scroll-driven 3D, and advanced interaction work. Use when
  researching, implementing, or reviewing 3D web experiences for Tyler Vea /
  MaserMedia client and portfolio work. Chain to CloudAI-X threejs skills and
  official threejs.org docs. Not for CSS-only web UI — use maser-lab-web instead.
---

# Maser-Lab Three.js

Senior creative-technology workflow for researching, building, testing, documenting, and reusing advanced Three.js systems inside Maser-Lab.

## Authority

1. [Official Three.js documentation](https://threejs.org/docs/) — final API authority
2. Project `PROJECT.md` acceptance criteria
3. This skill's `references/` and agent briefs
4. [CloudAI-X threejs-skills](https://github.com/cloudai-x/threejs-skills) — practical patterns (verify against official docs)
5. `hyperframes-animation` adapter for seek-driven compositions only

If CloudAI-X skills, tutorials, or local patterns conflict with official Three.js docs, follow the official docs unless a project-specific reason is documented.

## When to load

- Three.js scenes, shaders, WebGL/WebGPU experiments
- 3D hero sections, environments, particle systems
- Pointer-reactive or scroll-driven 3D
- Post-processing, animated shader backgrounds
- Figma-to-Three.js or static-design-to-Three.js workflows
- Client-ready 3D website sections

## Load order

1. Read `AGENTS.md` — pick agent role(s)
2. Read `references/workflow.md` — 12-step project flow
3. Load project `projects/{category}/{slug}/PROJECT.md` when a slug exists
4. Run **Skill Discovery** agent → `/find-skills` when capability gaps appear
5. Run **Research** agent before implementation on new effect types
6. Chain CloudAI-X skills (do not duplicate their content)

## Request modes (extends maser-lab-web)

| Mode | Use when |
| --- | --- |
| **Research** | New effect, unknown API path, renderer choice |
| **Shape** | Concept, mood, interaction model without code |
| **Implement** | Build scene, shaders, demo route |
| **Review** | Audit approach, risks, craft |
| **Harden** | Performance, fallbacks, mobile, reduced-motion |
| **Transfer** | Portfolio/client reuse documentation |

Declare mode at start. For non-3D UI motion, switch to `maser-lab-web`.

## Routed skills

| Need | Skill |
| --- | --- |
| Umbrella (this skill) | `maser-lab-threejs` |
| Scene, camera, renderer | `threejs-fundamentals` |
| Geometry, instancing | `threejs-geometry` |
| Materials, PBR vs shader | `threejs-materials` |
| Lights, shadows, IBL | `threejs-lighting` |
| Textures, env maps | `threejs-textures` |
| Animation, mixers | `threejs-animation` |
| GLTF/GLB loading | `threejs-loaders` |
| GLSL, ShaderMaterial | `threejs-shaders` |
| EffectComposer, bloom | `threejs-postprocessing` |
| Raycasting, controls | `threejs-interaction` |
| Seek-driven timelines | `hyperframes-animation` adapters/three.md |
| Web UI lifecycle | `maser-lab-web` |
| Find/install skills | `find-skills` |
| Figma ↔ code | `figma-design-workflow` |
| A11y audit | `web-design-guidelines` |
| React/Next performance | `vercel-react-best-practices` |
| E2E verification | `verification` |
| Motion craft review | `review-animations` |

## Loop commands

| Command | Status | Use when |
| --- | --- | --- |
| `/find-skills` | Confirmed | Starting new project types, shader/env work |
| `/loop` | Confirmed (user skill) | Iterative refinement, shader tuning, perf passes |
| `/loop-status` | Repo command | Check progress, unresolved issues, quality status |
| `/maser-threejs` | Repo command | Load this skill + Research agent |
| `/poteto-mode` | **Needs confirmation** | Deep reasoning — use **Shape + Research** until confirmed |
| `/setup-pstack` | **Needs confirmation** | New repeatable workflow setup |
| `/ux-design-systems` | **Needs confirmation** | Route to `figma-design-workflow` + `web-design-guidelines` |

### Loop discipline

Each loop iteration must answer:

1. What are we checking?
2. What did we find?
3. What did we fix?
4. What still needs review?
5. Did this improve quality?
6. Did this save or waste tokens?
7. Should this become a reusable Maser-Lab workflow?

Do not create loops without a clear quality target.

## Agent briefs

Load from `references/agents/`:

- `research.md` — Maser-Lab Three.js Research Agent
- `implementation.md` — Implementation Agent
- `shader-systems.md` — Shader Systems Agent
- `environment.md` — 3D Environment Agent
- `interaction-ux.md` — Interaction UX Agent
- `performance-fallback.md` — Performance and Fallback Agent
- `documentation-memory.md` — Documentation and Memory Agent
- `skill-discovery.md` — Skill Discovery Agent

Full network map: `AGENTS.md`

## References

| File | Purpose |
| --- | --- |
| `references/threejs-notes.md` | Knowledge base, checklists, open questions |
| `references/workflow.md` | 12-step project workflow |
| `references/build-standards.md` | Folder layout, disposal, fallbacks |
| `references/quality-gates.md` | Completion checklist |
| `references/client-portfolio.md` | Reuse notes template |
| `references/lab-patterns-threejs.md` | Maser-Lab 3D patterns |

## Code layout

Reusable Three.js utilities: `lab/src/three/`  
Per-project scenes: `lab/src/components/projects/{category}/{slug}/`

Install `three` only when building the first real scene:

```bash
cd lab && npm install three @types/three
```

## Validation before closing work

- [ ] Official Three.js docs checked for API decisions
- [ ] Research agent output documented (if new effect)
- [ ] WebGL fallback implemented or documented
- [ ] Mobile simplification considered
- [ ] `prefers-reduced-motion` considered
- [ ] Disposal on unmount verified
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] `PROJECT.md`, `threejs-notes.md` patterns updated if learnings apply
- [ ] Client/portfolio reuse notes added
