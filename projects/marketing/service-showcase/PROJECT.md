# Project: Service Showcase

**Slug:** `service-showcase`  
**Category:** marketing  
**Status:** building  
**Created:** 2026-07-13

## Design reference

- Figma: none
- Other: Linear / Vercel / Stripe / Apple simplicity — black & white premium service browser
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Landing-page visitors browsing junk removal service types (residential, commercial, industrial, rentals). Occasional interaction; not high-frequency chrome.

### Job
Let visitors quickly compare service offerings via tab navigation and a content viewer (image + copy, with before/after where relevant).

### Current behavior
Greenfield — isolated lab component for later drop-in to the 319Junk landing page.

### Desired outcome
Minimal, clean, premium B&W section: top tabs feel like navigation; content below feels expensive. Heading lives outside this component.

### Success signal
Tab switch feels smooth (pill spring + panel fade/slide); comparison slider works on mouse and touch; keyboard/ARIA tabs work; data swap alone ports the component.

### Non-goals
Full landing page, brand photography, colored accents, site-wide navigation chrome.

## States

- [ ] default (Residential active)
- [ ] hover (inactive tabs — pointer fine only)
- [ ] focus (visible focus ring on tabs and slider handle)
- [ ] active / selected tab (black pill, white text)
- [ ] comparison mode (Residential / Commercial / Industrial)
- [ ] image-only mode (Daily / Weekly Rentals)
- [ ] prefers-reduced-motion (instant or opacity-only transitions)
- [ ] desktop layout (tabs top; image 60% / copy 40%)
- [ ] mobile layout (scrollable tabs; stacked image → copy)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Framer Motion | Pill `layoutId`, AnimatePresence panel, spring feel |
| Tab pill | ~250ms spring | Premium nav indicator |
| Panel swap | 300ms fade + slight Y | Premium content transition |
| Comparison enter | Subtle whileInView | Polish without distraction |
| Reduced motion | Skip translate / springs | Clarity without vestibular risk |

## Acceptance criteria

- [x] Demo route `/demos/service-showcase` renders all states above
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified in browser
- [x] Component exported from `lab/src/components/projects/marketing/service-showcase/index.ts`
- [x] Lab controls: active tab, viewport, animations, image mode, duration, radius, spacing
- [x] Consumers can reuse by replacing/passing the `items` data array only

## Open decisions

- None — defaults locked in implement plan (Space Grotesk, Unsplash placeholders, slug `service-showcase`).
