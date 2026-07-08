# Project: Page Transitions Lab

**Slug:** `page-transitions-lab`  
**Category:** layout  
**Status:** building  
**Created:** 2026-07-07

## Design reference

- Figma: none
- Other: Client shopping-site route transitions, product browsing, collection switching, cart/checkout movement
- Design spec: `FIGMA.md`

## Brief

### User / trigger
Website visitors moving between pages in a client-facing shopping site. Trigger frequency is occasional to tens per session, depending on browsing depth.

### Job
Make page-to-page changes feel intentional and spatial without hiding content, delaying purchase decisions, or creating router-specific lock-in.

### Current behavior
Greenfield lab project. The playground has individual UI demos, but no reusable workspace for comparing route transition patterns with controls and export notes.

### Desired outcome
A gallery where we can preview transition concepts one by one, tune practical motion settings, and export starter code for an external website.

### Success signal
Each transition can be selected, replayed, tuned, understood from notes, and exported without lab-only dependencies beyond documented React/CSS patterns.

### Non-goals
- Full app router integration for a specific client stack
- Real page data fetching
- 3D/WebGL transitions
- Replacing each target site's navigation logic

## States

- [x] default preview
- [x] transition in progress
- [x] previous page
- [x] next page
- [x] selected transition
- [x] tuned settings
- [x] code export drawer
- [x] prefers-reduced-motion

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS custom properties + React state | Keeps exported code portable for client projects before router-specific integration. |
| Duration | 240-900ms control, 520ms default | Lets us test fast commercial navigation and slower editorial transitions. |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` default | Decelerated route entry reads responsive without spring bounce. |
| Properties | `transform`, `opacity`, `clip-path`, `filter` where noted | Prioritizes compositor-friendly motion; filter is reserved for specific concepts and documented. |

## First five transition concepts

| Order | Concept | Shopping-site use | Implementation direction | Risk to test |
| --- | --- | --- | --- | --- |
| 1 | Editorial Wipe | Collection to product detail | A full-bleed brand panel wipes across, then reveals the next page. | Can feel heavy if duration exceeds 600ms. |
| 2 | Product Shelf Slide | Category grid to neighboring category | Old page slides left as new page enters from right with slight depth. | Must preserve reading direction and avoid carousel confusion. |
| 3 | Spotlight Iris | Campaign landing to featured product | Circular reveal grows from the clicked product/CTA region. | Needs fallback origin when no click target exists. |
| 4 | Receipt Lift | Cart to checkout | Checkout panel rises over cart content like a receipt or order sheet. | Should feel transactional, not modal-blocking. |
| 5 | Soft Crossfade Blur | Utility pages, search, account | Fast opacity/blur bridge between unrelated layouts. | Filter cost and reduced-motion behavior need checking. |

## Acceptance criteria

- [x] Demo route `/demos/page-transitions-lab` renders a selectable transition workspace
- [x] Sliders expose duration, intensity, stagger, and corner radius where applicable
- [x] A replay control exercises the selected transition without editing code
- [x] Export drawer shows dependencies, current settings, and starter code
- [x] First five transition concepts are documented in this spec and visible in the demo
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] `prefers-reduced-motion` verified in browser
- [x] Component exported from `lab/src/components/projects/layout/page-transitions-lab/index.ts`

## Open decisions

- Which client router should get the first production adapter: Next.js App Router, Remix, Shopify Hydrogen, or a plain React shell?
- Should transition origin be captured from click targets in the first coded effect, or stay viewport-based until the pattern proves useful?
