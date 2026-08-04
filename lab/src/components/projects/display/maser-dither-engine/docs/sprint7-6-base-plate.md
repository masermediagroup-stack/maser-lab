# Sprint 7.6 — Component base plate (Black / White)

## Goal

Give a first-stop foundation: component background is **Black** or **White** before other color / material settings.

## Behavior

- Pinned **Background** strip at the top of playground controls (Black | White).
- Same control leads the Color → Material panel (“Component background”).
- Sets `color.colors.background` to pure `{0,0,0}` or `{1,1,1}` (GPU plate via existing `matBg()`).
- Preview stage follows (`mde-playground__preview--base-black|white`) so white plates aren’t judged on a black host.
- Palette Studio **preserves** the current base plate when applying a palette.
- Default remains **Black** (`DEFAULT_COLORS.background`).

## Files

- `engine/color/basePlate.ts` — ids, RGB, resolve / with helpers
- `shell/BasePlateControl.tsx` — chip UI
- `shell/PlaygroundControlPanels.tsx` — pinned strip
- `shell/MaterialPanel.tsx` — Color panel lead-in
- `shell/ComponentPlayground.tsx` — preview `data-base-plate` + class
- `tokens.css` — strip + preview stage variants
- `engine/color/palettes.ts` — preserve `background` on palette apply

## Out of scope

- Extra greys / custom hex for the foundation (still available later via Background color picker)
- WebGL pipeline changes

## Engine

`0.7.6`
