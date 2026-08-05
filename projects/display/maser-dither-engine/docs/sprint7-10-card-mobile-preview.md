# Sprint 7.10 — Card visible in mobile preview

## Problem

On mobile, the Card adapter was invisible in the normal Preview stage (black void / tiny center dot). It only appeared after entering fullscreen.

## Root cause

1. Mobile CSS forced `.mse-card { width: 100% !important }`.
2. FitStage measures children inside a `width: max-content` box.
3. Percentage width against that indefinite containing block collapses → ~0×0 card.
4. Fullscreen worked because `.mde-playground__fs-canvas` provides a definite width.

## Fix

- Size the featured card with **viewport units** on mobile: `min(72vw, 280px) !important` (no `%` dependency on FitStage).
- Remove `.mse-card` from the generic `width: 100% !important` adapter list.
- FitStage: apply `maxWidth` from the wrap to the measure node; remeasure on rAF after layout.

## Verify

1. Mobile viewport → Components → Card → Preview tab (not fullscreen)
2. Featured card (frame, scrim copy, CTA) should be centered and readable
3. Fullscreen still works

## Files

- `tokens.css` — mobile featured card width
- `shell/studio/FitStage.tsx` — definite measure max-width
- `constants.ts` → `0.7.10`
