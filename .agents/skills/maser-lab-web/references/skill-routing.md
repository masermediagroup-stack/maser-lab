# Skill routing

Routes domain skills for **all 2D web UI** in Maser-Lab. Do not duplicate content from these skills — load and apply them.

## Mode → skill map (lab quality stack)

Use this order inside `maser-lab-web` request modes:

| Mode | Load (in order) |
| --- | --- |
| **Shape** | `maser-lab-section-shape` → optional `frontend-design` / `emil-design-eng` / `figma-design-workflow` |
| **Implement (new slug)** | `maser-lab-project-scaffold` → `maser-lab-demo-chrome` → `maser-lab-export` (barrel contract) → `maser-lab-token-system` |
| **Implement (existing)** | Domain skills as needed → `vercel-composition-patterns` / `vercel-react-best-practices` / motion skills |
| **Review** | `maser-lab-acceptance-audit` → `web-design-guidelines` → motion via `review-animations` if in scope |
| **Motion-review** | `review-animations` (+ motion domain skills) |
| **Harden** | `maser-lab-demo-chrome` → `maser-lab-responsive-qa` → `maser-lab-acceptance-audit` → `verification` |
| **Transfer** | `maser-lab-acceptance-audit` → `maser-lab-export` → `maser-lab-token-system` |

## Lab operating skills (Maser-Lab local)

| Skill | Install source | When to load |
| --- | --- | --- |
| `maser-lab-section-shape` | Maser-Lab (local) | Shape mode; brand-first brief before code |
| `maser-lab-project-scaffold` | Maser-Lab (local) | New slug: template → registry → demoRegistry |
| `maser-lab-demo-chrome` | Maser-Lab (local) | Demo shells, a11y chrome, DemoHost consistency |
| `maser-lab-export` | Maser-Lab (local) | Transfer; product-only barrels; TRANSFER.md |
| `maser-lab-acceptance-audit` | Maser-Lab (local) | Before status bumps; prove PROJECT.md claims |
| `maser-lab-responsive-qa` | Maser-Lab (local) | Harden; 320/768/1280 + touch targets |
| `maser-lab-token-system` | Maser-Lab (local) | Product vs lab tokens; transfer weight |

## Design & craft (ecosystem)

| Skill | Install source | When to load |
| --- | --- | --- |
| `frontend-design` | anthropics/skills | Expressive layout/typography pressure in Shape |
| `emil-design-eng` | emilkowalski/skills | Design-engineering judgment alongside Shape/Harden |
| `find-skills` | vercel-labs/skills | User asks to find/install skills; capability gap |
| `figma-design-workflow` | Maser-Lab (local) | Figma refs, tokens, design↔code sync, Code Connect paths |
| `figma-use` | Figma MCP plugin | Read/write Figma nodes — load before every `use_figma` call |
| `figma-generate-design` | Figma MCP plugin | Push lab demos / pages to Figma from code |
| `figma-code-connect` | Figma MCP plugin | `.figma.ts` mappings for published team components |
| `figma-generate-library` | Figma MCP plugin | Variables, components, design system in Figma |

## Motion

| Skill | Install source | When to load |
| --- | --- | --- |
| `micro-interactions` | dylantarre/animation-principles | Small feedback: buttons, toggles, badges |
| `animation-micro-interaction-pack` | patricio0312rev/skills | Tailwind/Framer presets, quick patterns |
| `ui-animation` | mblode/agent-skills | Springs, gestures, decision framework |
| `review-animations` | emilkowalski/skills | Motion-review mode; aggressive craft audit |
| `gsap-framer-scroll-animation` | github/awesome-copilot | Scroll-linked or timeline-heavy demos |
| `hyperframes-animation` | heygen-com/hyperframes | CSS/motion catalog, transitions, blueprints |
| `vercel-react-view-transitions` | vercel-labs/agent-skills | Route-level View Transitions API |

## React / UI systems

| Skill | Install source | When to load |
| --- | --- | --- |
| `shadcn` | shadcn/ui | UI primitives, forms, composition |
| `web-design-guidelines` | vercel-labs/agent-skills | A11y and web interface audit |
| `vercel-react-best-practices` | vercel-labs/agent-skills | React/Next performance |
| `vercel-composition-patterns` | vercel-labs/agent-skills | Component composition patterns |
| `verification` | vercel-labs/vercel-plugin | End-to-end flow check after implementation |
| `vercel-agent` | vercel-labs/vercel-plugin | Vercel Agent platform configuration |
| `skill-creator` | anthropics/skills | Authoring or revising SKILL.md files |

## Three.js

| Skill | Install source | When to load |
| --- | --- | --- |
| `maser-lab-threejs` | Maser-Lab (local) | Three.js workflow, agents, quality gates |
| `threejs-fundamentals` | cloudai-x/threejs-skills | Scene, camera, renderer, resize |
| `threejs-geometry` | cloudai-x/threejs-skills | Meshes, BufferGeometry, instancing |
| `threejs-materials` | cloudai-x/threejs-skills | PBR, ShaderMaterial decisions |
| `threejs-lighting` | cloudai-x/threejs-skills | Lights, shadows, IBL |
| `threejs-textures` | cloudai-x/threejs-skills | Textures, env maps, performance |
| `threejs-animation` | cloudai-x/threejs-skills | Mixers, procedural motion |
| `threejs-loaders` | cloudai-x/threejs-skills | GLTF/GLB, async loading |
| `threejs-shaders` | cloudai-x/threejs-skills | GLSL, uniforms, effects |
| `threejs-postprocessing` | cloudai-x/threejs-skills | EffectComposer, bloom, DOF |
| `threejs-interaction` | cloudai-x/threejs-skills | Raycasting, controls, pointer |

Install bundle: `npx skills add cloudai-x/threejs-skills -y`. Verify APIs against [threejs.org/docs](https://threejs.org/docs/).

## Search for more

```bash
npx skills find "micro interaction"
npx skills find "animation" --owner vercel-labs
```

Browse: https://skills.sh/

## Priority when skills conflict

1. `maser-lab-acceptance-audit` / `maser-lab-export` for readiness honesty
2. `review-animations` craft bar for motion code review
3. `maser-lab-web` rules and project acceptance criteria
4. Domain skill (e.g. `ui-animation` for spring tuning)
5. General heuristics
