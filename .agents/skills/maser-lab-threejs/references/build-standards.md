# Three.js Build Standards

## Principles

- Separate scene setup from UI layout
- Clean animation loops with cleanup
- Progressive enhancement — page works without WebGL when decorative
- Document performance risks and placeholder assets

## Folder layout

Use project conventions first. Default for shared code:

```text
lab/src/three/
├── README.md
├── components/     # ThreeCanvas wrapper
├── hooks/          # useThreeCanvas, resize
├── utils/          # renderer, dispose, capabilities
├── fallbacks/      # static fallback UI
├── shaders/        # shared GLSL (when projects exist)
├── materials/
├── geometries/
└── scenes/         # optional shared scenes
```

Per-project code:

```text
lab/src/components/projects/{category}/{slug}/
├── index.ts
├── *-demo.tsx
├── scene/          # scene setup
├── shaders/        # project-specific GLSL
└── tokens.css      # scoped design tokens
```

## Renderer

```typescript
// Clamp pixel ratio
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Resize with container
renderer.setSize(width, height, false);
```

## Lifecycle

- Create renderer/scene in `useEffect` or dedicated hook
- `cancelAnimationFrame` / `renderer.setAnimationLoop(null)` on unmount
- `window.removeEventListener('resize', ...)` on unmount
- Call `dispose()` helper for geometries, materials, textures

## Next.js

- Mark Three.js components `"use client"`
- Use `next/dynamic` with `{ ssr: false }` for canvas-heavy demos
- Do not import `three` in Server Components

## Dependencies

- Add `three` and `@types/three` on first real project
- Defer `@react-three/fiber` until a project needs it
- Avoid large unused addons in bundle

## Naming

- Scene files: `*-scene.ts` or `scene.ts`
- Shaders: `*.vert.glsl`, `*.frag.glsl` or inline with clear names
- Uniforms: `uTime`, `uMouse`, `uResolution` (see Shader Systems agent)

## Assumptions

Document in `PROJECT.md`:

- Placeholder models/textures
- Target devices
- Whether 3D is decorative or required
