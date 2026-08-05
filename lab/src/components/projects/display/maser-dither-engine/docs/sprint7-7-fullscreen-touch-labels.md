# Sprint 7.7 — Fullscreen mobile, corners, solid labels

## Goals

1. Fullscreen on mobile keeps compact chrome (button / badge / avatar / loader) at intrinsic size — no full-width stretch.
2. Expose **Corner** (Pill / Round / Soft / Square) on button & badge Content panels (findable on mobile).
3. Fullscreen touch: pressable adapters, no iOS long-press copy callout; pointer drives dither on button / badge / avatar.
4. **Text color** + **Text on fill** (Solid default / Invert optional) so labels sit as opaque color above the dither — not exclusion-blended.

## Content fields

| Field | Values | Used by |
| --- | --- | --- |
| `chromeCorner` | pill · rounded · soft · square | button, badge |
| `labelColor` | hex | button, badge, avatar |
| `labelBlend` | solid (default) · exclusion | button, badge, avatar |

## Files

- `content/types.ts` — new fields + defaults
- `shell/ContentEditor.tsx` — Corner / Text color / Text on fill
- `components/adapters/adapterInteraction.ts` — pointer hook + styles
- `DitherButton` / `DitherBadge` / `DitherAvatar` — wire corner, label, touch
- `tokens.css` — radius vars, solid labels, touch-callout, fullscreen width overrides

## Engine

`0.7.7`
