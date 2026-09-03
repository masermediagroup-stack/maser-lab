# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none
- Other: approved still image at `/workspace/dallas-meetup-tv/dallas-meetup-wallpaper-still.png`
- Design spec: `FIGMA.md` in this folder
- Galaxy structure notes: `design.md` in this folder

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Current behavior
Greenfield.

### Desired outcome
Pure-white field with two ink marks and one line of type matching the approved still, with a seamless loop and deterministic export. Grok mark is a 3D rotating globe with density-driven galaxy-line filament meridians.

### Success signal
- Still frame matches approved composition.
- Loop has no seam between last frame and first frame.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion holds a completely still frame.

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, secondary copy, or decorative background effects.
- Do not download, copy, or reference xAI's self-hosted Universal Sans files.

## Type

**Geist Sans** (OFL 1.1, `geist` package, `GeistSans` from `geist/font/sans`, variable 100–900) for the `Dallas meetup` lockup and any type on the wallpaper. **Geist Mono** (`GeistMono` from `geist/font/mono`) for demo-rail readouts.

This is a justified stand-in, not a generic default: xAI's own site pairs **Geist Mono** for its large display headline with Universal Sans for body and headings. Geist already appears on grok.com alongside the licensed face we cannot use.

Universal Sans remains xAI's real production typeface — x.ai and grok.com self-host `UniversalSans_Display` and `UniversalSans_Text` woff2 files. It is commercial-only from Family Type and we hold no licence. Families stay behind `--dallas-font` / `--dallas-font-mono` so a licensed swap is one line in `tokens.css`. **Never** load xAI's self-hosted font files.

## Galaxy-line color provenance

xAI has **no fixed galaxy palette**. Each campaign gets bespoke art, and several campaign heroes have no lines whatsoever. The eight tokens (`--dallas-galaxy-1` through `-8`) are extracted from **one representative asset** — the Grok 4 hero at `https://media.x.ai/v1/website/grok-4-6bdb0520.webp` (page: `https://x.ai/news/grok-4`). Label them that way: derived from one campaign asset, not an official palette, not published brand tokens.

The ramp, in order:
1. `#CF525C` rose/magenta
2. `#F15336` red
3. `#FEB87C` orange
4. `#FFE4A6` gold/cream — CUT as a line color on white
5. `#C4D3E1` pale icy — CUT as a line color on white
6. `#AAD5EA` cyan
7. `#86A4C6` blue
8. `#7775A5` indigo/violet

On the original asset the motif is **hairlines on top of a soft mesh-gradient wash**: the lines themselves are white/silvery and the COLOR lives in the glow underneath. On black, lines are light and the wash carries colour. On white we invert — the ink carries the colour and density does the job the wash did. See `design.md` for EPG's white-ground call.

## Dallas skyline

**Approved behind a demo-rail toggle, default OFF.** EPG's composition (no skyline) is what loads. The user flips it on to judge. Additive layer only: toggling must not move the globe, the cube, or the type lockup.

Procedurally drawn flat-black silhouette. Proportions referenced from CC0 photograph by IcedCowboyCoffee: `https://commons.wikimedia.org/wiki/File:Dallas_Texas_skyline_overlooking_Trammell_Crow_Park.png` (CC0 1.0, no attribution required). Reunion Tower (ball-on-a-stalk) and Bank of America Plaza are the two reads that make it Dallas. No imported SVG, no Noun Project / clipart vectors (CC BY would drag attribution into a wallpaper).

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
- [x] skyline toggle (default off)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + requestAnimationFrame | Deterministic timeline and frame-exact export control |
| Duration | 12s default loop @ 30fps export | One full revolution = one seamless loop; 8s was too frantic for TV |
| Easing | Constant angular velocity for globe; easeInOutCubic for blinks/glance | Globe rotation must not ease — a globe does not stop and start |
| Font | Geist Sans (+ Geist Mono for readouts) via `--dallas-font` | OFL stand-in for Universal Sans; grok.com already pairs Geist Mono with Universal Sans |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Motion follows specified beats (float, glance, blink/wink, response tilt, squash/stretch, globe rotation)
- [x] `prefers-reduced-motion` verified in browser behavior (still frame)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`
- [x] Demo controls include play/pause, replay, scrub/step, reduced motion, face-forward toggle, revolution duration, skyline toggle, and export
- [x] Presentation mode is fullscreen without demo overlays
- [x] Galaxy colors wired to `--dallas-galaxy-1` through `-8` tokens
- [x] Font wired through `--dallas-font` token (Geist Sans; Geist Mono for readouts)
- [x] Skyline is additive, default off, no re-layout when toggled

## Open decisions

- Whether target browser can emit MP4 directly via MediaRecorder or needs WebM fallback.
- Final ramp tuning — Elite Pixel Guy owns the live preview sign-off on the galaxy colors.

## Accepted decisions

- Composition locked to approved still with a single ink tone for both marks and type.
- Geist Sans is the stand-in for Universal Sans. grok.com already uses Geist Mono on its display headline. Universal Sans remains the real production face; we never load xAI's self-hosted files.
- Galaxy-line colors derived from one Grok 4 campaign asset (not an official palette).
- Skyline is an additive layer behind a rail toggle, default off — never a re-layout.
