# Figma: Dither Gooey Card

**Slug:** `dither-gooey-card`  
**Category:** display

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | none | Code-first lab experiment |
| Other | https://www.npmjs.com/package/liquid-gooey | Gooey morph / move API |

## Figma file (team)

None.

## Token map

| Figma token / value | CSS variable | Notes |
| --- | --- | --- |
| Card surface | `--dgc-fill` | CSS fill on the shell and drip; host `backgroundColor` |
| Type / icons | `--dgc-ink` | Content layer (unfiltered); host `textColor` |

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| 2026-08-13 | code-first | Initial build |
| 2026-08-13 | code-first | Removed dither; color props + drip chevron |

## Code Connect

| Component | `.figma.ts` path | Figma node | Status |
| --- | --- | --- | --- |
| | | | not started |

## Visual diff checklist

- [ ] Mobile viewport (390×844) — card remains a thin horizontal bar
- [ ] Active / hover / focus states represented in code
- [ ] Typography and icon sizes readable at 320px
