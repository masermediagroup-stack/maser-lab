# Playground — Agent Instructions

This repository is a **micro-interaction lab**: build, review, and polish UI components and motion before transferring them to a portfolio.

## When to load skills

| Task | Load first |
| --- | --- |
| Shaping, building, reviewing, or polishing any UI/motion work | `.agents/skills/micro-interaction-lab/SKILL.md` |
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
│   ├── registry.json                  ← index of all projects
│   └── _template/                     ← copy to start a new project
├── lab/                               ← Next.js app for building & previewing
│   └── src/app/demos/[slug]/          ← one demo route per project
├── .agents/skills/                    ← agent skills (auto-discovered)
└── tooling/                           ← lint rules, eval fixtures, scripts
```

## Operating contract

1. **Start a project from the template** — copy `projects/_template/` to `projects/{slug}/`, fill in `PROJECT.md`, add the slug to `projects/registry.json`.
2. **Implement in `lab/`** — component code lives under `lab/src/components/projects/{slug}/`; demo page at `lab/src/app/demos/[slug]/page.tsx` or a dedicated route.
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
