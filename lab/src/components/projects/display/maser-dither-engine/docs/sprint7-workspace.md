# Sprint 7 — Preset Studio, Projects & Mobile Workspace

## Goals

Transform the Maser Dither Engine from a dense demo into a durable procedural material editor: save/reuse looks, browse them visually, and edit comfortably on phones.

## Workspace architecture

```text
DitherEngineApp
├── Sidebar (Overview · Components · Materials · Studio · System · Playground · Docs)
├── ProjectBrowser (`#/projects`) — Preset Studio
│   ├── System presets (immutable `system:*` rows from catalog)
│   └── User projects (`localStorage` `mde:projects:v1`)
└── ComponentPlayground
    ├── Stage + QuickActions + Material Dock
    ├── Desktop control panels (collapsible groups)
    ├── Mobile: bottom nav + BottomSheet (collapsed / half / expanded / fullscreen)
    ├── Control search + favorite control chips
    └── Workspace modes: Beginner · Advanced · Presentation · Debug
```

Shared WebGL pipeline is unchanged. Studio code lives under `projects/` (snapshot/store/history) and `shell/studio/` (UI chrome).

## Project format (schema v1)

```ts
ProjectRecord {
  id, origin: "system" | "user", name, description, notes, tags,
  colorLabel, favorite, materialId, thumbnailDataUrl,
  createdAt, updatedAt, readOnly, snapshot: ProjectSnapshot
}

ProjectSnapshot {
  schemaVersion: 1,
  componentId, params, animation, interaction, color, light,
  dither, material, content, sourceUrl (no blob:), sourceLightMix,
  basePresetId
}
```

- **Save / Save As** always forks when the active id is a system preset.
- **Autosave** only writes user projects.
- **Thumbnails** are JPEG data URLs captured from the live stage canvas on save.
- **Import / Export** use JSON project files (`.mde.json`).

## Preset system

Catalog presets map to immutable `SYSTEM_PROJECTS` via `presetToSystemProject`. The user library never persists system rows. Favorites for either origin are stored in `favoriteProjectIds`.

## Persistence

| Key | Contents |
| --- | --- |
| `mde:projects:v1` | User projects + dock order + workspace prefs |
| `mde:panels:v2` | Collapsed panel state |
| `mde:favorites:v1` | Favorite components |
| `mde:density:v1` | Basic / advanced density |

## Mobile editing patterns

Research (Figma Mobile, Procreate Pocket, Lightroom, Nomad, Rive, Linear): one workspace at a time, tool rail at the bottom, dense controls in sheets, large touch targets, value always visible.

Implemented:

- Bottom nav: Preview · Materials · Anim · Light · Touch · Comps · Projects · More
- Draggable bottom sheet with snap points
- Material Dock: tap inspect, double-tap apply, long-press menu, drag reorder
- StudioSlider available for touch-first numeric editing
- Global control search (e.g. “Bloom”)

## Future cloud sync

Project JSON is already portable. A future sync layer can push `ProjectRecord[]` to Convex/remote storage without changing the snapshot schema — treat `mde:projects:v1` as the offline cache and reconcile by `id` + `updatedAt`.

## Reduced motion

Sheet height transitions disable under `prefers-reduced-motion`. Engine reduced-motion toggle continues to mute animation/flicker.
