# Sprint 8.1 — v0.8 Studio Harden

Lab-only authoring reliability so Sprint 8.0 exports start from durable content.

## Shipped

| Item | Notes |
| --- | --- |
| Upload persistence | `lib/asset-store.ts` IndexedDB `mde-assets-v1`; refs `mde-asset:<uuid>` |
| Source / CTA upload | `SourceImageField` → `putImageFile`; resolve via `useResolvedDisplayUrl` |
| Lab vs export sanitize | Lab keeps asset refs; portable export strips `blob:` + `mde-asset:` |
| Async snapshot | `captureSnapshotAsync` persists leftover blobs on save/autosave |
| Component Inspector | Padding / radius / chrome dock target above Content |
| StudioSlider | Interaction, Animation, Lighting, Content numbers, tone params, light-mix |
| Material Dock live | Debounced blit + ~6fps live refresh for **active** material (one WebGL context) |
| Docs | Promoted `docs/roadmap/07-ASSET-SYSTEM.md`; roadmap baseline `0.8.0` |

## Non-goals (still deferred)

- Cloud sync
- Visual regression matrix (v0.9)
- npm pack smoke beyond scaffold (v0.9)
- Canvas2D algorithm parity
- Rewriting `SurfaceRenderer` / `VERT_SRC` / `SAMPLE_GLSL`

## Verify

1. Upload a photo → reload playground → image still dithered  
2. Save project → reopen → `mde-asset:` still resolves  
3. Export package → no `mde-asset:` / `blob:` in JSON  
4. Material Dock: active thumb animates lightly; Materials page still one context  
5. `/demos/maser-dither-engine` non-black surface  
