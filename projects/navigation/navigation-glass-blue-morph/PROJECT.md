# Project: Navigation Glass Blue Morph

**Slug:** `navigation-glass-blue-morph`  
**Category:** navigation  
**Status:** building  
**Created:** 2026-06-28

## Design reference

- [Glassmorphism nav bar micro interaction](https://dribbble.com/shots/23413962-Glassmorphism-nav-bar-micro-interaction) — Lakita Chen (shot #23413962)
- [Figma prototype](https://www.figma.com/community/file/1326240181612164401/micro-interaction-glassmorphism-style-ai-app-navigation)

Recolored portfolio variant: orange/lime → blue/navy. Demo brand **Prism** (stand-in for MIXPIX.AI context).

## Brief

### User / trigger
Mobile app users switching primary tabs; tens of selections per session.

### Job
Wayfind across five sections with a frosted-glass bottom bar; active tab is obvious via morphing inner glow and label.

### Desired outcome
Fluid blob slides inside the pill as the active slot expands; icons and label crossfade to accent blue.

### Non-goals
Routing, auth, scroll-spy, desktop top nav.

## States

- [x] default (Gallery active)
- [x] tab switch / morph
- [x] hover (pointer fine)
- [x] focus / keyboard (arrows, Home, End)
- [x] active / pressed
- [x] prefers-reduced-motion
- [x] demo reduced-motion override

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Framer Motion | layout + spring blob, matches lab |
| Blob spring | stiffness 320, damping 28 | Fluid “wet glass” per reference video |
| Label | 160ms fade + y | Matches reference label reveal |
| Icon color | 200ms currentColor | No layout thrash |

## Acceptance criteria

- [ ] Demo at `/demos/navigation-glass-blue-morph`
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: blob morph + slot width track reference
- [ ] `prefers-reduced-motion` verified in browser
- [ ] Component exported from `index.ts`
