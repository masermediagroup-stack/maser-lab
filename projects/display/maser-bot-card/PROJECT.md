# Project: Maser bot card

**Slug:** `maser-bot-card`  
**Category:** display  
**Status:** building  
**Created:** 2026-09-05  
**Mode:** Implement (Figma static recut + live behavior)

## Design reference

- Figma file: **GrokBot-Loop-DemoCard**. Front v1 `1:20` (mark-forward). Back v1 `1:2` (identity). Wordmark `1:22`. Artboard 1299×1299. v2/v3/Assets parked.
- Other: steal Zoah **pose + specular + slab-edge feel** only. Refuse Zoah skin, landscape, dither on the card face, embossed type.
- Build: CSS 3D slab (bezel + contact shadow) + flip + quieter sheen on a solid `#000` card face. Wordmark on Front v1. Live capsule on Back v1. vgpu **stage** (TL grey + pointer cloud) behind the card.

## Brief

### User / trigger
Dallas meetup stage: pointer over a single 1299-square card; explicit View front/back. Occasional, live demo frequency.

### Job
Teaching prop for the Lab loop. Figma static reads first. Pointer adds restrained yaw/pitch + quieter sheen. Stage stays behind the card.

### Current behavior
1299 square card face, radius 80, fill `#000`. Front v1 is the white Grok Bot wordmark. Back v1 typesets name/role/body and the live capsule. Keyboardable flip. CSS 3D tilt + CSS sheen. vgpu black + TL grey + pointer cloud on the stage field.

### Desired outcome
Match Figma boxes at `n / 1299`. Keep live tilt/sheen and stage field. Do not bake the stage shader into the card face.

### Success signal
`/demos/maser-bot-card` matches the Figma static, then tilts with a thin slab edge. Flip is keyboardable. Reduced motion: no tilt, no shine chase, still stage, mark first frame still.

### Non-goals
Lab shell chrome. Stage script. Zoah landscape/skin. Dallas wallpaper morphs. Full `defaultCycle`. Geist/Inter on the product. Maser blue on the capsule. Rewriting body copy. Dither on the card face. Loading Text Trial faces.

## States

- [x] rest
- [x] front / back / flip (View front / View back + demo Face knobs)
- [x] pointer enter / move / leave
- [x] prefers-reduced-motion (OS + demo toggle)
- [x] TV / present
- [ ] hover / focus / press on card CTA — later
- [ ] loading / success / error — not required yet

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS 3D pose + CSS sheen; vgpu stage | Figma card face must stay `#000` |
| Yaw / pitch | ~±8° / ±5° × feel knob | Stage prop; live timing, not tokens |
| Return | damped lerp | not a hard snap |
| Sheen / light | Quiet CSS wash **only while pointer is on the card face**; snap off on leave | no rest sheen, no idle center, no leftover specular |
| Band | none | critique killed parked highlight / band |
| Card face | solid `#000` | Figma lock; no center bloom |
| Bezel | CSS `preserve-3d` side faces + rim + contact shadow | physical object; not WebGL on the card face |
| Stage bg | vgpu black + TL grey + quiet pointer cloud | behind the card; not Bayer wave |
| Mark | Bloub engine, capsule + bleu, 30s curl / 30s break on Back v1 | Catalog expressions; refuse `defaultCycle` and idle→thinking→wide |

## Acceptance criteria

- [ ] Demo route `/demos/maser-bot-card` renders Figma-scaled 1299 card face
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Square 1299 (not landscape, not 3:4)
- [ ] Locked copy typeset in Figma boxes, verbatim
- [ ] Product does not import demo chrome or `--lab-*` as its look
- [ ] Reduced motion: no tilt, no sheen, bg still (black + TL grey), mark planted `neutre`, no curl or pointer chase, face swap without 3D flip
- [ ] Card face is solid `#000`. Stage is vgpu (TL grey + pointer cloud). Capsule bleu `#3b93f0` on **Back v1**. Wordmark on Front v1.
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
- Plate solid `#000`. No idle light. Pointer sheen only. vgpu = stage field (not Bayer wave).
- Mark: Bloub engine; capsule; bleu `#3b93f0`; 30s curl / 30s break on Back v1 only. Catalog: neutre → attentif → curieux → mefiant → thinking → fier → neutre. Refuse `defaultCycle`, idle→thinking→wide, and Maser blue `#10A4FF`.
- Product never imports demo chrome.
