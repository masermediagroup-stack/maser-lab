# Transfer: Maser bot card

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { MaserBotCard } from "@/components/projects/display/maser-bot-card";
```

## Dependencies

- CSS ground slate `#F7F5F0` (CleanSlateGround). No vgpu field on this card.
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
| `groundColor` | `string` | `"#F7F5F0"` | Clean slate ground only. Never on the card fill, type, or mark. Face fill stays `#000`. Demo does not expose a Stage-bg knob. |
| `forceReducedMotion` | `boolean` | `false` | Demo toggle; also honors OS |

## Public assets

- `lab/public/maser-bot-card/grok-bot-wordmark.svg` (Figma node 1:22)
- `lab/public/maser-bot-card/UniversalSansGrokTest-Display-Trial.ttf` — Display Trial 400 (also used for 300 slots)

## Porting steps

1. Copy `lab/src/components/projects/display/maser-bot-card/` to portfolio repo
2. Copy public assets listed above
3. Install remaining deps if any (WGSL loader not required for this slug)
4. Adjust import paths. Do not wire Geist or Inter onto the product.
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL: https://maser-qyv3ohfj8-masermediagroup.vercel.app/demos/maser-bot-card (`dpl_7keJMWJWH7dBKmJurYRwNVNeojCQ`, SHA `1c2d252`). Stale: `ng8sb7qyv` / `dpl_2s9LmAuPfVeGgzhBybPALtBHR1xy`, `bmhb2w5e8`, `awwry24pa`, `pd4uggc30`, `4nvivik66`, `rk46m1hj1`, `knumwb5a9` and earlier. Do not hand the git-branch alias.
- Card face is solid `#000`. Mark and sheen are painted onto the cuboid lid maps (same mesh as type). Overlay is hit-test only — no nested card, no extra planes. Ground is CSS slate `#F7F5F0` (CleanSlateGround). Flip viewport expanded (FlipNoClip). Front v1 wordmark. Back v1 capsule + typeset copy.
- Product must not import lab demo chrome tokens as its look.
- Mark: capsule + bleu `#3b93f0`. One curl per page load (`neutre` → `attentif` → `curieux` → `mefiant` → `thinking` → `fier` → `neutre`), then pointer gaze until refresh. Do not replay. Refuse `defaultCycle` montage.
