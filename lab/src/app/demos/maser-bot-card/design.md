# Maser bot card — teaching demo

Lab experiment for the Dallas meetup stage demo. Not a client. One PR in maser-lab. Rehearse by commit reset — do not trash the staged baseline.

Shell chrome is already on main. This package is the **card product** only.

Status: **skeleton**. Shape holds until the Figma drop lands. Type, color, mark, and layout lock from Figma → this file. Spark does not invent them.

## Reader and job

Stage audience: new → intermediate Grok Bot users. 8–12 min live demo of our Lab loop (Figma → design.md → Spark), not a prompt-only magic trick.

Job of the artifact: a simple, fun **Maser** bot card. Readable from the back of the room. Pointer makes it feel alive (tilt + shine). Background can be interactive / shader-ish. Teaching prop first; portfolio piece second.

## Thesis (open until Figma)

Steal Zoah founding-member **structure**: a single card as the hero, pointer-driven 3D tilt, specular shine that tracks the mouse, quiet return to rest. Optional later: Bloub-style SVG mark motion (https://bloub.vercel.app) — only if Figma wants a living mark.

Refuse Zoah skin: founding-member dither, Zoah type, Zoah colors, member-number chrome, community profile layout. Refuse generic AI glass cards, stock purple gradients, and Inter-on-white.

Maser voice lands with Figma. Placeholder assumption: dark card, one accent, one clear face (bot mark + name). Correct when Figma arrives.

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
- **Bg** — calm / interactive stage-bg stub (speed or intensity). Stage bg may still use vgpu; not required for this pass.
- **Replay / reduced motion** — shared lab row

Look knobs live in the demo. The product card never imports demo chrome.

## Observable decisions so far (Verb+Noun)

- Hold Shape until Figma lands.
- Steal Zoah tilt+shine structure; refuse Zoah skin.
- Use CSS 3D for tilt + front/back flip. Plate shine + light is vgpu / WebGL (Track A override 2026-09-05 evening). Stage bg may still use vgpu.
- One card as the hero. No collage of windows.
- Encode every Figma lock into this file the same turn it lands.

## Named refusals

- Prompt-only card with no Figma path
- Zoah dither / founding-member skin
- Vercel triangle, vbg grain, Geist on the **product** (shell may stay Geist)
- Generic glassmorphism / purple SaaS gradient
- Orbiting chrome bands or Dallas wallpaper morphs on this card
- Motion that ignores reduced-motion
- Inventing type scale, palette, or mark before Figma
- Zoah horizontal / landscape card
- Hover-only face reveal (no flip control)
- Zoah embossed / iridescent type

## Tokens

None named from Figma yet. Until then, surfaces (not `--maser-card-*` tokens):

- Card bg: dark-mode gray (`#242429` rehearsal)
- Text: white
- Type: **Universal Sans** (local file — wait for Figma / font handoff; do not substitute Geist on the product)
- Mark: Maser blue on the card (`#10a4ff`)

## Hand-off

- **EP:** Shape + fill this file when Figma drops.
- **Spark:** env prep only — demo route + chrome knobs. No invented look. Fresh URL when anything boots.
- **Copy:** stage script. Card strings when Figma has slots.
- **Groot:** quiet unless asked.

## Locked copy (verbatim — do not rewrite)

- Name: Maser
- Role: Producer
- Body: Takes the drop, writes the kickoff, parks what’s locked. Keeps Lab and Crew in sequence.
- Meta: skip.

## Orientation (locked 2026-09-05)

Square / vertical. Not Zoah’s horizontal member card. Steal tilt + sheen (+ optional band) + flip. Refuse landscape and embossed type.

Portrait first. Stage-readable from the back of the room. Scaffold the demo frame as a portrait card, not a landscape profile.

## Observable decisions (add)

- Park Copy lines verbatim. Do not rewrite.
- Set card orientation to square / vertical. Refuse Zoah landscape.

## Card faces (locked 2026-09-05)

Two sides. Not a hover peek.

| Face | Job |
| --- | --- |
| Front | Identity: name, role, bio (Copy parked verbatim). |
| Back | Mark-forward: logo + short lockup. |

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
- Mark: Maser blue on the card

Portrait / square stays. Front copy parked verbatim.

Optional later: animated Grok-style mark (idle / thinking / wink). Bloub is the motion ref. Do not invent the logo anim until human picks export vs custom.

This overrides “CSS plate only / vgpu = stage bg only.” Stage bg may still use vgpu; the **plate** is now vgpu too.
