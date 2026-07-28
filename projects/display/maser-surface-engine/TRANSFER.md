# Transfer — Maser Surface Engine

**Status:** building — fill completely before marking `ready`.

## Export

```ts
import {
  SurfaceCanvas,
  SurfaceCard,
  createMonochromeMaterial,
  MONOCHROME_DEFAULTS,
  type MonochromeParams,
} from "@/components/projects/display/maser-surface-engine";
```

## Product kind

**lab** — portable unit is the `engine/` core + `SurfaceCanvas` / `SurfaceCard` adapters. Demo controls stay out of the product barrel.

## Dependencies

- React 19
- Next.js (App Router) for demo only
- WebGL2 (runtime); Canvas2D fallback included
- `@/components/ui/button` (SurfaceCard CTA) — optional to swap
- No Three.js

## Props

See `types.ts` — `MonochromeParams`, `SurfaceCanvasProps`, `SurfaceCardProps`.

## Public assets

None required (procedural).

## Porting steps

1. Copy `lab/src/components/projects/display/maser-surface-engine/` (exclude `*-demo.tsx` and `ui/MaterialControls.tsx` if undesired).
2. Import `tokens.css`.
3. Mount `SurfaceCanvas` or `SurfaceCard` with `MonochromeParams`.
4. Ensure client component boundary (`"use client"`).
