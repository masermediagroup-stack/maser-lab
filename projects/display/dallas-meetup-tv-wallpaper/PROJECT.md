# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-03

## Design reference

- Figma: none
- Other: approved still image at `/workspace/dallas-meetup-tv/dallas-meetup-wallpaper-still.png`
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Current behavior
Greenfield.

### Desired outcome
Pure-white field with two ink marks and one line of type matching the approved still, with a seamless 8-second loop and deterministic export.

### Success signal
- Still frame matches approved composition.
- Loop has no seam between t=8 and t=0.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion holds a completely still frame.

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, secondary copy, or decorative background effects.

## States

- [x] default
- [ ] hover (pointer fine only)
- [ ] focus
- [ ] active / pressed
- [ ] loading
- [ ] success
- [ ] error
- [ ] disabled
- [x] prefers-reduced-motion

Additional demo verification states:
- [x] play / pause
- [x] replay from t=0
- [x] frame-step and scrub controls
- [x] presentation fullscreen mode
- [x] export capture

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + requestAnimationFrame | Deterministic timeline and frame-exact export control |
| Duration | 8s exact loop @ 30fps export | TV-safe long-cycle ambient motion |
| Easing | Piecewise easeInOutCubic | Organic living motion without linear ramps |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [x] Motion follows specified beats (drift, glance, blink/wink, response tilt, squash/stretch)
- [x] `prefers-reduced-motion` verified in browser behavior (still frame)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`
- [x] Demo controls include play/pause, replay, scrub/step, reduced motion, and export
- [x] Presentation mode is fullscreen without demo overlays

## Open decisions

- Whether target browser can emit MP4 directly via MediaRecorder or needs WebM fallback.

## Accepted decisions

- Composition locked to approved still with a single ink tone for both marks and type.
