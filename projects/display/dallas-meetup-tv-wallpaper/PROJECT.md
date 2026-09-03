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

**Settled. Do not re-open.**

| Surface | Face | Token |
| --- | --- | --- |
| Display line — `Dallas meetup` on the wallpaper | **Geist Sans** (`GeistSans` from `geist/font/sans`, variable 100–900) | `--dallas-font` |
| Body, labels, info blocks, demo-rail notes | **IBM Plex Sans Condensed** | `--dallas-font-ui` |
| Genuine structural mono only (not the display line) | Geist Mono, available, unused until earned | `--dallas-font-mono` |

The user named **Geist sans** twice for the display line. Mono on that line would read technical and is refused. Geist does not creep into body text. EPG's Plex Condensed call stands for everything small.

### Type lock (mechanical — not a judgment call)

Elite Pixel Guy: the two sans faces must read as a system, not an accident. The jump between them is decisive. Encoded in `lab/.../type-lock.ts` and `--dallas-plex-max`.

1. **Geist Sans appears exactly once on the frame** — the canvas display line `Dallas meetup`. Nowhere else. If a second element wants Geist, it does not get it. The wallpaper canvas is marked `data-dallas-geist="display"`. Any DOM computed `font-family` that classifies as Geist Sans is a fail.
2. **Nothing in Plex Condensed sits close to the display in size.** If a Plex label creeps up toward the headline, **cut or shrink the label**. Do not split the difference by nudging one of them, and **never enlarge the display** to restore the ratio.
3. **Geist Mono only if a small structural element genuinely earns it** — a slug or a rule label, marked `data-dallas-mono="structural"`. It is not a third voice, and it never appears just to add texture. No element uses it on this demo today.

**Engineering check (working threshold, not EPG's number):** the largest Plex (or other UI) element's rendered `font-size` must sit at or below **40% of the display's rendered size**. Display size is `56 × (canvas CSS width / 1920)`. Ratio lives in `DALLAS_PLEX_MAX_RATIO` and `--dallas-plex-max-ratio`. EPG can re-weight this off the live canvas; do not invent a second ratio. Pass/fail is published on `.dallas-demo` as `data-dallas-type-lock`.

Never Universal Sans. It remains xAI's real production typeface (commercial, Family Type). x.ai and grok.com self-host `UniversalSans_Display` and `UniversalSans_Text` woff2 files. We hold no licence and **never** load those files. Families stay behind tokens so a licensed display swap is one line in `tokens.css`.

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
| Font | Geist Sans once on `Dallas meetup`; IBM Plex Sans Condensed on body/labels, capped at 40% of display rendered size | User named Geist sans for display; EPG's Plex call for small type. Size jump is a check, not a vibe. |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Motion follows specified beats (float, glance, blink/wink, response tilt, squash/stretch, globe rotation)
- [x] `prefers-reduced-motion` verified in browser behavior (still frame)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`
- [x] Demo controls include play/pause, replay, scrub/step, reduced motion, face-forward toggle, revolution duration, skyline toggle, and export
- [x] Presentation mode is fullscreen without demo overlays
- [x] Galaxy colors wired to `--dallas-galaxy-1` through `-8` tokens
- [x] Font split: Geist Sans on the display line (`--dallas-font`); IBM Plex Sans Condensed on body/labels (`--dallas-font-ui`)
- [x] Type lock check: Geist Sans once (canvas only); largest Plex ≤ 40% of display rendered size; Geist Mono unused unless `data-dallas-mono="structural"`
- [x] Skyline is additive, default off, no re-layout when toggled

## Open decisions

- Whether target browser can emit MP4 directly via MediaRecorder or needs WebM fallback.
- Final ramp tuning — Elite Pixel Guy owns the live preview sign-off on the galaxy colors.

## Accepted decisions

- Composition locked to approved still with a single ink tone for both marks and type.
- Type split is settled: Geist Sans on `Dallas meetup`, IBM Plex Sans Condensed on body/labels. Display is never Mono. Universal Sans is licensed; we never load xAI's self-hosted files.
- Type lock (mechanical): Geist Sans exactly once on the frame; Plex never within 40% of display rendered size (shrink/remove the label, never enlarge the display); Geist Mono only if a slug/rule label earns `data-dallas-mono="structural"`. 40% is the engineering working threshold; EPG can re-weight off the live canvas.
- Galaxy-line colors derived from one Grok 4 campaign asset (not an official palette).
- Skyline is an additive layer behind a rail toggle, default off — never a re-layout.
