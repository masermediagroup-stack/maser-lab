# playground

Web components and micro interactions.

## Agent skills

This repo ships Cursor Cloud Agent skills under `.agents/skills/`. Cloud agents auto-discover them on every run.

### Installed skills

| Skill | Purpose | Source |
| --- | --- | --- |
| `find-skills` | Discover and install more skills from the open ecosystem | [vercel-labs/skills](https://github.com/vercel-labs/skills) |
| `web-design-guidelines` | Vercel web design and UX guidelines | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) |
| `shadcn` | Build, compose, and style shadcn/ui components | [shadcn/ui](https://github.com/shadcn/ui) |
| `micro-interactions` | Disney animation principles for UI feedback | [dylantarre/animation-principles](https://github.com/dylantarre/animation-principles) |
| `animation-micro-interaction-pack` | Pack of micro-interaction patterns | [patricio0312rev/skills](https://github.com/patricio0312rev/skills) |
| `review-animations` | Review and refine UI animation quality | [emilkowalski/skills](https://github.com/emilkowalski/skills) |
| `ui-animation` | Component animation patterns, springs, gestures | [mblode/agent-skills](https://github.com/mblode/agent-skills) |
| `gsap-framer-scroll-animation` | GSAP and Framer Motion scroll animations | [github/awesome-copilot](https://github.com/github/awesome-copilot) |
| `hyperframes-animation` | CSS and motion graphics animation guidance | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) |

### Add or update skills

```bash
# Search the ecosystem
npx skills find "micro interactions"

# Install a skill into this repo
npx skills add vercel-labs/skills --skill find-skills -y
npx skills add shadcn/ui@shadcn -y

# Check for updates
npx skills check
npx skills update
```

Browse more at [skills.sh](https://skills.sh/).
