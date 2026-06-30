# Playground — Agent Instructions

This repository is a **micro-interaction lab**: build, review, and polish UI components and motion before transferring them to a portfolio.

## When to load skills

| Task | Load first |
| --- | --- |
| Shaping, building, reviewing, or polishing any UI/motion work | `.agents/skills/micro-interaction-lab/SKILL.md` |
| Figma reference, design-to-code, code-to-Figma, Code Connect | `.agents/skills/figma-design-workflow/SKILL.md` |
| Discovering or installing more skills | `.agents/skills/find-skills/SKILL.md` |
| End-to-end verification after implementation | `.agents/skills/verification/SKILL.md` |
| React/Next.js performance or patterns | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Accessibility and web interface audit | `.agents/skills/web-design-guidelines/SKILL.md` |

**Always report** which skill(s) and reference files you loaded in your work plan or review output.

## Repository layout

```text
playground/
├── AGENTS.md                          ← you are here
├── projects/                          ← specs, acceptance criteria, lifecycle
│   ├── categories.json                ← canonical component categories
│   ├── registry.json                  ← index of all projects
│   ├── navigation/{slug}/             ← example category folder
│   ├── hero-section/{slug}/
│   └── _template/                     ← copy to start a new project
├── lab/                               ← Next.js app for building & previewing
│   └── src/app/demos/[slug]/          ← one demo route per project
├── .agents/skills/                    ← agent skills (auto-discovered)
└── tooling/                           ← lint rules, eval fixtures, scripts
```

## Operating contract

1. **Start a project from the template** — copy `projects/_template/` to `projects/{category}/{slug}/`, fill in `PROJECT.md` and `FIGMA.md` (if design references exist), add the slug to `projects/registry.json` with a valid `category` from `projects/categories.json`.
2. **Implement in `lab/`** — component code lives under `lab/src/components/projects/{category}/{slug}/`; demo page at `lab/src/app/demos/[slug]/page.tsx` or a dedicated route.
3. **Use request modes** from `micro-interaction-lab` — Shape, Implement, Review, Motion-review, Harden, Transfer. Do not mix modes without stating the switch.
4. **Verify rendered output** — run `npm run dev` in `lab/`, exercise states, check `prefers-reduced-motion`, keyboard, and touch. Source inspection alone is not enough for motion work.
5. **Review before transfer** — a project moves to `status: "ready"` only after motion review passes and acceptance criteria in `PROJECT.md` are met.

## Skip these skills for

- Backend-only work with no user-visible effect
- Telemetry, generated files, and documentation-only edits (unless updating agent guidance)
- Git or CI changes with no UI impact

## Quality gates

Before marking a project ready for portfolio transfer:

- [ ] `npm run lint` passes in `lab/`
- [ ] `npm run build` passes in `lab/`
- [ ] Demo route renders all states listed in `PROJECT.md`
- [ ] Motion review completed (`review-animations` or lab Review mode)
- [ ] `prefers-reduced-motion` honored
- [ ] No P0/P1 findings open from review

## Branch naming (Cloud Agents)

Use `cursor/webdesign<descriptive-name>-8c1a` for feature branches.

## Cursor Cloud specific instructions

The only app is the Next.js 16 / React 19 lab in `lab/`. Dependencies are installed automatically on startup (`npm ci --prefix lab`). Standard commands are documented in `lab/README.md` and `lab/AGENTS.md` (`npm run dev`, `npm run lint`, `npm run build`), all run from `lab/`.

Non-obvious caveats:

- **Only one `next dev` per directory.** Next.js 16 refuses a second `next dev` in `lab/` even on a different port — it aborts with "Another next dev server is already running." To serve a second instance (e.g. for Playwright, which targets `http://localhost:3001`), build first and use the production server instead: `npm run build` then `npm run start -- -p 3001`.
- **Playwright e2e** (`lab/e2e/`, run with `npx playwright test`) has no `webServer` config, so it needs a server already listening on port 3001 (see above). Browsers are not installed by the update script; run `npx playwright install chromium` once before running e2e.
- The current `lab/e2e/summitpath-sign-up.spec.ts` selectors are stale relative to the component: the spec queries `[aria-label="SummitPath sign-up section"]` but `signup-form.tsx` renders `"SummitPath sign-up desktop"` / `"...mobile"`, so all 6 tests currently fail. This is a pre-existing app/test mismatch, not an environment issue — the dev/build/lint pipeline and demo routes work.
