# Figma: CTA Logo Prism Wave

**Slug:** `cta-logo-prism-wave`  
**Category:** marketing

## Design sources

| Source | URL | Notes |
| --- | --- | --- |
| Figma file | none | Lab experiment from live production |
| Live production | https://masermedia.co/#contact | `CtaLogoTilt` on the CTA logo stage |
| Logo asset | https://masermedia.co/assets/Blue-HD.svg | Copied into `lab/public/assets/cta-logo-prism-wave/Blue-HD.svg` |
| Production source | masermediagroup-stack/maser-media `next-app/src/components/CtaLogoTilt.tsx` + `.mm-cta__logo-*` in `globals.css` | Read-only reference — do not edit that repo |

## Figma file (team)

None.

## Token map

| Production / locked value | CSS variable | Notes |
| --- | --- | --- |
| Maser blue body | `--clpw-blue: #10a4ff` | Not the SVG fill `#2cafff` |
| White filament | `--clpw-vapor: #ffffff` | Dry line only — no glow |
| Cool leading fringe | `--clpw-fringe: #73e7ff` | Tiny cyan-ish skin; drop if it reads as bloom |
| Perspective | `--clpw-perspective: 920px` | Production `.mm-cta__logo-link` |
| Aspect | `3776.87 / 1915.83` | Blue-HD viewBox |

## Implementation sync

| Date | Direction | Notes |
| --- | --- | --- |
| 2026-08-27 | production → code | Tilt constants and logo plane copied from CtaLogoTilt; wave is new |
| 2026-08-27 | look pass | Dry filament; kill glow; hash jitter along travel UV |
| 2026-08-27 | vgpu gate | Compile off the live Surface; `data-wave-mode="vgpu"` |
| 2026-08-27 | compositing | Always-on Blue-HD `<img>`; filament overlay only |

## Code Connect

| Component | `.figma.ts` path | Figma node | Status |
| --- | --- | --- | --- |
| | | | not started |

## Visual diff checklist

- [ ] Mark matches Blue-HD silhouette
- [ ] Tilt feel matches production (no extra lamp)
- [x] Wave is sequential continuous glass lines (deeper blue on light, pale on dark), glow inside the glyph — not dashed wedges or a lamp off the mark
