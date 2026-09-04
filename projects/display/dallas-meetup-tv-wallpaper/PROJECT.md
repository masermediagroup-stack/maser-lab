# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none. USER OVERRIDE encoded in `design.md`.
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working only on TV). Avatar motion by Benji Taylor.
- Article frames: Idle gaze *travel* (not TR rest), Working blank for stadium shape. Ver 02 shape→color tree = morph targets. Cursor: `CUBE_2D_DARK.svg`. Thinking / Working band frames are **refuse** — no nest, no ribbons.
- Look lock: `LOOK.md` (later interrupts win)
- Design spec: `design.md` (correction log)

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.
Trigger frequency: rare / ambient (TV loop).

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper `#F2F1ED`. Official Cursor cube (evenodd hole, ink; 360 whip on kick) + Grok picker morph (SDF blend, 1:1 shape↔HEX from the Ver 02 tree; cold start oval + Black) + white gaze-pair stadiums that look around and wink + one Universal Sans line `Dallas meetup`. Kick = body morph + HEX blend + Cursor 360. No bands on Grok.

### Success signal
- Skyline gone.
- Cursor reads as hexagon with cursor-shaped hole (paper through), not a solid blob. Spins 360 on kick, lands upright.
- Grok reads as the kept picker silhouettes (oval rest → square/teal first land, then triangle / hex / circle) with white stadiums that translate as a gaze pair and wink through the blend **without shearing**. Every body fits the cube-height mark box. Not a light organic PNG head.
- Kick is SDF morph + pair HEX blend + Cursor 360. Eyes may gaze/wink. No Thinking nest. No Working ribbons. No orbits.
- Same demo route `/demos/dallas-meetup-tv-wallpaper`.
- Reduced motion freezes Idle (oval + Black, no ribbons, no cube spin, no morph).

### Non-goals
- No skyline / Noun Project horizon / dither under the globe.
- No light organic PNG Grok. No smashed still pills.
- No independent HEX wraps (color without its paired silhouette). No Green body fill. No Cool Gray body fill.
- No eye-whip. No Grok body yaw. No 360 body spin. Morph in place only.
- No Thinking nest / Working ribbons / orbits on Grok.
- No Pill / Cloud / Teardrop cycle landings. No oversized Grok vs cube (do not scale the cube up).
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
| `--dallas-grok-black` | `#000000` | Cold-start oval rest only |
| `--dallas-eye-white` | `#FFFFFF` | Grok stadium eyes |
| Ver 02 kept pairs (5) | blue / orange-red / teal / magenta / violet | Body fills. Green, Gray, Red, Orange, Gold never a fill. Never orbits. |

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
| Body | SDF subset morph, 1:1 shape↔HEX. Shared mark box = cube height. Cold start oval + Black | USER OVERRIDE. No Pill/Cloud/Teardrop. No Green/Gray/Red/Orange/Gold body |
| Stream | None. Kick is morph + HEX blend + Cursor 360 | USER LOCK. Kill Thinking nest and Working ribbons |
| Eyes | White stadiums, vertical + slight left (−12°), translate as a pair, wink. Survive morph unsheared (face disc) | Not −28°. Not stuck BL/TR. No independent spin. No silhouette clip |
| Cube | Official path, evenodd hole, ink; 360 on kick | Hole is the cursor. Paper through |
| Horizon | Gone | USER LOCK |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/` (this PR: slug ESLint `--max-warnings=0`; repo lint has pre-existing `ui/` warnings)
- [x] Idle (clean morph face, cube upright, eyes wink) → one kick (SDF morph + HEX blend + Cursor 360) → Idle on next pair; reduced motion freezes Idle
- [x] Official cube evenodd hole; Grok SDF picker + white stadiums; no skyline; no eye-whip; no Grok body turn; no orbits on Grok
- [x] Wallpaper never draws Thinking nest, Working ribbons, or colored bands around Grok; cube clean of lines
- [x] Eyes are a parallel pair at −8° to −15° (product −12°), translate together (center / up / side / return), wink; never stuck BL or TR; never independent spin; never sheared/smashed mid-morph; never a light PNG head
- [x] Cycle is oval → square → triangle → hex → circle; no Pill, Cloud, or Teardrop landings; Grok fits the cube-height mark box
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
- `projects/display/dallas-meetup-tv-wallpaper/design.md` (correction log; subset + shared box)
- `LOOK.md` as look lock
