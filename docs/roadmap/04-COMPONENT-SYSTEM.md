# 04 — Component System

**Stable:** adapter catalog and shared APIs for exportable UI.  
Related: [01](./01-ENGINE-ARCHITECTURE.md) · [05](./05-MOBILE-WORKSPACE.md) · [06](./06-EXPORT-SYSTEM.md)  
Code: `components/registry.ts`, `components/adapters/`, `react/SurfaceCanvas.tsx`

## Responsibilities

Adapters wrap the shared engine in a concrete UI shape (card, button, …). They:

- Mount one (or few) `SurfaceCanvas` instances with sensible defaults.
- Expose content props (label, href, image, progress, …).
- Own layout/CSS for that shape; **do not** fork GLSL.
- Document a11y and mobile notes in `ComponentDefinition`.

## Catalog (current)

| ID | Status | Category | Adapter |
| --- | --- | --- | --- |
| `card` | ready | surfaces | `DitherCard` (+ `surfaces/SurfaceCard.tsx` composition) |
| `section-background` | ready | surfaces | `DitherSectionBackground` (hero folded in Sprint 7.4) |
| `scrollbar` | ready | chrome | `DitherScrollbar` |
| `avatar` | ready | media | `DitherAvatar` |
| `image-frame` | ready | media | `DitherImageFrame` |
| `progress-bar` | ready | feedback | `DitherProgressBar` |
| `loader` | ready | feedback | `DitherLoader` |
| `navigation` | preview | chrome | `DitherNavigation` |
| `button` | preview | chrome | `DitherButton` |
| `badge` | preview | chrome | `DitherBadge` |
| `input` | preview | chrome | `DitherInput` |

Registry: `components/registry.ts`. AC text saying “12 playgrounds” is outdated — hero merged into section-background.

## Shared API (product)

Common surface through `SurfaceCanvas` / engine config helpers:

| Concern | Mechanism |
| --- | --- |
| Material | `material` / material config → `MaterialController` |
| Dither | algorithm + `DITHER_SIZES` |
| Color / palette | `ColorMaterialController` / palette apply helpers |
| Animation | `ProceduralAnimationController` config |
| Interaction | `InteractionController` config |
| Source image | `sourceUrl` → texture unit 6 |
| Reduced motion | honor `prefers-reduced-motion` / demo chrome toggle |
| Config helpers | `createEngineParams`, `splitConfig`, `mergeConfig` (`engine/api.ts`) |

Adapters should prefer these shared knobs over one-off uniforms.

## Component-specific APIs (examples)

| Component | Specific props / behavior |
| --- | --- |
| Card | Title, body, CTA, optional photo planes (card vs CTA independence — Sprint 7.13) |
| Section background | Full-bleed procedural plane behind content |
| Button / Badge / Nav | Label contrast over dither fill; native interactive elements |
| Avatar | Shape tokens, initials/image/presence |
| Image frame | Framed media + material border treatment |
| Progress / Loader | Value-driven or indeterminate motion |
| Scrollbar | `role=scrollbar`, native pane scroll + material thumb |
| Input | Native input over dithered field background |

Exact prop types live next to each adapter — keep this doc aligned when APIs freeze for npm ([06](./06-EXPORT-SYSTEM.md)).

## Content editing (lab)

`shell/ContentEditor.tsx` + playground panels edit live content for demos. Content editing UI is **lab chrome**; adapters must still accept content via props for consumers.

## Responsive behavior

- Adapters document `mobileNotes` in registry.
- Lab studio uses `FitStage` / bottom sheets ([05](./05-MOBILE-WORKSPACE.md)) — not required in consumer apps.
- Touch targets ≥ 44px for interactive chrome.
- Prefer DPR ≤ 2 on large surfaces (`performanceNotes`).

## Accessibility

| Rule | Practice |
| --- | --- |
| Semantics | Prefer native `button`, `a`, `input`; scrollbar uses correct ARIA |
| Contrast | Labels/CTAs must meet contrast on dithered fills (don’t rely on material alone) |
| Names | Avatars/images need accessible names |
| Motion | Loaders/CRT respect reduced motion |
| Focus | Visible focus on interactive adapters |

## Export expectations

Consumers get adapters + engine + product tokens + module-scoped CSS. They do **not** get `ComponentsIndex`, sidebar, or studio dock. See [06](./06-EXPORT-SYSTEM.md).

## Adding an adapter

1. Create adapter under `components/adapters/`.
2. Register in `COMPONENTS` + adapter map.
3. Reuse `SurfaceCanvas`; pass `material` + optional `sourceUrl`.
4. Fill definition fields (a11y, mobile, performance, default preset).
5. Exercise on `/demos/maser-dither-engine` Components page.
6. If export surface changes, update [06](./06-EXPORT-SYSTEM.md) and public barrel plan.

## Why (human)

Components are how the engine becomes product UI. Keeping them thin adapters preserves the single-program architecture and makes npm export tractable.
