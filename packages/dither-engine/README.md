# @maser/dither-engine

Portable **Maser Dither Engine** runtime for React 19 + WebGL2.

This package is the consumer-facing surface of the lab product barrel
(`runtime.ts` + `export/`). It does **not** include the Lab editor shell
(`DitherEngineApp`, `shell/`, Project Browser).

## Install (local monorepo)

```bash
# from repo root
npm install
cd packages/dither-engine && npm run sync
```

Local pack dry-run (v0.9 path):

```bash
cd packages/dither-engine
npm run pack:dry
npm run verify:no-shell
```

## Usage

```tsx
import {
  SurfaceCanvas,
  DitherCard,
  ENGINE_VERSION,
  buildRuntimeConfig,
} from "@maser/dither-engine";
import "@maser/dither-engine/tokens.css";
```

Peer dependencies: `react` / `react-dom` `^19`. No Three.js.

## Sync model

`npm run sync` copies an allowlist from
`lab/src/components/projects/display/maser-dither-engine/` into `src/`.
Excluded: `shell/`, `projects/`, `engine/preview`, demos.

See `docs/roadmap/06-EXPORT-SYSTEM.md` and `TRANSFER.md`.

## Version

Aligned with `ENGINE_VERSION` **0.8.0**. Public npm publish is optional until
the v1.0 transfer gates pass; local `npm pack` is the required proof path.
