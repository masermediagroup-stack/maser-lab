# Local notes — Pixel Info Card

## Shape status

Brief locked in `PROJECT.md`. Do not implement until mode switches to **Implement**.

## Confirmed with human (2026-08-10)

1. Expanded card click plays the animation **in reverse** back to the squircle.
2. Demo chrome matches Blobby Rotation Loader; control slider fill is **blue**, not yellow.

## Implement checklist (when requested)

1. Scaffold `lab/src/components/projects/display/pixel-info-card/`
2. Register demo in `lab/src/components/projects/registry.ts`
3. Flip registry status `draft` → `building`
4. Build canvas pixel snake assemble/dissolve + state machine
5. Wire BlurFocusReveal (or `tal-blur-focus` CSS) for text in/out
6. Port Blobby demo shell CSS with `--pic-fill` blue
7. Verify open/close, keyboard, reduced-motion at 320 / 1280
