# Figma: Maser bot card

**Slug:** `maser-bot-card`  
**Category:** display

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | GrokBot-Loop-DemoCard | Source of truth for the 2026-09-08 recut |
| Figma frame (front) | node `1:2` | Identity face |
| Figma frame (back) | node `1:20` | Wordmark face |
| Wordmark vector | node `1:22` | Vendored SVG, 1100×212 |
| Other | Zoah founding-member **structure** only | Tilt + mouse shine. Refuse skin and landscape. |

## Figma file (team)

| Field | Value |
| --- | --- |
| Name | GrokBot-Loop-DemoCard |
| `fileKey` | (not in repo — use the team file of that name) |
| Front `node-id` | `1:2` |
| Back `node-id` | `1:20` |
| Wordmark `node-id` | `1:22` |
| Artboard | 1299×1299 |

## Token map

| Figma token / value | CSS variable | Notes |
| --- | --- | --- |
| Plate fill `#000000` | `--mbc-card-bg` | solid; no dither |
| Type `#FFFFFF` | `--mbc-text` | |
| Radius 80 / 1299 | `--mbc-radius` | scale from board |
| Family UniversalSansGrokTest Display Trial | `@font-face` | swap; no Geist/Inter |

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| 2026-09-05 | skeleton | Env prep. Track A: vgpu plate. Universal Sans waits. |
| 2026-09-06 | mark lock | Capsule + bleu `#3b93f0`. Cycle idle → thinking → wide → thinking → idle. |
| 2026-09-08 | Figma → code | Recut to 1299 square. Typeset copy. Capsule front. Wordmark back. vgpu stage dither. |
