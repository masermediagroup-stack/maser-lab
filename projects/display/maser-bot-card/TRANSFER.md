# Transfer: Maser bot card

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { MaserBotCard } from "@/components/projects/display/maser-bot-card";
```

## Dependencies

- `vgpu` (WebGPU **stage** dither). CSS 135° stripe fallback if `init()` fails.
- Vendored Grokbot engine: `lab/src/components/projects/display/maser-bot-card/grokbot/` from https://github.com/masermediagroup-stack/Grokbot-animations (MIT).
- Product type: **UniversalSansGrokTest Display Trial** — `@font-face` swap. Do not substitute Geist or Inter.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tiltEnabled` | `boolean` | `true` | Pointer tilt on/off |
| `maxAngleFeel` | `number` | `1` | Live feel multiplier around ~±8° yaw / ±5° pitch. Not a token. |
| `shineEnabled` | `boolean` | `true` | Specular wash on/off |
| `shineIntensity` | `number` | demo-owned | Wash + rim strength 0–1 |
| `bandEnabled` | `boolean` | `true` | Optional diagonal light mask |
| `face` | `"front" \| "back"` | `"front"` | Controlled face |
| `onFaceChange` | `(face) => void` | | Flip callback |
| `bgMode` | `"calm" \| "interactive"` | `"interactive"` | Stage dither still vs travelling |
| `forceReducedMotion` | `boolean` | `false` | Demo toggle; also honors OS |

## Public assets

- `lab/public/maser-bot-card/grok-bot-wordmark.svg` (Figma node 1:22)
- `lab/public/maser-bot-card/fonts/` — drop UniversalSansGrokTest Display Trial woff2 here (400 + 300)

## Porting steps

1. Copy `lab/src/components/projects/display/maser-bot-card/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above (`vgpu`, WGSL loader)
4. Adjust import paths. Do not wire Geist or Inter onto the product.
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL: set after this recut’s unique preview (prior aliases including `https://maser-pzzh176dj-masermediagroup.vercel.app/demos/maser-bot-card` are stale).
- Plate is solid `#000`. Stage dither is vgpu. Front capsule + typeset copy. Back wordmark.
- Product must not import lab demo chrome tokens as its look.
- Mark: capsule + bleu `#3b93f0`, cycle idle → thinking → wide → thinking → idle. Refuse `defaultCycle` montage.
