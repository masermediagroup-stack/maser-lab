# Transfer — Maser Dither Engine

**Status:** building

## Export

```ts
import {
  SurfaceCanvas,
  SurfaceCard,
  DitherEngineApp,
  createMonochromeMaterial,
  createEngineParams,
  ComponentCatalog,
  MaterialCatalog,
  PresetCatalog,
  MONOCHROME_DEFAULTS,
} from "@/components/projects/display/maser-dither-engine";
```

## Product kind

**lab** — portable units: `engine/` core + `SurfaceCanvas` / adapters. Shell (`DitherEngineApp`) is the lab workspace.

## Dependencies

- React 19, WebGL2 (Canvas2D fallback), shadcn Slider/Label/Button for playground chrome
- No Three.js

## Porting

1. Copy `lab/src/components/projects/display/maser-dither-engine/`
2. Import `tokens.css` when using shell or adapters
3. Prefer `SurfaceCanvas` + `createEngineParams` in product apps; omit shell if undesired
