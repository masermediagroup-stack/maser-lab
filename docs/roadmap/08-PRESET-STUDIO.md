# 08 — Preset Studio

**Status: STUB** — promote when preset system is redesigned beyond today’s catalogs.  
Promotion rules: [README](./README.md) · [10-QA](./10-QA.md)  
Related: [03](./03-MATERIAL-SYSTEM.md) · [06](./06-EXPORT-SYSTEM.md)

## Intent (target model)

```text
System Presets
    ↓
User Projects
    ↓
Material Recipes
    ↓
Collections
    ↓
Templates
    ↓
Shared Packs
    ↓
Marketplace-ready architecture (horizon)
```

## Current anchors

- System presets: `presets/catalog.ts` (~25 looks)
- Projects: `projects/` store + `.mde.json` import/export
- Material presets / Materials UI: Sprint 6–7
- Studio project browser / dock: `shell/studio/`

## Out of v1.0

Marketplace, shared packs cloud sync — foreshadow only ([11](./11-V2-FUTURE.md)).

## Promote when

Shipping collections, recipe objects distinct from presets, template packs, or marketplace schemas → expand with data models, migration, and UI IA.
