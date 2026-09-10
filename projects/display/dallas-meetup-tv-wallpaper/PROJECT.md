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
vgpu **black-and-white circle-glyph** ground at true **1920×1080**. Center **3-logo carousel** (Grok Bot → SpaceX → Cursor) as crisp SVG, fading one-at-a-time over a **120s** loop. Bottom-left white Universal Sans headline + subline (lab-editable). Reduced motion: still code field + first logo + static text.

### Success signal
- vgpu B/W circle-glyph ground fills the 1920×1080 stage behind the lockup (dpr 1.5–2).
- Three logos fade in/out at center without whip/spin/morph; SVG marks stay sharp (no CSS stretch).
- Text anchored bottom-left per Figma `11:97` as HTML Universal Sans (no scale below 1).
- Same demo route `/demos/dallas-meetup-tv-wallpaper` with headline/up-next inputs preserved.
- Reduced motion freezes the code field plus Grok logo + static text.

### Non-goals
- No kick/whip/Grok SDF morph cycle (retired 2026-09-09).
- No paper `#F2F1ED` ground (retired).
- Geist out. Do not invent layout beyond Figma frame.
- No mobile / 320 layout. Wall TV + laptop/desktop only.
- Do not scale logos or type off Figma native px.
- No Unicorn Studio embed (watermark / no Legend).
- Do not invent extra neo glyph shapes or an accent-blue palette.

## Type

**Settled for idle wallpaper (2026-09-09).**

| Surface | Face | Token |
| --- | --- | --- |
| Headline | Universal Sans trial / 400, 48px @ 1920 | `--dallas-font` |
| Subline | Universal Sans trial / 300, 36px @ 1920 | `--dallas-font` |
| Demo chrome labels | IBM Plex Sans Condensed | `--dallas-font-ui` |

Both canvas lines use Universal Sans (different weights). Plex only on lab demo chrome.

## Surface tokens

| Token | Value | Use |
| --- | --- | --- |
| `--dallas-stage` | `#060606` | Stage chrome / fallback ground |
| `--dallas-text-on-dark` | `#FFFFFF` | Headline + subline |

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
| Background | vgpu B/W circle glyphs | Unicorn embed killed; code texture under lockup |
| Logo motion | Sequential fade-out / fade-in (no overlap) | User: logos must never intersect |
| Duration | Default 120s loop | Existing demo control |
| Text | Static white, bottom-left | Figma layout |

## Acceptance criteria

- [ ] Demo route `/demos/dallas-meetup-tv-wallpaper` renders idle wallpaper composition
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Logo carousel loops at 120s without visible seam at t=0 vs t=120
- [ ] Headline/up-next editable in lab demo
- [ ] Reduced motion: still vgpu field, Grok logo, static text
- [ ] Universal Sans 400 + 300; Geist out of product surface
- [ ] Stage CSS is 1920×1080 (no stretch); marks are SVG at native px
- [ ] Ground is vgpu B/W circle glyphs — no Unicorn SDK
- [ ] Product exports from `lab/src/components/projects/display/dallas-meetup-tv-wallpaper/index.ts`
