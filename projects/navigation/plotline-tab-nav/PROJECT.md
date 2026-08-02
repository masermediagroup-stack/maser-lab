# Project: Plotline Tab Navigation

**Slug:** `plotline-tab-nav`  
**Category:** navigation  
**Status:** review  
**Created:** 2026-06-27

## Design reference

- Plotline marketing nav - glass-dark hanging tab (mobile) + text-only center tab selection (desktop)
- Demo brand label **Plotline**

## Brief

### User / trigger
Visitors on Plotline marketing pages; menu open is occasional, nav link clicks tens per session.

### Job
Wayfind across sections with a distinctive hanging-tab brand moment; desktop center tabs show active page through text color only, with secondary dropdowns for Features and Integrations.

### Desired outcome
Production-quality glass-dark nav for portfolio transfer - tab swing on mobile, text-only desktop center tab selection, compact magenta-glass dropdowns, and correctly centered Sign in text.

### Non-goals
Routing, auth, scroll-spy beyond demo sections.

## Layout (desktop)

| Zone | Content | Alignment |
| --- | --- | --- |
| Leading | Brand (logo + Plotline) | Start |
| Center column (`1fr`) | Five primary tabs, dropdowns on Features/Integrations | Optically centered in remaining space |
| Trailing | Sign in | Separate column - not clustered with CTA |
| Trailing | Start free | End |

**Bar width:** `max-w-5xl` (unchanged).

## States

- [x] collapsed (mobile tab)
- [x] expanded (mobile panel + scrim)
- [x] desktop idle
- [x] desktop hover on links (inactive to pink)
- [x] desktop active page (center tabs text-only)
- [x] Features dropdown hover/focus
- [x] Integrations dropdown hover/focus
- [x] Sign in selected - label centered in pill
- [x] Sign in hover (desktop) - text/User icon crossfade
- [x] Start free selected - white pill, dark pink text; clears tab bubble and active tab styling
- [x] Mobile Sign in - User icon always before label
- [x] prefers-reduced-motion
- [x] focus / keyboard

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Scope | Marketing nav | Occasional clicks; room for bubble spring on pointer |
| Library | Framer Motion | Springs, layout animations, hover crossfade |
| Center active state | Text color only | Keeps primary nav calm and avoids competing selected pills |
| Center tabs | Magnetic hover + scale | Distinctive craft without bubble on hover |
| Dropdowns | Opacity + small y/scale | Smooth secondary layer separate from active bubble |
| Start free | Hover/tap scale only; no magnetic | CTA stays stable |
| Sign in | Magnetic + hover icon swap | Utility affordance separate from center tabs |
| Brand | Scale on hover only | Brand moment without competing with bubble |
| Labels | Plain text; no per-letter splitting | Readability over decorative motion |
| Reduced motion | Dropdown opacity-only, shortened springs/reduced blur | Keep state clarity |

## Acceptance criteria

- [x] Demo at `/demos/plotline-tab-nav` (nav-only canvas, centered)
- [x] Features and Integrations dropdowns open on hover/focus
- [x] Dropdown trigger labels are centered with balanced 14px spacer/chevron cells
- [x] FAQ, Updates, and Pricing have no dropdown
- [x] Hovering dropdown triggers does not change the selected center tab text
- [x] Moving from trigger to dropdown does not flicker
- [x] Dropdowns match the dark glass / magenta glow style and layer above content
- [x] Sign in text is centered vertically and horizontally
- [x] Start free button remains unchanged
- [x] Five center tabs optically centered in middle column
- [x] Bar width `max-w-5xl` preserved
- [x] Mobile Sign in: icon before text
- [x] lint + build pass
- [x] `prefers-reduced-motion` verified in browser
- [x] Component exported from `index.ts`
- [ ] Motion review clean

## Motion verification checklist

- [x] Desktop - click center tab; only text color changes
- [x] Desktop - Features/Integrations dropdowns open independently of selected text state
- [x] Desktop - Features/Integrations labels remain centered with chevrons
- [x] Desktop - Sign in text center measured at x/y delta 0
- [ ] Desktop - Sign in hover shows User icon crossfade when Start free is active
- [ ] Desktop - Start free selected clears bubble and active tab styling
- [ ] Mobile - hanging tab opens panel with swing; scrim dismisses
- [ ] Mobile - Sign in shows User icon before label
- [ ] Keyboard - focus moves through tabs; bubble follows
- [x] Reduced-motion toggle - dropdown transform is removed
- [ ] Touch / coarse pointer - no sticky hover on links
