# Figma: SummitPath - Sign Up

**Slug:** `summitpath-sign-up`  
**Category:** sign-up  
**Lab:** Maser-Lab

## Design sources

| Source | URL / node | Notes |
| --- | --- | --- |
| Figma file | https://www.figma.com/design/f2TLFWW5Eg8aqczRjuZ403/Maser-Lab-web-component-and-interaction-file | Maser-Lab source |
| Desktop frame | `19:2` | `SummitPath - Sign Up` — 1920×1080 |
| Mobile frame | `56:570` | `SummitPath - Sign Up-mobile` — 452×1168 |
| Motion node | `45:16` | Hikelogo — opacity + x keyframes, 3.505s loop |

## Figma file metadata

| Field | Value |
| --- | --- |
| `fileKey` | `f2TLFWW5Eg8aqczRjuZ403` |
| Desktop `node-id` | `19:2` |
| Mobile `node-id` | `56:570` |
| Hikelogo `node-id` | `45:16` |

## Token map

### SummitPath section (`tokens.css`)

| Figma value | CSS variable | Desktop | Mobile |
| --- | --- | --- | --- |
| `#17261D` text | `--summitpath-signup-text` | ✓ | ✓ |
| `#799886` labels | `--summitpath-signup-label` | ✓ | ✓ |
| `#17666D` input border | `--summitpath-signup-input-border` | 2px | 2px |
| `#FFFFFF` input bg | `--summitpath-signup-input-bg` | ✓ | ✓ |
| CTA gradient | `--summitpath-signup-cta-from/to` | 475×64 | 342×64 |
| `#FDFCF9` page bg | mobile base | — | ✓ |
| Social shadow | `--summitpath-signup-social-shadow` | 223×35 | 342×52 |
| Instrument Sans | `--summitpath-font` | 64/20/12/16 | 40/16/12/16 |

### Maser-Lab shell (separate — `maser-lab-tokens.css`)

| COLORWAY hex | `--lab-*` |
| --- | --- |
| `#F8F8F8` | `--lab-text-primary` |
| `#10A4FF` | `--lab-accent-primary` |
| `#0097F5` | `--lab-accent-secondary` |
| `#0065A3` | `--lab-accent-soft` |

## Layout spec (from deep audit 2026-06-29)

### Desktop `19:2`

| Element | Spec |
| --- | --- |
| Frame | 1920×1080 |
| Form panel | 960px left |
| Hero panel | 960px right + vector overlays `48:59`, `50:15` |
| Form width | 475px fields, centered in panel |
| Field height | 56px, radius 12px |
| Field gap | ~20px between groups |
| CTA | 475×64, gradient, shadow |
| Social | 223×35 each, side-by-side, **no OR** |
| Header | 64px title, 20px tagline + hikelogo |
| Tagline copy | `Explore the trail ahead...` |

### Mobile `56:570`

| Element | Spec |
| --- | --- |
| Frame | 452×1168, bg `#fdfcf9` |
| Hero | 338px tall, image 425×322 @ 13px inset, radius 30px |
| Content | 390px wide, starts y=338 |
| Header | 40px title, 16px tagline (no hikelogo) |
| Tagline copy | `Explore the trail ahead.` |
| Fields | 342px wide, 56px tall |
| CTA | 342×64 |
| Social | stacked 342×52, **OR divider** |
| Footer sign-in | underlined semibold `#163020` |

## Asset inventory (lab)

| File | Figma source |
| --- | --- |
| `summitpath-signup-hero.png` | `48:39` |
| `summitpath-mobile-hero-a.png` | `56:571` |
| `summitpath-vector-2.png` | `48:59` |
| `summitpath-vector-3.png` | `50:15` |
| `summitpath-hikelogo-layer.png` | `45:17` |
| `summitpath-google-icon.png` | Google button asset |
| `summitpath-apple-icon.png` | Apple button asset |

## Motion context (`45:16`)

```tsx
// Framer Motion reference from Figma
opacity: [0, 0, 1, 1], times: [0, 0.6348, 0.7092, 1], duration: 3.505s, repeat: Infinity
x: [-10, -10, -2, -2], times: [0, 0.4224, 0.8472, 1], duration: 3.505s, repeat: Infinity
```

Implemented in `signup-header.tsx` → `HikeLogo`.

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| 2026-06-29 | design → code | Initial mobile-first approximation |
| 2026-06-29 | design → code | Maser-Lab 1:1 rebuild: dual frames, shell rebrand, motion |
| | code → figma | Optional post-review push |

## Code Connect

| Component | Path | Figma node | Status |
| --- | --- | --- | --- |
| `SummitPathSignUpSection` | `lab/src/components/projects/sign-up/summitpath-sign-up/` | `19:2` / `56:570` | not started |

## Visual diff checklist

| Check | Desktop 1920 | Mobile 452 | Notes |
| --- | --- | --- | --- |
| Frame dimensions | pass | pass | Fixed frame components |
| Typography (Instrument Sans) | pass | pass | next/font scoped |
| Input 475/342 × 56, radius 12 | pass | pass | |
| CTA 64px gradient | pass | pass | |
| Social layout | pass (side-by-side) | pass (stacked + OR) | |
| Hikelogo + tagline ellipsis | pass | N/A | Mobile shorter tagline |
| Hero + vector overlays | pass | pass | |
| QA controls outside section | pass | pass | Demo shell only |
| Hover/focus states | pass | pass | CSS + demo |
| ±2px manual pixel review | pending | pending | Use viewport frame modes in demo |
