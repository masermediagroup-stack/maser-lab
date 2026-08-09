# Transfer — Maser Dither Engine

**Status:** building  
**Engine:** `0.8.0`  
**Export schema:** `2.0.0`

## Product barrel (portable)

```ts
import {
  SurfaceCanvas,
  DitherCard,
  DitherButton,
  DitherImageFrame,
  // …other adapters
  createMonochromeMaterial,
  createEngineParams,
  ComponentCatalog,
  MaterialCatalog,
  PresetCatalog,
  MONOCHROME_DEFAULTS,
  ENGINE_VERSION,
  buildRuntimeConfig,
  createExportDoc,
  generateExportOutput,
  parseAndMigrateImport,
  validateExportDoc,
} from "@maser/dither-engine";
import "@maser/dither-engine/tokens.css";
```

Monorepo package: `packages/dither-engine` (sync from lab via `npm run sync:dither`).

Lab editor shell is **not** on the product barrel. For demos only:

```ts
import { DitherEngineApp } from "@/components/projects/display/maser-dither-engine/index.lab";
```

## Product kind

**lab** — portable units: `engine/` + `react/SurfaceCanvas` + `components/adapters` + `export/`.  
Do **not** copy `shell/`, Project Browser, or control panels into client apps.

## Dependencies (minimal runtime)

| Required | Notes |
| --- | --- |
| React 19 | Adapters + `SurfaceCanvas` |
| WebGL2 | Primary path; Canvas2D fallback for subset |
| Host CSS | `tokens.css` / generated design tokens when styling chrome |

| Not required | |
| --- | --- |
| Three.js | Never used by this engine |
| Lab shell / shadcn playground chrome | Editor-only |
| `fflate` | Only if you ZIP packages in-app (Lab Export workspace) |

## Porting steps

1. Copy portable folders: `engine/`, `react/`, `components/adapters`, `components/registry.ts`, `surfaces/` (as needed), `content/`, `materials/`, `presets/`, `export/`, `runtime.ts`, `tokens.css`, `constants.ts`.
2. Import via product `index.ts` / `runtime.ts` — never import `shell/**`.
3. Prefer schema `2.0.0` runtime configs from Export workspace (`#/export`) or `buildRuntimeConfig`.
4. Import legacy `.mde.json` / v1 snapshots with `parseAndMigrateImport`.
5. Honor `accessibility.reducedMotionPolicy` (`respect` | `force-reduce` | `ignore`).
6. For Image Frame / Avatar / CTA photos: use public paths or package assets — never `blob:` URLs.
7. Verify WebGL surface is non-black after any shader change (`docs/engine-lessons.md`).

## Export from the Lab

Open `/demos/maser-dither-engine#/export` for the nine production modes, validation gate, ZIP packaging, and component-specific TRANSFER.md generation.

Independent proof fixtures (no editor): `#/transfer-fixtures`.

## Engine invariants (do not regress)

- `VERT_SRC` stays on `gl_VertexID` fullscreen triangle (no `aPos` without a VBO).
- Keep `SAMPLE_GLSL` helpers (`sampleBayer` / `sampleBlue` / `uPosterization`).
- One shared WebGL2 pipeline — not Three.js, not a second renderer.
