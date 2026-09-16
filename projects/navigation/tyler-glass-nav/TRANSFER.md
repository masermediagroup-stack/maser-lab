# Transfer: Tyler Vea Frost Disc Nav

Fill when status → `ready` or `transferred`. **Not finished:** lab demo incomplete; live tylervea.com ship is a later PR. Do not treat this merge as done.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { TylerGlassNav } from "@/components/projects/navigation/tyler-glass-nav";
```

## Dependencies

- React 19
- Next.js `Link` (or pass `linkComponent`)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pathname` | `string` | `"/"` | Active route (`/`, `/work`, `/contact`) |
| `items` | `FrostNavItem[]` | Home / Work / Contact | href + aria-label + icon |
| `forceExpanded` | `boolean` | `false` | Demo / tests |
| `forceReducedMotion` | `boolean` | `false` | Demo overlay |
| `forceReducedTransparency` | `boolean` | `false` | Demo overlay |
| `forceShell` | `FrostNavShell` | `undefined` | Demo state matrix |

## Public assets

- None in the product barrel. Lab demo only: `demo/forest-ground.png` (do not copy to tylervea.com).

## Porting steps

1. Copy `lab/src/components/projects/navigation/tyler-glass-nav/` (exclude `*-demo.tsx`, `*-demo.css`, `demo/`)
2. Import `./tokens.css` once
3. Wire `pathname` from the portfolio router
4. Keep product hrefs `/`, `/work`, `/contact`
5. Preview on a dark, non-clipped ancestor (no `overflow: hidden` on frost ancestors)

## Notes

- Live URL (after deploy): lab preview only
- Product tokens are `--nav-*` — do not require `--lab-*`
