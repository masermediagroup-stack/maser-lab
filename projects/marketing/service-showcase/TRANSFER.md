# Transfer: Service Showcase

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import {
  ServiceShowcase,
  SERVICE_ITEMS,
  type ServiceItem,
  type ServiceShowcaseProps,
} from "@/components/projects/marketing/service-showcase";
```

## Dependencies

- `framer-motion`
- `next/image` (or swap to `<img>` if not on Next.js)
- Tailwind CSS
- Space Grotesk (or Geist fallback)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `ServiceItem[]` | `SERVICE_ITEMS` | Service data — replace for any brand |
| `defaultActiveId` | `string` | `"residential"` | Uncontrolled initial tab |
| `activeId` | `string` | — | Controlled active tab |
| `onActiveChange` | `(id: string) => void` | — | Tab change callback |
| `forceReducedMotion` | `boolean` | `false` | Demo / OS override |
| `animationEnabled` | `boolean` | `true` | Disable motion for lab |
| `panelDurationMs` | `number` | `300` | Content swap duration |
| `tabDurationMs` | `number` | `250` | Pill spring duration |
| `borderRadiusPx` | `number` | `24` | Corner radius |
| `spacingScale` | `number` | `1` | Whitespace multiplier |
| `imageMode` | `"auto" \| "comparison" \| "image"` | `"auto"` | Force media presentation |
| `className` | `string` | — | Wrapper class |

## Public assets

None required — seed images use Unsplash remote URLs. Replace with local assets in production.

## Porting steps

1. Copy `lab/src/components/projects/marketing/service-showcase/` to portfolio repo
2. Install `framer-motion` if missing
3. Load Space Grotesk (or map `--ss-font` to existing brand font)
4. Pass brand `items` array; keep heading outside the component
5. Preview → QA → production
6. Set registry status → `transferred`

## Notes

- Heading is intentionally outside this component.
- Lab demo chrome (`service-showcase-demo.tsx`) is not required for transfer.
