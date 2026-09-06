# Project: Maser bot card

**Slug:** `maser-bot-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-05  
**Mode:** Implement (Track A — vgpu plate)

## Design reference

- Figma: none — Shape holds until the drop. See `design.md` in this folder.
- Other: steal Zoah **pose + specular feel** only. Refuse Zoah skin, landscape, dither, embossed type.
- Build: CSS 3D pose + flip. Plate shine/light is **vgpu**. Mark is vendored Grokbot SVG (`defaultCycle` as-is). Stage bg may still use vgpu (stub now).

## Brief

### User / trigger
Dallas meetup stage: pointer over a single portrait card; explicit View front/back. Occasional, live demo frequency.

### Job
Teaching prop for the Lab loop. Planted at rest, alive under pointer (restrained yaw/pitch + shader shine/light). Look is not invented here.

### Current behavior
Portrait 3:4 plate. Empty identity slots. Keyboardable flip. CSS 3D tilt. vgpu plate for shine + light (CSS specular fallback if GPU fails). Optional band. Empty stage-bg stub. Dark-mode gray card, white text, Universal Sans named (file not in). Back mark is the Grokbot SVG (Bloub lineage) playing the upstream default cycle.

### Desired outcome
Figma locks type/color/mark/layout. Until then: portrait frame, parked copy off-face, vgpu plate.

### Success signal
`/demos/maser-bot-card` boots. Knobs: tilt, shine, band, face, bg, reduced motion. Flip is keyboardable. Reduced motion: no tilt, no shine chase, instant/opacity face swap, mark still on first frame. Present hides demo chrome (Esc out).

### Non-goals
Lab shell chrome. Stage script. Zoah landscape/skin/dither/embossed type. Dallas wallpaper morphs. Invented mark timeline. Typesetting parked copy. Geist on the product.

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
| Library | CSS 3D pose + vgpu plate | Track A: premium shader shine/light |
| Yaw / pitch | ~±8° / ±5° × feel knob | Stage prop; live timing, not tokens |
| Return | damped lerp | not a hard snap |
| Sheen / light | vgpu wash + counter rim (+ optional band) | CSS fallback if init fails |
| Band | optional diagonal mask | mute via knob |
| Plate | vgpu / WebGL | Track A override 2026-09-05 evening |
| Stage bg | empty calm / interactive stub | may still use vgpu; not invented now |
| Mark | Grokbot SVG, upstream `defaultCycle()` | Do not invent the timeline |

## Acceptance criteria

- [ ] Demo route `/demos/maser-bot-card` renders skeleton states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Portrait / square-vertical (not landscape)
- [ ] Parked copy is not typeset on the card face
- [ ] Product does not import demo chrome or `--lab-*` as its look
- [ ] Reduced motion: no tilt, no sheen chase, bg still, mark first frame still, face swap without 3D flip
- [ ] Plate is vgpu (CSS fallback if GPU fails). Mark uses Grokbot `defaultCycle` as-is. No starfield/noise bg now
- [ ] Product type stack names Universal Sans (no Geist substitute). Font file waits for Figma
- [ ] Component exported from `lab/src/components/projects/display/maser-bot-card/index.ts`

## Open decisions

- Type, color, mark, layout — wait for Figma.
- Card face strings — parked verbatim.
- Universal Sans file — wait for handoff.
- Stage bg vgpu (environment only) — optional; EP after Figma if needed.
- Mark choreography / human style list — hold. Asset is wired; do not rewrite `defaultCycle`.

## Accepted decisions

- Park Copy lines verbatim. Do not typeset until Figma.
- Lock card Name to **mace** (not Maser). Role Producer, body unchanged.
- Square / vertical. Refuse Zoah landscape.
- Two faces + explicit flip. Refuse hover-only.
- Track A: vgpu plate for shine + light. CSS 3D tilt + flip.
- Mark: vendored Grokbot-animations engine; play `defaultCycle()` as-is.
- Product never imports demo chrome.
