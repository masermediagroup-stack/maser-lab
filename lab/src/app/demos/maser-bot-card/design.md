# Maser bot card — teaching demo

Lab experiment for the Dallas meetup stage demo. Not a client. One PR in maser-lab. Rehearse by commit reset — do not trash the staged baseline.

Shell chrome is already on main. This package is the **card product** only.

Status: **Figma static recut (2026-09-08), faces flipped.** File **GrokBot-Loop-DemoCard**. **Front v1 = node `1:20` (frame at 0,0) — mark-forward wordmark.** **Back v1 = node `1:2` (frame at 1501,0) — identity.** Wordmark vector `1:22`. v2 / v3 and Assets parked. Artboard **1299×1299**. Scale from that board. Do not invent a second proportion. Do not eyeball.

## Reader and job

Stage audience: new → intermediate Grok Bot users. 8–12 min live demo of our Lab loop (Figma → design.md → Spark), not a prompt-only magic trick.

Job of the artifact: a simple, fun **Maser** bot card. Readable from the back of the room. Pointer makes it feel alive (tilt + shine). Background can be interactive / shader-ish. Teaching prop first; portfolio piece second.

## Thesis (Figma lock)

Steal Zoah founding-member **structure**: a single card as the hero, pointer-driven 3D tilt, specular shine that tracks the mouse, quiet return to rest.

Refuse Zoah skin: founding-member dither, Zoah type, Zoah colors, member-number chrome, community profile layout. Refuse generic AI glass cards, stock purple gradients, Inter, Geist, and system grotesk on the **product**. Refuse landscape recut. Refuse Maser blue `#10A4FF` on the capsule. Refuse rewriting locked copy. Refuse dither **on the card face**.

## Scope

In: the card (face, type, color, mark, tilt, shine, interactive bg), demo knobs for those behaviors, empty/loading/error if the demo needs them.

Out: lab shell chrome (already locked on main). Stage script (Copy). Prompt-only rebuild of the card.

## States

| State | Behavior |
| --- | --- |
| Rest | Card planted. No tilt. No sheen. No idle center light. |
| Front | Front v1 (`1:20`): white Grok Bot wordmark. No animated mark. |
| Back | Back v1 (`1:2`): identity — live capsule + name, role, bio. |
| Flip | View front/back control toggles faces. Not hover-only. |
| Pointer enter | Track pointer. Tilt + quieter sheen arm only while the pointer is on the card face. |
| Pointer move | Tilt follows pointer (X/Y). Quiet sheen tracks the pointer on the card face. Stage cloud follows on the field. |
| Pointer leave | Tilt eases back. Sheen dies clean (including a fast swipe). No stuck glow. |
| Reduced motion | No tilt. No sheen. Stage still (black + TL grey). Mark planted `neutre`. Honor OS + demo toggle. |
| TV / present | Fullscreen card, zero chrome (Esc out). Stage mode. |
| Empty / missing mark | Honest fallback — never a broken layout. Copy owns the line. |

Hover, focus-visible, and press belong to any controls on the card (CTA later). Map them when Figma shows them.

## Open knobs (demo chrome — not product)

Until Figma locks values, Spark may scaffold knobs only:

- **Tilt** — on/off, max angle feel (leave numbers to live timing)
- **Shine** — on/off, quiet intensity (pointer-only; no rest sheen)
- **Face** — front / back (same as the product flip control)
- **Bg** — calm (black + TL grey, no cursor cloud) / interactive (quiet pointer cloud). vgpu stage only — not the card face.
- **Replay / reduced motion** — shared lab row

Look knobs live in the demo. The product card never imports demo chrome.

## Observable decisions so far (Verb+Noun)

- Hold Shape until Figma lands.
- Steal Zoah tilt+shine structure; refuse Zoah skin.
- Recut card face to Figma 1299×1299 square, radius 80, fill `#000000`. Scale from the board.
- Wordmark on **Front v1** (`1:20`). Live capsule + identity type on **Back v1** (`1:2`). No capsule on front. No animated mark on front.
- Card face stays solid `#000`. No idle center light, rest sheen, parked highlight, or center bloom. Tilt + quieter sheen only while the pointer is on the card. Leave (including a fast swipe) kills the light clean.
- CSS 3D slab: thin bezel around the square portrait (`preserve-3d`, side faces). A rim highlight rides the near edge with the pointer. Soft contact shadow under the card. Type stays flat Display Trial — not embossed, not metallic. Do not put the card face on WebGL.
- Stage bg is vgpu: black field, small grey gradient from the top-left, plus a small quiet cloud-type cursor following the pointer. Not the old Bayer/wave dither. Not on the card face or the type. Pointer moves the card, not a wallpaper.
- Lock Back v1 mark to Bloub engine, capsule, bleu `#3b93f0`. Curl catalog expressions on **Back v1 only**: neutre → attentif → curieux → mefiant → thinking → fier → neutre across ~30s, then 30s neutre break (pointer gaze), then curl again. Refuse `defaultCycle`, the old idle→thinking→wide curl, and Maser blue `#10A4FF`.
- Typeset **only** Front v1 (`1:20`) and Back v1 (`1:2`) plus wordmark `1:22`. Every other frame in GrokBot-Loop-DemoCard (v2/v3, Assets, parked ideas) stays parked. Do not pull extra type, marks, or layouts from them.
- One card as the hero. No collage of windows.
- Encode every Figma lock into this file the same turn it lands.

## Named refusals

- Prompt-only card with no Figma path
- Zoah dither / founding-member skin
- Vercel triangle, vbg grain, Geist on the **product** (shell may stay Geist)
- Generic glassmorphism / purple SaaS gradient
- Orbiting chrome bands or Dallas wallpaper morphs on this card
- Motion that ignores reduced-motion
- Inventing a second plate proportion or eyeballing off 1299
- Zoah horizontal / landscape card
- Maser blue `#10A4FF` on the capsule
- Geist / Inter / system grotesk on the product
- Dither on the card face
- Rewriting locked body copy
- Hover-only face reveal (no flip control)
- Zoah embossed / iridescent type
- Typesetting parked GrokBot-Loop-DemoCard frames (v2/v3, Assets, extra marks) onto the card
- Idle center light / rest sheen / leftover specular after pointer leave
- Old travelling Bayer dither wave on the stage
- Geist / Inter / system grotesk if the UniversalSans TTF is missing — leave the named `@font-face`; do not substitute

## Tokens (Figma static — 2026-09-08)

Scale every box as `n / 1299` of the card face. Artboard 1299×1299.

- Card face: 1299×1299, corner radius 80, fill `#000000`
- Type: `#FFFFFF`
- Family: **UniversalSansGrokTest Display Trial** (name table id 16). Metrics: name 96/400, role and body 64/300, leading 1.2. Vendor `lab/public/maser-bot-card/UniversalSansGrokTest-Display-Trial.ttf` (12252 bytes, style 400 only). Use that same face for 300 slots at Figma size. Do not substitute Geist, Inter, or a system grotesk. Two other files exist (Text Trial 300 and Text Trial 400) — **do not load them**. Figma specifies Display. Do not swap Display for Text.
- Capsule: bleu `#3b93f0`. Paper holes = card face `#000000`. Refuse `#10A4FF`.

## Hand-off

- **EP:** Shape + fill this file when Figma drops.
- **Spark:** env prep only — demo route + chrome knobs. No invented look. Fresh URL when anything boots.
- **Copy:** stage script. Card strings when Figma has slots.
- **Groot:** quiet unless asked.

## Locked copy (verbatim — do not rewrite)

Figma face lock (2026-09-08). Old Producer-only role and prior bodies are stale. Do not rewrite. Curly apostrophes. Meta: none. No extra lockup line.

- Name: mace
- Role: Chief of Staff/Producer
- Body: Chief of staff for the creative team. Turns a vague ask into a clear brief, keeps everyone on the same job, and locks decisions so work doesn’t drift. Doesn’t design, write, or build — keeps the room moving.
- Meta: none.

## Figma static lock (2026-09-08)

File: **GrokBot-Loop-DemoCard**. **Front v1 = `1:20` (frame at 0,0)**. **Back v1 = `1:2` (frame at 1501,0)**. Wordmark `1:22`. Human confirm 2026-09-08: faces flipped; these two frames only. Other frames in the file are parked ideas/assets — do not typeset them onto the card.

Front v1 (mark-forward, `1:20`):

- Same card face. No capsule. No animated mark on this face.
- White Grok Bot wordmark vector, box x 100, y 988, w 1100, h 212. Bottom-anchored. Exact SVG from node `1:22`. Do not typeset a fake logotype.

Back v1 (identity, `1:2`):

- Live capsule (Grokbot-animations engine, `capsule`, bleu `#3b93f0`). Replace the Figma still (mac logo black eyes, 272×162 at x 100, y 142). Place and size the live mark **in that box**. Do not float it. Do not ship the still. Thinking may briefly leave the capsule (engine) and clips to the slot.
- Name: mace. UniversalSansGrokTest Display Trial 400, 96px, leading 1.2, white, right. Box x 969, y 138, w 231, h 68.
- Role: Chief of Staff/Producer. 300, 64px, leading 1.2, right. Box x 574, y 253, w 626, h 45.
- Body: 300, 64px, leading 1.2, left. Box x 97, y 692, w 840, h 512. Verbatim — do not rewrite.

Live behavior (after static):

1. Tilt + quieter sheen on the **card face** only while the pointer is on the card. Card face stays the Figma square `#000`. No rest sheen, idle center light, parked highlight, or center bloom. Flip control stays (View front / View back), not hover-only. On leave, including a fast swipe off the card, the light dies clean. Reduced motion: planted, no sheen at all.
2. Stage background **behind** the card, not on the card face and not the type: black field, small grey gradient from the top-left, plus a small quiet cloud-type cursor shader that follows the pointer. Shader is **vgpu**. Not a new raw WebGL stack. Not the old dither wave.
3. Card face stays solid `#000000` so type and capsule read as the Figma file.
4. Physical object: CSS 3D thin slab bezel + contact shadow. Pointer moves the card. Do not put the card face on WebGL.

## Orientation (locked 2026-09-05)

Square / vertical. Not Zoah’s horizontal member card. Steal tilt + sheen (+ optional band) + flip. Refuse landscape and embossed type.

Portrait first. Stage-readable from the back of the room. Scaffold the demo frame as a portrait card, not a landscape profile.

## Observable decisions (add)

- Park Copy lines verbatim. Do not rewrite.
- Lock card Name to **mace** (not Maser). Role **Chief of Staff/Producer**.
- Recut card face to Figma 1299 square. Wordmark on Front v1 (`1:20`). Capsule in the 272×162 box on Back v1 (`1:2`). Do not invent spacing.
- Park every other GrokBot-Loop-DemoCard frame. Do not typeset them.
- Stage field is vgpu behind the card (TL grey + pointer cloud). Do not bake it into the card face.
- Set card orientation to 1299 square. Refuse Zoah landscape.

## Card faces (locked 2026-09-05)

Two sides. Not a hover peek.

| Face | Job |
| --- | --- |
| Front | Front v1 (`1:20`): white Grok Bot wordmark vector. No capsule. |
| Back | Back v1 (`1:2`): live capsule + name, role, bio (Figma boxes). |

Toggle with an explicit **View front / View back** control (flip). Do not use hover-only to reveal the other face. Focusable, keyboardable, reduced-motion safe (instant swap or opacity crossfade when motion is off).

## Light (steal from Zoah craft — structure only)

Three layers on the card:

1. **Tilt** — pointer-driven CSS 3D with a readable thin slab edge.
2. **Sheen** — quieter specular across the card face, tracks the pointer, only while on the card.
3. **Bezel / rim** — extruded side faces; a thin rim highlight rides the near edge with the pointer. Soft contact shadow under the card.

Refuse Zoah embossed / iridescent type treatment. Our type is flat UniversalSansGrokTest Display Trial, not a metallic fill. Refuse Zoah purple, member chrome, landscape, and Zoah dither on the card face.

## Observable decisions (add)

- Build two faces: mark-forward Front v1, identity Back v1.
- Flip via View front/back control. Refuse hover-only reveal.
- Stack tilt + sheen + optional band. Refuse embossed/iridescent type.

## Zoah craft notes (structure only — 2026-09-05 inspect)

Steal:

- Pointer X → yaw, Y → pitch. Live feel (~±16° yaw / ±10° pitch) so the thin slab edge reads on tilt — stage prop, not a flip toy. Do not freeze these as product tokens until Figma + timing.
- Ease back to rest with a damped return (spring/lerp feel).
- Sheen is a broad specular wash steered by pointer, plus a rim highlight that counter-shifts. Not a single CSS diagonal streak alone.
- Thickness / rim read on the **card face** while tilting.

Refuse (confirmed):

- Zoah ~1.59:1 landscape proportion and founding-member hierarchy (avatar → name → handle → badge → meta → oversized ID).
- Dither/hash bg skin, metallic embossed type, Zoah palette/brand.
- Pointer that only retextures the bg; our bg response stays optional and ours.

## Build order (locked 2026-09-05)

Zoah’s plate is WebGL2; bg is a separate low-res WebGL. We steal the *feel* (pose + specular), not their stack.

1. **CSS first** — square/vertical front/back, flip control, tilt pose (rehearsal).
2. **vgpu plate** — Track A override 2026-09-05 evening. Pointer drives tilt + shine + light on the card. Not CSS-only.
3. **Bloub-style SVG mark anim** — later, optional, only if Figma wants a living mark. Do not invent the logo anim.

Refuse Zoah skin. EP owns look from Figma. Spark does not invent type/layout/mark.

## Tech reconcile (locked 2026-09-05)

Card interaction = **CSS 3D tilt + specular overlay + front/back flip**. That is enough. Do not put the plate on WebGL by default.

Zoah page canvases are mainly **environment** (starfield / noise). Optional **vgpu** is for stage **background** only — not the card plate.

Meetup default: CSS portrait card. Optional vgpu = stage bg. Bloub mark anim stays later-optional.

Overrides earlier “optional vgpu plate if CSS feels flat” — plate stays CSS unless EP reopens after Figma.

**Superseded the same evening** by Track A override below. Keep this section as history.

## Track A override (locked 2026-09-05 evening)

Plate + interactivity: **vgpu / WebGL** for a premium shader look. Not CSS-only. Pointer drives tilt + shine + light on the card.

Surfaces (until Figma tokens):

- Card bg: dark-mode gray
- Text: white
- Type: **Universal Sans** (local file — wait for Figma / font handoff; do not substitute Geist on the product)
- Mark: stock bloub **bleu** (`#3b93f0`). Refuse Maser blue `#10A4FF` on this mark

Portrait / square stays. Front copy parked verbatim. Mark animation is locked in the section below — not optional later.

**Superseded 2026-09-08** by the Figma static lock, then critique: the **card face** is solid `#000` CSS. No idle light. Pointer sheen only while on the card face. **vgpu is the stage field** (TL grey + pointer cloud), not the card face and not the old dither wave.

## Mark animation (locked 2026-09-06 — Grok meetup capsule)

Repo inspect: `/workspace/grokbot-animations-inspect` (org fork of **bloub**, live https://bloub.vercel.app). Engine is pure JS time → radial silhouette (`BotEngine.sample`), not SMIL / CSS path morph. Eyes are mask holes (`capsulePath`), not white overlays.

Context: **Grok Bot meetup** teaching demo — mark reads as Grok, not Maser brand chrome.

**Locks (human 2026-09-08):**
- Keep the Bloub engine. Do **not** hand-redraw a static capsule SVG. Do not ship the Figma still.
- Body: ShapeId **`capsule`** — horizontal stadium as shipped (`skins.ts`). Vertical pill refused unless human reopens.
- Color: stock bloub **`bleu` `#3b93f0`**. Refuse Maser blue `#10A4FF` on this mark.
- Eyes: paper stadium holes. `paper` = card face `#000000`.
- Loop lives on **Back v1 only** (`1:2`). Slot 272×162 at x 100, y 142. Size and place to that box; do not float. No animated mark on Front v1 (`1:20`).
- **30s curl, then 30s break, then curl again.** Repeat. Not a one-shot. Not `defaultCycle`. Not idle→thinking→wide.
- Curl beats (catalog IDs, in order, spread across ~30s; time feel on the live preview — do not freeze guessed ms as tokens):
  1. `neutre`
  2. `attentif`
  3. `curieux`
  4. `mefiant`
  5. `thinking` (body may leave capsule — engine truth, accept it)
  6. `fier`
  7. `neutre`
- **Break (30s):** stay `neutre` / capsule. Eyes follow the pointer. Expression gaze is off during the break so the pointer owns the look. During the curl, the expression owns the gaze — do not fight it with cursor follow.
- Reduced motion: plant `neutre`, no curl, no pointer chase.

**Spark:** wire now — `shape="capsule"`, `color="bleu"` (`#3b93f0`), loop above. Fresh unique URL. Time feel on the live preview.

## Critique (2026-09-08)

Say **card face**, not plate.

- Match Front v1 / Back v1 spacing to Figma boxes. Do not invent spacing.
- Type: UniversalSansGrokTest Display Trial 400, vendored at `lab/public/maser-bot-card/UniversalSansGrokTest-Display-Trial.ttf` (name table: UniversalSansGrokTest Display Trial 400, 12252 bytes). `@font-face` 300 and 400 both load that file. Do not substitute Geist. Do not load Text Trial 300/400. If 300 is missing from Display, keep Display 400 at Figma size.
- Back v1 mark slot: 272×162 at x 100, y 142. Live capsule, stock bleu, same curl. Size and place to that box. Do not float it.
- Card face: solid `#000000`. Kill idle center light. No rest sheen, parked highlight, or center bloom.
- Pointer light: keep tilt + a quieter sheen only while the pointer is on the card. On leave, including a fast swipe off the card, the light dies clean. No stuck glow, no flash, no leftover specular. Reduced motion: no sheen at all.
- Physical craft (Zoah videos / zoah.com founding-card as **feel** only): CSS 3D thin slab bezel around the square portrait (`preserve-3d` side faces). When it tilts, the edge is visible. A thin cool-white rim highlight rides the near edge with the pointer. Soft contact shadow under the card so it sits in the room. Face stays black. Type stays flat Display Trial — not embossed, not metallic. Not landscape. Not purple. Not member chrome. Not Zoah dither on the card face. Do not put the card face on WebGL.
- Stage behind the card, not on the card face and not on the type: black field, small grey gradient from the top-left, plus a small quiet cloud-type cursor shader (vgpu). Not the old dither wave. Pointer moves the card, not a wallpaper.
- Copy stays verbatim. Flip control stays.

