# Transfer: CTA Logo Gradient

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { CtaLogoGradient } from "@/components/projects/marketing/cta-logo-gradient";
```

## Dependencies

- `vgpu` (WebGPU wash; CSS fallback does not require it at runtime if init fails)
- Next.js App Router / React 19 client component

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Optional class on the hit shell |
| `forceReducedMotion` | `boolean` | `false` | Drops tilt; wash still runs |
| `look` | `CtaLogoGradientLook` | product defaults | Speed / highlight / shade / glow / angle |

## Public assets

- `lab/public/assets/cta-logo-gradient/Blue-HD.svg`
- `lab/public/assets/cta-logo-gradient/ascii-{dot,colon,plus,x,m}.svg` (CSS fallback glyphs)

## Porting steps

1. Copy `lab/src/components/projects/marketing/cta-logo-gradient/` (exclude `*-demo.tsx`)
2. Copy `lab/public/assets/cta-logo-gradient/` (`Blue-HD.svg` and the `ascii-*.svg` glyph tiles)
3. Install `vgpu`; keep the Next.js WGSL loader rules from `lab/next.config.ts`
4. Load `tokens.css`; do not depend on `--lab-*` for the mark
5. Wire production tilt is already in the product; do not add a hover lamp
6. Preview deploy → QA → production
7. Set registry status → `transferred`

## Notes

- Live URL (after deploy): `/demos/cta-logo-gradient`
- Knobs stay in the demo. Product barrel is `CtaLogoGradient` + types + defaults only.
