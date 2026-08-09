# 05 — Mobile Workspace (Lab Only)

> **Non-transferable.** This document describes the ideal **lab** mobile authoring shell.  
> It is **not** part of the npm/export product surface. See [00-VISION](./00-VISION.md) · [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md).

**Depth:** medium (ideal lab UX + current anchors).  
Related: [04](./04-COMPONENT-SYSTEM.md) · [09](./09-PERFORMANCE.md)  
Code today: `shell/studio/` (`BottomSheet`, `MobileBottomNav`, `FitStage`, `MaterialDock`, `ProjectBrowser`, …)

## Current vs target

| Area | Current (approx.) | Target (ideal lab) |
| --- | --- | --- |
| Entry | ≤900px + playground → `mde-app--mobile-editor` | Same breakpoint family; clearer mode switch |
| Chrome | Hides lab sidebar; bottom nav + sheet | Persistent bottom nav; one sheet stack |
| Preview | `FitStage` scales component | Always visible preview; sheet never fully covers without peek |
| Controls | Panels in sheet | Grouped sheets (Material / Dither / Content / Inspect) |
| Projects | Project browser exists | Fast Save / Save As / Recent within thumb reach |
| Thumbs | JPEG via ThumbBlitEngine | Stay single-context; no live thumb grid |

## Ideal workspace

```text
┌─────────────────────────────┐
│  Preview (FitStage)         │
│  component under edit       │
├─────────────────────────────┤
│  Peek / Bottom sheet        │
│  controls for active dock   │
├─────────────────────────────┤
│  Nav: Browse · Edit · Lib   │
└─────────────────────────────┘
```

### Bottom sheets

- One primary sheet; nested sheets push/pop with clear dismiss.
- Drag handle + Scrim; focus trap while open; restore focus on close.
- Density: Beginner shows essentials; Advanced reveals full groups (`mde:density`).

### Navigation

- Bottom nav ≤5 destinations (e.g. Components, Materials, Project, Play, More).
- Avoid hamburger-only IA for primary authoring actions.

### Preview

- Preview remains the hero of the viewport.
- Landscape: optional split (preview | sheet) when width allows.
- Portrait: stacked preview + sheet.

### Touch

- Sliders: large hit area; prefer `StudioSlider` pattern once wired widely (v0.8).
- No hover-only affordances.
- Pointer → UV path already required for interaction engine — keep accurate under scroll/sheet drag.

### Safe areas

- Respect `env(safe-area-inset-*)` for nav and sheet.
- Use `100dvh` (already used by mobile editor) to avoid URL-bar jumps.

### Performance

- **One** live WebGL preview.
- Pause/simplify when sheet fully covers preview if needed; never spawn extra contexts for docks.
- `uMatLowQ` on narrow viewports ([09](./09-PERFORMANCE.md)).

### Accessibility

- Sheet labelled; nav items have accessible names.
- Reduced motion: sheet transitions shorten/disable; CRT flicker muted.
- Keyboard: desktop parity still required when not in mobile editor mode.

## Research anchors (lab UX)

Borrow patterns from professional creative mobile tools (Figma, Procreate, Spline mobile, Rive): **preview-first**, **sheeted inspectors**, **limited top-level nav**, **large manipulators**. Do not copy their product scope — only interaction hygiene.

## Out of scope for export

Consumers implement their own responsive layouts around adapters. Do not require `shell/studio` in the package.

## Why (human)

Mobile authoring keeps the lab usable on a phone, but the product you ship is still the adapter + engine — not the sheet chrome.
