# Export: homepage CTA mark (`CtaLogoTilt`)

This folder is the drop-in replacement for **masermedia.co homepage `CtaLogoTilt`**.

It is **not** the footer ASCII wave strip. Do not copy this onto the footer.

## What Crew copies

Folder:

`lab/src/components/projects/marketing/cta-logo-gradient/`

**Copy these files:**

- `cta-logo-gradient.tsx` — the mark (tilt + four-blob wash + in-place `.:+x*#` tick)
- `index.ts` — public API (`CtaLogoTilt` / `CtaLogoGradient`)
- `types.ts`
- `constants.ts`
- `tokens.css`
- `wash-clock.ts`
- `wash-palette.ts`
- `wash.wgsl`
- `start-gradient.ts`
- `start-ascii-grain.ts`
- `sparkle-bursts.ts`

**Copy this asset:**

- `lab/public/assets/cta-logo-gradient/Blue-HD.svg` → site public path used by `LOGO_SRC` / CSS `mask-image`

**Do not copy onto production:**

- `cta-logo-gradient-demo.tsx` — lab dock / knobs / rail
- `demo.css` — lab page ground
- `ascii-dot.svg`, `ascii-colon.svg`, `ascii-plus.svg`, `ascii-x.svg`, `ascii-m.svg` — unused leftovers

## Drop-in

```tsx
import { CtaLogoTilt } from "./cta-logo-gradient";

<CtaLogoTilt />
```

No dock. No rail. No knobs. Optional `look` / `forceReducedMotion` are for the lab demo page only; production uses baked defaults:

- Speed `1.5`
- White (highlight) `1` (knob max)
- Dark (shade) `1` (knob max)
- Glow `0.55` (unchanged)
- Angle `118` (unchanged)

Needs: React 19 client component, Next.js `Image`, `vgpu` + the WGSL loader from `lab/next.config.ts`.
