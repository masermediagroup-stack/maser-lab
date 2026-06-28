# Projects

Each folder is one micro-interaction or component experiment.

## Categories

Every project must declare a category in `registry.json`. Canonical IDs live in [`categories.json`](./categories.json):

| Category | Use for |
| --- | --- |
| `navigation` | Menus, tabs, breadcrumbs, wayfinding |
| `inputs` | Buttons, toggles, sliders, form controls |
| `feedback` | Loaders, toasts, success/error states |
| `display` | Cards, lists, badges, data presentation |
| `scroll` | Scroll-linked reveals and parallax |
| `marketing` | Hero blocks, CTAs, brand moments |
| `layout` | Modals, drawers, panels, page chrome |

Pick the category that best describes the **primary user-facing job** of the component. If a project spans categories, choose the one you'd file it under in a design system.

## Start a new project

```bash
cp -r projects/_template projects/my-slug
```

1. Edit `projects/my-slug/PROJECT.md` (include category in the header)
2. Add an entry to `registry.json` with a valid `category` id
3. Implement in `lab/src/components/projects/my-slug/`
4. Demo at `/demos/my-slug`

Agents: load `.agents/skills/micro-interaction-lab/SKILL.md` before starting.
