# Transfer: Plotline Tab Navigation

## Export

```tsx
import { PlotlineTabNav } from "@/components/projects/navigation/plotline-tab-nav";
```

## Dependencies

- `framer-motion` (^12.x)
- Tailwind CSS v4 (demo styling; component uses scoped CSS tokens in `tokens.css`)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `activeId` | `NavItemId` | required | Current tab id |
| `onNavigate` | `(id: NavItemId) => void` | required | Tab change handler |
| `startFreeActive` | `boolean` | `false` | When true, Start free CTA uses inverted selected styling |
| `onStartFree` | `() => void` | optional | Start free CTA handler |
| `forceReducedMotion` | `boolean` | optional | Demo override for reduced motion |
| `idPrefix` | `string` | optional | Prefix for aria ids when multiple instances |
| `placement` | `"fixed-top" \| "inline" \| "center"` | `"fixed-top"` | Layout placement mode |

## Porting steps

1. Copy `lab/src/components/projects/navigation/plotline-tab-nav/` to portfolio repo
2. `npm install framer-motion`
3. Import `tokens.css` in your app or merge CSS variables into your theme
4. Provide `activeId` / `onNavigate` from your router or page state
5. On mobile, ensure body scroll lock behavior matches your layout (see `use-body-scroll-lock.ts`)

## Notes

- Desktop: five center tabs optically centered in a `1fr` grid column; Sign in and Start free in trailing columns
- Mobile: hanging tab brand with swing panel; User icon always before Sign in label
- GPU transform bubble — no width/height animation on the selection indicator
- Plain text labels — no per-character splitting
