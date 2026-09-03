# Dallas Meetup TV Wallpaper — Design Directives

USER LOCK. Pivot of PR 63. Do not defend the old cut. This file is the correction log. Named tokens only. Do not invent type, spacing, or layout. Display is Universal Sans. Body/labels IBM Plex Sans Condensed. Geist is out. No new shader — canvas 2D only (vgpu if any later engine work).

## Killed, fully

- Dallas skyline: Noun Project, dither, horizon, any silhouette under the globe.
- Grok body morph / picker silhouettes / SDF shape cycle.
- HEX cycling / shape→color pairs / globe fill changes. Body stays Black `#000000` forever (`--dallas-grok-black`).
- Eye-whip around the form. Eyes do not orbit the disc. Eyes do not leave the face.
- Globe yaw / 360 disc spin / any body turn. Face-forward. No axis yaw.

## Paper, ink, disc

`--dallas-paper` `#F2F1ED` is the wallpaper ground — not pure white.
`--dallas-ink` `#111111` is type and the Cursor cube. Not the Grok fill.
`--dallas-grok-black` `#000000` is the Grok disc, forever.

Universal Sans trial (`UniversalSansGrokTest Display Trial` / 400) on the one canvas display line. IBM Plex Sans Condensed on everything small. 40% size check. Geist is out. Never fetch xAI webfonts. Cube and type stay clean.

## Surface (do not invent)

- Canvas 1920×1080. Paper ground.
- Cursor cube: official 2D mark, ink, uniform scale from viewBox `466.73 × 532.09`, ~280px tall. Draw the **whole cube**. The inner cutout is a bug — stop trimming or masking the mark. Cube stays clean (no ribbons).
- Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. **Circle disc.** Face-forward. No body rotate.
- One display line: `Dallas meetup`. Universal Sans trial, exactly once, 44px @ 1920, tracking ~2.4.
- Draw order: paper → cube + disc (kick ribbons on the mark only) + type.

## Grok = article Idle / Working only

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → one kick → Idle.** Do not use Thinking, Waiting, Blocked, or Done.

- Black `#000000` disc. Solid. No meridians, filaments, Lambert, terminator.
- Official white stadium eyes, planted in the face. Stay white cutouts. Stay planted. They may pump more upright during the kick. They do not whip around the form. They do not leave the face.
- No picker morph. Rest and kick are the same disc.

Refs (article Working, Benji Taylor):

- `article-working-thickness.png` — thickness and planted eyes. Ribbon width ≈ one white stadium eye-bar ≈ **~8% of face height (~24px if the face is 300px)**. Rounded hemispherical caps. Distinct clean paths, not a nest. Flat fills, no gradients, no drop shadows. Depth only via occlusion (ribbons pass behind the disc).
- `article-working-cross-eye.png` — ribbons cross the left eye. Tails occluded behind the bottom-left of the disc. Wrap front/back, clip on the disc, cross the eyes, then leave.

## Timing — 8s (do not shorten)

Loop = **8s**. Whip slider 0.5–0.7s; rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Super-fast means the whip is short.

| Beat | Duration | Article state | Job |
| --- | --- | --- | --- |
| Rest | 6.4s | **Idle** | Face-forward planted black disc. White stadiums planted. **No ribbons.** Cube clean. |
| Whip | 0.6s | **Working** | Same black disc. Eyes planted (may pump more upright). 2–4 article-thick Ver 02 ribbons wrap, clip, cross the left eye, leave. |
| Settle | ~1.0s | **Idle** | Same disc. Planted Idle eyes. No ribbons. |

**Reduced motion:** freeze Idle (black disc, planted Idle eyes, no ribbons).

## Kick ribbons (the only motion)

2–4 flat Ver 02 chromatic ribbons. Much thicker than the old hairlines. Match the two article Working frames.

- Stroke **~8% of face height** (~24px at 300px). Rounded hemispherical caps (`lineCap` round).
- Plane **−15°**. Wrap front/back. Back occluded by the disc. Front clipped to the disc. Cross the eyes. Then leave. Not a nest. Not Thinking. Not parked at rest.
- Flat named HEX. No gradients. No drop shadows. Depth only via occlusion.
- Random assignment **per kick** from the nine Ver 02 chromatic tokens. Skip Cool Gray `#777777` (`--dallas-grok-gray`). Skip body-fill cycling — ribbons only.

| Token | Hex |
| --- | --- |
| `--dallas-grok-gold` | `#97683D` |
| `--dallas-grok-red` | `#FF263C` |
| `--dallas-grok-orange-red` | `#FF6700` |
| `--dallas-grok-orange` | `#FF9800` |
| `--dallas-grok-green` | `#00C972` |
| `--dallas-grok-teal` | `#00BCA6` |
| `--dallas-grok-blue` | `#1084FE` |
| `--dallas-grok-violet` | `#9159FE` |
| `--dallas-grok-magenta` | `#FF309B` |

Gray `--dallas-grok-gray` `#777777` is a named token and is never a ribbon and never a body fill.

## Cursor cube

Official 2D cube, `--dallas-ink`. Draw the whole mark. Do not even-odd punch the inner fold. No ribbons on the cube. Type lockup stays clean.
