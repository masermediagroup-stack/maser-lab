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

**Scope:** `lab/src/components/projects/{category}/{slug}/`

**Rule:** No cross-imports between project slugs.

**Why:** Portfolio transfer extracts one project at a time.

**Source:** `project-lifecycle.md`

---

## rule/no-keyboard-motion

**Scope:** Keyboard shortcuts, arrow navigation, focus moves, command palette, any 100+/day control

**Rule:** Do not animate keyboard-initiated or ultra-high-frequency actions beyond instant state clarity (opacity/color at most).

**Why:** Motion on actions seen hundreds of times per day feels slow and fatiguing.

**Exceptions:** Rare first-run coaching moments documented in `PROJECT.md`.

**Source:** `review-animations` STANDARDS.md, `emil-design-eng`

---

## rule/no-scale-zero

**Scope:** Enter / appear animations for UI surfaces

**Rule:** Do not start from `scale(0)`. Prefer `scale(0.9–0.97)` plus opacity. Centered modals may omit scale and use opacity only.

**Why:** Nothing should appear from nothing — zero-scale feels discontinuous.

**Exceptions:** Explicitly intentional brand moments with documented reduced-motion fallback.

**Source:** `review-animations`, `emil-design-eng`

---

## rule/interruptible-dynamic-motion

**Scope:** Toasts, toggles, expandable panels, drag-reversible UI, anything triggered rapidly

**Rule:** Use CSS transitions or springs that retarget from the current presentation value. Avoid keyframes that restart from zero on interruption.

**Why:** Restarting motion on every trigger feels broken under rapid input.

**Exceptions:** Predetermined one-shot sequences (e.g. success checkmark) that are not re-triggerable mid-flight.

**Source:** `review-animations`, `improve-animations` AUDIT.md, `apple-design`

---

## rule/direct-manipulation-continuity

**Scope:** Drag, swipe, sheets, drawers, scrubbers, carousels

**Rule:** Respond on pointer-down; track the pointer 1:1 during the gesture (respect grab offset); do not lock input while a transition is settling if the user can reverse.

**Why:** Indirect or delayed manipulation breaks the “holding the object” illusion.

**Exceptions:** Non-gesture UI (button clicks, menu items).

**Source:** `apple-design`

---

## rule/velocity-aware-gestures

**Scope:** Gesture release / commit decisions

**Rule:** Use velocity (and projected landing) in addition to distance thresholds. Prefer carrying velocity into the settling spring. Rubber-band past edges instead of hard-clamping when the interaction is continuous.

**Why:** Distance-only thresholds feel sticky; momentum matches user intent.

**Exceptions:** Discrete snaps with no drag continuous phase.

**Source:** `apple-design`

---

## rule/motion-token-cohesion

**Scope:** Product `tokens.css` and shared motion CSS

**Rule:** Repeated durations and easings used in 2+ places must become product motion tokens (e.g. `--{brand}-duration-fast`, `--{brand}-ease-out`). Do not invent a unique cubic-bezier per component without a documented personality reason.

**Why:** Cohesive products share a motion language; one-offs read as unfinished.

**Exceptions:** One-off brand moments documented in `PROJECT.md`.

**Source:** `improve-animations` AUDIT.md, `maser-lab-token-system`, Emil recommended curves in `emil-design-eng`

