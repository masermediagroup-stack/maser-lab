# Project: {title}

**Slug:** `{slug}`  
**Category:** navigation | inputs | feedback | display | scroll | hero-section | marketing | layout  
**Status:** draft | building | review | ready | transferred  
**Created:** YYYY-MM-DD

## Design reference

- Figma: _URL or "none"_
- Other: _Dribbble, screenshot, etc._
- Design spec: `FIGMA.md` in this folder (copy from `projects/_template/FIGMA.md`)

## Brief

### User / trigger
Who activates this and how often?

### Job
What should the user understand or feel after the interaction?

### Current behavior
What exists today (or "greenfield")?

### Desired outcome
What does "done" feel like?

### Success signal
How do we know it works? (timing, clarity, delight bar)

### Non-goals
What this project explicitly does not solve.

## States

List every reachable state the demo must expose:

- [ ] default
- [ ] hover (pointer fine only)
- [ ] focus
- [ ] active / pressed
- [ ] loading
- [ ] success
- [ ] error
- [ ] disabled
- [ ] prefers-reduced-motion

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS / WAAPI / Framer / GSAP / Three.js | |
| Duration | ms | |
| Easing | | |

## Three.js / 3D (optional)

Skip if not a 3D project. Load `.agents/skills/maser-lab-threejs/SKILL.md`.

| Field | Value |
| --- | --- |
| Target type | shader background / 3D hero / environment / particles / GLTF / scroll scene / other |
| Renderer | WebGL / WebGPU / none |
| Decorative? | yes — page works without canvas / no — 3D required |
| Fallback | static image / CSS / simplified scene |
| Mobile strategy | full / simplified / static fallback |
| Reduced motion | static / paused / minimal |
| Research docs checked | [threejs.org/docs/...](https://threejs.org/docs/) |
| CloudAI-X skills used | threejs-* |

## Client & portfolio adaptation (optional)

See `.agents/skills/maser-lab-threejs/references/client-portfolio.md`.

## Acceptance criteria

- [ ] Demo route `/demos/{slug}` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified in browser
- [ ] Component exported from `lab/src/components/projects/{category}/{slug}/index.ts`

## Open decisions

- 
