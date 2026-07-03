# Transfer: MakeYourDay Calendar

Fill when status -> `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` -> **Transfer checklist**.

## Export

```tsx
import { ComponentName } from "@/components/projects/{category}/{slug}";
import { MakeYourDayCalendarDemo } from "@/components/projects/web-apps/makeyourday-calendar";
```

## Dependencies

- React 19
- Next.js 16

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `minimal` | `boolean` | `false` | Hide lab chrome when embedding in another route. |

## Public assets

List files to copy from `lab/public/`:

- None

## Porting steps

1. Copy `lab/src/components/projects/{category}/{slug}/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above
4. Adjust import paths / theme tokens
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel -> QA -> production deploy
7. Set registry status -> `transferred`

## Notes

- Live URL (after deploy):
- Imported from `/Users/tylervea/Documents/makeyourday-main`.
