# Project: Maser bot card

**Slug:** `maser-bot-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-05  
**Mode:** Implement (Figma static recut + live behavior)

## Design reference

- Figma file: **GrokBot-Loop-DemoCard**. Front v1 `1:20` (mark-forward). Back v1 `1:2` (identity). Wordmark `1:22`. Artboard 1299×1299. v2/v3/Assets parked.
- Other: steal Zoah **pose + specular + cuboid-edge feel** only. Refuse Zoah skin, landscape, dither on the card face, embossed type.
- Build: One thin cuboid card (Three.js ExtrudeGeometry, no bevel). Type is painted on the face mesh (flat Display Trial). Tilt and quieter sheen live on that face. The edge is the cuboid side, seen on tilt and flip. No outline rim, no bevel, no chrome edge, no second plane around the type. Wordmark on Front v1. Live capsule on Back v1. vgpu **stage** (TL grey + pointer cloud) behind the card. New shaders stay vgpu.

## Brief

### User / trigger
Dallas meetup stage: pointer over a single 1299-square card; explicit Back / Front text at the bottom of the card. Occasional, live demo frequency.

### Job
Teaching prop for the Lab loop. Figma static reads first. Pointer adds restrained yaw/pitch + quieter sheen. Stage stays behind the card.

### Current behavior
1299 square card, radius 80, fill `#000`. Thin Three.js cuboid (no bevel): the edge is the side of the cuboid, read on tilt and on the flip. Front v1 is the white Grok Bot wordmark. Back v1 typesets name/role/body and the live capsule. Identity body sits at Figma x 97, width 840, height 512, top raised to 560 so it stays clear of the swap; `room moving.` stays on one line. Keyboardable Back / Front text below the card, black type, no chip. Clicking Back / Front turns the cuboid once to the other face and settles (reduced: swap, no turn). Type sits on the card face (painted on the cuboid lids); tilt + quieter sheen on that face. No rim, no bevel. vgpu ground (demo **Background** knob, default `#000`) + TL grey + pointer cloud on the stage field. Background color does not paint the card face, type, or mark.

### Desired outcome
Match Figma boxes at `n / 1299`. Keep live tilt/sheen and stage field. Do not bake the stage shader into the card face.

### Success signal
`/demos/maser-bot-card` matches the Figma static, then tilts as one card face. Flip is keyboardable. Reduced motion: no tilt, no shine chase, still stage, mark first frame still.

### Non-goals
Lab shell chrome. Stage script. Zoah landscape/skin. Dallas wallpaper morphs. Full `defaultCycle`. Geist/Inter on the product. Maser blue on the capsule. Rewriting body copy. Dither on the card face. Loading Text Trial faces.

## States

- [x] rest
- [x] front / back / flip (Back / Front text below the card, clear of the body box + demo Face knobs)
- [x] pointer enter / move / leave
- [x] prefers-reduced-motion (OS + demo toggle)
- [x] TV / present
- [ ] hover / focus / press on card CTA — later
- [ ] loading / success / error — not required yet

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Thin Three.js cuboid (ExtrudeGeometry, bevel off) + type painted on lid maps + vgpu stage | Type is on the cuboid face. The edge is the cuboid side. Rim, bevel, chrome, Geist, and a frame around the type are refused. New shaders stay vgpu. |
| Yaw / pitch | Live ~±16° / ±10° × feel knob | Enough tilt to read the face and the cuboid edge; not a flip toy; not frozen tokens |
| Return | damped lerp | not a hard snap |
| Sheen / light | Quiet wash **only while pointer is on the card face**; snap off on leave | no rest sheen, no idle center, no leftover specular, no light that sticks when the card tilts |
| Band | none | critique killed parked highlight / band. No lanyard. |
| Card face | solid `#000` | Figma lock; no center bloom |
| Bezel / rim | none | no chrome edge, no outline, no second plane around the type. Thickness is the cuboid side. |
| Stage bg | vgpu ground (demo **Background** knob, default `#000`) + TL grey + quiet pointer cloud | behind the card; not on the card face, type, or mark |
| Flip | One 180° turn on the cuboid, then settle (520ms, product state). Reduced: swap, no turn | Back on the wordmark, Front on the identity face. Text is the button. Swap type is black. No extra spin, no loop, no fade. |
| Mark | Bloub engine, capsule + bleu, **one curl per page load** then pointer gaze | Catalog once; do not replay; clamp gaze inside capsule |

## Acceptance criteria

- [ ] Demo route `/demos/maser-bot-card` renders Figma-scaled 1299 card face
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Square 1299 (not landscape, not 3:4)
- [ ] Locked copy typeset in Figma boxes, verbatim
- [ ] Product does not import demo chrome or `--lab-*` as its look
- [ ] Reduced motion: no tilt, no sheen, bg still (black + TL grey), mark planted `neutre`, no curl or pointer chase, face swap without 3D flip
- [ ] Card face is solid `#000`. Stage is vgpu (ground + TL grey + pointer cloud). Capsule bleu `#3b93f0` on **Back v1**. Wordmark on Front v1.
- [ ] Ground / Background color is a demo knob (default `#000000`) and never sits on the card. Changing it does not tint the card fill, type, or mark.
- [ ] Front / Back turns the cuboid once to the other face and settles. Reduced motion swaps without the turn. Swap type is black.
- [ ] Product type stack names UniversalSansGrokTest Display Trial (no Geist/Inter substitute; Display file only, not Text Trial)
- [ ] Component exported from `lab/src/components/projects/display/maser-bot-card/index.ts`

## Open decisions

- UniversalSansGrokTest Display Trial TTF vendored at `lab/public/maser-bot-card/UniversalSansGrokTest-Display-Trial.ttf` (400 only). Same face for 300 slots. Do not load Text Trial.

## Accepted decisions

- Park Copy lines verbatim. Typeset in Figma boxes.
- Lock card Name to **mace**. Role **Chief of Staff/Producer**.
- Figma body (2026-09-08). Prior short/package Producer bodies are stale. Verbatim — do not rewrite.
- 1299 square. Refuse Zoah landscape.
- Two faces + explicit flip. Refuse hover-only.
- Card face solid `#000`. No idle light. Pointer sheen only. vgpu = stage field (not Bayer wave).
- Mark: Bloub engine; capsule; bleu `#3b93f0`; **one curl per page load** on Back v1 only, then pointer gaze until refresh. Catalog: neutre → attentif → curieux → mefiant → thinking → fier → neutre. Clamp gaze so the full eye stays inside the capsule. Refuse `defaultCycle`, idle→thinking→wide, and Maser blue `#10A4FF`.
- Product never imports demo chrome.
