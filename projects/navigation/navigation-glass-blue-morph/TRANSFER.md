# Transfer: Navigation Glass Blue Morph

## Export

```tsx
import { GlassBottomNav } from "@/components/projects/navigation/navigation-glass-blue-morph";
```

## Dependencies

- `framer-motion` (^12.x)
- Tailwind CSS v4 (demo styling; component uses scoped CSS tokens)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `activeId` | `NavItemId` | required | Current tab id |
| `onNavigate` | `(id: NavItemId) => void` | required | Tab change handler |
| `forceReducedMotion` | `boolean` | optional | Demo override for reduced motion |

## Porting steps

1. Copy `lab/src/components/projects/navigation/navigation-glass-blue-morph/` to portfolio repo
2. `npm install framer-motion`
3. Import `tokens.css` in your app or merge CSS variables into your theme
4. Place nav fixed bottom-center; ensure colorful content behind bar for glass readability

## Notes

- Design credit: Lakita Chen, Dribbble shot #23413962
- Inline SVG icons — no icon library required
