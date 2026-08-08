# 00 — Vision

**Stable framing** for why the Dither Engine exists and what “done” means.  
Related: [DEVELOPMENT-ROADMAP](./DEVELOPMENT-ROADMAP.md) · [11-V2-FUTURE](./11-V2-FUTURE.md) · [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md)

## Product vision

Maser Dither Engine is Maser-Lab’s **reference material engine**: one shared procedural WebGL2 surface that powers many UI adapters, authored in-lab and **exported into other web projects**.

It is not a general UI kit. It is not a Three.js demo farm. It is a **portable dither/material runtime** with a lab creative shell used to design and verify components before transfer.

### Why it exists

1. **Consistency** — one GLSL program (`engine/pipeline/stages.ts`) so Card, Button, Nav, etc. share look and physics.
2. **Craft** — dither, materials, lighting, and interaction are first-class, not CSS filters bolted on.
3. **Transfer** — lab designers can ship adapters + engine into portfolio/client apps without dragging Studio chrome.
4. **Template** — architecture becomes the pattern for future engines (Liquid, Glass, …) starting at **v1.5**.

## Long-term goals

| Horizon | Goal |
| --- | --- |
| Near (v0.8–v1.0) | Freeze exportable public API; local `npm pack` path; registry `ready` |
| Mid (v1.5) | Second engine in the Lab using shared contracts from this docs set |
| Far (v2.0 / [11](./11-V2-FUTURE.md)) | Multi-engine ecosystem, optional plugin/marketplace schemas |

## Design philosophy

- **One program, many controllers** — CPU packs uniforms; fragment pipeline owns look. Do not fork shaders per adapter.
- **Clear ownership** — lighting = luminance; color = chroma; material = structure/UV/finish; dither = threshold/quantization. See [01](./01-ENGINE-ARCHITECTURE.md).
- **Incremental evolution** — never rewrite stable renderer/`VERT_SRC`/`SAMPLE_GLSL` for features. Extend.
- **Lab shell ≠ product** — `shell/` exists so humans and agents can author materials; it does not ship in the package.

## UX philosophy (lab tooling)

- Feels like a small creative app (overview → components → materials → playground), not an endless slider list.
- Prefer one live WebGL surface per view; grids use CSS swatches (`ThumbBlitEngine` for bitmaps).
- Mobile workspace is a **lab convenience** ([05](./05-MOBILE-WORKSPACE.md)), not the exported product.

## Technical philosophy

- WebGL2 fullscreen triangle via `gl_VertexID` (no VBO today).
- Controllers → uniforms → single `FRAG_SRC` assembly.
- Canvas2D fallback exists for no-WebGL; full algorithm parity is **not** a v1.0 requirement.
- Product CSS tokens only in the package — never `--lab-*` ([06](./06-EXPORT-SYSTEM.md), `maser-lab-token-system`).

## Creative philosophy

- Materials should be **visually distinct** under identical shared settings.
- Presets are looks, not architecture. Structure belongs to `engine/material/`, not Color “behavior” chips.
- Reduced motion mutes flicker/ambient drama; surfaces still render.

## Non-goals

- Not rewriting the WebGL pipeline or migrating to Three.js `ShaderMaterial`.
- Not a general design-system component library outside dither materials.
- Not physically accurate refraction / full environment cubemaps (abstractions only).
- Not cloud sync, multiplayer, or marketplace in v1.0 (docs foreshadow only).
- Not shipping Studio/mobile chrome to consumers.

## Success metrics

| Metric | Signal |
| --- | --- |
| Export works | Consumer app renders an adapter with product tokens only (no lab shell) |
| API frozen | Public barrel documented; migration notes for breaking changes |
| npm path | Local `npm pack` + install-into-test-app proven; public name locked later |
| Registry | `status: "ready"` only after acceptance audit + TRANSFER + npm path |
| Agent clarity | Agents load this roadmap before inventing architecture from commits |
| Stability | No black-screen regressions; `SAMPLE_GLSL` / `VERT_SRC` contracts intact |

## Maser-Lab ecosystem (foreshadow only)

```text
Maser-Lab
├── Dither Engine     ← current focus (this docs set)
├── Glass / Liquid / Mesh Gradient / Grain / …   ← v1.5+
├── Shared patterns   ← one program · controllers · export split
├── Component adapters
├── Preset Studio / Playground / Inspector       ← lab chrome
└── Marketplace       ← horizon ([11](./11-V2-FUTURE.md))
```

Do **not** design those engines in this pass. Keep them as foreshadow so future work reuses Dither contracts instead of inventing a second architecture.

## Why (human)

The engine outgrew “shader demo.” Sprint-by-sprint notes cannot guide years of agents. This vision keeps the product = **exportable materials**, the lab = **authoring surface**, and future engines = **same contracts, new pipelines**.
