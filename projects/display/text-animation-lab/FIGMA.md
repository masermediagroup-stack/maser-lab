# Figma: {title}

**Slug:** `{slug}`  
**Category:** {category}

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | | Team or community file URL |
| Figma frame (primary) | | `node-id` for main component/screen |
| Figma prototype | | Motion reference (optional) |
| Other (Dribbble, etc.) | | |

## Figma file (team)

Fill when a team file exists for this project:

| Field | Value |
| --- | --- |
| `fileKey` | |
| Demo frame `node-id` | |
| Component set `node-id` | |

## Token map

Map Figma variables or inspect values → lab `tokens.css`:

| Figma token / value | CSS variable | Notes |
| --- | --- | --- |
| | `--{prefix}-*` | |

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| | design → code | Initial build from reference |
| | code → figma | Demo pushed to team file |

## Code Connect

| Component | `.figma.ts` path | Figma node | Status |
| --- | --- | --- | --- |
| | `lab/src/components/projects/{category}/{slug}/` | | not started |

## Visual diff checklist

- [ ] Mobile viewport (390×844) matches Figma frame
- [ ] Active / hover / focus states represented in Figma or documented as code-only
- [ ] Typography and icon sizes within 2px of reference
- [ ] Glass / blur / shadow read correctly on colorful background
