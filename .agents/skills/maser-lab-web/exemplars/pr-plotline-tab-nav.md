# Exemplar: plotline-tab-nav

**Slug:** `plotline-tab-nav` · **Category:** `navigation`  
**Demo:** `/demos/plotline-tab-nav`  
**Status:** review

## Decision

**Status:** accepted (project-level motion pattern)  
**Scope:** Marketing nav with hanging mobile tab + desktop center tabs  
**Decision:** Occasional nav interaction gets springs and glass craft; high-frequency / keyboard paths stay calm; reduced-motion shortens springs and drops decorative transform on dropdowns  
**Rationale:** Motion must explain spatial relationships (hanging tab, dropdown layer) without fatiguing text-color active states or keyboard users (`rule/reduced-motion-required`, `rule/interruptible-dynamic-motion`, `rule/no-keyboard-motion`)  
**Evidence:** `projects/navigation/plotline-tab-nav/PROJECT.md` motion decisions + verification checklist  
**Exceptions:** Decorative hanging-tab swing is intentional brand motion with reduced-motion fallback  
**Approver:** project author / lab maintainer

## Useful decisions

1. **Frequency-aware motion** — center active state is text color only; springs reserved for pointer hover / open panel.
2. **Interruptible springs** — Framer Motion layout / spring values retarget; avoid one-shot keyframes that restart from zero on rapid tab clicks.
3. **Reduced motion** — dropdown opacity-only; shortened springs; keep open/closed clarity (`rule/reduced-motion-required`).
4. **Hover gating** — pointer-fine hover styles; touch must not leave sticky hover (`rule/hover-gated`).
5. **One job** — wayfinding chrome only; no scroll-spy or auth in the product surface.

## Known flaws (do not copy)

- Motion verification checklist still has unchecked items (Sign in hover when Start free active; some mobile/keyboard rows) — do not claim Motion-review clean.
- Glass / magenta glow is brand-specific — do not universalize into lab rules as “all navs must glow.”
- Status remains `review`; export/acceptance audit still required before `ready`.

## Bad example

```tsx
// Animate every keyboard focus move with a long spring
onKeyDown={() => animate(bubbleX, target, { type: "spring", stiffness: 80 })}
```

```css
/* Unbounded transition on the whole nav */
.nav { transition: all 400ms ease; }
```

## Good example

```tsx
// Reduced motion: opacity-only dropdown; springs shortened via MotionConfig / variants
const reduced = useReducedMotion();
animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
```

Desktop active tab = text color only; hanging tab swing only on coarse open gesture.

## Sources

- `projects/navigation/plotline-tab-nav/PROJECT.md`
- Demo: `/demos/plotline-tab-nav`
- Rules: `rule/reduced-motion-required`, `rule/no-transition-all`, `rule/interruptible-dynamic-motion`
