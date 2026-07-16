---
name: maser-lab-responsive-qa
description: >-
  Responsive and touch QA for Maser-Lab demos and products. Use during Harden,
  before ready, or when mobile/desktop layouts break. Checks 320/768/1280,
  44px targets, sticky demo chrome, and reduced-motion across breakpoints.
---

# Maser-Lab Responsive QA

Prove the **rendered** surface works across viewports. Source inspection alone is not a pass.

Load in Harden / Review. Chain `maser-lab-demo-chrome` and `verification`.

## When to load

| Trigger | Action |
| --- | --- |
| Harden / pre-ready | Full breakpoint pass |
| Mobile nav / sign-up frames | Touch + frame QA |
| Control bar overlap bugs | Chrome layout pass |
| "Works on desktop only" reports | Bisect breakpoints |

## Required breakpoints

| Width | Intent |
| --- | --- |
| **320** | Smallest phone — no horizontal page scroll from chrome |
| **768** | Tablet / compact |
| **1280** | Desktop lab shell |
| Artboard frames | If demo uses fixed 1920 / 452 frames, scale must fit without clipping controls |

## Checklist

### Layout

- [ ] Primary content readable at 320 without cutting CTA or inputs
- [ ] Demo control bar wraps; does not cover the only interactive target
- [ ] Fixed/sticky elements respect safe areas and `--lab-control-bar-bottom` if used
- [ ] Images use responsive sizes; no overflow from fixed widths unless intentionally framed

### Touch & pointer

- [ ] Interactive targets ≥ **44×44px** for mobile-simulated controls
- [ ] Hover-only motion gated: `@media (hover: hover) and (pointer: fine)`
- [ ] Focus visible for keyboard at all breakpoints

### Motion

- [ ] `prefers-reduced-motion` still honored at mobile widths
- [ ] Demo reduced-motion toggle reachable on 320

### Product-specific

| Surface | Extra checks |
| --- | --- |
| Navigation | Mobile menu open/close, scroll lock, focus trap if modal |
| Sign-up | Desktop vs mobile artboards; form fields usable on 320 |
| Scroll / pin | Pin disabled or safe under reduced motion; no stuck scroll |
| Labs | Panels usable; drawers don't trap off-screen |

## Verification method

1. Run `lab` (`npm run dev`)
2. Open `/demos/{slug}`
3. Resize or device emulation: 320 → 768 → 1280
4. Exercise PROJECT.md states at **320 and 1280**
5. Capture notes (and screenshots when visual)

## Report format

```markdown
## Responsive QA — {slug}

| Breakpoint | Result | Notes |
| --- | --- | --- |
| 320 | pass/fail | … |
| 768 | pass/fail | … |
| 1280 | pass/fail | … |

### Findings
| Pri | Issue | Fix |
| --- | --- | --- |
```

## Severity guide

| Pri | Example |
| --- | --- |
| P0 | Primary CTA unreachable; form unusable at 320 |
| P1 | Control bar covers content; target <44px on touch path |
| P2 | Minor wrap awkwardness; cosmetic overflow |

## Related

- `maser-lab-web/references/interface-quality.md`
- `maser-lab-demo-chrome`
- `web-design-guidelines`
- `verification`
