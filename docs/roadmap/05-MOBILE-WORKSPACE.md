# 05 — Lab Workspace (Mobile + Desktop Playground)

> **Non-transferable.** This document describes the ideal **lab** authoring shell.  
> It is **not** part of the npm/export product surface. See [00-VISION](./00-VISION.md) · [06](./06-EXPORT-SYSTEM.md).  
> Control ownership map: `lab/.../docs/control-ia-audit.md` · Sprint 5: `docs/sprint5-control-audit.md`

**Depth:** medium (ideal lab UX + current anchors).  
Code today: `shell/studio/` (`BottomSheet`, `MobileBottomNav`, `FitStage`, `MaterialDock`, `ProjectBrowser`, …) · `shell/PlaygroundControlPanels.tsx` · `shell/ComponentPlayground.tsx`

## Current vs target

| Area | Target (ideal lab) |
| --- | --- |
| Entry | ≤900px + playground → `mde-app--mobile-editor`; desktop uses same panel tree |
| Mobile chrome | Bottom nav ≤5 + one sheet stack |
| Desktop chrome | Right rail: **exclusive category list** + one panel body |
| Preview | Always visible; sheet never fully covers without peek |
| Labels | Palette (chroma) · Structure (material ID) · Color tone (sliders) |
| Thumbs | Real data URLs only; no empty image placeholders ([08](./08-PRESET-STUDIO.md)) |

## Desktop playground IA

```text
┌──────────────────────────────┬─────────────────────┐
│  Preview + Material Dock     │ Category list       │
│                              │ (single-select)     │
│                              ├─────────────────────┤
│                              │ Active panel body   │
└──────────────────────────────┴─────────────────────┘
```

### Categories (single-open)

Presets · Content · Structure · Palette · Dither · Lighting · Animation · Interaction · Finish · Export

- Selecting a category opens **that** panel only (closes others).
- Optional “Expand all” only in Advanced/Debug.
- Base plate may stay pinned; full Palette body is not pinned on every category.
- Material Dock = structure picker on the stage, not a second inspector.

## Mobile workspace

```text
┌─────────────────────────────┐
│  Preview (FitStage)         │
├─────────────────────────────┤
│  Peek / Bottom sheet        │
│  controls for active tab    │
├─────────────────────────────┤
│  Preview · Look · Light ·   │
│  Content · More             │
└─────────────────────────────┘
```

### Bottom nav (≤5)

| Tab | Focuses |
| --- | --- |
| Preview | Sheet closed |
| Look | Palette + Structure |
| Light | Lighting |
| Content | Content / Component Inspector |
| More | Animation · Interaction · Finish · Export (+ Projects action) |

### Bottom sheets

- One primary sheet; nested sheets push/pop with clear dismiss.
- Drag handle + Scrim; focus trap while open; restore focus on close.
- Density: Beginner shows essentials; Advanced reveals full groups (`mde:density`).

### Preview

- Preview remains the hero of the viewport.
- Landscape: optional split (preview | sheet) when width allows.
- Portrait: stacked preview + sheet.

### Touch

- Sliders: large hit area; prefer `StudioSlider`.
- No hover-only affordances.
- Pointer → UV path accurate under scroll/sheet drag.

### Safe areas

- Respect `env(safe-area-inset-*)` for nav and sheet.
- Use `100dvh` to avoid URL-bar jumps.

### Performance

- **One** live WebGL preview.
- Never spawn extra contexts for docks.
- `uMatLowQ` on narrow viewports ([09](./09-PERFORMANCE.md)).

### Accessibility

- Sheet labelled; nav items have accessible names.
- Reduced motion: sheet transitions shorten/disable; CRT flicker muted.
- Keyboard: desktop category rail must be operable.

## Research anchors (lab UX)

Borrow patterns from professional creative tools (Figma, Procreate, Spline, Rive): **preview-first**, **sheeted / exclusive inspectors**, **limited top-level nav**, **large manipulators**. Do not copy their product scope.

## Out of scope for export

Consumers implement their own responsive layouts around adapters. Do not require `shell/studio` in the package.

## Why (human)

Lab chrome exists so humans and agents can author dither materials; the product you ship is still the adapter + engine — not the sheet or category rail.
