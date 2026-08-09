# 07 — Asset System

**Status: ACTIVE (v0.8 lab)** — IndexedDB upload persistence shipped in Sprint 8.1.  
Cloud / asset browser remain future. Promotion rules: [README](./README.md) · [10-QA](./10-QA.md)

## Intent

Durable lab assets so authored components survive reload and feed cleaner exports:

- Uploads (source images for `uSource`) with IndexedDB persistence
- Nested CTA photos (card button) on the same store
- Portable export still strips lab-only refs
- Future: palettes, textures, browser UI, cloud (docs only until a sync milestone)

## Lab storage (shipped)

| Item | Value |
| --- | --- |
| DB name | `mde-assets-v1` (`STORAGE_KEYS.assetsDb`) |
| Object store | `blobs` |
| Ref scheme | `mde-asset:<uuid>` |
| Compress | JPEG ≤ ~1.2MB, max edge 1280 |
| Module | `lab/.../lib/asset-store.ts` |

### Flow

1. `SourceImageField` → `putImageFile` → stores `mde-asset:` in project state  
2. `captureSnapshot` / `captureSnapshotAsync` keeps `mde-asset:` for lab JSON; drops leftover `blob:`  
3. `useResolvedDisplayUrl` → object URL for `<img>` / GL texture  
4. Portable export (`sanitizeSourceUrl` / `sanitizeContentAssets`) strips `blob:` **and** `mde-asset:`

### Quotas / risks

- Browser IndexedDB quota; large photos are compressed before write  
- Clearing site data deletes assets (project JSON refs become empty)  
- Do not serialize `mde-asset:` into npm packages or share links without embedding

## Export boundary

See [06-EXPORT-SYSTEM](./06-EXPORT-SYSTEM.md). Strategies remain `reference` | `include` | `placeholder` | `base64`. Lab refs are never portable without an explicit include/base64 step.

## Current anchors

- `shell/SourceImageField.tsx` — upload + persist  
- `lib/asset-store.ts` — IDB CRUD + compress  
- `projects/snapshot.ts` — lab vs export sanitize  
- `export/assets.ts` — portable strip  
- Thumbs: `engine/preview/ThumbBlitEngine.ts` (single shared context; live dock at ~6fps for active material)

## Cloud

v1.0: **docs only** — no backend hooks.

## Still open (post v0.8)

- Asset browser UI (collections / tags / search)  
- Embedding assets into export ZIP  
- Cross-device sync
