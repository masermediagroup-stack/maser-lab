# Transfer: Maser bot card

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { MaserBotCard } from "@/components/projects/display/maser-bot-card";
```

## Dependencies

- `vgpu` (WebGPU plate). CSS specular fallback if `init()` fails.
- Vendored Grokbot engine: `lab/src/components/projects/display/maser-bot-card/grokbot/` from https://github.com/masermediagroup-stack/Grokbot-animations (MIT).
- Product type: **Universal Sans** — wait for the font file. Do not substitute Geist.

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
| `bgMode` | `"calm" \| "interactive"` | `"calm"` | Stage-bg stub. May use vgpu later. |
| `forceReducedMotion` | `boolean` | `false` | Demo toggle; also honors OS |

## Public assets

- none (Universal Sans file not in yet)

## Porting steps

1. Copy `lab/src/components/projects/display/maser-bot-card/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above (`vgpu`, WGSL loader)
4. Adjust import paths / theme tokens (none named yet). Do not wire Geist onto the product.
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL: stale until this mark-asset preview lands (prior aliases including `https://maser-phhilidsh-masermediagroup.vercel.app/demos/maser-bot-card`).
- Skeleton: empty identity slots; back mark is Grokbot SVG. Parked copy is not typeset.
- Product must not import lab demo chrome tokens as its look.
- Plate is vgpu / WebGL. Stage bg stub may still use vgpu. Mark: capsule + bleu `#3b93f0`, cycle idle → thinking → wide → thinking → idle. Refuse `defaultCycle` montage.
