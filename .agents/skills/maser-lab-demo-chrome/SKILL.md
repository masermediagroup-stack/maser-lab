---
name: maser-lab-demo-chrome
description: >-
  Canonical demo shell standard for Maser-Lab. Use when creating or hardening
  demo routes, DemoHost chrome, reduced-motion toggles, state matrices, viewport
  frames, or when demo UI is inconsistent or coupled to a product slug.
  Ensures demos are accessible, product-isolated, and transferable.
---

# Maser-Lab Demo Chrome

Standardize **how demos present products** so agents and humans can exercise every state without guessing, and so shared chrome never imports a specific project.

Load with `maser-lab-web` Implement / Harden. Complements `interface-quality.md`.

## When to load

| Trigger | Action |
| --- | --- |
| New `*-demo.tsx` | Apply template checklist |
| Harden / Review demo UX | Audit against contract |
| E2E selector drift | Align aria-labels with chrome |
| Shared chrome touches a product slug | Decouple types/classes |

## Architecture

```text
lab/src/app/demos/[slug]/page.tsx  →  DemoHost  →  demoRegistry[slug]
                                                      ↓
                                              {Slug}Demo (project)
                                                      ↓
                                    @/components/lab/demo-chrome  (shared)
                                                      ↓
                                              Product component only
```

**Prefer** catch-all `[slug]` + `DemoHost`. Dedicated `demos/{slug}/page.tsx` routes are legacy — do not add new ones unless capture/tooling requires it (e.g. prism capture).

## Shared chrome module

Path: `lab/src/components/lab/demo-chrome.tsx`

| Export | Required a11y |
| --- | --- |
| `DemoBackButton` / `DemoLabBrand` | Link to `/` with visible name |
| `LabButton` | Real `<button>`, not div |
| `ReducedMotionToggle` | `aria-label="Toggle reduced motion"` (or equivalent stable name) |
| `DemoControlBar` | Landmark or labeled group |
| `ViewportModeToggle` | `role="group"` + `aria-label` |
| `DemoViewportFrame` | **Generic** class names — never `summitpath-signup-*` |

### Decoupling rule (P0 if violated)

Shared chrome **must not**:

- Import types from `lab/src/components/projects/{category}/{slug}/`
- Use CSS class prefixes owned by one product (`summitpath-signup-viewport-*`)

Move shared types (e.g. `ViewportMode`) into `lab/src/components/lab/` or `lab/src/types/`.

## Demo component contract

Every `{slug}-demo.tsx` must provide:

1. **Lab brand / back** — return to home
2. **Title + one-line purpose** (on-page or in control region)
3. **State matrix** — labeled controls for every state in `PROJECT.md` (not hover-only)
4. **Reduced motion** — demo toggle + product honors OS `prefers-reduced-motion`
5. **Live region** — product root `aria-label` describing the component under test
6. **Props / API note** — short snippet or link for Transfer (below fold OK)
7. **No product pollution** — demo imports product; product never imports demo

### Reduced motion toggle (canonical)

```tsx
<button
  type="button"
  aria-label="Toggle reduced motion"
  onClick={onToggle}
>
  Reduced motion: {enabled ? "on" : "off"}
</button>
```

E2E and humans must find this via accessible name.

### Product live region

```tsx
<section aria-label="{Brand} {surface}">  {/* one stable label, or desktop/mobile variants documented in PROJECT.md */}
```

If desktop/mobile use different labels, document both in `PROJECT.md` and keep e2e selectors in sync.

## State matrix patterns

Prefer explicit controls over hidden interactions:

| Pattern | When |
| --- | --- |
| Toggle buttons / selects | Discrete states (disabled, viewport, reduced motion) |
| Side-by-side frames | Compare desktop vs mobile artboards |
| Form fill helpers | Sign-up / validation demos |
| Replay / reset | Motion labs |

## Anti-patterns

- Custom back link styled differently per demo with no shared chrome
- Product-specific viewport scaler classes inside `demo-chrome`
- Missing `aria-label` on reduced-motion control (breaks Playwright)
- Demo registered only via dedicated page, omitted from `demoRegistry`
- Putting tuning sliders inside the **product** instead of the demo

## Harden checklist

- [ ] Uses `DemoControlBar` + `DemoLabBrand` (or justified exception noted in PROJECT.md)
- [ ] `ReducedMotionToggle` has accessible name
- [ ] Product `aria-label` stable and documented
- [ ] All PROJECT.md states reachable from controls
- [ ] No import from other project slugs in demo except shared lab chrome
- [ ] Wired in `demoRegistry`
- [ ] Works at 320px and 1280px control bar layout

## Related

- `maser-lab-web/references/interface-quality.md`
- `maser-lab-responsive-qa`
- `maser-lab-export` (demo must not enter product barrel)
- `verification` (e2e after chrome stable)
