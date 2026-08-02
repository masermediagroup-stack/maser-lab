# Transfer: SummitPath - Sign Up

Fill when status -> `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` -> **Transfer checklist**.

## Export

```tsx
import { SummitPathSignUpSection } from "@/components/projects/sign-up/summitpath-sign-up";
```

## Dependencies

- `framer-motion`

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | `undefined` | Optional wrapper class override |
| `forceReducedMotion` | `boolean` | `false` | Disables non-essential motion for preview/testing |

## Public assets

List files to copy from `lab/public/`:

- None currently required

## Porting steps

1. Copy `lab/src/components/projects/sign-up/summitpath-sign-up/` to portfolio repo
2. Copy public assets listed above
3. Install dependencies listed above
4. Adjust import paths / theme tokens
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel -> QA -> production deploy
7. Set registry status -> `transferred`

## Notes

- Live URL (after deploy):
