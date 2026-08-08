# 06 — Export System

**Stable product boundary** for transferring Dither Engine into other web projects.  
Related: [01](./01-ENGINE-ARCHITECTURE.md) · [04](./04-COMPONENT-SYSTEM.md) · [00](./00-VISION.md) · `maser-lab-export` · `TRANSFER.md`

## Runtime separation

| Layer | Ships to consumer? | Paths |
| --- | --- | --- |
| Engine runtime | **Yes** | `engine/**` (except treat `preview/ThumbBlitEngine` as optional/lab) |
| React bridge | **Yes** | `react/SurfaceCanvas.tsx` |
| Adapters | **Yes** | `components/adapters/**`, `surfaces/**` as needed |
| Catalogs / types | **Yes** | material/preset/component catalogs needed at runtime |
| Product tokens + module CSS | **Yes** | `tokens.css` product vars; adapter-scoped CSS |
| Lab shell | **No** | `shell/**`, studio, sidebar, docs pages inside app |
| Lab tokens | **No** | `--lab-*` |
| DemoHost / registry demo | **No** | lab app wiring |

```text
Consumer app
  └── PACKAGE_NAME
        ├── engine/
        ├── react/SurfaceCanvas
        ├── adapters/
        └── tokens + scoped CSS

Maser-Lab
  └── shell/ + demos (authoring only)
```

## Public API freeze (v0.9 → v1.0)

Today `index.ts` re-exports engine pieces **and** `DitherEngineApp`. Before registry `ready`:

1. Define **product barrel** (engine + canvas + adapters + catalogs + types + tokens).
2. Move lab app entry to a non-packaged path (e.g. demo-only import).
3. Document exports in `TRANSFER.md` and this file.
4. Add migration notes for any renamed exports.

## Project / preset / component export

| Kind | Current | Target |
| --- | --- | --- |
| Project | `.mde.json` import/export in lab | Remains lab interchange; not required for npm consumers |
| Preset | System catalog in repo | Serializable preset objects consumers can pass as props |
| Component | Source adapters | Packaged React components |
| Package | Lab monorepo path | Single npm package (name TBD) |

## Tokens & CSS rules

- Ship **product tokens only** (surface/material/adapter variables).
- Ship **module-scoped CSS** needed for adapters.
- **Do not** ship `--lab-*` or studio layout CSS.
- Follow `maser-lab-token-system`: product must render without lab tokens.

## npm packaging — skill spec (implement later)

> **Do not create a new skill in this docs PR.** When packaging work starts, **extend** `.agents/skills/maser-lab-export/` with the workflow below.

### Intended skill additions (`maser-lab-export`)

1. **Prepare product tree** — include allowlist paths; exclude `shell/`.
2. **Generate/verify barrel** — product-only `index.ts` (or `package/index.ts`).
3. **Local pack** — `npm pack` → install tarball into a scratch Next/Vite app.
4. **Smoke** — render `SurfaceCanvas` + one adapter; confirm no `--lab-*` dependency; WebGL non-black.
5. **Versioning** — align `ENGINE_VERSION` / package semver; write migration blurb on breaking changes.
6. **Public publish** — only after local pack path is proven; lock `PACKAGE_NAME` then.
7. **TRANSFER.md** — fill install snippet, peer deps (React 19), WebGL2 note, CSS import path.

### Package identity

- Docs use placeholder **`PACKAGE_NAME`** until packaging locks the name (grilled Q16).
- Peer dependencies: React / React DOM (match lab major).
- No Three.js dependency.

### Workflow order (grilled Q7)

```text
API freeze candidate → local npm pack → install in test app → fix leaks
  → acceptance audit + TRANSFER → public publish (optional same milestone)
  → registry status ready
```

## Transfer system (lab today)

- Spec: `projects/display/maser-dither-engine/TRANSFER.md`
- Skills: `maser-lab-export`, `maser-lab-acceptance-audit`, `maser-lab-token-system`
- Registry stays `building` until v1.0 gates pass ([DEVELOPMENT-ROADMAP](./DEVELOPMENT-ROADMAP.md))

## Versioning & migration

| Mechanism | Role |
| --- | --- |
| `ENGINE_VERSION` in `constants.ts` | In-engine identity (currently `0.7.13`) |
| Package semver | Consumer-facing (set at npm time) |
| `engine/dither/migrate.ts` | Example of config migration — extend pattern for breaking uniform/API changes |
| Roadmap milestones | Communicate breaking windows |

Breaking changes require: migration note, barrel update, demo smoke, TRANSFER update.

## Validation before `ready`

- [ ] Product barrel excludes shell / `--lab-*`
- [ ] Local `npm pack` install smoke passed
- [ ] `TRANSFER.md` has no template placeholders
- [ ] Acceptance audit proves ACs
- [ ] Roadmap stubs for touched domains promoted ([10](./10-QA.md))

## Cloud sync (docs foreshadow only)

v1.0 does **not** implement cloud sync. Projects JSON should remain portable so a future sync layer can wrap files without rewriting the engine. No Convex stubs, no reserved remote schema fields in v1.0 code. See [07](./07-ASSET-SYSTEM.md) / [08](./08-PRESET-STUDIO.md) stubs and [11](./11-V2-FUTURE.md).

## Why (human)

Export is the product finish line. Specifying npm inside `maser-lab-export` keeps agents on one Transfer path instead of inventing a second packaging skill too early.
