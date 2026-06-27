# Playground

Web components and micro-interactions — built here, reviewed with agent skills, transferred to portfolio when ready.

## Quick start

```bash
cd lab
npm install   # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the lab index. Each project gets a demo at `/demos/{slug}`.

## For agents

**Start here:** [`AGENTS.md`](./AGENTS.md) → load [`.agents/skills/micro-interaction-lab/SKILL.md`](./.agents/skills/micro-interaction-lab/SKILL.md)

This repo follows Vercel's [product-design for agents](https://vercel.com/blog/teaching-agents-product-design-at-vercel) pattern, adapted for motion and micro-interactions:

| Layer | Location |
| --- | --- |
| Entry & triggers | `AGENTS.md` |
| Workflow & modes | `.agents/skills/micro-interaction-lab/SKILL.md` |
| Rules & patterns | `.agents/skills/micro-interaction-lab/references/` |
| Project specs | `projects/{slug}/PROJECT.md` |
| Deterministic checks | `tooling/eslint/` + `npm run lint` in `lab/` |
| Eval fixtures | `tooling/scripts/evals/` |

### Request modes

Shape → Implement → Review / Motion-review → Harden → Transfer

### New project

```bash
cp -r projects/_template projects/my-slug
# Edit projects/my-slug/PROJECT.md
# Add entry to projects/registry.json
# Implement in lab/src/components/projects/my-slug/
# Register demo in lab/src/components/projects/registry.ts
```

## Agent skills

Cloud agents auto-discover skills under `.agents/skills/`.

| Skill | Purpose |
| --- | --- |
| **`micro-interaction-lab`** | **Primary entry — workflow, rules, lifecycle** |
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
| `vercel-agent` | Vercel Agent platform guidance |

### Add or update skills

```bash
npx skills find "micro interactions"
npx skills add vercel-labs/vercel-plugin@verification -y
npx skills check && npx skills update
```

## Repository layout

```text
playground/
├── AGENTS.md                 # Agent entry point
├── projects/                 # Specs & registry
├── lab/                      # Next.js build shell
├── .agents/skills/           # Agent skills
└── tooling/                  # ESLint rules, evals
```

## Quality gates

Before portfolio transfer: lint + build pass, all `PROJECT.md` states demoed, motion review clean, reduced-motion verified.
