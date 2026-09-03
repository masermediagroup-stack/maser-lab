# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none. Full lockup stills pending from Elite Pixel Guy; globe stills + this text are the lock until they arrive.
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working / Waiting / Blocked / Thinking / Done). Avatar motion by Benji Taylor. **TV whip = Working only.**
- Look lock: `LOOK.md` in this folder (authority)
- Design spec: `FIGMA.md` / `design.md` in this folder
- Horizon: Noun Project Dallas skyline, Blaise Sewell, icon 3583788

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper field `#F2F1ED` with Noun Project Dallas horizon, Cursor cube + solid Grok body + one Universal Sans line `Dallas meetup`. Grok maps article Idle / Working onto the 8s loop: 6.4s Idle hold, 0.6s Working whip (chat-line filaments travel with the mark), ~1s settle back to Idle where color SNAP and SDF blend land.

### Success signal
- TV mode loads: paper ground, Noun Project horizon ON, solid globe, Universal Sans display line. Cube and type stay clean.
- Rest = Idle (6.4s): calm, slightly curious, face-forward hold. Shape 2 irregular oval, ink `#111111`, official stadiums. No idle bob. Orbits quiet/parked on the mark — not a wallpaper field.
- Whip = Working (0.6s): kicks into gear. Chat-line filaments orbit the body and travel with the mark. One revolution, hard ease-in-out, same body + fill, eyes planted, land face-forward. Tilt 16°. Not Thinking / Waiting / Blocked / Done.
- Settle (~1s) back to Idle: next Ver 02 hue SNAP + next official picker SDF blend. First settle lands rounded square + Teal.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion freezes the Idle rest pose.

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, or secondary copy.
- Do not use Thinking, Waiting, Blocked, or Done as the TV whip.
- Do not fill rest with idle bob or body spin. Quiet parked orbits on the mark are Idle, not a second motion. Do not shorten the 8s loop.
- Eyes stay planted. No eye-whip. No meridians through the fill.
- Do not fetch xAI webfonts. Do not steal article ribbon gradients.
- Do not 360-rotate the disc. Not a hairline nest. Not a square of doodles behind a PNG.
- Do not map the skyline onto the sphere. Do not use the teal tourist illustration.

## Type

**Settled. Do not re-open.** See `LOOK.md`.

| Surface | Face | Token |
| --- | --- | --- |
| Display line — `Dallas meetup` on the wallpaper | Universal Sans trial / 400, exactly once | `--dallas-font` |
| Body, labels, info, demo-rail notes | IBM Plex Sans Condensed | `--dallas-font-ui` |

Largest Plex ≤ **40%** of display. Display is **44px** @ 1920. Tracking ~2.4.

## Paper / ink / field

| Token | Hex | Use |
| --- | --- | --- |
| `--dallas-paper` | `#F2F1ED` | Wallpaper background |
| `--dallas-ink` | `#111111` | Type, cube, Noun Project skyline, rest globe |
| Ver 02 chromatic (9) | gold → magenta | Chat-line filaments on the mark. Gray never a filament. |

## States

- [x] default
- [x] prefers-reduced-motion
- [x] play / pause
- [x] replay from t=0
- [x] frame-step and scrub
- [x] presentation fullscreen
- [x] export capture
- [x] rest+whip vs linear-spin compare (default off)
- [x] whip duration 0.5–0.7s
- [x] horizon toggle (default on)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Canvas 2D + rAF | Deterministic timeline and export |
| Duration | 8s: 6.4 Idle / 0.6 Working / ~1 settle | Do not shorten the loop. Super-fast = short whip |
| Body | Planted SDF. Rest holds. Morph in settle. No disc spin | No idle bob. No meridians |
| Stream | Chat-line filaments on the mark | Working whip travels with the mark; Idle orbits are quiet |
| Color + shape | SNAP + SDF blend land in settle | No rainbow lerp. Whip keeps current fill/body |
| Eyes | Planted stadiums through whip and morph | Mid-yaw smear is a miss |
| Horizon | Noun Project Dallas 3583788 | Ink silhouette, not a photograph |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [ ] `npm run lint` and `npm run build` pass in `lab/` (verify this PR)
- [x] 8s Idle hold → 0.6s Working whip (filaments on the mark) → ~1s settle to Idle (SNAP + SDF); reduced motion freezes Idle
- [x] Front filaments clip to the current body; back occluded; cube clean; no meridians; no wallpaper-field doodles
- [x] Shape→color pairing; fill SNAP + SDF blend in settle; cold-start oval+ink; first settle squircle+Teal
- [x] Eyes planted in face-space through whip and morph (no eye-whip, no yaw smear)
- [x] Universal Sans trial once on the canvas line; Plex ≤ 40% of display; Geist out
- [x] Noun Project Dallas skyline (3583788) ink, default ON, behind the globe
- [x] Ver 02 filaments on the mark (never meridians, never gray, never a wallpaper field)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`

## Loaded skills (this pass)

- `maser-lab-web` Implement (existing slug)
- `maser-lab-web/references/skill-routing.md`
- `maser-lab-web/references/motion-judgment.md`
- `maser-lab-demo-chrome`
- `maser-lab-token-system`
- `verification`
- `LOOK.md` as project authority (later interrupts win)
