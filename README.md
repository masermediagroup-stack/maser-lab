# Maser-Lab

**Maser-Lab** — Maser Media's web testing facility. Build, review, and harden page sections, components, forms, navigation, scroll reveals, micro-interactions, and 3D web experiences here; transfer to portfolio or client codebases when ready.

## Quick start

```bash
cd lab
npm install   # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the lab index. Each project gets a demo at `/demos/{slug}`.

## For agents

**Start here:** [`AGENTS.md`](./AGENTS.md) → load [`.agents/skills/maser-lab-web/SKILL.md`](./.agents/skills/maser-lab-web/SKILL.md)

This repo follows Vercel's [product-design for agents](https://vercel.com/blog/teaching-agents-product-design-at-vercel) pattern, adapted for **full-stack web UI** — not micro-interactions alone:

| Layer | Location |
| --- | --- |
| Entry & scope | `AGENTS.md` |
| Workflow & modes | `.agents/skills/maser-lab-web/SKILL.md` |
| Rules & patterns | `.agents/skills/maser-lab-web/references/` |
| Project specs | `projects/{category}/{slug}/PROJECT.md` |
| Figma / design sync | `projects/{category}/{slug}/FIGMA.md` + `figma-design-workflow` skill |
| Deterministic checks | `tooling/eslint/` + `npm run lint` in `lab/` |
| Eval fixtures | `tooling/scripts/evals/` |

### Request modes

Shape → Implement → Review / Motion-review → Harden → Transfer  
With Figma: **design → code** (Shape/Implement) and **code → Figma** (after demo stable) — see `figma-design-workflow` skill.

### New project

```bash
mkdir -p projects/{category}/{slug}
cp projects/_template/PROJECT.md projects/{category}/{slug}/
cp projects/_template/TRANSFER.md projects/{category}/{slug}/
mkdir -p lab/src/components/projects/{category}/{slug}
# Edit projects/{category}/{slug}/PROJECT.md
# Add entry to projects/registry.json (with category)
# Implement in lab/src/components/projects/{category}/{slug}/
# Register demo in lab/src/components/projects/registry.ts
```

## Agent skills

Cloud agents auto-discover skills under `.agents/skills/`.

| Skill | Purpose |
| --- | --- |
| **`maser-lab-web`** | **Primary entry — workflow, rules, lifecycle for all web UI** |
| **`maser-lab-threejs`** | **Three.js / WebGL / shader systems** |
| `find-skills` | Discover and install skills from [skills.sh](https://skills.sh/) |
| `verification` | End-to-end flow verification after implementation |
| `vercel-react-best-practices` | React/Next.js performance |
| `web-design-guidelines` | Web interface & accessibility audit |
| `review-animations` | Motion craft review (Emil Kowalski bar) |
| `micro-interactions` | Disney principles for UI feedback |
| `ui-animation` | Springs, gestures, component patterns |
| `animation-micro-interaction-pack` | Motion presets |
| `gsap-framer-scroll-animation` | Scroll/timeline animations |
| `hyperframes-animation` | CSS/motion graphics catalog |
| `shadcn` | UI component composition |
| **`figma-design-workflow`** | **Figma ↔ lab integration (tokens, Code Connect, sync)** |
| `vercel-agent` | Vercel Agent platform guidance |

### Add or update skills

```bash
npx skills find "scroll animation"
npx skills add vercel-labs/vercel-plugin@verification -y
npx skills check && npx skills update
```

## Repository layout

```text
maser-lab/
├── AGENTS.md                 # Agent entry point
├── projects/                 # Specs & registry
│   ├── categories.json       # Canonical web UI categories
│   ├── registry.json         # Project index (includes category)
│   ├── navigation/{slug}/    # Example: navigation/plotline-tab-nav/
│   ├── sign-up/{slug}/       # Example: sign-up/summitpath-sign-up/
│   └── hero-section/{slug}/  # Example: hero-section/my-hero/
├── lab/                      # Next.js build shell
│   └── src/components/projects/{category}/{slug}/
├── .agents/skills/           # Agent skills
└── tooling/                  # ESLint rules, evals
```

## Quality gates

Before portfolio transfer: lint + build pass, all `PROJECT.md` states demoed, review clean, reduced-motion verified when motion is in scope. Full checklist: `project-lifecycle.md` → Transfer checklist; per-slug steps in `TRANSFER.md`.

## Vercel deployment

Deploy the `lab/` app as the online Maser-Lab.

| Setting | Value |
| --- | --- |
| Project name | `maser-lab` |
| Framework preset | Next.js |
| Root directory | Repository root |
| Install command | `npm ci` |
| Build command | `npm run build --workspace maser-lab` |
| Output directory | `lab/.next` |

Keep the repository root as the deployment context because the Next.js app imports project specs from `projects/`. The root `package.json` is a workspace wrapper for the `lab/` app so Vercel can detect Next.js while still building the lab workspace.

## Figma integration

Design ↔ code sync for lab projects. Load `.agents/skills/figma-design-workflow/SKILL.md` when working with Figma.

### MCP setup (Cursor)

Use **both** servers for the full workflow:

| Server | URL | Purpose |
| --- | --- | --- |
| **Remote** (Figma plugin) | `https://mcp.figma.com/mcp` | Write to canvas (`use_figma`), capture localhost UI (`generate_figma_design`) |
| **Desktop** (optional) | `http://127.0.0.1:3845/mcp` | Read current selection without pasting URLs |

**Install remote (recommended):** In agent chat run `/add-plugin figma` and authenticate with Figma.

**Install desktop (optional):**

1. Open **Figma desktop** → your design file → **Shift+D** (Dev Mode).
2. Inspect panel → **MCP server** → **Enable desktop MCP server**.
3. **Cursor → Settings → MCP → Add server:**

```json
{
  "mcpServers": {
    "figma-desktop": {
      "url": "http://127.0.0.1:3845/mcp"
    }
  }
}
```

Keep Figma desktop open while using the desktop server.

### Team Maser-Lab Figma File

Primary Figma file for this repo:

**[Maser-Lab web component and interaction file](https://www.figma.com/design/f2TLFWW5Eg8aqczRjuZ403/Maser-Lab-web-component-and-interaction-file)**

| Field | Value |
| --- | --- |
| `fileKey` | `f2TLFWW5Eg8aqczRjuZ403` |

**Access requirement:** The Figma account connected to Cursor MCP must have **Editor** access on this file. Share the file with the authenticated account (check via Figma MCP `whoami`) before asking the agent to push components.

### Push lab demo → Figma

1. `cd lab && npm run dev`
2. Open demo: `/demos/{slug}` or `/demos/{slug}/capture` (nav-only, no chrome)
3. Paste the **Figma file URL** (and optional `node-id`) in chat
4. Agent uses `use_figma` to build frames + prototype interactions, or `generate_figma_design` for pixel capture

Per-project design notes live in `projects/{category}/{slug}/FIGMA.md`.

### Prototype pattern (glass nav)

For tab morph interactions, the agent builds **one frame per active tab** and wires **On click → Navigate to → Smart animate** between frames. Present from the Gallery (default) frame in Figma.
