# Maser-Lab Three.js Notes

Knowledge base for Three.js, shaders, and 3D work in Maser-Lab.

## Source links

| Resource | URL | Role |
| --- | --- | --- |
| Official Three.js docs | https://threejs.org/docs/ | **Final API authority** |
| Three.js examples | https://threejs.org/examples/ | Reference implementations |
| CloudAI-X skills | https://github.com/cloudai-x/threejs-skills | Practical agent patterns |
| HyperFrames Three adapter | `.agents/skills/hyperframes-animation/adapters/three.md` | Seek-driven timelines only |

## Research workflow

1. Load **Research agent** (`references/agents/research.md`)
2. Read project `PROJECT.md`
3. Check official docs for every API used
4. Load relevant CloudAI-X skill(s)
5. Verify CloudAI-X against official docs
6. Output research template (see Research agent)
7. Archive in `PROJECT.md` before Implement

## Skill intake workflow

```bash
npx skills add cloudai-x/threejs-skills -y   # bundle (installed)
npx skills find "three.js"                   # discover more
npx skills check && npx skills update
```

Local paths: `.agents/skills/threejs-*`  
Do not edit CloudAI-X files; add Maser-Lab notes here instead.

## Renderer decision notes

| Need | Recommendation |
| --- | --- |
| Standard web 3D | `WebGLRenderer` — default, broad support |
| Next.js decorative canvas | `dynamic(() => import(...), { ssr: false })` |
| WebGPU experiments | `WebGPURenderer` when docs confirm support; fallback to WebGL |
| Full-screen gradient only | CSS — no Three.js |
| 2D procedural | Canvas 2D — no Three.js |
| Video-style timeline export | HyperFrames seek adapter — not rAF-driven |

## Shader decision notes

CSS → Canvas 2D → Three.js `ShaderMaterial` → post-processing stack.  
See Shader Systems agent for uniform naming (`uTime`, `uMouse`, `uResolution`, …).

## 3D environment notes

- One hero focal object beats cluttered scenes
- IBL + one key light often sufficient for product heroes
- Camera: match Figma frame aspect; update on resize
- GLTF/GLB: compress; show placeholder while loading

## Performance checklist

- [ ] Clamp `devicePixelRatio` (max 2)
- [ ] Dispose geometry/material/texture on unmount
- [ ] Cancel animation frame on unmount
- [ ] Limit shadow map size on mobile
- [ ] Reduce post-processing passes on mobile
- [ ] Use instancing for repeated objects
- [ ] Texture max 2048 on mobile when possible

## Mobile checklist

- [ ] Test iOS Safari and Android Chrome
- [ ] Touch interactions (no hover-only affordances)
- [ ] Simpler scene or static fallback on low-end
- [ ] Canvas does not block scroll unintentionally

## Reduced-motion checklist

- [ ] Respect `prefers-reduced-motion: reduce`
- [ ] Static fallback or paused scene
- [ ] DOM content remains fully usable

## Fallback checklist

- [ ] `WebGLRenderer` capability probe
- [ ] Static visual if WebGL fails
- [ ] Decorative scenes: page works without canvas

## Reusable patterns

_Patterns ship with projects; document in `lab-patterns-threejs.md`._

| Pattern | Status |
| --- | --- |
| Canvas lifecycle hook | Scaffold in `lab/src/three/hooks/` |
| Renderer factory | Scaffold in `lab/src/three/utils/` |
| Static fallback component | Scaffold in `lab/src/three/fallbacks/` |
| R3F kinetic bar sculpture | Shipped: `display/kinetic-perspective-bars` — shared `useFrame`, mode blend, pointer ripple |

## HyperFrames vs Maser-Lab loops

- **HyperFrames**: render from `hf-seek` event; no rAF as source of truth
- **Maser-Lab demos**: `requestAnimationFrame` or `setAnimationLoop` with cleanup; standard React lifecycle
- **R3F demos**: single `useFrame` controller; refs for per-frame values; no React state inside the frame loop

## Open questions

- WebGPU + Next.js 16 production patterns
- Shared post-processing composer utility
- Automated WebGL perf evals in `tooling/scripts/evals/`
- Instanced rounded bars with per-instance edge strokes (perf vs craft tradeoff)

## Future experiments

- WebGPU particle systems
- TSL / Node Materials for r174+ Three.js
- Scroll-driven camera with Lenis/GSAP integration
- Figma depth layers → Three.js planes
