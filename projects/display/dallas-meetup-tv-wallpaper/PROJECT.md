# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none. Full lockup stills pending from Elite Pixel Guy; globe stills + this text are the lock until they arrive.
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working / Waiting / Blocked / Thinking / Done). Craft the kick from **Working** frames, not the blank Working-cycle gap.
- Look lock: `LOOK.md` in this folder (authority)
- Design spec: `FIGMA.md` / `design.md` in this folder
- Horizon photograph: [Dallas Texas skyline overlooking Trammell Crow Park](https://commons.wikimedia.org/wiki/File:Dallas_Texas_skyline_overlooking_Trammell_Crow_Park.png) (CC0 1.0, IcedCowboyCoffee)

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper field `#F2F1ED` with dithered Dallas horizon, 9-hue field swooshes, Cursor cube + solid Grok body + one Universal Sans line `Dallas meetup`. Grok follows the article Idle/Working face: flat body, white stadiums, one Working-stream kick per 8s loop.

### Success signal
- TV mode loads: paper ground, dithered horizon ON, field filaments, solid globe, whip, Universal Sans display line.
- Idle rest is still: current body, Idle eyes, no ribbons.
- Whip is one kick: morph + fill snap to next pair HEX + wrapping ribbons + eye-whip. Face-forward rest, 0.5–0.7s travel, hard ease, land face-forward. Tilt 16°.
- First kick lands rounded square + Teal. Cold start is oval + ink `#111111`.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion freezes Idle.

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, or secondary copy.
- Do not hold the product Working loop (stream / gap / stream) through rest.
- Do not fetch xAI webfonts. Do not steal article ribbon gradients.
- Do not 360-rotate the disc. Not Thinking. Not a hairline nest on the mark.
- Do not map the skyline onto the sphere. Do not use Noun Project or the teal tourist illustration.
- Do not draw meridians / parallels / longitude on the globe. Field filaments stay in the wallpaper field.

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
| `--dallas-ink` | `#111111` | Type, cube, skyline dither, rest globe |
| Ver 02 chromatic (9) | gold → magenta | Field swooshes. Gray never a filament. |

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
| Duration | 8s: 6.4 still / 0.6 whip / ~1 settle | Idle dwell, one Working kick, land |
| Body | Planted SDF. Kick morphs to next picker. No disc spin | Turn is an illusion (ribbons + eye-whip) |
| Stream | 2–4 flat Ver 02 ribbons, ~4.8% of face, −15° wrap | Product Working stream; TV plays it once |
| Color | Snap to next pair HEX at kick start | No rainbow lerp, no settle snap on a still face |
| Field | Seeded random 9-hue hairlines on paper | Ver 02 swooshes, never on the mark |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [ ] `npm run lint` and `npm run build` pass in `lab/` (verify this PR)
- [x] 8s Idle → one kick (morph + ribbons + eye-whip) → Idle on the new body; reduced motion freezes Idle
- [x] Front ribbons clip to the morphing body; back occluded; cube clean
- [x] Shape→color pairing; fill snaps on the kick; cold-start oval+ink; first kick squircle+Teal
- [x] Universal Sans trial once on the canvas line; Plex ≤ 40% of display; Geist out
- [x] Trammell Crow CC0 skyline Bayer-dithered paper/ink, default ON, behind the globe
- [x] 9-hue field swooshes on paper (random assignment, never meridians on the mark, never gray)
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`

## Loaded skills (this pass)

- `maser-lab-web` Implement (existing slug)
- `maser-lab-web/references/skill-routing.md`
- `maser-lab-demo-chrome`
- `maser-lab-token-system`
- `verification`
- `LOOK.md` as project authority
