# DEVELOPMENT-ROADMAP

Living product milestones for Maser Dither Engine.  
**Supersedes** Sprint 8+ recommendation lists in `PROJECT.md`.  
Baseline: engine `0.7.13` · status `building`.

Related: [00-VISION](./00-VISION.md) · [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md) · [10-QA](./10-QA.md) · [11-V2-FUTURE](./11-V2-FUTURE.md)

## Milestone map

```text
0.7.x (now) → v0.8 → v0.9 → v1.0 (ready) → v1.5 (multi-engine) → v2.0
```

| Milestone | Intent |
| --- | --- |
| **v0.8** | Lab studio harden that improves export quality |
| **v0.9** | API freeze candidate + local `npm pack` dry-run + regression foundation |
| **v1.0** | Acceptance + TRANSFER + package path → registry `ready` |
| **v1.5** | First engines beyond Dither + expand stubs `07`/`08` as built |
| **v2.0** | Multi-engine contracts + horizon systems under migration discipline |

**Out of v1.0:** Canvas2D full parity, new material IDs as must-haves, cloud sync implementation, marketplace.

---

## v0.8 — Studio harden (export quality)

### Goals

Make authoring reliable so exported components are designed with durable content and inspectable structure.

### Major features

- Persist uploads (data URL / IndexedDB) across project save
- Component inspector sheet (padding / radius / content) as dock target
- Wire `StudioSlider` across panels by default
- Continuous FBO thumb refresh without JPEG churn (still one context)
- Live Material Dock animation within context budget

### Architecture

No renderer rewrite. Projects store + `shell/studio/` only; engine uniform uploads unchanged except as needed for thumbs.

### Breaking changes

None expected at engine GLSL level.

### Migration

If project JSON gains upload blobs, document size limits and migration in store version key.

### Risks

Quota / large images; accidental multi-context thumbs.

### Performance

Context budget audits ([09](./09-PERFORMANCE.md)).

### Testing

Manual upload→reload→non-black; Materials page context count.

### Documentation

Update [07](./07-ASSET-SYSTEM.md) stub → promote sections that ship.

### Dependencies

None external.

### Estimated complexity

Medium (persistence + UI wiring).

### Recommended order

1. Upload persistence  
2. Inspector dock  
3. StudioSlider defaults  
4. Thumb refresh polish  

---

## v0.9 — API freeze candidate + local pack

### Goals

Define the consumer surface and prove install via **local `npm pack`** before public publish.

### Major features

- Product vs lab barrel split (`DitherEngineApp` out of product entry)
- Public API list + migration notes
- Local pack → scratch app smoke ([06](./06-EXPORT-SYSTEM.md))
- Visual regression **foundation** (algorithms × materials × sizes — start small)
- Extend `maser-lab-export` skill with npm workflow (spec already in [06](./06-EXPORT-SYSTEM.md))

### Architecture

Packaging layout / exports only; sacred `VERT_SRC` / `SAMPLE_GLSL` untouched.

### Breaking changes

Possible barrel export removals (lab-only symbols). Document migrations.

### Migration

Changelog of removed re-exports; codemod optional.

### Risks

Accidentally packaging `shell/` or `--lab-*`.

### Performance

Pack size sanity; tree-shaking notes.

### Testing

Scratch app render; lint/build; pack allowlist review.

### Documentation

[06](./06-EXPORT-SYSTEM.md), TRANSFER draft snippets, skill update when implementing.

### Dependencies

npm auth not required for local pack.

### Estimated complexity

Medium–high (barrel discipline + skill extension).

### Recommended order

1. Barrel split  
2. Pack allowlist  
3. Scratch smoke  
4. Regression foundation scaffolding  
5. Skill implementation  

---

## v1.0 — Transfer ready

### Goals

Registry `ready`: consumers can use the module; lab ACs proven; npm path proven (public publish when name locked).

### Major features

- Acceptance audit pass (no false-checked ACs)
- `TRANSFER.md` complete
- Package path proven (local pack required; public publish optional same milestone once `PACKAGE_NAME` locked)
- QA gates in [10](./10-QA.md)

### Architecture

Freeze product API. Cloud sync = **docs foreshadow only**.

### Breaking changes

Should be empty at release; if any, must ship with migration.

### Migration

Semver + `ENGINE_VERSION` alignment notes.

### Risks

Declaring `ready` without pack smoke; token leakage.

### Performance

No regression vs v0.9 smoke.

### Testing

Full [10](./10-QA.md) v1.0 checklist.

### Documentation

Roadmap + TRANSFER + PROJECT pointer consistent.

### Dependencies

`maser-lab-acceptance-audit`, `maser-lab-export` (+ npm steps).

### Estimated complexity

Medium (process + verification more than new features).

### Recommended order

1. Audit ACs  
2. Pack smoke sign-off  
3. TRANSFER finalize  
4. Registry status flip  

---

## v1.5 — Beyond Dither

### Goals

Start **additional engines** (e.g. Liquid / Glass) using Dither contracts as the template; expand asset/preset stubs as those systems need them.

### Major features

- Second engine project scaffold + docs under roadmap / `projects/`
- Shared export patterns from [06](./06-EXPORT-SYSTEM.md)
- Promote [07](./07-ASSET-SYSTEM.md) / [08](./08-PRESET-STUDIO.md) where code lands
- Optional deeper glass variants / new material IDs on Dither if still needed

### Architecture

New engine = new program/pipeline **or** shared host — decide in that engine’s ADR; do not break Dither sacred paths.

### Breaking changes

Prefer additive packages.

### Migration

Cross-engine token naming conventions.

### Risks

Copy-paste architecture drift; context budget across demos.

### Performance

Per-engine budgets.

### Testing

Each engine’s non-black / lint / build gates.

### Documentation

Promote [11](./11-V2-FUTURE.md) sections that become real; add engine-specific roadmap files as needed.

### Dependencies

Dither v1.0 stable as reference.

### Estimated complexity

High (new product surface).

### Recommended order

1. Pick first new engine (Liquid or Glass)  
2. Scaffold + contracts doc  
3. Minimal pipeline + one adapter  
4. Export path reuse  

---

## v2.0 — Ecosystem contracts

### Goals

Multi-engine Lab consistency; optional marketplace/plugin schemas; WebGPU only with migration discipline.

### Major features

- Shared engine host conventions
- Plugin / marketplace-ready metadata (if pursued)
- Selective horizon items from [11](./11-V2-FUTURE.md)

### Architecture

Stable vs horizon enforcement across engines.

### Breaking changes

Possible major semver across packages — require migrations.

### Migration

Explicit per-package guides.

### Risks

Boiling the ocean; treating horizon as sprint scope.

### Performance

Lab-wide context and bundle budgets.

### Testing

Cross-engine QA matrix.

### Documentation

Ecosystem index; promoted stubs.

### Dependencies

v1.5 learnings.

### Estimated complexity

Very high — sequence verifiable units; do not big-bang.

### Recommended order

Defer until at least two engines exist and export paths are boring.

---

## Complexity legend

| Label | Meaning |
| --- | --- |
| Medium | Contained to known modules; limited migration |
| Medium–high | Cross-cutting barrel/packaging or skill work |
| High | New engine or major product surface |
| Very high | Multi-package ecosystem changes |

## Why (human)

Milestones replace sprint folklore with a finish line agents can aim at: **exportable module, then more engines.**
