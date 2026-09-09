# Project: Dallas Meetup TV Wallpaper

**Slug:** `dallas-meetup-tv-wallpaper`
**Category:** display
**Status:** building
**Created:** 2026-09-03

## Design reference

- Figma: [GrokBot-Dallas](https://www.figma.com/design/pZRH3cYPdDl1cDbmzzgZ5M/GrokBot-Dallas) — frame `GrokBot-TV-Idle-Wallpaper` (`11:2`). See `FIGMA.md`.
- Design spec: `design.md` (USER OVERRIDE 2026-09-09 idle wallpaper)

## Brief

### User / trigger
The wallpaper runs on a room **wall TV** (1920×1080) during the Cursor + Grok Bot Dallas meetup, and is previewed on **laptop / desktop**. Not a mobile surface.
Trigger frequency: rare / ambient (TV loop).

### Job
Hold a calm branded presence for long dwell viewing without reading like an ad.

### Desired outcome
Dark moving-gradient background. Center **3-logo carousel** (Grok Bot → SpaceX → Cursor) fading one-at-a-time over a **120s** loop. Bottom-left white Universal Sans headline + subline (lab-editable). Reduced motion: static gradient + first logo + static text.

### Success signal
- Moving gradient shader loops seamlessly at `loopSeconds` (default 120s).
- Three logos fade in/out at center without whip/spin/morph.
- Text anchored bottom-left per Figma `11:97`.
- Same demo route `/demos/dallas-meetup-tv-wallpaper` with headline/up-next inputs preserved.
- Reduced motion freezes first frame.

### Non-goals
- No kick/whip/Grok SDF morph cycle (retired 2026-09-09).
- No paper `#F2F1ED` ground (retired).
- Geist out. Do not invent layout beyond Figma frame.
- No mobile / 320 layout. Wall TV + laptop/desktop only.
- Do not scale logos or canvas type off Figma native px.

## Type

**Settled for idle wallpaper (2026-09-09).**

| Surface | Face | Token |
| --- | --- | --- |
| Canvas headline | Universal Sans trial / 400, 48px @ 1920 | `--dallas-font` |
| Canvas subline | Universal Sans trial / 300, 36px @ 1920 | `--dallas-font` |
| Demo chrome labels | IBM Plex Sans Condensed | `--dallas-font-ui` |

Both canvas lines use Universal Sans (different weights). Plex only on lab demo chrome.

## Surface tokens

| Token | Value | Use |
| --- | --- | --- |
| `--dallas-stage` | `#060606` | Stage chrome / fallback ground |
| `--dallas-text-on-dark` | `#FFFFFF` | Canvas headline + subline |

## States

- [x] default
- [x] prefers-reduced-motion
- [x] play / pause
- [x] replay from t=0
- [x] frame-step and scrub
- [x] presentation fullscreen
- [x] export capture
- [x] loop duration 30–120s (default 120s)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Background | WebGPU moving gradient + Canvas2D fallback | Figma `11:2` shader fill |
| Logo motion | Sequential fade-out / fade-in (no overlap) | User: logos must never intersect |
| Duration | Default 120s loop | Existing demo control |
| Text | Static white, bottom-left | Figma layout |

## Acceptance criteria

- [ ] Demo route `/demos/dallas-meetup-tv-wallpaper` renders idle wallpaper composition
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Shader + logo carousel loop at 120s without visible seam at t=0 vs t=120
- [ ] Headline/up-next editable in lab demo
- [ ] Reduced motion: static gradient, Grok logo, static text
- [ ] Universal Sans 400 + 300 on canvas; Geist out of product surface
- [ ] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`
