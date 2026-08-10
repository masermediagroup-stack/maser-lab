# 08 — Preset Studio

**Status: promoted (partial)** — thumb policy + browser IA for v0.8 control pass.  
Collections / marketplace schemas remain horizon ([11](./11-V2-FUTURE.md)).  
Promotion rules: [README](./README.md) · [10-QA](./10-QA.md)  
Related: [03](./03-MATERIAL-SYSTEM.md) · [05](./05-MOBILE-WORKSPACE.md) · [06](./06-EXPORT-SYSTEM.md)

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
- Studio project browser / dock: `shell/studio/ProjectBrowser.tsx`

## Thumbnail policy (shipped)

| Case | UI |
| --- | --- |
| `thumbnailDataUrl` set (user save / blit) | Show real `<img>` |
| `thumbnailDataUrl` null (system presets, unsaved) | **No** empty image frame / placeholder box |
| List / grid without thumb | Title + material/family **CSS chip** (tint via `data-material`) + meta |

Do **not** require generating JPEG thumbs for every system preset. Materials page CSS swatches / single-context `ThumbBlitEngine` remain separate (context budget).

## Browser IA

- Prefer readable list/rows over fake media cards.
- System vs User pills stay.
- Open / Duplicate / Rename actions unchanged.

## Out of v1.0

Marketplace, shared packs cloud sync — foreshadow only ([11](./11-V2-FUTURE.md)).

## Still stub / promote later

Shipping collections, recipe objects distinct from presets, template packs, or marketplace schemas → expand with data models, migration, and deeper UI IA.
