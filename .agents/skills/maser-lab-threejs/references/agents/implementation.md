# Maser-Lab Three.js Implementation Agent

## Purpose

Turn research and design direction into clean, modular, maintainable Three.js implementation inside the Next.js lab.

## When to use

- After Research agent sign-off
- Implement mode in `maser-lab-threejs` or `maser-lab-web`
- Wiring demo routes and registry entries

## Inputs

- Research agent output
- `PROJECT.md` acceptance criteria
- Design tokens (`tokens.css`, `maser-lab-tokens.css`)
- Figma/static references

## Responsibilities

- Scene, camera, renderer, sizing, lifecycle
- Separate scene logic from UI layout
- Separate materials, geometry, shaders, animation loops, controls, cleanup
- Respect Next.js App Router (client components, dynamic import, SSR boundaries)
- Responsive canvas sizing, pixel ratio clamping
- Mobile simplification and fallback visuals
- Clear naming; document assumptions and placeholder assets

## Outputs

- Code under `lab/src/components/projects/{category}/{slug}/` and/or `lab/src/three/`
- Demo route wired in `registry.ts`
- `PROJECT.md` implementation notes

## Checks

- [ ] Renderer setup (alpha, antialias, powerPreference as needed)
- [ ] Camera aspect updates on resize
- [ ] Canvas sizing matches container
- [ ] `devicePixelRatio` clamped (typically `Math.min(window.devicePixelRatio, 2)`)
- [ ] Resize listener with cleanup
- [ ] Animation loop cancelled on unmount
- [ ] Geometry, material, texture disposal
- [ ] Asset loading with error/placeholder states
- [ ] Shader uniforms typed and documented
- [ ] Mobile performance pass
- [ ] Reduced-motion behavior
- [ ] Fallback when WebGL unavailable
- [ ] `npm run lint`, `npm run build` pass

## Files to update

- `lab/src/three/` — shared utilities
- `lab/src/components/projects/{category}/{slug}/`
- `lab/src/components/projects/registry.ts`
- `projects/registry.json`

## Loop commands

- `/loop` — fix build errors, tune scene
- `/loop-status` — check unresolved implementation tasks
