# Dallas Meetup TV Wallpaper — Design Directives

USER OVERRIDE. Later interrupts win. Do not wait on Thinking frame files — implement from this lock; if EPG sends those paths mid-run, match line density to them. Named tokens only. Do not invent type, spacing, or layout. Display is Universal Sans. Body/labels IBM Plex Sans Condensed. Geist is out. No new shader — canvas 2D only.

Do not ask anyone to retime the thick-band cut or the light-head cut.

## Killed, fully

- Dallas skyline: Noun Project, dither, horizon, any silhouette under the globe.
- Grok body morph / picker silhouettes / SDF shape cycle / HEX body cycling.
- **Light organic / white head Grok.** App-icon PNG as the live Idle face. `grok-bot-face-tight.png` `drawImage`.
- **Static bitmap face.** Frozen crop. Eyes that never wink.
- **Smashed overlapping white pills** that sit still on the disc (the live-broken / light-head inverse). Gap must keep two distinct stadiums.
- **Stuck bottom-left stadiums.** Independent lower-left rest (`cx: −0.3 / cy: 0.28`) that never looks around.
- **Thick Working capsules.** Chunky mid / tapered-thick-middle stroke / `ORBIT_STROKE_FACE_RATIO ≈ 0.08` (~24px) / `drawTaperedRibbon` / `fillStrip`. Do not ship that cut again.
- Jagged solid Cursor polygon. Outer-only / `nonzero` flood / bbox-trim / flattened hexagon. The hole is the cursor.
- Eye-whip around the form. Eyes do not orbit the disc. Eyes do not leave the disc.
- Globe yaw / 360 disc spin / any **Grok** body turn. The disc stays planted.
- Ribbons on the Cursor cube. Type lockup stays clean.

## Refs (this override)

| File | Job |
| --- | --- |
| `article-idle-black-disc.png` | Idle: black disc, two planted white stadiums. Rest is a **gaze pair on the face**, not a BL crop. |
| Thinking frames (EPG, when they arrive) | Kick **line** density / weight. Sparse thin nest. Not Working ribbons. |
| `article-working-black-disc.png` | **Do not steal thickness from this.** Color + wrap only. |
| `CUBE_2D_DARK.svg` | Official Cursor. Hexagon with cursor-shaped hole. Keep. |

## Paper / ink / disc / eyes

`--dallas-paper` `#F2F1ED` is the wallpaper ground — not pure white.
`--dallas-ink` `#111111` is type and the Cursor cube fill. Not a Grok fill.
`--dallas-grok-black` `#000000` is the **Grok disc**, forever. Perfect solid circle. Never a light organic head.
`--dallas-eye-white` `#FFFFFF` is the **stadium eyes**, not the body.

Universal Sans trial (`UniversalSansGrokTest Display Trial` / 400) on the one canvas display line. IBM Plex Sans Condensed on everything small. 40% size check. Geist is out. Never fetch xAI webfonts.

## Cursor

Ship the official SVG path as the mark. viewBox `0 0 466.73 532.09`. Exact path:

```
M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3,9.46,9.3,16.11v-247.99c0,6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z
```

On paper: fill `--dallas-ink`. `fill-rule: evenodd`. The second subpath (`M444.05…`) **is** the cursor hole — leave it transparent so paper shows through.

NEVER bbox-trim, flood-fill, flatten to a solid polygon, drop the inner subpath, or fill the hole with `nonzero`. Live solid jagged hexagon = the bug.

~280px tall, uniform scale from the viewBox. No ribbons on the cube.

**Kick whip:** in the same 0.6s Working window as the Grok bands, the cube does a **quick 360° spin**, hard cubic ease-in-out, then lands face-forward / upright for Idle. Hole stays evenodd (paper through) while it spins. Reduced motion: cube planted, no spin.

## Grok

Article Idle / Working face. Draw as geometry.

- Perfect solid circle, fill `--dallas-grok-black` `#000000`. Not a squircle. Not a PNG.
- Two **white** stadiums (pills), planted on the disc as a **gaze pair**. Distinct gap. Asymmetric / slightly tilted.
- Rest looks at **camera / center** of the disc — **not** stuck bottom-left.
- Both stadiums move **together as a gaze**: look at different points on the screen (up, side, center), then return. Translate/rotate as a pair on the face.
- Eyes **wink** on Idle and through the kick. Not a static crop.
- Eyes stay planted on the disc. No eye-whip around the form. No orbit off the face.
- No morph. No HEX cycle. Disc stays black forever.

**Reduced motion:** freeze Idle (disc + planted pair at camera rest, no ribbons). Wink may freeze.

## Surface (do not invent)

- Canvas 1920×1080. Paper ground.
- Cursor cube ~280px tall. Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Grok face-forward. No Grok body rotate.
- One display line: `Dallas meetup`. Universal Sans trial, exactly once, 44px @ 1920, tracking ~2.4.
- Draw order: paper → cube (kick 360, else upright) + Grok (kick lines on the disc only) + type.

## Motion — Idle / Working only

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → one kick → Idle.** Do not use Thinking, Waiting, Blocked, or Done as the whip. Steal **Thinking line weight** for the kick orbits only.

Idle: official Cursor (upright) + black disc + gaze-pair white stadiums (look around, wink). **No lines.**
Kick: 2–4 **thin even** flat Ver 02 lines around **Grok only**, **and** Cursor 360 whip. Disc stays planted.

## Timing — 8s (do not shorten)

Loop = **8s**. Whip slider 0.5–0.7s; rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Super-fast means the whip is short.

| Beat | Duration | Article state | Job |
| --- | --- | --- | --- |
| Rest | 6.4s | **Idle** | Upright cube + black disc. Gaze pair looks up / side / center then returns. Wink. No lines. |
| Whip | 0.6s | **Working** | Cube 360 (ease-in-out) + 2–4 thin even Ver 02 lines wrap, clip, cross the eyes, leave. Eyes still wink. Disc planted. |
| Settle | ~1.0s | **Idle** | Cube upright. Same disc. No lines. |

**Reduced motion:** freeze Idle (upright cube, disc + planted pair, no lines, no spin).

## Kick lines (Grok only) — Thinking weight, not Working ribbons

2–4 flat Ver 02 chromatic **lines**. Even stroke weight. Hairline / thin orbits. Steal Thinking density (sparse thin nest), **not** the thick Working capsules.

- Stroke ≈ **~1% of face height** (~3px if the face is 300px). Same weight along the whole arc. Round caps. **No mid-arc fattening. No taper envelope.**
- Spread them out a little more around the disc — not a tight nest.
- Plane **−15°** base. Extra per-band plane / phase / radius jitter **seeded per kick**.
- Wrap front/back around Grok only. Clip on the **disc**. Cross the eyes. Then leave.
- Cube clean — no lines on Cursor.
- Random assignment **per kick** from the nine Ver 02 chromatic tokens. Skip Cool Gray `#777777`. Skip body-fill cycling — lines only.

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

Gray `--dallas-grok-gray` `#777777` is a named token and is never a line and never a body fill.
