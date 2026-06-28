# Rules

Stable IDs for traceable findings. Format: `rule/{id}`

---

## rule/no-transition-all

**Scope:** All CSS and styled components in `lab/`

**Rule:** Never use `transition: all` or `transition-all` without an explicit property list.

**Why:** Unbounded transitions animate layout properties and cause jank.

**Exceptions:** None in lab code.

**Source:** `review-animations` escalation triggers

**Bad:**
```css
.card { transition: all 200ms ease; }
```

**Good:**
```css
.card { transition: transform 200ms ease-out, opacity 200ms ease-out; }
```

---

## rule/ui-duration-cap

**Scope:** UI chrome (buttons, toggles, tooltips, menus)

**Rule:** Default duration ≤300ms. High-frequency actions ≤150ms or no motion.

**Why:** Sluggish UI erodes trust; high-frequency motion causes fatigue.

**Exceptions:** Intentional loading/progress indicators; document in `PROJECT.md`.

**Source:** `review-animations` STANDARDS.md

---

## rule/reduced-motion-required

**Scope:** Any movement beyond opacity/color on interactive components

**Rule:** Implement `prefers-reduced-motion: reduce` — reduce or remove translation/scale; keep state clarity.

**Why:** Vestibular accessibility requirement.

**Exceptions:** None.

**Source:** `micro-interactions`, WCAG motion guidance

---

## rule/gpu-properties-only

**Scope:** Animated properties

**Rule:** Prefer `transform` and `opacity`. Do not animate `width`, `height`, `margin`, `padding`, `top`, `left` for UI feedback.

**Why:** Layout thrash and dropped frames.

**Exceptions:** `@keyframes` for SVG stroke-dashoffset; document in project spec.

**Source:** `review-animations`

---

## rule/transform-origin-anchored

**Scope:** Popovers, dropdowns, tooltips, menus anchored to triggers

**Rule:** `transform-origin` must match trigger anchor, not default center.

**Why:** Motion must explain spatial relationship.

**Exceptions:** Centered modals.

**Source:** `review-animations`

---

## rule/hover-gated

**Scope:** Hover-only motion

**Rule:** Gate behind `@media (hover: hover) and (pointer: fine)`.

**Why:** Touch devices receive stuck or phantom hover states.

**Source:** `review-animations`

---

## rule/ease-out-enter

**Scope:** Elements entering or responding to user input

**Rule:** Use `ease-out` or custom deceleration curve. Avoid `ease-in` on UI enter.

**Why:** User watches the end of the motion most; ease-in delays payoff.

**Source:** `review-animations`, Emil Kowalski motion craft

---

## rule/demo-all-states

**Scope:** Demo pages in `lab/src/app/demos/`

**Rule:** Every state listed in `PROJECT.md` must be reachable from the demo UI without editing code.

**Why:** Agents and reviewers must verify rendered behavior.

**Source:** Lab operating contract

---

## rule/project-isolation

**Scope:** `lab/src/components/projects/{slug}/`

**Rule:** No cross-imports between project slugs.

**Why:** Portfolio transfer extracts one project at a time.

**Source:** `project-lifecycle.md`
