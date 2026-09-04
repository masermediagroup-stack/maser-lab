# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none. USER OVERRIDE encoded in `design.md`.
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working only on TV). Avatar motion by Benji Taylor.
- Article frames: `article-idle-black-disc.png`, `article-working-black-disc.png`. Cursor: `CUBE_2D_DARK.svg`.
- Look lock: `LOOK.md` (later interrupts win)
- Design spec: `design.md` (correction log)

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.
Trigger frequency: rare / ambient (TV loop).

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper `#F2F1ED`. Official Cursor cube (evenodd hole, ink; 360 whip on kick) + article Grok (black disc, white gaze-pair stadiums that look around and wink) + one Universal Sans line `Dallas meetup`. Kick = thin even Ver 02 lines around Grok only.

### Success signal
- Skyline gone.
- Cursor reads as hexagon with cursor-shaped hole (paper through), not a solid blob. Spins 360 on kick, lands upright.
- Grok reads as black disc + white stadiums that gaze as a pair (not stuck BL) and wink, not a light organic PNG head.
- Kick shows thin even Thinking-weight Ver 02 lines around Grok; Idle has none. No thick mid.
- Same demo route `/demos/dallas-meetup-tv-wallpaper`.
- Reduced motion freezes Idle (no ribbons, no cube spin).

### Non-goals
- No skyline / Noun Project horizon / dither under the globe.
- No light organic PNG Grok. No smashed still pills.
- No picker morph, no SDF cycle, no HEX body cycling.
- No eye-whip. No Grok disc yaw. No 360 disc spin.
- No Thinking / Waiting / Blocked / Done as the whip.
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
| Ver 02 chromatic (9) | gold → magenta | Kick ribbons only. Gray never a ribbon. |

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
| Stream | 2–4 thin even Ver 02, −15°, spread, clip disc, wrap then leave | Thinking weight. No thick mid |
| Eyes | White stadiums, gaze pair + wink, planted | Not BL. Not a PNG. No eye-whip |
| Cube | Official path, evenodd hole, ink; 360 on kick | Hole is the cursor. Paper through |
| Horizon | Gone | USER LOCK |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/` (this PR: slug ESLint `--max-warnings=0`; repo lint has pre-existing `ui/` warnings)
- [x] Idle (no ribbons, cube upright, eyes wink) → one kick (Grok bands + Cursor 360) → Idle; reduced motion freezes Idle
- [x] Official cube evenodd hole; Grok black disc + white stadiums; no skyline; no SDF morph; no eye-whip; no Grok body turn
- [x] Front bands clip to the disc; back occluded; cube clean of ribbons; no meridians
- [x] Kick lines even hairline (~1% face), spread, random Ver 02 chromatic / phase per kick, skip gray; no mid-arc taper
- [x] Eyes gaze as a planted pair (up / side / center / return) and wink; never a light PNG head; never stuck BL
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
