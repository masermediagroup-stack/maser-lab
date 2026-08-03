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
    ├── Desktop: stage + QuickActions + Material Dock + side panels
    ├── Mobile (≤900px): dedicated 100dvh workspace shell
    │   ├── Compact top bar (back · title · undo/redo · save)
    │   ├── Preview stage (FitStage scales adapters into view)
    │   ├── Contextual BottomSheet (tool panels; closed on Preview)
    │   └── Persistent bottom tool nav
    ├── Control search + favorite control chips
    └── Workspace modes: Beginner · Advanced · Presentation · Debug
```

Shared WebGL pipeline is unchanged. Studio code lives under `projects/` (snapshot/store/history) and `shell/studio/` (UI chrome).

## Sprint 7.1 — Mobile workspace reconstruction

Desktop composition is **not** reused on phones. At ≤900px on `#/component` / `#/playground`, `mde-app--mobile-editor` locks the app to `height: 100dvh`, hides lab chrome + sidebar, and hands the viewport to a purpose-built shell:

| Region | Role |
| --- | --- |
| Top bar | Navigation + undo/redo + save |
| Stage | Full selected component + procedural effect (no document scroll) |
| Sheet | Materials dock, sliders, search/modes (More tab) — overlays stage |
| Bottom nav | Preview · Materials · Anim · Light · Touch · Comps · Projects · More |

**Preview tab** closes the sheet for immediate full-stage viewing. Adapters are width-contained and scaled via `FitStage` so cards/navs no longer clip off the right edge. Horizontal page overflow and stacked desktop chrome (header → modes → search → dock → perf) are removed from the mobile path.

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

- Dedicated mobile editor shell (`100dvh`, no competing sticky chrome)
- Bottom nav: Preview · Materials · Anim · Light · Touch · Comps · Projects · More
- Draggable bottom sheet with snap points (dvh-based, above bottom nav)
- Material Dock inside Materials sheet
- StudioSlider available for touch-first numeric editing
- Global control search under More
- FitStage preview containment

## Future cloud sync

Project JSON is already portable. A future sync layer can push `ProjectRecord[]` to Convex/remote storage without changing the snapshot schema — treat `mde:projects:v1` as the offline cache and reconcile by `id` + `updatedAt`.

## Reduced motion

Sheet height transitions disable under `prefers-reduced-motion`. Engine reduced-motion toggle continues to mute animation/flicker.

## Sprint 7.2

See `docs/sprint7-2-stabilization.md` — monochrome chrome, Scrollbar/Avatar/Image Frame repairs, color HEX/RGB/HSL editors, animation composition gain (engine `0.7.2`).
