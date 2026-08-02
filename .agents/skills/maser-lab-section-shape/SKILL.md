---
name: maser-lab-section-shape
description: >-
  Shape-mode brief for Maser-Lab page sections and chrome. Use before coding
  heroes, nav, sign-up, marketing, scroll, or feedback surfaces. Produces a
  brand-first brief, one-job sections, state inventory, and motion non-goals.
  Routes to frontend-design / emil-design-eng / Figma when needed.
---

# Maser-Lab Section Shape

**Shape before Implement.** Lock the job, brand signal, states, and non-goals so agents do not invent dashboard clutter or generic AI layouts.

This is the lab-specific Shape mode. Load `maser-lab-web` first and declare **Shape**.

## When to load

| Trigger | Action |
| --- | --- |
| New section / greenfield UI | Full brief |
| "Design this" without settled motion | Shape only — no code unless asked |
| Redesign that feels generic | Re-run brand test |
| Before scaffold | Brief → then `maser-lab-project-scaffold` |

## Hard brand & composition rules

Apply the workspace frontend design rules:

1. **One composition** — first viewport is one idea, not a dashboard
2. **Brand first** — product/brand is hero-level, not nav-only
3. **Brand test** — if removing nav makes it anonymous, branding is too weak
4. **Expressive type** — no Inter/Roboto/Arial/system as the design voice
5. **Atmospheric background** — not flat single-color only
6. **Full-bleed hero** on landing/promo — no inset card heroes by default
7. **Hero budget** — brand, one headline, one support line, one CTA group, one dominant image
8. **No hero overlays** — no floating badges/chips on media
9. **Cards only for interaction** — never in hero
10. **One job per section**
11. **Real visual anchor** — product/place/context, not abstract gradient alone
12. **Avoid AI-default palettes** — purple-on-white, cream+terracotta serif, broadsheet dense columns; avoid dark-mode/purple/glow/pill bias unless brand requires

## Shape brief template

Write this into `PROJECT.md` (or chat, then copy):

```markdown
### User / trigger
…

### Job
…

### Brand signal
What must remain if nav is removed?

### First viewport contents (max)
- Brand:
- Headline:
- Support:
- CTA:
- Visual:

### Section map (one job each)
1. …
2. …

### States to ship
- [ ] default
- [ ] hover / focus / …
- [ ] prefers-reduced-motion

### Motion non-goals
What will NOT animate

### Success signal
…

### Explicit non-goals
…
```

## Decision forks (prefer experiment over asking)

When Shape is blocked by "which layout?":

1. Route to **prototype** mindset (throwaway variants) or install taste skills
2. Load `frontend-design` and/or `emil-design-eng` for craft pressure
3. If Figma URL exists → `figma-design-workflow`
4. If asking “what could animate?” → `find-animation-opportunities` (include rejected candidates)
5. If naming an effect → `animation-vocabulary`
6. Gesture / sheet / spring personality → `apple-design`

Do not jump to production components until the brief's first viewport is settled.

## Output before leaving Shape

- [ ] Brief fields filled in PROJECT.md
- [ ] Category chosen from `categories.json`
- [ ] Slug proposed
- [ ] Product kind named (section | lab | app)
- [ ] Open decisions listed (not silently assumed)
- [ ] Mode switch stated when moving to Implement

## Anti-patterns

- Starting Implement with empty States checklist
- Hero with stats strips, schedules, and promo chips
- Generic purple gradient SaaS template
- Treating a **lab workspace** like a marketing section (wrong kind)

## Related

- `maser-lab-web` Shape mode + `references/motion-judgment.md`
- `frontend-design`, `emil-design-eng`
- `figma-design-workflow`
- `maser-lab-project-scaffold` (next)
- `maser-lab-token-system` (when brand tokens appear)
