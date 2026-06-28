# Projects

Each folder is one micro-interaction or component experiment, organized by category:

```text
projects/
├── categories.json
├── registry.json
├── navigation/
│   └── plotline-tab-nav/
│       ├── PROJECT.md
│       └── TRANSFER.md
├── hero-section/
│   └── my-hero-slug/
└── inputs/
    └── my-button-slug/
```

Component code mirrors the same `{category}/{slug}/` layout under `lab/src/components/projects/`.

## Categories

Every project must declare a category in `registry.json`. Canonical IDs live in [`categories.json`](./categories.json):

| Category | Folder | Use for |
| --- | --- | --- |
| `navigation` | `navigation/{slug}/` | Menus, tabs, breadcrumbs, wayfinding |
| `inputs` | `inputs/{slug}/` | Buttons, toggles, sliders, form controls |
| `feedback` | `feedback/{slug}/` | Loaders, toasts, success/error states |
| `display` | `display/{slug}/` | Cards, lists, badges, data presentation |
| `scroll` | `scroll/{slug}/` | Scroll-linked reveals and parallax |
| `hero-section` | `hero-section/{slug}/` | Landing heroes and above-the-fold headers |
| `marketing` | `marketing/{slug}/` | CTAs, social proof, brand moments |
| `layout` | `layout/{slug}/` | Modals, drawers, panels, page chrome |

Pick the category that best describes the **primary user-facing job** of the component.

## Start a new project

```bash
SLUG=my-slug
CATEGORY=navigation   # or hero-section, inputs, etc.

mkdir -p "projects/${CATEGORY}/${SLUG}"
cp projects/_template/PROJECT.md "projects/${CATEGORY}/${SLUG}/"
cp projects/_template/TRANSFER.md "projects/${CATEGORY}/${SLUG}/"
mkdir -p "lab/src/components/projects/${CATEGORY}/${SLUG}"
```

1. Edit `projects/{category}/{slug}/PROJECT.md` (include category in the header)
2. Add an entry to `registry.json` with a valid `category` id
3. Implement in `lab/src/components/projects/{category}/{slug}/`
4. Demo at `/demos/{slug}`

Agents: load `.agents/skills/micro-interaction-lab/SKILL.md` before starting.
