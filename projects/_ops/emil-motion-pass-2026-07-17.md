# Emil motion pass — all lab projects (2026-07-17)

**Mode:** Harden + Motion audit  
**Skills:** `review-animations`, `improve-animations` (audit), `apple-design` (gesture notes), `maser-lab-responsive-qa`, `maser-lab-web`

Executed highest-leverage Emil findings across all 9 registry projects. This file is the double-check ledger for the loop.

## Per-project changes

| Project | What changed for the better | Emil rules |
| --- | --- | --- |
| **blobby-rotation-loader** | OS `prefers-reduced-motion` freezes rotation; rAF stops when paused; canvas buffer only resizes when size changes | `reduced-motion-required`, `interruptible-dynamic-motion`, `gpu-properties-only` |
| **plotline-tab-nav** | Mobile hamburger bars honor reduced motion (duration 0) | `reduced-motion-required` |
| **prism** | Mobile menu uses `scaleY`/`opacity` instead of `height: auto`; desktop nav entrance ≤240ms, no blur filter | `gpu-properties-only`, `ui-duration-cap` |
| **summitpath-sign-up** | Loader spin disabled under reduced motion; social hover translate suppressed when RM | `reduced-motion-required` |
| **text-animation-lab** | Removed `ease-in` from ease picker; scale-start floor 0.2 (no `scale(0)`) | `ease-out-enter`, `no-scale-zero` |
| **page-transitions-lab** | Wormhole fallback no longer uses `scale(0)`; mini wormhole respects RM; mobile replay scroll is `auto` when RM | `no-scale-zero`, `reduced-motion-required` |
| **makeyourday-calendar** | Arrow-key day changes skip wheel animation; RM removes transforms on moving UI | `no-keyboard-motion`, `reduced-motion-required` |
| **service-showcase** | Arrow keys focus tabs only (Enter/Space activate); divider no longer transitions `left` | `no-keyboard-motion`, `gpu-properties-only` |
| **liquid-monochrome** | Idle rAF exits immediately under reduced motion | `reduced-motion-required`, `interruptible-dynamic-motion` |

## Deferred (documented, not blocking this pass)

| Item | Why deferred |
| --- | --- |
| Plotline/Prism keyboard dropdown channel split | Needs careful focus/hover state machine; schedule next Harden |
| MakeYourDay stem/wave `height` → `scaleY` | Broader CSS refactor; lower user impact than keyboard day spin |
| Service panel Framer `y` → full `transform` strings | Under-load nuance; tab keyboard was higher leverage |
| Text lab cursor halo `left/top` → transform | Isolated to one demo effect |

## Responsive QA checklist

| Slug | 320 | 768 | 1280 | RM sample |
| --- | --- | --- | --- | --- |
| plotline-tab-nav | pass | pass | pass | pass |
| prism | pass | pass | pass | pass |
| summitpath-sign-up | pass | pass | pass | pass |
| blobby-rotation-loader | pass | pass | pass | pass |
| liquid-monochrome | pass | pass | pass | pass |
| text-animation-lab | pass | pass | pass | pass |
| page-transitions-lab | pass | pass | pass | pass |
| makeyourday-calendar | pass | pass | pass | pass |
| service-showcase | pass | pass | pass | pass |

Method: Playwright Chromium against `npm run start -p 3001`, screenshots in `/opt/cursor/artifacts/emil-viewport-qa/`. Fail criteria: HTTP error, empty body, horizontal overflow >24px.

Lint/build: pass (pre-existing shadcn `transition-all` warnings only).

