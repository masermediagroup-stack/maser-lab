# Skill routing

Do not duplicate content from these skills — load and apply them.

| Skill | Install source | When to load |
| --- | --- | --- |
| `find-skills` | vercel-labs/skills | User asks to find/install skills; capability gap |
| `micro-interactions` | dylantarre/animation-principles | Small feedback: buttons, toggles, badges |
| `animation-micro-interaction-pack` | patricio0312rev/skills | Tailwind/Framer presets, quick patterns |
| `ui-animation` | mblode/agent-skills | Springs, gestures, decision framework |
| `review-animations` | emilkowalski/skills | Motion-review mode; aggressive craft audit |
| `gsap-framer-scroll-animation` | github/awesome-copilot | Scroll-linked or timeline-heavy demos |
| `hyperframes-animation` | heygen-com/hyperframes | CSS/motion catalog, transitions, blueprints |
| `shadcn` | shadcn/ui | UI primitives, forms, composition |
| `web-design-guidelines` | vercel-labs/agent-skills | A11y and web interface audit |
| `vercel-react-best-practices` | vercel-labs/agent-skills | React/Next performance |
| `verification` | vercel-labs/vercel-plugin | End-to-end flow check after implementation |
| `vercel-agent` | vercel-labs/vercel-plugin | Vercel Agent platform configuration |
| `figma-design-workflow` | playground (local) | Figma refs, tokens, design↔code sync, Code Connect paths |
| `figma-use` | Figma MCP plugin | Read/write Figma nodes — load before every `use_figma` call |
| `figma-generate-design` | Figma MCP plugin | Push lab demos / pages to Figma from code |
| `figma-code-connect` | Figma MCP plugin | `.figma.ts` mappings for published team components |
| `figma-generate-library` | Figma MCP plugin | Variables, components, design system in Figma |

## Search for more

```bash
npx skills find "micro interaction"
npx skills find "animation" --owner vercel-labs
```

Browse: https://skills.sh/

## Priority when skills conflict

1. `review-animations` craft bar for motion code review
2. `micro-interaction-lab` rules and project acceptance criteria
3. Domain skill (e.g. `ui-animation` for spring tuning)
4. General heuristics
