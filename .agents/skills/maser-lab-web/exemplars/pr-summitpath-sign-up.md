# Exemplar: summitpath-sign-up

**Slug:** `summitpath-sign-up` · **Category:** `sign-up`  
**Demo:** `/demos/summitpath-sign-up`  
**Status:** review

## Decision

**Status:** accepted (project-level pattern)  
**Scope:** Dual-breakpoint registration section with Figma parity + motion  
**Decision:** Brand-first outdoor identity with product-scoped tokens; demo chrome stays in the lab shell; all listed states reachable from DemoHost toggles  
**Rationale:** Portfolio / client transfer needs a complete section (desktop + mobile), not a form widget alone; motion is optional personality (hikelogo)  
**Evidence:** `projects/sign-up/summitpath-sign-up/PROJECT.md`; demo route; Figma frames `19:2` / `56:570`  
**Exceptions:** Hikelogo may be removed for non-outdoor brands  
**Approver:** project author / lab maintainer

## Useful decisions

1. **Brand-first composition** — SummitPath wordmark / outdoor hero read as the section identity; Instrument Sans + light outdoor palette; no generic SaaS purple theme.
2. **Product tokens only** — `tokens.css` uses `--summitpath-*`; does not require `--lab-*` to render the product surface.
3. **Dual composition** — desktop 1920×1080 and mobile 452×1168 compositions share form logic; DemoHost viewport modes exercise both.
4. **States in demo** — idle, validation, submitting, success, social CTAs, reduced-motion via OS + demo toggle (`rule/demo-all-states`, `rule/reduced-motion-required`).
5. **Accessible names** — section labels distinguish desktop vs mobile surfaces for assistive tech.
6. **Motion as layer** — staggered entrance + hikelogo keyframes; reduced-motion keeps state clarity without decorative motion.

## Known flaws (do not copy)

- Registry status is still `review`, not `ready` — do not treat as transfer-complete.
- E2E selectors historically drifted (`aria-label` mismatch desktop/mobile) — keep labels stable or update tests with the component.
- Shared `ViewportMode` type previously lived inside this project and was imported by other demos / chrome — violates `rule/project-isolation` (fixed by moving the shared type to `demo-chrome`).
- Product `index.ts` must stay product-only on Transfer; demo wrappers are lab-local.

## Bad example

```tsx
// Cross-project type import (breaks transfer isolation)
import type { ViewportMode } from "@/components/projects/sign-up/summitpath-sign-up/summitpath-sign-up-section";
```

```tsx
// Flat single-color hero with generic Inter + purple CTA cluster
```

## Good example

```tsx
// Demo chrome owns shared viewport mode; product keeps its own section API
import type { ViewportMode } from "@/components/lab/demo-chrome";
```

Scoped `--summitpath-*` tokens + Instrument Sans + full-bleed outdoor hero plane.

## Sources

- `projects/sign-up/summitpath-sign-up/PROJECT.md`
- Demo: `/demos/summitpath-sign-up`
- Figma: Maser-Lab web component file (nodes in PROJECT.md)
