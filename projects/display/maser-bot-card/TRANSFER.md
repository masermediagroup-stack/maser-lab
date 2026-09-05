# Transfer: Maser bot card

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { MaserBotCard } from "@/components/projects/display/maser-bot-card";
```

## Dependencies

- None beyond the lab React/Next runtime (CSS skeleton).

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
| `bgMode` | `"calm" \| "interactive"` | `"calm"` | Stage-bg stub only. Not a plate shader. |
| `forceReducedMotion` | `boolean` | `false` | Demo toggle; also honors OS |

## Public assets

- none

## Porting steps

1. Copy `lab/src/components/projects/display/maser-bot-card/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above
4. Adjust import paths / theme tokens (none named yet)
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL: https://maser-mtbrec48d-masermediagroup.vercel.app/demos/maser-bot-card
- Skeleton: empty portrait faces. Parked copy is not typeset.
- Product must not import lab demo chrome tokens as its look.
- Plate is CSS only. Optional vgpu = stage bg (not implemented). No Bloub mark anim.
