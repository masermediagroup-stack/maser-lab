# Interface quality (lab demos)

Standards for demo pages and component presentation in this repo.

## Demo layout

- Max content width ~960px; generous padding
- Dark and light both readable (use `lab` theme tokens)
- State controls clearly labeled — user should not guess how to trigger states
- Side-by-side or stacked **state matrix** preferred over hidden-only interactions

## Hierarchy

- Project title (h1) → purpose (lead) → state controls → live demo → implementation notes
- Primary demo is the hero; metadata below the fold

## Component isolation

- Components under `lab/src/components/projects/{category}/{slug}/` must not import from other project slugs
- Shared primitives live in `lab/src/components/ui/` (when added)

## Responsive

- Demos work at 320px and 1280px minimum
- Touch targets ≥44px where the demo simulates mobile controls

## Performance

- No layout-thrashing animations in demo shell
- Lazy-load heavy libraries (GSAP, Three) when a project requires them

## Accessibility (demo chrome)

- State toggle buttons are real `<button>` elements with accessible names
- Live demo region has `aria-label` describing the component under test
- Focus order: controls → demo → notes
