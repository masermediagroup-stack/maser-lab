# High-performance web production stack

How Maser-Lab agents should run Shape → Transfer at full quality.

```text
Shape
  maser-lab-web (Shape)
  → maser-lab-section-shape
  → frontend-design / emil-design-eng (craft)
  → find-animation-opportunities (if “what could animate?”)
  → animation-vocabulary (if naming effects)
  → apple-design (if gesture/sheet personality)
  → figma-design-workflow (if refs)

Scaffold
  maser-lab-project-scaffold
  → maser-lab-demo-chrome
  → maser-lab-export (barrel contract)
  → maser-lab-token-system

Implement
  maser-lab-web (Implement)
  → shadcn / vercel-react-best-practices / vercel-composition-patterns
  → ui-animation / micro-interactions / packs when motion is in scope
  → apple-design for drag/swipe/sheets/springs
  → vercel-react-view-transitions when route transitions matter

Motion-review
  review-animations (+ STANDARDS.md)

Motion audit / roadmap
  improve-animations → plans/ (read-only; execute separately)

Harden
  maser-lab-demo-chrome
  → maser-lab-responsive-qa
  → review-animations (if motion)
  → emil-design-eng (optional craft)
  → web-design-guidelines
  → maser-lab-acceptance-audit
  → verification

Transfer
  maser-lab-acceptance-audit
  → maser-lab-export
  → maser-lab-token-system
  → registry status: ready → transferred
```

## Emil Kowalski pack

Install: `npx skills@latest add emilkowalski/skills`

| Skill | Role |
| --- | --- |
| `emil-design-eng` | Design-engineering philosophy |
| `review-animations` | Diff craft review (Block/Approve) |
| `improve-animations` | Codebase audit + executable plans |
| `find-animation-opportunities` | Additive motion proposals (restrained) |
| `animation-vocabulary` | Name effects precisely |
| `apple-design` | Gestures, springs, materials, typography |

Do **not** fork these into lab rules — route and cite; absorb only stable `rule/*` IDs.

## Skills 1–7 (lab operating system)

| # | Skill | Job |
| --- | --- | --- |
| 1 | `maser-lab-export` | Product-only API + TRANSFER.md |
| 2 | `maser-lab-demo-chrome` | Canonical demo shell |
| 3 | `maser-lab-project-scaffold` | New slug wiring |
| 4 | `maser-lab-acceptance-audit` | Honesty gate |
| 5 | `maser-lab-section-shape` | Brand-first Shape |
| 6 | `maser-lab-responsive-qa` | Breakpoint / touch |
| 7 | `maser-lab-token-system` | Lab vs product tokens |

## Phase 1 ecosystem installs

| Skill | Source |
| --- | --- |
| `frontend-design` | anthropics/skills |
| `emil-design-eng` | emilkowalski/skills |
| `vercel-composition-patterns` | vercel-labs/agent-skills |
| `vercel-react-view-transitions` | vercel-labs/agent-skills |
| `skill-creator` | anthropics/skills |
