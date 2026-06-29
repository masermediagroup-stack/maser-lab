# Project: Plotline Tab Navigation

**Slug:** `plotline-tab-nav`  
**Category:** navigation  
**Status:** review  
**Created:** 2026-06-27

## Design reference

- Plotline marketing nav — glass-dark hanging tab (mobile) + sliding bubble indicator (desktop)
- Demo brand label **Plotline**

## Brief

### User / trigger
Visitors on Plotline marketing pages; menu open is occasional, nav link clicks tens per session.

### Job
Wayfind across sections with a distinctive hanging-tab brand moment; desktop shows active page via a moving glass bubble.

### Desired outcome
Production-quality glass-dark nav for portfolio transfer — tab swing on mobile, GPU-friendly sliding bubble on desktop, readable labels without per-character splitting.

### Non-goals
Routing, auth, scroll-spy beyond demo sections.

## Layout (desktop)

| Zone | Content | Alignment |
| --- | --- | --- |
| Leading | Brand (logo + Plotline) | Start |
| Center column (`1fr`) | Five primary tabs | Optically centered in remaining space |
| Trailing | Sign in | Separate column — not clustered with CTA |
| Trailing | Start free | End |

**Bar width:** `max-w-5xl` (unchanged).

### Optical centering (research note)

Primary nav links centered in the middle band is a **common production pattern**, not mere preference:

- **Material Design 3** — centered tab bar on large viewports when width allows.
- **Marketing / SaaS** — primary sections in a centered group; utilities (Sign in, CTA) on the trailing edge.

Implementation: CSS grid `auto | 1fr | auto | auto` with the five tabs in a flex row inside the `1fr` column (`justify-center`). Geometric center of the bar ≠ optical center when brand and utilities have unequal width; centering the tab group in the flexible middle column matches user expectation.

## States

- [x] collapsed (mobile tab)
- [x] expanded (mobile panel + scrim)
- [x] desktop idle
- [x] desktop hover on links (inactive → pink)
- [x] desktop active page (bubble position)
- [x] Sign in selected — label centered in pill (`justify-center`, `text-box-trim`)
- [x] Sign in hover (desktop) — text ↔ User icon crossfade (works when Start free is active)
- [x] Start free selected — white pill, dark pink text; clears tab bubble and active tab styling
- [x] Mobile Sign in — User icon always before label
- [x] prefers-reduced-motion
- [x] focus / keyboard (bubble spring retained)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Scope | Marketing nav | Occasional clicks; room for bubble spring on pointer |
| Library | Framer Motion | Springs, layout animations, hover crossfade |
| Bubble (pointer) | Transform-only spring + motion blur (5px peak) | GPU-friendly; no width/height animation |
| Bubble (keyboard) | Spring retained per spec | Focus path keeps spatial feedback |
| Center tabs | Magnetic hover + scale | Distinctive craft without bubble on hover |
| Start free | Hover/tap scale only — **no** magnetic | CTA stays stable |
| Sign in | Magnetic + hover icon swap | Utility affordance separate from center tabs |
| Brand | Scale on hover only | Brand moment without competing with bubble |
| Labels | Plain text — **no** per-letter splitting | Readability over decorative motion |
| Reduced motion | Shortened springs / reduced blur | Keep state clarity |

## Acceptance criteria

- [x] Demo at `/demos/plotline-tab-nav` (nav-only canvas, centered)
- [x] Five center tabs optically centered in middle column
- [x] Sign in text centered in selection pill
- [x] Bar width `max-w-5xl` preserved
- [x] GPU transform bubble migration
- [x] Per-letter `AnimatedText` removed
- [x] Mobile Sign in: icon before text
- [x] lint + build pass
- [ ] `prefers-reduced-motion` verified in browser
- [x] Component exported from `index.ts`
- [ ] Motion review clean

## Motion verification checklist

- [ ] Desktop — click each center tab; bubble slides with spring + blur
- [ ] Desktop — Sign in hover shows User icon crossfade when Start free is active
- [ ] Desktop — Start free selected clears bubble and active tab styling
- [ ] Mobile — hanging tab opens panel with swing; scrim dismisses
- [ ] Mobile — Sign in shows User icon before label
- [ ] Keyboard — focus moves through tabs; bubble follows
- [ ] Reduced-motion toggle — motion shortens or snaps per `forceReducedMotion`
- [ ] Touch / coarse pointer — no sticky hover on links
