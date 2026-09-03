# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: none
- Motion source: Grok Bot lifecycle tour at https://x.ai/news/designing-grok-bot (Idle / Working / Waiting / Blocked / Thinking / Done). Craft the kick from **Working** frames, not the blank Working-cycle gap.
- Look lock: `LOOK.md` in this folder (authority)
- Design spec: `FIGMA.md` / `design.md` in this folder

## Brief

### User / trigger
The wallpaper runs continuously on a room TV during the Cursor + Grok Bot Dallas meetup.

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Paper field `#F2F1ED` with Cursor cube + Grok body + one line `Dallas meetup`. Grok follows the article Idle/Working face: flat body, white stadiums, one Working-stream kick per 8s loop.

### Success signal
- Idle rest is still: current body, Idle eyes, no ribbons.
- Whip is one Working stream (2–4 thick bands wrap front/back, cross the eyes, leave).
- First settle is squircle + Teal. Cold start is oval + Black.
- Presentation mode is fullscreen with zero demo chrome.
- Reduced motion freezes Idle.

### Non-goals
- No event logistics, QR, RSVP, wordmarks, taglines, or secondary copy.
- Do not hold the product Working loop (stream / gap / stream) through rest.
- Do not fetch xAI webfonts. Do not steal article ribbon gradients.
- Not Thinking. Not a hairline nest.

## Type

**Settled. Do not re-open.** See `LOOK.md`.

| Surface | Face | Token |
| --- | --- | --- |
| Display line — `Dallas meetup` on the wallpaper | Universal Sans trial 400, exactly once | `--dallas-font` |
| Body, labels, info, demo-rail notes | IBM Plex Sans Condensed | `--dallas-font-ui` |

Largest Plex ≤ **40%** of display. Display is **44px** @ 1920. Tracking ~2.4. Geist is out.

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
| Body | No yaw | Article Idle/Working body stays face-on |
| Stream | 2–4 flat Ver 02 ribbons, ~4.5% of face, wrap+clip | Product Working stream; TV plays it once |

## Acceptance criteria

- [x] Demo route `/demos/dallas-meetup-tv-wallpaper` renders locked composition
- [ ] `npm run lint` and `npm run build` pass in `lab/` (verify this PR)
- [x] 8s Idle → one kick → Idle; reduced motion freezes Idle
- [x] Front ribbons cross the eyes; back occluded; cube clean
- [x] Shape→color pairing; cold-start oval+Black; first settle squircle+Teal
- [x] Universal Sans once on the canvas line; Plex ≤ 40% of display
- [x] Noun Project Dallas horizon default ON; credit in the rail
- [x] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`

## Loaded skills (this pass)

- `maser-lab-web` Implement (existing slug)
- `maser-lab-demo-chrome`
- `maser-lab-token-system`
- `verification`
- `LOOK.md` as project authority
