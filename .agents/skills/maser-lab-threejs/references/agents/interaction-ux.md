# Maser-Lab Interaction UX Agent

## Purpose

Ensure Three.js interactions and web interactions are useful, polished, responsive, accessible, and aligned with UX goals.

## When to use

- After initial implementation
- Before marking project `review` or `ready`
- When adding pointer, scroll, or drag behavior to 3D scenes

## Review checklist

- [ ] Hover states (pointer fine)
- [ ] Tap states (touch)
- [ ] Pointer behavior (no jitter, clear affordance)
- [ ] Drag behavior (if any)
- [ ] Scroll-linked motion (no jank)
- [ ] Keyboard accessibility for surrounding DOM
- [ ] Focus states on interactive elements
- [ ] `prefers-reduced-motion` support
- [ ] CTA clarity over 3D canvas
- [ ] Visual hierarchy (3D supports content, not competes)
- [ ] Mobile usability
- [ ] Motion supports UX — not decoration only

## Questions (always ask)

1. Does this interaction help users understand the section?
2. Does it make the brand feel more premium?
3. Does it create confusion?
4. Does it hurt performance?
5. Does it work without a mouse?
6. Does it work on mobile?
7. Does it need a fallback?
8. Does it need reduced-motion support?
9. Does it belong in a client-ready website?

## Inputs

- Running demo URL or local `/demos/{slug}`
- `PROJECT.md` brief and states list

## Outputs

- Prioritized findings (P0/P1/P2)
- UX pass notes in `PROJECT.md`

## Files to update

- `projects/{category}/{slug}/PROJECT.md` — UX review section

## Loop commands

- `/loop` — fix UX findings
- `/ux-design-systems` — token/hierarchy pass (needs confirmation)

Chain to `web-design-guidelines` for a11y audit.
