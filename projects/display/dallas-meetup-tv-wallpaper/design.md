# Dallas Meetup TV Wallpaper — Design Directives

USER + EPG LOCK. Remake of PR 63. Later interrupts win. Do not defend the black-disc rebuild or the jagged solid cube. This file is the correction log. Named tokens only. Do not invent type, spacing, or layout. Display is Universal Sans. Body/labels IBM Plex Sans Condensed. Geist is out. No new shader — canvas 2D only (vgpu if any later engine work).

## Killed, fully

- Dallas skyline: Noun Project, dither, horizon, any silhouette under the globe.
- Grok body morph / picker silhouettes / SDF shape cycle / HEX body cycling.
- **Black-disc reconstruction.** Solid `#000000` circle + white stadiums is the live bug (`live-broken`). Inverse of the official product face.
- **Jagged solid Cursor polygon.** Outer-only / `nonzero` flood / bbox-trim / flattened hexagon. The hole is the cursor.
- Eye-whip around the form. Eyes do not orbit. Eyes do not leave the product face.
- Globe yaw / 360 disc spin / any body turn.
- Ribbons on the Cursor cube. Type lockup stays clean.

## Official marks (beginning of this create)

Refs (commit these into the PR):

| File | Job |
| --- | --- |
| `live-broken` | Bug. Solid jagged Cursor + smashed overlapping white pills on a black disc. Kill it. |
| `CUBE_2D_DARK.svg` | Official Cursor mark. Hexagon with cursor-shaped hole. |
| `grok-bot-face-tight.png` | Official Grok product face. Light organic head, two **black** stadiums, asymmetric. |
| `beginning-promo-1080.png` | Official product faces side by side on paper. |

Shipped under `lab/public/assets/dallas-meetup-tv-wallpaper/`.

## Paper / ink / head / eyes

`--dallas-paper` `#F2F1ED` is the wallpaper ground — not pure white.
`--dallas-ink` `#111111` is type and the Cursor cube fill. Not a Grok fill.
`--dallas-grok-head` `#FFFFFF` is the Grok organic head fill (product face). Never a black disc.
`--dallas-grok-black` `#000000` is the Grok **stadium eyes**, not the body.

Universal Sans trial (`UniversalSansGrokTest Display Trial` / 400) on the one canvas display line. IBM Plex Sans Condensed on everything small. 40% size check. Geist is out. Never fetch xAI webfonts.

## Cursor

Ship the official SVG path as the mark. viewBox `0 0 466.73 532.09`. Exact path:

```
M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3-9.46,9.3-16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z
```

On paper: fill `--dallas-ink`. `fill-rule: evenodd`. The second subpath (`M444.05…`) **is** the cursor hole — leave it transparent so paper shows through.

NEVER bbox-trim, flood-fill, flatten to a solid polygon, drop the inner subpath, or fill the hole with `nonzero`. Live solid jagged hexagon = the bug.

~280px tall, uniform scale from the viewBox. Cube stays clean (no ribbons).

## Grok

Back to the beginning of this create — official product / app-icon face.

- Light organic head (not a perfect circle). Paint from `grok-bot-face-tight.png` via `drawImage`.
- Two **black** stadium eyes, asymmetric, tilted inward at the top. Inverse of the live cut.
- Do NOT rebuild as black disc + white eyes. Live overlapping white pills = dead.
- Rest and kick are the same product face. No morph. No HEX cycle. Body stays the light head forever.
- Eyes stay planted on that product face. They do not whip. They do not leave.

## Surface (do not invent)

- Canvas 1920×1080. Paper ground.
- Cursor cube ~280px tall. Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Face-forward. No body rotate.
- One display line: `Dallas meetup`. Universal Sans trial, exactly once, 44px @ 1920, tracking ~2.4.
- Draw order: paper → cube (clean) + Grok (kick ribbons on the head only) + type.

## Motion — Idle / Working only

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → one kick → Idle.** Do not use Thinking, Waiting, Blocked, or Done.

Idle: official Cursor + official Grok pair. **No ribbons.**
Kick: 2–4 thick flat Ver 02 ribbons around **Grok only**. Cube stays clean.

Ribbons MUST fire during the kick. Orbit radius hugs the head (not a 42px halo outside the clip). Front clipped to the organic silhouette. Back occluded by the head. Cross the eyes, then leave.

## Timing — 8s (do not shorten)

Loop = **8s**. Whip slider 0.5–0.7s; rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Super-fast means the whip is short.

| Beat | Duration | Article state | Job |
| --- | --- | --- | --- |
| Rest | 6.4s | **Idle** | Official pair. No ribbons. Cube clean. |
| Whip | 0.6s | **Working** | Same product face. 2–4 article-thick Ver 02 ribbons wrap, clip, cross the eyes, leave. |
| Settle | ~1.0s | **Idle** | Same pair. No ribbons. |

**Reduced motion:** freeze Idle (official pair, no ribbons).

## Kick ribbons (the only motion)

2–4 flat Ver 02 chromatic ribbons. Thickness ≈ one stadium eye-bar ≈ **~8% of face height (~24px if the face is 300px)**. Rounded hemispherical caps. Distinct clean paths, not a nest. Flat fills, no gradients, no drop shadows. Depth only via occlusion.

- Plane **−15°**. Wrap front/back. Clip on the head. Then leave.
- Random assignment **per kick** from the nine Ver 02 chromatic tokens. Skip Cool Gray `#777777`. Skip body-fill cycling — ribbons only.

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
