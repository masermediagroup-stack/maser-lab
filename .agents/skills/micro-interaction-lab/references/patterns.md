# Patterns

Canonical patterns for this lab. Prefer these before inventing new motion.

## Button press

- Hover: `translateY(-1px)` + shadow, 100ms ease-out, hover-gated
- Active: `scale(0.98)`, 100ms ease-out
- Focus: visible ring, no motion dependency
- Reduced motion: skip translate/scale; keep color/opacity

**Skills:** `micro-interactions`, `animation-micro-interaction-pack`

## Toggle switch

- Thumb: 150–200ms spring or `cubic-bezier(0.34, 1.56, 0.64, 1)` with slight overshoot
- Track: color crossfade 150ms
- Reduced motion: instant thumb position; keep color change

## Loading indicator

- Prefer opacity pulse or indeterminate progress over infinite bounce on buttons
- Label text stable; use aria-busy

## Success / error feedback

- Success: brief scale 1→1.05→1 or checkmark draw, ≤250ms, once
- Error: horizontal shake 3–5px max, ≤200ms, once — not on every keystroke

## List entrance

- Stagger 30–80ms per item; max 8 items staggered before instant remainder
- Enter: opacity + translateY(8px), ease-out

## Scroll reveal

- Only for below-fold marketing-style demos — not lab chrome
- Use `gsap-framer-scroll-animation` or `hyperframes-animation` catalogs
- Must not block primary interaction path

## Portfolio export shape

```tsx
// lab/src/components/projects/{slug}/index.ts
export { ComponentName, type ComponentNameProps } from "./component-name";
```

Include minimal usage in `TRANSFER.md`.
