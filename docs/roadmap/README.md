# Maser Dither Engine — Roadmap Index

**Canonical planning** for the Maser Dither Engine and (lightly) future Maser-Lab engines.  
**Audience:** Cursor agents first; short human “why” sections second.  
**Baseline:** engine `0.7.13` · registry status `building` · demo `/demos/maser-dither-engine`

This folder supersedes sprint-numbered planning. Sprint notes under `lab/.../docs/sprint*.md` and `projects/display/maser-dither-engine/docs/` remain a **historical archive**.

## Stable vs Horizon

| Kind | Meaning | Agent rule |
| --- | --- | --- |
| **Stable contract** | Current architecture that must not be broken | Obey. Cite paths. Do not rewrite for convenience. |
| **Horizon** | 1–5 year ideas | Never treat as a ticket to violate stable contracts. Requires an explicit migration milestone. |

Sacred engine contracts live in:

- [`projects/display/maser-dither-engine/AGENTS.md`](../../projects/display/maser-dither-engine/AGENTS.md)
- [`lab/.../engine/AGENTS.md`](../../lab/src/components/projects/display/maser-dither-engine/engine/AGENTS.md)
- [`docs/engine-lessons.md`](../../lab/src/components/projects/display/maser-dither-engine/docs/engine-lessons.md)

Roadmap docs **must not contradict** those contracts.

## Product one-liner

**Job:** author dither material components in the lab and **export them into other web projects**.  
**Product:** shared WebGL2 engine + React bridge + adapters + product tokens + module-scoped CSS.  
**Not product:** Studio / mobile workspace / Presets chrome (`shell/`) — lab tooling only.

## Agent read order by task

| Change type | Read first |
| --- | --- |
| Any dither work | This README → project `AGENTS.md` → `engine/AGENTS.md` |
| Shader / pipeline | [02-RENDER-PIPELINE](./02-RENDER-PIPELINE.md) → [01-ENGINE-ARCHITECTURE](./01-ENGINE-ARCHITECTURE.md) → `engine/AGENTS.md` |
| Materials | [03-MATERIAL-SYSTEM](./03-MATERIAL-SYSTEM.md) → `engine/material/` |
| Adapters / components | [04-COMPONENT-SYSTEM](./04-COMPONENT-SYSTEM.md) → [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md) |
| Lab mobile / studio shell | [05-MOBILE-WORKSPACE](./05-MOBILE-WORKSPACE.md) (lab-only) |
| Export / npm / TRANSFER | [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md) → `maser-lab-export` skill |
| Milestone / priority | [DEVELOPMENT-ROADMAP](./DEVELOPMENT-ROADMAP.md) |
| Assets / presets / future engines | Matching stub (`07`–`08`, `11`) — **promote stub in same PR when shipping code** |
| Perf / release QA | [09-PERFORMANCE](./09-PERFORMANCE.md), [10-QA](./10-QA.md) |
| Vision / non-goals | [00-VISION](./00-VISION.md) |

## Document map

| File | Depth | Owns |
| --- | --- | --- |
| [00-VISION.md](./00-VISION.md) | Deep | Why, philosophy, non-goals, success metrics, ecosystem foreshadow |
| [01-ENGINE-ARCHITECTURE.md](./01-ENGINE-ARCHITECTURE.md) | Deep | Modules, boundaries, debt, stable vs horizon |
| [02-RENDER-PIPELINE.md](./02-RENDER-PIPELINE.md) | Deep | Stage I/O, uniforms, extension points |
| [03-MATERIAL-SYSTEM.md](./03-MATERIAL-SYSTEM.md) | Deep | Material catalog, recipes, layering |
| [04-COMPONENT-SYSTEM.md](./04-COMPONENT-SYSTEM.md) | Deep | Adapters, shared APIs, a11y |
| [05-MOBILE-WORKSPACE.md](./05-MOBILE-WORKSPACE.md) | Medium | Lab mobile + desktop playground IA (non-transferable) |
| [06-EXPORT-SYSTEM.md](./06-EXPORT-SYSTEM.md) | Deep | Runtime/shell split, npm skill **spec**, tokens |
| [07-ASSET-SYSTEM.md](./07-ASSET-SYSTEM.md) | Stub | Promote when asset work ships |
| [08-PRESET-STUDIO.md](./08-PRESET-STUDIO.md) | Partial | Thumb policy + browser IA; collections still stub |
| [09-PERFORMANCE.md](./09-PERFORMANCE.md) | Thin | Context budget + known constraints |
| [10-QA.md](./10-QA.md) | Thin | Release + stub-promotion gates |
| [11-V2-FUTURE.md](./11-V2-FUTURE.md) | Stub / horizon | Multi-engine brainstorm — not tickets |
| [DEVELOPMENT-ROADMAP.md](./DEVELOPMENT-ROADMAP.md) | Deep | v0.8 → v2.0 milestones |

## Stub promotion contract

When shipping code for a stubbed domain (assets, preset redesign, new engine, etc.):

1. **Same PR** must promote the matching `docs/roadmap/0N-*.md` from stub → full engineering depth for what shipped.
2. [10-QA.md](./10-QA.md) release checklist includes “roadmap stubs for touched domains promoted.”
3. Ideas in [11-V2-FUTURE.md](./11-V2-FUTURE.md) never authorize violating stable contracts.

## Living roadmap

Active milestones: [DEVELOPMENT-ROADMAP.md](./DEVELOPMENT-ROADMAP.md).  
Sprint 8+ lists in `PROJECT.md` are superseded by those milestones.
