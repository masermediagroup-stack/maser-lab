# Project: Prism

**Slug:** `prism`  
**Category:** navigation  
**Status:** review  
**Created:** 2026-06-28

## Design reference

- [Liquid glass navigation](https://dribbble.com/shots/26155046-Liquid-glass-navigation) — layout + liquid glass
- [Figma playground file](https://www.figma.com/design/f2TLFWW5Eg8aqczRjuZ403/web-component-and-interaction-playground) — node `12:274` PrismGlassNavigation
- Landscape background demo — portfolio showcase

Demo brand label **Prism**. Teal selector pill on glass bar.

## Brief

### User / trigger
Portfolio demo — occasional tab switching with emphasis on visual craft.

### Job
Centered liquid-glass top nav: **Prism** brand label beside logo, four category links, Profile control, sliding teal selector pill. On viewports below `md`, collapse to a compact glass bar with menu panel.

### Desired outcome
Pointer clicks feel liquid/springy; keyboard navigation snaps instantly; Profile only activates its own gradient when selected; mobile menu opens with glass panel, scrim, and closes on navigate or Escape.

### Non-goals
Routing, auth, scroll-spy, theme toggle, CTA.

## Layout

| Viewport | Pattern |
| --- | --- |
| Desktop (`md+`) | Full horizontal glass bar — brand, four tabs with sliding pill, Profile |
| Mobile (`<md`) | Compact glass bar — brand + menu toggle; panel lists all destinations |

## States

- [x] default (Gallery active)
- [x] tab switch / liquid pill slide (pointer, desktop)
- [x] keyboard nav — instant pill snap (desktop)
- [x] hover on links (pointer-only)
- [x] press feedback (:active scale)
- [x] Profile selected — teal gradient on Profile only
- [x] prefers-reduced-motion
- [x] demo reduced-motion override
- [x] mobile collapsed bar
- [x] mobile menu expanded (panel + scrim)
- [x] mobile navigate — closes panel
- [x] mobile Escape / overlay dismiss

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Scope | Portfolio demo | Room for liquid spring on pointer; still instant keyboard per ui-animation |
| Library | Framer Motion | Springs + whileTap |
| Pill (pointer) | `spring` duration 0.42, bounce 0.2 | Liquid / wet glass personality |
| Pill (keyboard) | `duration: 0` | Never animate keyboard-initiated nav |
| Pill movement | `transform` only (x, y, scaleX, scaleY) | GPU-only; no width/height animation |
| Press feedback | `scale(0.97)`, 120ms ease-out | maser-lab-web button press pattern |
| Link hover | 150ms color, pointer-gated | No sticky hover on touch |
| Profile swap | Instant shell + 150ms label color | No border fade; pill unmounts when Profile active |
| Mobile panel | scaleY + opacity from top; staggered links | Matches Plotline mobile pattern; glass preserved |
| Mobile menu icon | Animated hamburger → X | Standard affordance |
| Reduced motion | Instant pill + no whileTap + instant panel | Keep state clarity |

## Acceptance criteria

- [x] Demo at `/demos/prism`
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Figma nav layout integrated (`12:274`) on desktop
- [x] Mobile layout at 320px — compact bar + menu panel
- [x] Touch targets ≥44px on mobile controls
- [ ] `prefers-reduced-motion` verified in browser
- [x] Component exported from `index.ts`

## Motion verification checklist

- [ ] Click between categories — liquid spring on transform pill (desktop)
- [ ] Arrow keys — instant pill jump (desktop)
- [ ] Profile on/off — instant pill hide; Profile gradient only when Profile selected
- [ ] Reduced-motion toggle — all movement snaps
- [ ] Touch / coarse pointer — no sticky link hover
- [ ] Mobile menu open/close — panel + scrim; navigate closes panel
- [ ] Mobile 320px — bar readable, no horizontal overflow
