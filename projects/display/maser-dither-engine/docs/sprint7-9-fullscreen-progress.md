# Sprint 7.9 — Mobile fullscreen + progress stability

## Problems

1. **Fullscreen on mobile** collapsed scrollbar, input, avatar, progress, and navigation into tiny centered scraps on a black void.
2. **Progress bar** glitched / flashed black when speeding up the auto loop.

## Root causes

### Fullscreen collapse
The fullscreen stage uses `place-items: center`. Adapters sized with `width: min(100%, Npx)` resolved `%` against an indefinite shrink-wrapped grid area → ~0 width.

Separately, fullscreen CSS forced `width: auto !important` on **avatar** (copied from button/badge rules). That overrode authored pixel size; absolute fill/initials left a floating “MD” with no disc.

### Progress flash
The fill animated via `style.width`. Every frame resized the nested WebGL canvas → black flash, worse at higher speeds. Phase continuity was already correct; the visual bug was canvas resize, not phase reset.

## Fixes

1. Wrap fullscreen preview in `.mde-playground__fs-canvas` (`min(92vw, 480px)`) so fluid adapters can use `width: 100%`.
2. Keep button/badge/loader intrinsic; **exclude avatar** from any `width: auto !important`.
3. Progress fill stays full track width; reveal with `clip-path: inset(0 {100-pct}% 0 0)`.
4. Speed still only updates `speedRef` — phase never resets.

## Verify

1. Mobile (or narrow viewport) → each of: Scrollbar, Input, Avatar, Progress, Navigation → Fullscreen
2. Each should read at a usable size, centered, with X to exit
3. Progress: enable Auto loop, drag Speed up — fill advances smoothly without black flashes

## Files

- `shell/ComponentPlayground.tsx` — `fs-canvas` wrapper
- `tokens.css` — fullscreen sizing
- `components/adapters/DitherProgressBar.tsx` — clip-path fill
- `constants.ts` → `0.7.9`
