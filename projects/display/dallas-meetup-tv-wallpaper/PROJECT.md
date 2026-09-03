# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none. USER LOCK encoded in `design.md`.
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working only on TV). Avatar motion by Benji Taylor.
- Article Working refs: `article-working-thickness.png`, `article-working-cross-eye.png`
- Look lock: `LOOK.md` (later interrupts win)
- Design spec: `design.md` (correction log for this pivot)

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.
Trigger frequency: rare / ambient (TV loop).

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper `#F2F1ED`. Official 2D Cursor cube (whole mark, ink) + black `#000000` Grok disc with planted white stadiums + one Universal Sans line `Dallas meetup`. Kick = article-thick Ver 02 ribbons only. Same disc forever.

### Success signal
- Skyline gone.
- Disc always black `#000000`.
- Eyes planted (may pump more upright on the kick; never orbit).
- Ribbons article-thick with rounded caps, wrap and clip, cross the left eye, then leave.
- Cube uncut. Same demo route `/demos/dallas-meetup-tv-wallpaper`.
- Reduced motion freezes Idle (no ribbons).

### Non-goals
- No skyline / Noun Project horizon / dither under the globe.
- No picker morph, no SDF cycle, no HEX body cycling.
- No eye-whip. No globe yaw. No 360 disc spin. No body turn.
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
| `--dallas-ink` | `#111111` | Type, cube |
| `--dallas-grok-black` | `#000000` | Grok disc, forever |
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
| Body | Black circle disc, forever | USER LOCK. No morph, no fill cycle |
| Stream | 2–4 article-thick Ver 02, −15°, wrap then leave | Idle has no bands |
| Eyes | Planted. Pump more upright on kick | Do not orbit. Do not leave the face |
| Cube | Whole 2D mark, ink | Cutout was a bug |
| Horizon | Gone | USER LOCK |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [x] `npm run lint` and `npm run build` pass in `lab/` (this PR: slug ESLint `--max-warnings=0`; repo lint has pre-existing `ui/` warnings)
- [x] Idle (no ribbons) → one kick (thick wrap + clip) → Idle; reduced motion freezes Idle
- [x] Disc always `--dallas-grok-black` `#000000`; no skyline; no SDF morph; no eye-whip; no body turn
- [x] Front bands clip to the disc; back occluded; cube whole and clean; no meridians
- [x] Kick ribbons ~8% of face height, rounded caps, random Ver 02 chromatic per kick, skip gray
- [x] Eyes Idle planted; may pump more upright on kick; never leave the face
- [x] Universal Sans trial once on the canvas line; Plex ≤ 40% of display; Geist out
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`

## Loaded skills (this pass)

- `maser-lab-web` Implement (existing slug)
- `maser-lab-web/references/skill-routing.md`
- `maser-lab-web/references/motion-judgment.md`
- `maser-lab-web/references/decision-template.md`
- `maser-lab-demo-chrome`
- `maser-lab-token-system`
- `projects/display/dallas-meetup-tv-wallpaper/design.md` (correction log)
- `LOOK.md` as look lock
