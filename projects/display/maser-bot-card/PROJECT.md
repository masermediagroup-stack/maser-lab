# Project: Maser bot card

**Slug:** `maser-bot-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-05  
**Mode:** Implement (skeleton / Spark env prep — CSS first)

## Design reference

- Figma: none — Shape holds until the drop. See `design.md` in this folder.
- Other: steal Zoah **pose + specular feel** only. Refuse Zoah skin, landscape, WebGL stack.
- Build order: CSS first. No vgpu. No Bloub mark anim.

## Brief

### User / trigger
Dallas meetup stage: pointer over a single portrait card; explicit View front/back. Occasional, live demo frequency.

### Job
Teaching prop for the Lab loop. Planted at rest, alive under pointer (restrained yaw/pitch + sheen). Look is not invented here.

### Current behavior
CSS skeleton: square/vertical plate, empty identity + mark slots, flip control, damped tilt, specular wash + counter-shift rim, optional band, stub bg slot (no vgpu).

### Desired outcome
Figma locks type/color/mark/layout. Until then: portrait frame, parked copy off-face, CSS light stack only.

### Success signal
`/demos/maser-bot-card` boots. Knobs: tilt, shine, band, face, bg, reduced motion. Flip is keyboardable. Reduced motion: no tilt, no sheen chase, instant/opacity face swap. Present hides demo chrome (Esc out).

### Non-goals
Lab shell chrome. Stage script. Zoah landscape/skin/dither/embossed type. Dallas wallpaper morphs. vgpu plate. Bloub SVG mark. Typesetting parked copy.

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
| vgpu | none | locked later-only |

## Acceptance criteria

- [ ] Demo route `/demos/maser-bot-card` renders skeleton states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Portrait / square-vertical (not landscape)
- [ ] Parked copy is not typeset on the card face
- [ ] Product does not import demo chrome or `--lab-*` as its look
- [ ] Reduced motion: no tilt, no sheen chase, bg still, face swap without 3D flip
- [ ] No vgpu, no Bloub mark animation
- [ ] Component exported from `lab/src/components/projects/display/maser-bot-card/index.ts`

## Open decisions

- Type, color, mark, layout — wait for Figma.
- Whether CSS feels flat after live timing (vgpu plate optional later).
- Card face strings — parked verbatim.

## Accepted decisions

- Park Copy lines verbatim. Do not typeset until Figma.
- Square / vertical. Refuse Zoah landscape.
- Two faces + explicit flip. Refuse hover-only.
- CSS first. No vgpu now. No Bloub now.
- Product never imports demo chrome.
