# Transfer: Page Transitions Lab

Fill when status -> `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` -> **Transfer checklist**.

## Export

```tsx
import { PageTransitionsLab } from "@/components/projects/layout/page-transitions-lab";
```

For client extraction, copy only the chosen transition definition, generated CSS, and the small route shell described in the export drawer.

## Dependencies

- React
- Optional: client router adapter for the target project

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| None yet | | | This first pass is a lab workspace, not a final production adapter. |

## Public assets

- None

## Porting steps

1. Select a transition in `/demos/page-transitions-lab`
2. Tune duration, intensity, stagger, and radius
3. Copy the export drawer starter code
4. Replace demo page panels with the target project's previous/current route content
5. Wire transition replay to the target router's route-change lifecycle
6. Verify keyboard navigation, reduced motion, and mobile performance in the target project

## Notes

- The first production-ready extraction should likely be a single transition plus a Next.js App Router adapter.
