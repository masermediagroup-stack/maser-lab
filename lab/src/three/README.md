# lab/src/three

Shared Three.js utilities for Maser-Lab demos.

**Knowledge base:** [`.agents/skills/maser-lab-threejs/references/threejs-notes.md`](../../.agents/skills/maser-lab-threejs/references/threejs-notes.md)

## Install (first real 3D project)

```bash
cd lab && npm install three @types/three
```

## Layout

| Path | Purpose |
| --- | --- |
| `components/three-canvas.tsx` | Client wrapper shell |
| `hooks/use-three-canvas.ts` | Container ref, resize, cleanup |
| `utils/capabilities.ts` | WebGL probe, reduced motion |
| `utils/dispose.ts` | GPU resource cleanup |
| `utils/renderer.ts` | Renderer factory (requires `three`) |
| `fallbacks/static-fallback.tsx` | Decorative fallback UI |

Per-project scenes live under `src/components/projects/{category}/{slug}/`.

## Conventions

See `.agents/skills/maser-lab-threejs/references/build-standards.md`.
