# Maser-Lab Three.js Patterns

Reusable patterns for 3D work. Complements `maser-lab-web/references/patterns.md`.

## Status

Patterns are added when a project ships to `review` or `ready`. Scaffolds exist before first demo.

## Scaffold patterns (setup)

### Client-only canvas shell

- `lab/src/three/components/three-canvas.tsx` — wrapper with fallback slot
- `lab/src/three/fallbacks/static-fallback.tsx` — decorative failure UI

### Capability probe

- `lab/src/three/utils/capabilities.ts` — WebGL support, reduced motion

### Lifecycle hook

- `lab/src/three/hooks/use-three-canvas.ts` — mount container ref, resize, cleanup callback

### Disposal utility

- `lab/src/three/utils/dispose.ts` — traverse and dispose GPU resources

## Shipped patterns

| Pattern | Project | Notes |
| --- | --- | --- |
| Orthographic curtain strips | `layout/page-transitions-lab` | CanvasTexture of destination page → UV-sliced planes fall with stagger; CSS strip fallback without WebGL. See `curtain-fall-scene.tsx`. |

## Planned patterns

| Pattern | Description |
| --- | --- |
| Full-screen shader quad | Orthographic camera + plane for backgrounds |
| Scroll-driven camera | `uScroll` uniform + DOM scroll progress |
| Pointer-reactive shader | `uMouse` + `uVelocity` uniforms |
| GLTF hero with loading UI | Loaders skill + placeholder |
| Mobile degrade | Disable post-processing, lower DPR |
| Kinetic bar formation | `display/kinetic-perspective-bars` — R3F rounded slabs, shared `useFrame` wave, mode blend, pointer ripple, Leva + export |

## Anti-patterns

- Three.js in Server Components
- No disposal on route change
- Hover-only interaction on touch devices
- Canvas blocking scroll without intent
- rAF loop without cleanup

## Contributing

After shipping a demo, add a row to the table above with file path and link to `PROJECT.md`.
