# Sprint 8.0 — Production Export, Packaging & Transfer

**Engine:** `0.8.0`  
**Schema:** `2.0.0` (`export/types.ts`)

## Boundary

| Portable (`runtime.ts` / product `index.ts`) | Lab-only (`index.lab.ts` / `shell/`) |
| --- | --- |
| `engine/`, `react/SurfaceCanvas`, adapters, materials, presets, `export/` | `DitherEngineApp`, panels, Project Browser, dock, FPS, favorites UI |

ESLint rule `lab-custom/no-dither-runtime-shell-imports` + Vitest import-graph checks keep `export/**` and runtime barrels free of `shell/` imports.

## Export modes (`#/export`)

1. **Project File** — `.maser-dither.json` (project meta + runtime)
2. **Preset File** — `.maser-preset.json` (visual domains; optional component settings)
3. **Runtime Configuration** — TS / JS / JSON · Minimal | Complete
4. **React Component** — Shared Runtime (default) vs Standalone file map
5. **Component Package** — file tree + ZIP (`fflate`, dynamic import)
6. **CSS Variables / design tokens** (+ optional Tailwind map)
7. **Shader Uniform Snapshot** — uniforms + material recipe + required GLSL chunk names
8. **Shareable Scene** — portable JSON + compact `#/scene?c=` hash when under budget (local-first, no cloud)
9. **Transfer Documentation** — component-specific `TRANSFER.md`

Validation gate: Ready | Warning | Blocked (`export/validate.ts`) before production downloads.

## Assets

Never emit live `blob:` URLs. Strategies: `reference` | `include` | `placeholder` | `base64` (opt-in). Nested CTA photo blobs stripped on snapshot capture (`sanitizeContentAssets`).

## Import

Parse → validate → detect version → `migrateV1ToV2` → summary → import as new or apply to current. Size cap + prototype-pollution sanitization.

## Presentation / fixtures

- `#/present` — client review chrome (title, material, Open in Editor / Duplicate)
- `#/scene` — decode shareable scene payload
- `#/transfer-fixtures` — Card / Button / Image Frame **without** shell panels

## History

`localStorage` key `mde:export-history:v1` — metadata only; re-export regenerates from current runtime.

## Non-goals (→ Sprint 8.1 / v0.9+)

Cloud sync, IndexedDB upload persistence by default, visual regression matrix, public npm publish (scaffold `@maser/dither-engine` exists — local `npm pack` is the v0.9 proof), Canvas2D algorithm parity.
