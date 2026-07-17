# Maser-Lab — Agent Instructions

**Maser-Lab** is Maser Media's internal **web testing lab**: build, review, and harden anything you ship on a website or web app before transferring it to portfolio or client codebases.

## What belongs here

This is not a micro-interaction-only sandbox. Treat the lab as the staging ground for **all client-facing web UI**.

| In scope | Examples |
| --- | --- |
| **Page sections** | Heroes, sign-up flows, feature grids, pricing, footers |
| **Components & chrome** | Navigation, tabs, modals, cards, forms, inputs, toasts |
| **Motion & interaction** | Hover/press feedback, loaders, toggles, scroll reveals, page transitions |
| **Layout & structure** | Drawers, panels, page shells, responsive breakpoints |
| **3D / WebGL** | Shader backgrounds, 3D heroes, scroll-driven scenes, particles |

Pick a **category** from `projects/categories.json` that matches the primary job of the work (e.g. `sign-up` for a registration section, `scroll` for reveal-driven blocks, `navigation` for menus).

## When to load skills

| Task | Load first |
| --- | --- |
| Any web UI in the lab — sections, components, forms, motion, reveals | `.agents/skills/maser-lab-web/SKILL.md` |
| Shape a new section (brand-first brief) | `.agents/skills/maser-lab-section-shape/SKILL.md` |
| Scaffold a new project slug | `.agents/skills/maser-lab-project-scaffold/SKILL.md` |
| Demo chrome / DemoHost / reduced-motion controls | `.agents/skills/maser-lab-demo-chrome/SKILL.md` |
| Export / Transfer / product `index.ts` | `.agents/skills/maser-lab-export/SKILL.md` |
| Prove PROJECT.md acceptance claims | `.agents/skills/maser-lab-acceptance-audit/SKILL.md` |
| Responsive / touch Harden pass | `.agents/skills/maser-lab-responsive-qa/SKILL.md` |
| Product vs lab CSS tokens | `.agents/skills/maser-lab-token-system/SKILL.md` |
| Three.js, shaders, 3D, WebGL/WebGPU, scroll/pointer 3D | `.agents/skills/maser-lab-threejs/SKILL.md` |
| Figma reference, design-to-code, code-to-Figma, Code Connect | `.agents/skills/figma-design-workflow/SKILL.md` |
| Discovering or installing more skills | `.agents/skills/find-skills/SKILL.md` |
| End-to-end verification after implementation | `.agents/skills/verification/SKILL.md` |
| React/Next.js performance or patterns | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Accessibility and web interface audit | `.agents/skills/web-design-guidelines/SKILL.md` |

> **Note:** `maser-lab-web` is the primary **workflow and quality gate** for all web UI in this repo. Use `maser-lab-threejs` when the deliverable is canvas/WebGL/Three.js. Mode→skill routing lives in `.agents/skills/maser-lab-web/references/skill-routing.md`.

**Always report** which skill(s) and reference files you loaded in your work plan or review output.

## Repository layout

```text
maser-lab/
├── AGENTS.md                          ← you are here
├── projects/                          ← specs, acceptance criteria, lifecycle
│   ├── categories.json                ← canonical web UI categories
│   ├── registry.json                  ← index of all projects
│   ├── navigation/{slug}/             ← example category folder
│   ├── sign-up/{slug}/
│   ├── hero-section/{slug}/
│   └── _template/                     ← copy to start a new project
├── lab/                               ← Next.js app for building & previewing
│   └── src/app/demos/[slug]/          ← one demo route per project
├── .agents/skills/                    ← agent skills (auto-discovered)
└── tooling/                           ← lint rules, eval fixtures, scripts
```

## Operating contract

1. **Start a project from the template** — copy `projects/_template/` to `projects/{category}/{slug}/`, fill in `PROJECT.md` and `FIGMA.md` (if design references exist), add the slug to `projects/registry.json` with a valid `category` from `projects/categories.json`.
2. **Implement in `lab/`** — component code lives under `lab/src/components/projects/{category}/{slug}/`; demos register in `demoRegistry` and render via `lab/src/app/demos/[slug]/page.tsx` (DemoHost). Load `maser-lab-project-scaffold` for new slugs.
3. **Use request modes** from `maser-lab-web` — Shape, Implement, Review, Motion-review, Harden, Transfer. Do not mix modes without stating the switch.
4. **Verify rendered output** — run `npm run dev` in `lab/`, exercise all states in `PROJECT.md`, check keyboard, touch, responsive breakpoints, and `prefers-reduced-motion` when motion is involved. Source inspection alone is not enough for visual or motion work.
5. **Review before transfer** — a project moves to `status: "ready"` only after `maser-lab-acceptance-audit` and `maser-lab-export` pass and acceptance criteria in `PROJECT.md` are met.

## Skip these skills for

- Backend-only work with no user-visible effect
- Telemetry, generated files, and documentation-only edits (unless updating agent guidance)
- Git or CI changes with no UI impact

## Quality gates

Before marking a project ready for portfolio transfer:

- [ ] `npm run lint` passes in `lab/`
- [ ] `npm run build` passes in `lab/`
- [ ] Demo route renders all states listed in `PROJECT.md`
- [ ] Review completed (lab Review mode; Motion-review when motion is in scope)
- [ ] `prefers-reduced-motion` honored when the UI animates
- [ ] No P0/P1 findings open from review
- [ ] `maser-lab-acceptance-audit` pass (no false-checked ACs)
- [ ] `maser-lab-export` pass (product-only barrel + filled `TRANSFER.md`)
- [ ] `maser-lab-responsive-qa` pass at 320 and 1280

### Three.js / 3D projects (additional gates)

See `.agents/skills/maser-lab-threejs/references/quality-gates.md`.

- [ ] Official [Three.js docs](https://threejs.org/docs/) checked for APIs used
- [ ] WebGL fallback implemented or documented
- [ ] Mobile simplification considered
- [ ] Geometry/material/texture disposal on unmount

## Branch naming (Cloud Agents)

Use `cursor/webdesign<descriptive-name>-8c1a` for feature branches.

## Cursor Cloud specific instructions

The only app is the Next.js 16 / React 19 lab in `lab/`. Dependencies are installed automatically on startup (`npm ci --prefix lab`). Standard commands are documented in `lab/README.md` and `lab/AGENTS.md` (`npm run dev`, `npm run lint`, `npm run build`), all run from `lab/`.

Non-obvious caveats:

- **Only one `next dev` per directory.** Next.js 16 refuses a second `next dev` in `lab/` even on a different port — it aborts with "Another next dev server is already running." To serve a second instance (e.g. for Playwright, which targets `http://localhost:3001`), build first and use the production server instead: `npm run build` then `npm run start -- -p 3001`.
- **Playwright e2e** (`lab/e2e/`, run with `npx playwright test`) has no `webServer` config, so it needs a server already listening on port 3001 (see above). Browsers are not installed by the update script; run `npx playwright install chromium` once before running e2e.
- The current `lab/e2e/summitpath-sign-up.spec.ts` selectors are stale relative to the component: the spec queries `[aria-label="SummitPath sign-up section"]` but `signup-form.tsx` renders `"SummitPath sign-up desktop"` / `"...mobile"`, so all 6 tests currently fail. This is a pre-existing app/test mismatch, not an environment issue — the dev/build/lint pipeline and demo routes work.
