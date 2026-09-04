# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none. USER OVERRIDE encoded in `design.md`.
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working only on TV). Avatar motion by Benji Taylor.
- Article frames: Idle gaze *travel* (not TR rest), Working blank for stadium shape. Cursor: `CUBE_2D_DARK.svg`. Thinking / Working band frames are **refuse** — no nest, no ribbons.
- Look lock: `LOOK.md` (later interrupts win)
- Design spec: `design.md` (correction log)

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.
Trigger frequency: rare / ambient (TV loop).

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper `#F2F1ED`. Official Cursor cube (evenodd hole, ink; 360 whip on kick) + article Grok (black disc, white gaze-pair stadiums that look around and wink) + one Universal Sans line `Dallas meetup`. Kick = Cursor spin only. No bands on Grok.

### Success signal
- Skyline gone.
- Cursor reads as hexagon with cursor-shaped hole (paper through), not a solid blob. Spins 360 on kick, lands upright.
- Grok reads as black disc + white stadiums (vertical, slight left, parallel) that translate as a gaze pair (not stuck BL or TR) and wink, not a light organic PNG head.
- Kick is Cursor 360 only. Grok stays a clean disc (eyes may gaze/wink). No Thinking nest. No Working ribbons. No orbits.
- Same demo route `/demos/dallas-meetup-tv-wallpaper`.
- Reduced motion freezes Idle (no ribbons, no cube spin).

### Non-goals
- No skyline / Noun Project horizon / dither under the globe.
- No light organic PNG Grok. No smashed still pills.
- No picker morph, no SDF cycle, no HEX body cycling.
- No eye-whip. No Grok disc yaw. No 360 disc spin.
- No Thinking nest / Working ribbons / orbits on Grok.
- No Thinking / Waiting / Blocked / Done as a held TV state.
- Do not invent type, spacing, or layout. Geist out. No new shader.

## Type

**Settled. Do not re-open.**

| Surface | Face | Token |
| --- | --- | --- |
| Display line — `Dallas meetup` on the wallpaper | Universal Sans trial / 400, exactly once | `--dallas-font` |
| Body, labels, info, demo-rail notes | IBM Plex Sans Condensed | `--dallas-font-ui` |

Largest Plex ≤ **40%** of display. Display is **44px** @ 1920. Tracking ~2.4.

## Paper / ink / field

| Token | Hex | Use |
| --- | --- | --- |
| `--dallas-paper` | `#F2F1ED` | Wallpaper background |
| `--dallas-ink` | `#111111` | Type, cube fill |
| `--dallas-grok-black` | `#000000` | Grok disc |
| `--dallas-eye-white` | `#FFFFFF` | Grok stadium eyes |
| Ver 02 chromatic (9) | gold → magenta | Named tokens. Never drawn as orbits. Gray never a fill. |

## States

- [x] default
- [x] prefers-reduced-motion
- [x] play / pause
- [x] replay from t=0
- [x] frame-step and scrub
- [x] presentation fullscreen
- [x] export capture
- [x] whip duration 0.5–0.7s

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + rAF | Deterministic timeline and export. No new shader. |
| Duration | 8s: 6.4 Idle / 0.6 Working / ~1 settle | Do not shorten. Super-fast = short whip |
| Body | Black disc forever | USER OVERRIDE. Article Idle/Working |
| Stream | None. Kick is Cursor 360 only | USER LOCK. Kill Thinking nest and Working ribbons |
| Eyes | White stadiums, vertical + slight left (−12°), translate as a pair, wink | Not −28°. Not stuck BL/TR. No independent spin |
| Cube | Official path, evenodd hole, ink; 360 on kick | Hole is the cursor. Paper through |
| Horizon | Gone | USER LOCK |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/` (this PR: slug ESLint `--max-warnings=0`; repo lint has pre-existing `ui/` warnings)
- [x] Idle (clean disc, cube upright, eyes wink) → one kick (Cursor 360 only) → Idle; reduced motion freezes Idle
- [x] Official cube evenodd hole; Grok black disc + white stadiums; no skyline; no SDF morph; no eye-whip; no Grok body turn; no orbits on Grok
- [x] Wallpaper never draws Thinking nest, Working ribbons, or colored bands around Grok; cube clean of lines
- [x] Eyes are a parallel pair at −8° to −15° (product −12°), translate together (center / up / side / return), wink; never stuck BL or TR; never independent spin; never a light PNG head
- [x] Universal Sans trial once on the canvas line; Plex ≤ 40% of display; Geist out
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`

## Loaded skills (this pass)

- `maser-lab-web` Implement (existing slug)
- `maser-lab-web/references/skill-routing.md`
- `maser-lab-web/references/motion-judgment.md`
- `maser-lab-web/references/decision-template.md`
- `maser-lab-demo-chrome`
- `maser-lab-token-system`
- `ui-animation` (easing character for cube whip + wink)
- `projects/display/dallas-meetup-tv-wallpaper/design.md` (correction log)
- `LOOK.md` as look lock
