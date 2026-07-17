---
name: maser-lab-token-system
description: >-
  Per-project CSS token discipline for Maser-Lab. Use when creating tokens.css,
  separating lab shell vs product tokens, preparing Transfer, or when token
  files are huge or leak lab variables into portable components.
---

# Maser-Lab Token System

Keep **lab shell** and **product brand** tokens separate so transfer does not drag demo chrome styles into portfolio.

Load during Implement (branded sections), Harden, and Transfer. Chain `maser-lab-export`.

## When to load

| Trigger | Action |
| --- | --- |
| New branded project | Create `tokens.css` contract |
| Transfer prep | Audit portable tokens |
| 1000+ line tokens.css | Split / trim |
| Product uses `--lab-*` | Decouple |

## Two layers

| Layer | Location | Prefix | Portable? |
| --- | --- | --- | --- |
| **Lab shell** | `lab/src/styles/maser-lab-tokens.css` + `.maser-lab` | `--lab-*` | No — stays in lab |
| **Product** | `…/{slug}/tokens.css` | `--{brand}-*` or `--{slug}-*` | Yes — copy on transfer |

### Rules

1. Product components may **read** product tokens only (or plain CSS values)
2. Product components must **not** require `--lab-*` to render correctly in portfolio
3. Demo chrome may use `--lab-*`
4. Prefer CSS variables for color, radius, space, motion durations used in more than one file

## Product `tokens.css` skeleton

```css
/* {slug} product tokens — portable with the component */
:root,
.{slug-root-class} {
  --{brand}-bg: …;
  --{brand}-text: …;
  --{brand}-accent: …;
  --{brand}-radius: …;
  --{brand}-ease-out: cubic-bezier(…);
  --{brand}-duration-fast: 150ms;
  --{brand}-duration-ui: 200ms;
}
```

Scope under a product root class when multiple demos share a page.

## What belongs where

| Token type | Product | Lab shell | Demo-only |
| --- | --- | --- | --- |
| Brand colors / type scale | ✓ | | |
| Motion easings for product UI | ✓ | | |
| Control bar / backdrop blur | | ✓ | ✓ |
| Viewport frame chrome | | | ✓ (shared lab chrome) |
| One-off debug outlines | | | delete before ready |

## Size & maintainability

| Signal | Action |
| --- | --- |
| tokens.css > ~400 lines | Split by concern (color, type, motion) or delete dead vars |
| Duplicated literals across files | Promote to token |
| CSS modules only (no tokens.css) | Allowed if documented in PROJECT.md / TRANSFER.md |

## Transfer checklist

- [ ] List token file(s) in TRANSFER.md
- [ ] Confirm portfolio theme merge strategy (import file vs map to design system)
- [ ] No `--lab-*` required at runtime for product
- [ ] Reduced-motion overrides live with product tokens or product CSS

## Anti-patterns

- Product class names like `summitpath-signup-viewport-*` living in shared lab chrome
- Copy-pasting entire lab `globals.css` into portfolio
- Magical unnamed hexes repeated 20× with no variable
- Mixing light-lab chrome contrast tokens into a light marketing section without renaming

## Related

- `maser-lab-export`
- `figma-design-workflow` (Figma variables → tokens)
- `maser-lab-web` interface quality
- Lab tokens: `lab/src/styles/maser-lab-tokens.css`
