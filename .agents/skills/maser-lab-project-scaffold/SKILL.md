---
name: maser-lab-project-scaffold
description: >-
  Scaffolds a new Maser-Lab project end-to-end: template copy, registry entry,
  category folder, product + demo files, demoRegistry wiring, and DemoHost route.
  Use when starting a new lab project, "add a demo", or creating a new slug.
---

# Maser-Lab Project Scaffold

Create a new lab project in **one coherent pass** so registry, specs, components, and demos never drift.

Load with `maser-lab-web` Implement mode for new slugs. Chain `maser-lab-section-shape` first when the brief is unset.

## When to load

| Trigger | Action |
| --- | --- |
| "New project" / "start a demo" | Full scaffold |
| Missing registry or demoRegistry entry | Repair wiring |
| Wrong category path | Move to `{category}/{slug}` |

## Preconditions

1. Pick `category` from `projects/categories.json` (never invent ids)
2. Pick kebab-case `slug` unique in `projects/registry.json`
3. Declare product kind: **section** | **lab** | **app** (`maser-lab-export`)

## Scaffold steps (in order)

### 1. Spec folder

```bash
cp -R projects/_template projects/{category}/{slug}
```

Fill:

- `PROJECT.md` — title, slug, category, status `draft` → flip to `building` when code starts
- `FIGMA.md` — if design refs exist; else note "none"
- Leave `TRANSFER.md` as template until Transfer mode
- Optional `LOCAL.md`

### 2. Registry

Add to `projects/registry.json`:

```json
{
  "slug": "{slug}",
  "title": "{Title}",
  "status": "building",
  "category": "{category}",
  "description": "{one line}"
}
```

### 3. Component folder

```text
lab/src/components/projects/{category}/{slug}/
  index.ts                 # PRODUCT ONLY (see export skill)
  {product}.tsx            # main component
  {slug}-demo.tsx          # demo shell
  tokens.css               # unless CSS modules-only (document why)
  constants.ts             # as needed
  types.ts                 # as needed
```

`index.ts` must export product symbols only. Register demo separately.

### 4. Demo registry

In `lab/src/components/projects/registry.ts`:

```ts
import { {Slug}Demo } from "./{category}/{slug}/{slug}-demo";
// or from package if demo re-exported via index.demo — prefer direct demo import

export const demoRegistry = {
  // …
  "{slug}": {Slug}Demo,
};
```

Prefer importing the demo file path to avoid pressure to re-export Demo from `index.ts`.

### 5. Demo route

Use catch-all only:

- `lab/src/app/demos/[slug]/page.tsx` → `DemoHost`
- **Do not** add `lab/src/app/demos/{slug}/page.tsx` unless a capture/tool route is required

Apply `maser-lab-demo-chrome` to the demo component.

### 6. Home listing

Home already reads `projectsRegistry` — no page edit if registry is correct. Verify card appears under the right category.

### 7. Verify scaffold

- [ ] Spec path = `projects/{category}/{slug}/`
- [ ] Component path matches category
- [ ] Registry slug + category valid
- [ ] `demoRegistry` has slug
- [ ] `/demos/{slug}` renders via DemoHost
- [ ] `index.ts` product-only
- [ ] `npm run lint` in `lab/`

## Naming conventions

| Artifact | Pattern |
| --- | --- |
| Slug | `kebab-case` |
| Product component | PascalCase matching brand/job |
| Demo file | `{slug}-demo.tsx` |
| Demo export | `{Name}Demo` |
| Tokens | `tokens.css` with `--{slug}-*` or brand prefix |

## Empty categories

`hero-section` and `inputs` may exist as `.gitkeep` only — valid. Scaffolding into them is fine.

## Anti-patterns

- Spec under wrong category vs registry
- Demo only on dedicated page, missing `demoRegistry`
- Exporting Demo from `index.ts` "for convenience"
- Status `ready` on day one
- Skipping PROJECT.md states inventory

## Related

- Lifecycle: `maser-lab-web/references/project-lifecycle.md`
- Paths: `lab/src/lib/project-paths.ts`
- Export: `maser-lab-export`
- Chrome: `maser-lab-demo-chrome`
- Shape: `maser-lab-section-shape`
