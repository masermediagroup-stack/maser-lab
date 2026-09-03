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
Paper field `#F2F1ED` with Noun Project Dallas horizon, Cursor cube + solid Grok body + one Universal Sans line `Dallas meetup`. Disc stays. Illusion of spin: planted morph + ribbon wrap + eyes whipping around the form. Color SNAPS with the next shape in the same kick. Lands Idle on the new face.

### Success signal
- TV mode loads: paper ground, Noun Project horizon ON, solid globe, Universal Sans display line. Cube and type stay clean.
- Rest = Idle (6.4s): planted face, official body, flat HEX, white stadiums, **no bands**. Cube clean. Shape 2 irregular oval, ink `#111111`. No idle bob. No globe yaw.
- Whip = kick (0.6s): planted morph + ribbon wrap + eyes whipping around the form. Color SNAPS with the next shape. First kick lands rounded square + Teal. Disc stays.
- After kick (~1s): Idle on the new face. No bands. No second morph.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion freezes Idle (no whip, no morph, no bands, Idle eyes).

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, or secondary copy.
- Do not use Thinking, Waiting, Blocked, or Done as the TV whip.
- Do not fill rest with idle bob, body spin, or parked bands. Do not shorten the 8s loop.
- Eyes whip around the form on the kick, then Idle. Do not yaw the disc. No meridians through the fill.
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
| Body | Planted SDF. Disc stays. Morph during the kick. No globe yaw | Illusion of spin is morph + ribbons + eye whip |
| Stream | 2–4 thick flat Ver 02, −15°, wrap then leave | Idle/settle have no bands |
| Color + shape | SNAP + SDF blend in the same kick | Lands Idle on the new face. No rainbow lerp |
| Eyes | Idle at rest; whip around the form on the kick | Hide behind the fill. Land Idle |
| Horizon | Noun Project Dallas 3583788 | Ink silhouette, not a photograph |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [ ] `npm run lint` and `npm run build` pass in `lab/` (verify this PR)
- [x] 8s Idle (no bands) → 0.6s kick (planted morph + ribbons + eye whip; color with next shape) → Idle on the new face; reduced motion freezes Idle
- [x] Front bands clip to the current body; back occluded; cube clean; no meridians; no globe yaw; no parked rest bands
- [x] Shape→color pairing; fill SNAP + SDF blend in the kick; cold-start oval+ink; first kick lands squircle+Teal
- [x] Eyes Idle at rest; whip around the form on the kick (hide behind); land Idle
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
