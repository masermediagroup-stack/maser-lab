# Figma: TYPE WORLD

**Slug:** `type-world`  
**Category:** scroll

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | none | No team file |
| Other | Editorial still (agent prompt) | Warm-white `#FAFAF7`, royal-blue `#1047C9`, high-contrast Geist quote, generous negative space |

## Figma file (team)

| Field | Value |
| --- | --- |
| `fileKey` | none |
| Demo frame `node-id` | none |
| Component set `node-id` | none |

## Token map

| Figma token / value | CSS variable | Notes |
| --- | --- | --- |
| Warm white field | `--type-world-bg` | `#FAFAF7` |
| Royal blue glyphs | `--type-world-ink` | `#1047C9` |
| Geist | `--type-world-serif` | `next/font/google` Geist, product-scoped |

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| 2026-08-14 | design → code | Initial build from editorial still |

## Code Connect

| Component | `.figma.ts` path | Figma node | Status |
| --- | --- | --- | --- |
| TypeWorld | n/a | none | not started |

## Visual diff checklist

- [ ] Mobile viewport keeps the resting quote uncropped
- [ ] Hover / pressed (grab) documented as code-only
- [ ] Typography character matches Geist (Vercel) reference
- [ ] No glass / blur / shadow on the artwork
