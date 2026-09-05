# Project: Meetup loop visualization

**Slug:** `meetup-loop-viz`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-05  
**Kind:** section (lab teaching page)

## Design reference

- Figma: none
- Other: `design.md` in this folder (canonical brief + locked copy)
- Duplicate for the demo folder: `lab/src/app/demos/meetup-loop-viz/design.md`
- Official Grok Bot face: `lab/public/assets/meetup-loop-viz/grok-bot-face.png` (cropped from xAI published Grok Bot art; see `SOURCE.txt`)

## Brief

### User / trigger
Beginners → intermediate Grok users on a Dallas meetup stage. Speaker walks the six Lab hands out loud, once per rehearsal / show.

### Job
One glance: how work hands across bots. Heavy titles, lighter lines, dots between steps for the handoff.

### Brand signal
Black field, white type, official Grok Bot face top-right. Removing lab chrome still reads as this teaching page.

### First viewport contents (max)
- Brand: Grok Bot face mark (official)
- Headline: six-step spine (no extra marketing H1)
- Support: locked one-liners
- CTA: none
- Visual: vertical spine + dots

### Current behavior
Greenfield. Separate track from wallpaper and maser-bot-card.

### Desired outcome
Showroom timeline. Dots teach handoff. No flowchart, glass cards, or Track A card look.

### Success signal
All six locked titles + lines visible. Dots travel unless reduced motion. Speaker can focus one step. Groot spur optional, default off.

### Non-goals
Process-diagram spaghetti; glass step cards; inventing Dice Sans metrics; Universal Sans / Geist / Inter as the product story; required 7th Groot step; page-load stagger; mixing the card track.

## States

- [x] default — all six steps; dots idle/travel
- [x] step focus (demo knob) — one step emphasized
- [x] Groot spur on/off (demo knob, default off)
- [x] prefers-reduced-motion — static dots, no travel (OS + lab toggle)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS | Opacity pulse along connector dots — handoff only |
| Duration | ~1.2s loop | Slow travel; not UI chrome |
| Easing | linear / ease-in-out on opacity | `rule/gpu-properties-only` |
| Page load | none | No stagger (`rule/ui-duration-cap` / Emil: if it doesn’t teach the handoff, kill it) |
| Step focus | instant opacity, no travel | Don’t animate keyboard-driven focus |

## Acceptance criteria

- [ ] Demo route `/demos/meetup-loop-viz` renders all states above
- [ ] Locked copy used verbatim on the canvas
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] `prefers-reduced-motion` + lab toggle: static dots
- [ ] Component exported from `lab/src/components/projects/display/meetup-loop-viz/index.ts` (product-only)

## Open decisions

- Typeface: Dice Sans pending human confirm. Scaffold uses `--loop-font-temp` (system grotesk). Approver required before Status: accepted.
- Grok Bot mark: official face crop from xAI Grok Bot published art until a vector file is filed from brand zip (zip currently has Grok Saturn logomark, not the Bot face).

## Accepted decisions

- Copy lock 2026-09-05: six titles + lines verbatim (see `design.md` Locked copy).
