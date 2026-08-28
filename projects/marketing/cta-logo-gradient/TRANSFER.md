# Transfer: CTA Logo Gradient

**Target:** masermedia.co homepage **`CtaLogoTilt`** (CTA lockup).  
**Not the footer ASCII wave strip.** Do not open a maser-media PR from this lab — Crew drops this folder onto the live CTA.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

Crew copy list also lives next to the code: `lab/src/components/projects/marketing/cta-logo-gradient/EXPORT.md`.

## Export

```tsx
import { CtaLogoTilt } from "@/components/projects/marketing/cta-logo-gradient";

<CtaLogoTilt />
```

`CtaLogoGradient` is the same component. The mark has **no dock, no rail, no knobs**. Lab knobs stay on `cta-logo-gradient-demo.tsx` only.

## Dependencies

- `vgpu` (WebGPU wash; CSS fallback if init fails)
- Next.js App Router / React 19 client component (`next/image`)
- WGSL loader from `lab/next.config.ts` (`*.wgsl` → `@vgpu/wgsl/loader-webpack`)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Optional class on the hit shell |
| `forceReducedMotion` | `boolean` | `false` | Drops tilt; wash still runs (lab RM toggle). Production can omit. |
| `look` | `CtaLogoGradientLook` | speed `1.5`, White `1`, Dark `1`, glow `0.55`, angle `118` | Lab dock only. Production omits — uses these baked defaults. |

## Public assets

- `lab/public/assets/cta-logo-gradient/Blue-HD.svg` (mask + never-blank plate)

Do not copy `ascii-*.svg` leftovers.

## Files to copy

From `lab/src/components/projects/marketing/cta-logo-gradient/`:

1. `cta-logo-gradient.tsx`
2. `index.ts`
3. `types.ts`
4. `constants.ts`
5. `tokens.css`
6. `wash-clock.ts`
7. `wash-palette.ts`
8. `wash.wgsl`
9. `start-gradient.ts`
10. `start-ascii-grain.ts`
11. `sparkle-bursts.ts`

Do **not** copy: `cta-logo-gradient-demo.tsx`, `demo.css`.

## Porting steps

1. Copy the files listed above into the masermedia CTA module (replace `CtaLogoTilt`, not the footer wave).
2. Copy `Blue-HD.svg` and keep `LOGO_SRC` / CSS `mask-image` paths aligned.
3. Install `vgpu`; keep the Next.js WGSL loader rules.
4. Load `tokens.css` on the mark. Do not depend on `--lab-*`. Do not import `demo-chrome`.
5. Keep production tilt (14/16/14, lerp 0.12). Do not add a hover lamp.
6. Preview on the homepage CTA → production. No lab PR into maser-media.

## Notes

- Lab preview: `/demos/cta-logo-gradient` (chrome + knobs on the **page**).
- Portable unit: `CtaLogoTilt` / `CtaLogoGradient` + `tokens.css` + `Blue-HD.svg`.
- Four-blob wash, reverse-phase glyphs, in-place `.:+x*#` tick stay on the mark.
