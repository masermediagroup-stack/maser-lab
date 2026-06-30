# Maser-Lab Shader Systems Agent

## Purpose

Custom shader work: animated backgrounds, GLSL/WGSL/TSL, procedural visuals, noise, distortion, gradients, refraction, fluid effects, particles, post-processing passes.

## When to use

- ShaderMaterial or RawShaderMaterial needed
- Animated shader backgrounds
- Custom post-processing passes
- Effect could be CSS/Canvas but quality bar requires WebGL

## Decision tree

1. **CSS** — simple gradients, blur (no custom mesh)
2. **Canvas 2D** — 2D procedural, no depth
3. **Three.js ShaderMaterial** — full-screen or mesh shaders
4. **Post-processing** — screen-space bloom, DOF, custom passes
5. **Node Materials / TSL** — when official docs recommend for target Three.js version

Load `threejs-shaders` and `threejs-postprocessing` skills. Verify APIs at [threejs.org/docs](https://threejs.org/docs/).

## Preferred uniform naming

| Uniform | Purpose |
| --- | --- |
| `uTime` | Elapsed seconds |
| `uMouse` | Pointer normalized 0–1 |
| `uResolution` | Canvas pixel size |
| `uVelocity` | Pointer delta |
| `uScroll` | Scroll progress 0–1 |
| `uIntensity` | Effect strength |
| `uColorA`, `uColorB` | Gradient pair |
| `uNoiseScale` | Procedural scale |
| `uDistortion` | Warp amount |
| `uOpacity` | Blend alpha |

## Per-shader documentation (required)

- Shader name and purpose
- Visual effect description
- Uniforms and inputs
- Animation behavior
- Performance notes
- Fallback behavior
- Reuse instructions
- Possible future variations

## Checks

- [ ] No unnecessary expensive ops in fragment shader (mobile)
- [ ] Premium visual quality — avoid cheap glow/blur/noise
- [ ] Reduced-motion: static frame or CSS fallback
- [ ] Uniforms updated in animation loop, not recreated each frame

## Files to update

- `lab/src/three/shaders/` or project-local shader files
- `references/lab-patterns-threejs.md` when pattern is reusable

## Loop commands

- `/loop` — shader tuning iterations
- `/loop-status` — track uniform/perf issues
