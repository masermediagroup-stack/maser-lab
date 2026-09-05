# Project: Maser bot card

**Slug:** `maser-bot-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-05  
**Mode:** Implement (skeleton / Spark env prep — CSS first)

## Design reference

- Figma: none — Shape holds until the drop. See `design.md` in this folder.
- Other: steal Zoah **pose + specular feel** only. Refuse Zoah skin, landscape, WebGL stack.
- Build order: CSS first. Vgpu plate KILLED. Optional vgpu = stage bg only (not now). No Bloub mark anim.

## Brief

### User / trigger
Dallas meetup stage: pointer over a single portrait card; explicit View front/back. Occasional, live demo frequency.

### Job
Teaching prop for the Lab loop. Planted at rest, alive under pointer (restrained yaw/pitch + sheen). Look is not invented here.

### Current behavior
CSS skeleton: square/vertical plate, empty identity + mark slots, flip control, damped tilt, specular wash + counter-shift rim, optional band, empty stage-bg stub (calm / interactive; no shader, no invented look).

### Desired outcome
Figma locks type/color/mark/layout. Until then: portrait frame, parked copy off-face, CSS light stack only.

### Success signal
`/demos/maser-bot-card` boots. Knobs: tilt, shine, band, face, bg, reduced motion. Flip is keyboardable. Reduced motion: no tilt, no sheen chase, instant/opacity face swap. Present hides demo chrome (Esc out).

### Non-goals
Lab shell chrome. Stage script. Zoah landscape/skin/dither/embossed type. Dallas wallpaper morphs. WebGL plate. Starfield/noise vgpu now. Bloub SVG mark. Typesetting parked copy.

## States

- [x] rest
- [x] front / back / flip (View front / View back + demo Face knobs)
- [x] pointer enter / move / leave
- [x] prefers-reduced-motion (OS + demo toggle)
- [x] TV / present
- [x] empty / missing mark (silent slots)
- [ ] hover / focus / press on card CTA — later
- [ ] loading / success / error — not required yet

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS 3D + rAF lerp | Build order: CSS first. Steal feel, not Zoah WebGL. |
| Yaw / pitch | ~±8° / ±5° × feel knob | Stage prop; live timing, not tokens |
| Return | damped lerp | not a hard snap |
| Sheen | broad wash + counter-shift rim | not a lone diagonal streak |
| Band | optional diagonal mask | mute via knob |
| Plate | CSS 3D only | Tech reconcile: no WebGL plate |
| Stage bg | empty calm / interactive stub | optional vgpu later; not a plate shader |

## Acceptance criteria

- [ ] Demo route `/demos/maser-bot-card` renders skeleton states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Portrait / square-vertical (not landscape)
- [ ] Parked copy is not typeset on the card face
- [ ] Product does not import demo chrome or `--lab-*` as its look
- [ ] Reduced motion: no tilt, no sheen chase, bg still, face swap without 3D flip
- [ ] Plate is CSS only (no vgpu plate). No Bloub mark animation. No starfield/noise bg now
- [ ] Component exported from `lab/src/components/projects/display/maser-bot-card/index.ts`

## Open decisions

- Type, color, mark, layout — wait for Figma.
- Card face strings — parked verbatim.
- Stage bg vgpu (environment only) — not now; EP after Figma if needed.

## Accepted decisions

- Park Copy lines verbatim. Do not typeset until Figma.
- Square / vertical. Refuse Zoah landscape.
- Two faces + explicit flip. Refuse hover-only.
- CSS 3D tilt + specular + flip. Vgpu plate KILLED. No Bloub now.
- Product never imports demo chrome.
