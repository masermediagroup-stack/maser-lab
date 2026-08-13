# Transfer: Logo Material Gallery

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { LogoMaterialGallery } from "@/components/projects/display/logo-material-gallery";
```

## Dependencies

- `three`
- `@types/three` (dev)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `reducedMotion` | `boolean` | `false` | Freeze turntable when true |
| `className` | `string` | | Optional root class |

## Public assets

- `lab/public/brand/maser-mm-mark.svg` — 2D stacked MM (WebGL fallback)

## Porting steps

1. Copy `lab/src/components/projects/display/logo-material-gallery/` (exclude `*-demo.tsx` if the host provides chrome)
2. Copy `lab/public/brand/maser-mm-mark.svg`
3. Install `three`
4. Keep product tokens in `tokens.css` (`--lmg-*`); do not require `--lab-*`
5. Mount `<LogoMaterialGallery />` full-viewport
6. Preview deploy → QA export PNG on light/dark slides

## Notes

- Live URL (after deploy):
- Kind: **app**. The portable unit is the gallery/studio product, not DemoHost chrome.
- One WebGL context is required; do not spawn per-card canvases.
- Swap `MASER_M_CENTERLINE_SVG` in `constants.ts` to rebrand the mark.
