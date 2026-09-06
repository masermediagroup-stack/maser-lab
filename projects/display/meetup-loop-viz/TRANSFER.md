# Transfer: Meetup loop visualization

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { MeetupLoopViz } from "@/components/projects/display/meetup-loop-viz";
```

## Dependencies

- None beyond React / Next.js (CSS tokens + vendored Bloub engine)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| focusedStep | `LoopStepId \| "all"` | `"all"` | Speaker step emphasis |
| showGrootSpur | `boolean` | `false` | Optional Groot side note |
| forceReducedMotion | `boolean` | `false` | Lab toggle; OR with OS `prefers-reduced-motion` |

## Public assets

- `lab/public/assets/meetup-loop-viz/SOURCE.txt`
- Engine sources: `lab/src/components/projects/display/meetup-loop-viz/bloub/` (from Grokbot-animations; do not import maser-bot-card)

## Porting steps

1. Copy `lab/src/components/projects/display/meetup-loop-viz/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above
4. Adjust import paths / theme tokens
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL (after deploy):
- Temporary typeface `--loop-font-temp` until Dice Sans is confirmed
- Do not ship Universal Sans / Geist / Inter as this page’s story
