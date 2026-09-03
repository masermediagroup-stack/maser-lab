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
Pure-white field with two ink marks and one line of type matching the approved still, with a seamless loop and deterministic export. Grok mark is a 3D rotating globe with galaxy-line filament meridians.

### Success signal
- Still frame matches approved composition.
- Loop has no seam between last frame and first frame.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion holds a completely still frame.

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, secondary copy, or decorative background effects.

## Galaxy-line color provenance

xAI publishes NO official galaxy-line palette. The eight colors in `tokens.css` (`--dallas-galaxy-1` through `--dallas-galaxy-8`) are **sampled medians** from xAI's own Grok 4 artwork at `https://media.x.ai/v1/website/grok-4-6bdb0520.webp` (page: `https://x.ai/news/grok-4`). They faithfully represent that official artwork; they are **not** published brand tokens.

The ramp, in order:
1. `#CF525C` rose/magenta
2. `#F15336` red
3. `#FEB87C` orange
4. `#FFE4A6` gold/cream
5. `#C4D3E1` pale icy
6. `#AAD5EA` cyan
7. `#86A4C6` blue
8. `#7775A5` indigo/violet

On white, the pale stops (4–6) may read near-transparent. Saturation carries the color, not additive bloom.

## Dallas skyline provenance

Procedurally drawn flat-black silhouette. Proportions referenced from CC0 photograph by IcedCowboyCoffee: `https://commons.wikimedia.org/wiki/File:Dallas_Texas_skyline_overlooking_Trammell_Crow_Park.png` (CC0 1.0, commercial use and modification allowed, no attribution required). No imported SVG; all geometry is inline rectangles and arcs.

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
- [x] face-forward vs full-rotation toggle
- [x] revolution duration knob (8/10/12/16s)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + requestAnimationFrame | Deterministic timeline and frame-exact export control |
| Duration | 12s default loop @ 30fps export | One full revolution = one seamless loop; 8s was too frantic for TV |
| Easing | Constant angular velocity for globe; easeInOutCubic for blinks/glance | Globe rotation must not ease — a globe does not stop and start |
| Font | Geist Sans (OFL 1.1) via `--dallas-font` token | Universal Sans requires paid licence; Geist is free and approved |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Motion follows specified beats (float, glance, blink/wink, response tilt, squash/stretch, globe rotation)
- [x] `prefers-reduced-motion` verified in browser behavior (still frame)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`
- [x] Demo controls include play/pause, replay, scrub/step, reduced motion, face-forward toggle, revolution duration, and export
- [x] Presentation mode is fullscreen without demo overlays
- [x] Galaxy colors wired to `--dallas-galaxy-1` through `-8` tokens
- [x] Font wired through `--dallas-font` token

## Open decisions

- Whether target browser can emit MP4 directly via MediaRecorder or needs WebM fallback.
- Final ramp tuning — Elite Pixel Guy owns the live preview sign-off on the galaxy colors.

## Accepted decisions

- Composition locked to approved still with a single ink tone for both marks and type.
- Geist Sans approved as font fallback while Universal Sans licence is pending.
- Galaxy-line colors sampled from official xAI Grok 4 artwork (not published brand tokens).
