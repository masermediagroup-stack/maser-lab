# Maser bot card — teaching demo

Lab experiment for the Dallas meetup stage demo. Not a client. One PR in maser-lab. Rehearse by commit reset — do not trash the staged baseline.

Shell chrome is already on main. This package is the **card product** only.

Status: **Figma static recut (2026-09-08)**. File **GrokBot-Loop-DemoCard**. Front frame `1:2`. Back frame `1:20`. Wordmark vector `1:22`. Artboard **1299×1299**. Scale from that board. Do not invent a second proportion. Do not eyeball.

## Reader and job

Stage audience: new → intermediate Grok Bot users. 8–12 min live demo of our Lab loop (Figma → design.md → Spark), not a prompt-only magic trick.

Job of the artifact: a simple, fun **Maser** bot card. Readable from the back of the room. Pointer makes it feel alive (tilt + shine). Background can be interactive / shader-ish. Teaching prop first; portfolio piece second.

## Thesis (Figma lock)

Steal Zoah founding-member **structure**: a single card as the hero, pointer-driven 3D tilt, specular shine that tracks the mouse, quiet return to rest.

Refuse Zoah skin: founding-member dither, Zoah type, Zoah colors, member-number chrome, community profile layout. Refuse generic AI glass cards, stock purple gradients, Inter, Geist, and system grotesk on the **product**. Refuse landscape recut. Refuse Maser blue `#10A4FF` on the capsule. Refuse rewriting locked copy. Refuse dither **on the plate**.

## Scope

In: the card (face, type, color, mark, tilt, shine, interactive bg), demo knobs for those behaviors, empty/loading/error if the demo needs them.

Out: lab shell chrome (already locked on main). Stage script (Copy). Prompt-only rebuild of the card.

## States

| State | Behavior |
| --- | --- |
| Rest | Card planted. No tilt. Shine idle or off. Bg calm. |
| Front | Identity face showing (name, role, bio). |
| Back | Mark-forward face showing (logo + short lockup). |
| Flip | View front/back control toggles faces. Not hover-only. |
| Pointer enter | Track pointer. Tilt + shine arm. |
| Pointer move | Tilt follows pointer (X/Y). Shine streak tracks pointer across the face. Bg may respond. |
| Pointer leave | Ease back to rest. Shine settles. |
| Reduced motion | No tilt. No shine chase. Bg static or a single still frame. Honor OS + demo toggle. |
| TV / present | Fullscreen card, zero chrome (Esc out). Stage mode. |
| Empty / missing mark | Honest fallback — never a broken layout. Copy owns the line. |

Hover, focus-visible, and press belong to any controls on the card (CTA later). Map them when Figma shows them.

## Open knobs (demo chrome — not product)

Until Figma locks values, Spark may scaffold knobs only:

- **Tilt** — on/off, max angle feel (leave numbers to live timing)
- **Shine** — on/off, intensity
- **Band** — on/off for optional diagonal light mask
- **Face** — front / back (same as the product flip control)
- **Bg** — calm (still dither) / interactive (travelling dither). vgpu stage only — not the plate.
- **Replay / reduced motion** — shared lab row

Look knobs live in the demo. The product card never imports demo chrome.

## Observable decisions so far (Verb+Noun)

- Hold Shape until Figma lands.
- Steal Zoah tilt+shine structure; refuse Zoah skin.
- Recut plate to Figma 1299×1299 square, radius 80, fill `#000000`. Scale from the board.
- Capsule on **front**. White Grok Bot wordmark vector on **back**. No capsule on back.
- Plate stays solid `#000`. Tilt + sheen + light are pointer-driven CSS overlays. Do not bake dither into the plate.
- Stage bg is vgpu: black field + grey dither, wave/frequency, travel top-left → bottom-right. Quiet. Not rainbow, not grain soup, not on the type.
- Lock front mark to Bloub engine, capsule, bleu `#3b93f0`, cycle idle → thinking → wide → thinking → idle. Refuse `defaultCycle` montage and Maser blue `#10A4FF` on this mark.
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
- Dither on the plate
- Rewriting locked body copy
- Hover-only face reveal (no flip control)
- Zoah embossed / iridescent type

## Tokens (Figma static — 2026-09-08)

Scale every box as `n / 1299` of the plate. Artboard 1299×1299.

- Plate: 1299×1299, corner radius 80, fill `#000000`
- Type: `#FFFFFF`
- Family: **UniversalSansGrokTest Display Trial**. Name 400. Role and body 300. Leading 1.2. `@font-face` swap; do not substitute Geist, Inter, or system grotesk.
- Capsule: bleu `#3b93f0`. Paper holes = plate `#000000`. Refuse `#10A4FF`.

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

File: **GrokBot-Loop-DemoCard**. Front `1:2`. Back `1:20`. Wordmark `1:22`.

Front (identity):

- Live capsule (Grokbot-animations engine, `capsule`, bleu `#3b93f0`). Cycle idle→thinking→wide→thinking→idle. Box 273×162 at x 100, y 142. Thinking may briefly leave the capsule (engine). Accept that.
- Name: mace. 96 / 400. Box x 969, y 138, w 231, h 68. Right-edge of the box at 1200. Right aligned.
- Role: Chief of Staff/Producer. 64 / 300. Box x 574, y 253, w 626, h 45. Right-edge at 1200. Right aligned.
- Body: 64 / 300. Left aligned. Box x 97, y 692, w 840, h 512.

Back (mark-forward):

- Same plate. No capsule.
- White Grok Bot wordmark vector, box x 100, y 988, w 1100, h 212. Bottom-anchored. Exact SVG from node `1:22`. Do not typeset a fake logotype.

Live behavior (after static):

1. Tilt + sheen + light on the card (pointer-driven). Plate stays the Figma square `#000`. Flip control stays (View front / View back), not hover-only. Reduced motion: planted, no chase.
2. Stage background **behind** the card, not the plate: black field + grey dither. Slight motion, wave / frequency, travel top-left to bottom-right. Quiet. Not a rainbow, not grain soup, not on the type. Shader is **vgpu**.
3. Plate stays solid `#000000` so type and capsule read as the Figma file.

## Orientation (locked 2026-09-05)

Square / vertical. Not Zoah’s horizontal member card. Steal tilt + sheen (+ optional band) + flip. Refuse landscape and embossed type.

Portrait first. Stage-readable from the back of the room. Scaffold the demo frame as a portrait card, not a landscape profile.

## Observable decisions (add)

- Park Copy lines verbatim. Do not rewrite.
- Lock card Name to **mace** (not Maser). Role **Chief of Staff/Producer**.
- Recut plate to Figma 1299 square. Capsule on front. Wordmark on back.
- Stage dither is vgpu behind the card. Do not bake dither into the plate.
- Set card orientation to 1299 square. Refuse Zoah landscape.

## Card faces (locked 2026-09-05)

Two sides. Not a hover peek.

| Face | Job |
| --- | --- |
| Front | Identity: live capsule + name, role, bio (Figma boxes). |
| Back | Mark-forward: white Grok Bot wordmark vector. No capsule. |

Toggle with an explicit **View front / View back** control (flip). Do not use hover-only to reveal the other face. Focusable, keyboardable, reduced-motion safe (instant swap or opacity crossfade when motion is off).

## Light (steal from Zoah craft — structure only)

Three layers on the plate:

1. **Tilt** — pointer-driven 3D with readable thickness / rim.
2. **Sheen** — moving specular across the plate, tracks the pointer.
3. **Band (optional)** — diagonal light mask that shifts with tilt. Knob can mute it.

Refuse Zoah embossed / iridescent type treatment. Our type is flat and set from Figma, not a metallic fill gimmick.

## Observable decisions (add)

- Build two faces: identity front, mark-forward back.
- Flip via View front/back control. Refuse hover-only reveal.
- Stack tilt + sheen + optional band. Refuse embossed/iridescent type.

## Zoah craft notes (structure only — 2026-09-05 inspect)

Steal:

- Pointer X → yaw, Y → pitch. Restrained feel (~±8° yaw / ±5° pitch) — stage prop, not a flip toy. Live-time on the preview; do not freeze these as product tokens until Figma + timing.
- Ease back to rest with a damped return (spring/lerp feel).
- Sheen is a broad specular wash steered by pointer, plus a rim highlight that counter-shifts. Not a single CSS diagonal streak alone.
- Thickness / rim read on the plate while tilting.

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

**Superseded 2026-09-08** by the Figma static lock: plate is solid `#000` CSS. Tilt/sheen/light stay pointer-driven overlays. **vgpu is the stage dither**, not the plate. Do not bake dither into the plate.

## Mark animation (locked 2026-09-06 — Grok meetup capsule)

Repo inspect: `/workspace/grokbot-animations-inspect` (org fork of **bloub**, live https://bloub.vercel.app). Engine is pure JS time → radial silhouette (`BotEngine.sample`), not SMIL / CSS path morph. Eyes are mask holes (`capsulePath`), not white overlays.

Context: **Grok Bot meetup** teaching demo — mark reads as Grok, not Maser brand chrome.

**Locks (human 2026-09-06):**
- Keep the Bloub engine. Do **not** hand-redraw a static capsule SVG.
- Body: ShapeId **`capsule`** — horizontal stadium as shipped (`skins.ts`). Vertical pill refused unless human reopens.
- Color: stock bloub **`bleu` `#3b93f0`**. Refuse Maser blue `#10A4FF` on this mark.
- Eyes: paper stadium holes. `paper` = plate `#000000`.
- Front-face loop (curl, seamless): **idle → thinking → wide (interested/excited) → thinking → idle**. Repeat.
  - EP maps “interested/excited” → engine state **`wide`** (baseBody; keeps capsule).
  - `thinking` is `baseBody: false` — silhouette briefly leaves capsule for the thinking gag, then morphs back. Accept that (engine truth). Do not invent a custom thinking capsule.
- Refuse full ~31s `defaultCycle` montage on the card. Refuse orbit/burst/egg/hex on this face unless human adds them.

**Spark:** wire now — `shape="capsule"`, `color="bleu"` (`#3b93f0`), cycle above. Fresh URL. Time feel on the live preview; no invented ms.
