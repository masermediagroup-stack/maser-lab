# Sprint 7.8 — Featured card redesign

## Goal

Restyle the Card adapter toward a featured “What’s new” promo card: tall media plane, inset light frame, bottom-heavy copy over a scrim, and a full-width pill CTA — while keeping Instrument Sans and making the CTA a live dither surface.

## Shipped

### Layout
- `SurfaceCard` is `mse-card--featured`: 3:4 media, warm paper inset frame, bottom gradient scrim
- Eyebrow (`cardSubtitle`) + headline (`cardTitle`) sit bottom-left over the media
- Optional description only when copy is non-empty (default cleared)
- Media pointer tracking is isolated to the canvas hit layer so the CTA owns its own pointer

### Dithered CTA
- Nested `SurfaceCanvas` inside `.mse-card__cta-fill`
- Cream plate (`#ebe4d8`) under multiply-blended dither so the button still reads as a soft CTA while showing engineered density
- Default CTA label ink flips from global white → near-black when unset/`#ffffff`
- Content editor exposes CTA text color + solid/invert blend

### Content defaults
- Eyebrow: “What's printing”
- Headline: “Fresh density”
- CTA: “Explore”

### Mobile
- Removed the old `max-height: 11rem` media cap for featured cards so the tall aspect holds

## Files
- `surfaces/SurfaceCard.tsx`
- `components/adapters/DitherCard.tsx`
- `content/types.ts`, `shell/ContentEditor.tsx`
- `types.ts` (`labelColor` / `labelBlend` on `SurfaceCardProps`)
- `tokens.css` (featured card + mobile overrides)
- `constants.ts` → `0.7.8`

## Verify
1. Open `/demos/maser-dither-engine` → Card
2. Confirm tall framed media, scrim copy, cream dither pill
3. Drag on media vs CTA — each drives its own pointer response
4. Toggle CTA text color / Invert in Content
5. Check mobile preview width (~300px) without clipping the aspect
