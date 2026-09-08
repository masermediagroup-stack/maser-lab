# Transfer: Maser bot card

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { MaserBotCard } from "@/components/projects/display/maser-bot-card";
```

## Dependencies

- `vgpu` (WebGPU **stage** field: black + TL grey + pointer cloud). CSS gradient fallback if `init()` fails. Do not boot a new raw WebGL stack for the stage.
- Vendored Grokbot engine: `lab/src/components/projects/display/maser-bot-card/grokbot/` from https://github.com/masermediagroup-stack/Grokbot-animations (MIT).
- Product type: **UniversalSansGrokTest Display Trial** — `@font-face` swap. Do not substitute Geist or Inter. Do not load Text Trial.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tiltEnabled` | `boolean` | `true` | Pointer tilt on/off |
| `maxAngleFeel` | `number` | `1` | Live feel multiplier around ~±16° yaw / ±10° pitch. Not a token. |
| `shineEnabled` | `boolean` | `true` | Specular wash on/off |
| `shineIntensity` | `number` | demo-owned | Quiet wash strength 0–1 |
| `face` | `"front" \| "back"` | `"front"` | Controlled face |
| `onFaceChange` | `(face) => void` | | Flip callback |
| `bgMode` | `"calm" \| "interactive"` | `"interactive"` | Stage still vs pointer cloud |
| `groundColor` | `string` | `"#000000"` | Stage ground only (demo **Background** knob). Never on the card fill, type, or mark. |
| `forceReducedMotion` | `boolean` | `false` | Demo toggle; also honors OS |

## Public assets

- `lab/public/maser-bot-card/grok-bot-wordmark.svg` (Figma node 1:22)
- `lab/public/maser-bot-card/UniversalSansGrokTest-Display-Trial.ttf` — Display Trial 400 (also used for 300 slots)

## Porting steps

1. Copy `lab/src/components/projects/display/maser-bot-card/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above (`vgpu`, WGSL loader)
4. Adjust import paths. Do not wire Geist or Inter onto the product.
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL: set after this recut’s unique preview. `knumwb5a9` and earlier hosts are stale. Do not hand the branch alias.
- Card face is solid `#000`. Stage is vgpu (TL grey + pointer cloud), not on the card face. Front v1 wordmark. Back v1 capsule + typeset copy.
- Product must not import lab demo chrome tokens as its look.
- Mark: capsule + bleu `#3b93f0`. One curl per page load (`neutre` → `attentif` → `curieux` → `mefiant` → `thinking` → `fier` → `neutre`), then pointer gaze until refresh. Do not replay. Refuse `defaultCycle` montage.
