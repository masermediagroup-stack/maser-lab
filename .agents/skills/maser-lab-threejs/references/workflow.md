# Three.js Project Workflow

Every Three.js, shader, 3D, or advanced interaction project follows these steps.

## 1. Identify source type

- Figma frame / component
- Static screenshot or image reference
- Existing lab component
- Client concept or brief
- Portfolio or brand direction
- Original experiment

## 2. Identify target type

- Shader background
- 3D hero
- 3D environment
- Particle system
- GLTF/GLB model scene
- Interactive object
- Scroll-driven scene
- Pointer interaction
- Post-processing effect
- Creative landing section
- Portfolio demo
- Client website component

## 3. Scan lab documentation

- Root `AGENTS.md`
- `maser-lab-threejs/SKILL.md`
- `maser-lab-web` if hybrid UI + 3D
- Existing project `PROJECT.md` and `tokens.css`
- `references/threejs-notes.md`

## 4. Run Skill Discovery

- `/find-skills` or Skill Discovery agent
- Confirm CloudAI-X skills cover the task

## 5. Run Research agent

- Official Three.js docs + CloudAI-X skills
- Document renderer and material path
- Output research template before coding

## 6. Choose implementation path

| Option | When |
| --- | --- |
| CSS only | Flat gradients, no depth |
| SVG | Vector brand shapes |
| Canvas 2D | 2D procedural |
| Three.js WebGL | Standard 3D |
| Three.js WebGPU | Experimental; needs fallback |
| ShaderMaterial | Custom full-screen or mesh shaders |
| Built-in materials | PBR product/object scenes |
| GLTF/GLB | Authored 3D assets |
| Post-processing | Bloom, DOF, screen effects |
| Particles / instancing | Many similar objects |
| Raycasting | Object pick/hover |
| Hybrid DOM + Three.js | UI over 3D canvas |

## 7. Plan architecture

Define before Implement:

- Files and folders
- Components and hooks
- Materials and shaders
- Assets and placeholders
- Fallbacks
- Controls
- Design tokens
- Mobile strategy
- Reduced-motion strategy

## 8. Build implementation

- Implementation agent
- `lab/src/three/` for shared code
- Project folder for scene-specific code
- Wire demo registry

## 9. Run loops

- `/loop` for visual tuning, perf, UX fixes
- `/loop-status` to track open items
- Loop discipline per `SKILL.md`

## 10. Run QA

- Visual design and UX (Interaction UX agent)
- Motion smoothness
- Responsive and mobile
- Accessibility and reduced-motion
- Performance and fallbacks (Performance agent)
- `npm run lint` and `npm run build`

## 11. Update documentation

- Documentation and Memory agent
- `PROJECT.md`, `threejs-notes.md`, patterns

## 12. Create reuse notes

- Tyler portfolio
- MaserMedia portfolio
- Client websites
- See `client-portfolio.md` template

## Project bootstrap (new slug)

```bash
mkdir -p projects/{category}/{slug}
cp projects/_template/PROJECT.md projects/{category}/{slug}/
# Edit PROJECT.md — add Three.js section
# Add to projects/registry.json
mkdir -p lab/src/components/projects/{category}/{slug}
cd lab && npm install three @types/three   # first 3D project only
```

Register demo in `lab/src/components/projects/registry.ts`.
