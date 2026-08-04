# Sprint 7.13 — CTA photo independence + Remove photo contrast

**Mode:** Harden · **Engine:** `0.7.13`

## Problem

1. Empty **CTA photo** still reused the card media photo on the dithered button.
2. Lab **Remove** control used a shadcn outline button that rendered white text on a light/white background inside the dark source-field drop zone.

## Fix

- `DitherCard` passes `cardCtaSourceUrl` through as-is (including `null`).
- `SurfaceCard` only falls back to card `sourceUrl` when `ctaSourceUrl` is omitted (`undefined`); explicit `null` means no photo.
- `SourceImageField` **Remove photo** uses `mde-btn` + `.mde-source-field__remove` for readable contrast.
- Content hint updated to match the new empty-CTA behavior.

## Verify

1. Card → upload Card photo only → CTA shows procedural dither, not the card image.
2. Upload CTA photo → button uses that image.
3. Remove CTA photo → back to procedural (card media unchanged).
4. Remove photo control is readable (light label on dark chrome).
