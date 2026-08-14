# Transfer: Dither Gooey Card

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { DitherGooeyCard } from "@/components/projects/display/dither-gooey-card";
```

## Dependencies

- `framer-motion`
- shadcn `Card` primitives already in the lab

## Props

See `DitherGooeyCardProps` in the product module. Host colors: `backgroundColor`, `textColor`.

## Public assets

None.

## Porting steps

1. Copy `lab/src/components/projects/display/dither-gooey-card/` to portfolio repo
2. Install dependencies listed above
3. Copy product `tokens.css`
4. Adjust import paths / theme tokens
5. Add showcase page; wire props to portfolio router

## Notes

Lab demo chrome is not portable. Product barrel must stay demo-free.
This slug does not depend on `@maser/dither-engine`.
