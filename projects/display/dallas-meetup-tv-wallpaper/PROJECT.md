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
Paper field `#F2F1ED` with Noun Project Dallas horizon, Cursor cube + solid Grok body + one Universal Sans line `Dallas meetup`. Disc stays; ribbons are the whip. Loop: 6.4s Idle (planted face, no bands), 0.6s kick (2–4 thick flat Ver 02 wrap front/back at −15°, cross the eyes, leave; eyes may pump), ~1s settle SNAP on the still face.

### Success signal
- TV mode loads: paper ground, Noun Project horizon ON, solid globe, Universal Sans display line. Cube and type stay clean.
- Rest = Idle (6.4s): planted face, official body, flat HEX, white stadiums, **no bands**. Cube clean. Shape 2 irregular oval, ink `#111111`. No idle bob. No globe yaw.
- Whip = kick (0.6s): **ribbons are the whip.** 2–4 thick flat Ver 02 wrap front/back, −15° plane, **cross the eyes**, then leave. Eyes can pump more upright. Disc stays (same body + fill). Tilt 16°.
- Settle (~1s): shape/color SNAP on the **still face** — no spin needed. First settle lands rounded square + Teal. Idle eyes. No bands.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion freezes Idle (no whip, no morph, no orbits, Idle eyes).

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, or secondary copy.
- Do not use Thinking, Waiting, Blocked, or Done as the TV whip.
- Do not fill rest with idle bob, body spin, or parked bands. Do not shorten the 8s loop.
- Eyes stay in face-space. Working pump on the kick only. No yaw smear. No meridians through the fill.
- Do not fetch xAI webfonts. Do not steal article ribbon gradients.
- Do not 360-rotate the disc. No globe yaw. Not a hairline nest. Not a square of doodles behind a PNG.
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
| Ver 02 chromatic (9) | gold → magenta | Palette. Kick bands use a sparse subset. Gray never a filament. |

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
| Body | Planted SDF. Disc stays. Morph in settle. No globe yaw | Ribbons are the whip. No 360 disc spin |
| Stream | 2–4 thick flat Ver 02, −15°, wrap then leave | Front crosses the eyes. Idle/settle have no bands |
| Color + shape | SNAP + SDF blend on the still face | No spin needed at settle. Whip keeps current fill/body |
| Eyes | Idle at rest; Working pump on the kick | Still planted in face-space. No yaw smear |
| Horizon | Noun Project Dallas 3583788 | Ink silhouette, not a photograph |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [ ] `npm run lint` and `npm run build` pass in `lab/` (verify this PR)
- [x] 8s Idle (no bands) → 0.6s kick (2–4 ribbons wrap, cross eyes, leave; disc stays) → ~1s still-face SNAP; reduced motion freezes Idle
- [x] Front bands clip to the current body and cross the eyes; back occluded; cube clean; no meridians; no globe yaw; no parked rest bands
- [x] Shape→color pairing; fill SNAP + SDF blend in settle; cold-start oval+ink; first settle squircle+Teal
- [x] Eyes Idle at rest/settle; Working pump (more upright) on the kick; still planted (no yaw smear)
- [x] Universal Sans trial once on the canvas line; Plex ≤ 40% of display; Geist out
- [x] Noun Project Dallas skyline (3583788) ink, default ON, behind the globe
- [x] 2–4 thick flat Ver 02 kick bands, −15° plane (never meridians, never gray, never a wallpaper field, never parked at rest)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`

## Loaded skills (this pass)

- `maser-lab-web` Implement (existing slug)
- `maser-lab-web/references/skill-routing.md`
- `maser-lab-web/references/motion-judgment.md`
- `maser-lab-demo-chrome`
- `maser-lab-token-system`
- `verification`
- `LOOK.md` as project authority (later interrupts win)
