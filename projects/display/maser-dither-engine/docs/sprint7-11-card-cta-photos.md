# Sprint 7.11 — Card + CTA independent photos

## Goal

Let the featured Card use one photo on the media plane and a different photo on the dithered CTA pill.

## Shipped

- `ComponentContent.cardCtaSourceUrl` / `cardCtaLightMix`
- Content editor for Card:
  - **Card photo** — playground source image (media plane)
  - **CTA photo** — optional; empty used to reuse the card photo (**changed in 7.13** — empty is procedural only)
- `SurfaceCard` accepts `ctaSourceUrl` / `ctaSourceLightMix`
- `DitherCard` wires media from `sourceUrl`, CTA from content (7.11 fell back to card photo)
- `SourceImageField` supports custom `label` / `hint`

## Verify (updated in 7.13)

1. Card → Content → upload **Card photo**
2. Upload a different **CTA photo**
3. Media and button show distinct dithered images
4. Remove CTA photo → button uses procedural fill (does **not** reuse the card photo)

## Files

- `content/types.ts`, `shell/ContentEditor.tsx`, `shell/SourceImageField.tsx`
- `surfaces/SurfaceCard.tsx`, `components/adapters/DitherCard.tsx`, `types.ts`
- `constants.ts` → `0.7.11`
