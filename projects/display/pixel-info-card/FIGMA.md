# Figma: Pixel Info Card

**Slug:** `pixel-info-card`  
**Category:** display

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | none | Shape from verbal brief + lab references |
| Blobby Rotation Loader | `/demos/blobby-rotation-loader` | Demo chrome layout/style; replace yellow fill with blue |
| Info glyph | Lucide `Info` (lab standard) | Classic circular “i” — blue on white |
| Pixel assemble refs | [Dirck Mulder — Pixel Card](https://www.dirckmulder.com/blog/pixel-card); particle dissolve morphs (e.g. Disintegrate-style) | White multi-opacity squares / snakes → card silhouette; not Bayer dither engine |
| Text blur-in | Lab `BlurFocusRevealAnimation` / `tal-blur-focus` | Fast blur + slight offset for card body |

## Figma file (team)

| Field | Value |
| --- | --- |
| `fileKey` | — |
| Demo frame `node-id` | — |
| Component set `node-id` | — |

## Token map (proposed)

| Intent | CSS variable | Notes |
| --- | --- | --- |
| Demo bg | `--pic-bg: #000000` | Match Blobby |
| Demo text | `--pic-text: #ffffff` | |
| Slider track | `--pic-track: #2a2a2a` | |
| Slider fill | `--pic-fill: #3b82f6` | Blue (was yellow on Blobby) |
| Slider thumb | `--pic-thumb: #ffffff` | |
| Trigger / card plate | `--pic-surface: #ffffff` | |
| Info accent | `--pic-accent: #3b82f6` | Icon + INFO / `info` label |
| Body copy | `--pic-body: #0a0a0a` | Black text on card |

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| 2026-08-10 | brief → shape | Shape-only; awaiting Implement |

## Code Connect

N/A until a Figma component set exists.
