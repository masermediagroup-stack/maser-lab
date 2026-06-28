# Project: Plotline Tab Navigation

**Slug:** `plotline-tab-nav`  
**Status:** review  
**Created:** 2026-06-27

## Brief

### User / trigger
Visitors on Plotline marketing pages; menu open is occasional, nav link clicks tens per session.

### Job
Wayfind across sections with a distinctive hanging-tab brand moment; desktop shows active page via a moving glass bubble.

### Desired outcome
Smooth, glass-dark nav that feels premium — tab swing on mobile, sliding bubble on desktop, subtle text motion on all labels.

### Non-goals
Routing, auth, scroll-spy beyond demo sections.

## States

- [x] collapsed (mobile tab)
- [x] expanded (mobile panel + scrim)
- [x] desktop idle
- [x] desktop hover on links
- [x] desktop active page (bubble position)
- [x] prefers-reduced-motion
- [x] focus / keyboard

## Acceptance criteria

- [x] Demo at `/demos/plotline-tab-nav`
- [ ] lint + build pass
- [ ] Motion review clean
