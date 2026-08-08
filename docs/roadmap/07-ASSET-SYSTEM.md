# 07 — Asset System

**Status: STUB** — promote to full engineering depth in the **same PR** that ships asset-management code.  
Promotion rules: [README](./README.md) · [10-QA](./10-QA.md)

## Intent (when built)

Plan storage and browsing for materials-adjacent assets:

- Uploads (source images for `uSource`) with durable persistence (IndexedDB / data URL)
- Palettes, gradients, textures, noise, fonts, icons
- Asset browser, collections, favorites, tags, search
- Future cloud storage (docs foreshadow only until a sync milestone)

## Current anchors

- Source image field: `shell/SourceImageField.tsx` → `SurfaceCanvas` `sourceUrl` → texture unit 6
- Upload persistence across project save: **open** (v0.8 candidate)
- Thumbs: `engine/preview/ThumbBlitEngine.ts` (single shared context)

## Cloud

v1.0: **docs only** — keep local project JSON portable; no backend hooks in this stub’s implementation phase unless a later milestone says so.

## Promote when

Shipping IndexedDB uploads, asset browser UI, or cloud-backed libraries → expand this file with schemas, APIs, quotas, and migration notes.
