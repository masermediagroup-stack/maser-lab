# Dallas Meetup TV Wallpaper — Design Directives

USER OVERRIDE. Later interrupts win. Named tokens only. Do not invent type, spacing, or layout. Display is Universal Sans. Body/labels IBM Plex Sans Condensed. Geist is out. No new shader — canvas 2D only.

Do not ask anyone to retime the thick-band cut or the light-head cut.

## Killed, fully

- **Thinking nest.** Orbital hairlines (~8–10 strokes). `drawWorkingOrbits`. Wrap front/back. 3% / 9px densify. Do not ship that cut again.
- **Working ribbons.** Thick mid capsules. Sparse 2–4 fat or thin bands. `drawTaperedRibbon` / `fillStrip` / `ORBIT_STROKE_FACE_RATIO`.
- **Orbits on Grok.** Any colored arcs, bands, lines, or filaments around the body. Morph is the kick body. Cursor spin is separate.
- **Globe yaw.** 360 disc spin / any **Grok** body turn. The silhouette stays planted. Morph in place.
- **Independent eye spin.** Each stadium does not rotate on its own. Tilt stays locked. Pair translates together.
- **Broken eyes during morph.** Stadiums stay white, readable, clipped to the SDF. Do not drop, dim, or detach them mid-blend.
- **Green body fill.** `#00C972` is a named token. It is not on the Ver 02 tree. Never a body fill.
- **Cool Gray.** `#777777` is a named token. Never a body fill. Never a line.
- Dallas skyline: Noun Project, dither, horizon, any silhouette under the globe.
- **Light organic / white head Grok.** App-icon PNG as the live Idle face. `grok-bot-face-tight.png` `drawImage`.
- **Static bitmap face.** Frozen crop. Eyes that never wink.
- **Smashed overlapping white pills** that sit still on the body. Gap must keep two distinct stadiums.
- **Stuck bottom-left stadiums.** Independent lower-left rest that never looks around.
- **Stuck top-right / 45° article Idle rest.** Steal paired gaze *travel* from article Idle. Our rest is upright + slight left. User overrules the article TR pose.
- **−28° / 45° stadiums.** Shape is vertical long axis, slight left lean (~−8° to −15°). Parallel pair.
- **Dim article Thinking eyes.** Wallpaper eyes stay **white** stadiums (gaze pair + wink). Do not copy the subdued charcoal pills. Article tree uses black eyes on dark — we keep WHITE.
- Jagged solid Cursor polygon. Outer-only / `nonzero` flood / bbox-trim / flattened hexagon. The hole is the cursor.
- Eye-whip around the form. Eyes do not orbit the body. Eyes do not leave the face.
- Ribbons on the Cursor cube. Type lockup stays clean.
- Independent HEX wraps (color cycling without its paired silhouette). Shape owns fill.

## Refs (this override)

| File | Job |
| --- | --- |
| `ver02_shape_color_tree.png` | **Morph targets.** 1:1 shape↔color. Eight official silhouettes. Skip Green. Skip Cool Gray. |
| `article_idle_gaze_pair.png` | **Steal paired gaze travel only.** Stadiums shift together around the face. Do **not** copy the stuck-TR / ~45° rest. |
| `article_working_upright.png` | **Shape lock.** More upright stadiums, slight left lean (~−8° to −15°). Parallel pair. |
| `article-idle-black-disc.png` | Cold-start rest: oval + Black `#000000`, two planted **white** stadiums. Rest is camera / slight-left, not a BL or TR crop. |
| `thinking_tight_crop.png` / `thinking_frame_01–03` | **Refuse.** Nest density is killed. Do not restripe Grok. |
| `article-working-black-disc.png` | **Refuse thickness.** Color family is named tokens / body fills — never drawn as bands. |
| `CUBE_2D_DARK.svg` | Official Cursor. Hexagon with cursor-shaped hole. Keep. |

## Paper / ink / body / eyes

`--dallas-paper` `#F2F1ED` is the wallpaper ground — not pure white.
`--dallas-ink` `#111111` is type and the Cursor cube fill. Not a Grok fill.
`--dallas-grok-black` `#000000` is the **cold-start rest** fill (irregular oval only, first Idle). After the walk returns to oval, fill is Orange-red.
`--dallas-eye-white` `#FFFFFF` is the **stadium eyes**, not the body.

Universal Sans trial (`UniversalSansGrokTest Display Trial` / 400) on the one canvas display line. IBM Plex Sans Condensed on everything small. 40% size check. Geist is out. Never fetch xAI webfonts.

## Cursor

Ship the official SVG path as the mark. viewBox `0 0 466.73 532.09`. Exact path:

```
M457.43,125.94L244.42,2.96c-6.84-3.95-15.28-3.95-22.12,0L9.3,125.94c-5.75,3.32-9.3,9.46-9.3,16.11v247.99c0,6.65,3.55,12.79,9.3,16.11l213.01,122.98c6.84,3.95,15.28,3.95,22.12,0l213.01-122.98c5.75-3.32,9.3,9.46,9.3,16.11v-247.99c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05,151.99l-205.63,356.16c-1.39,2.4-5.06,1.42-5.06-1.36v-233.21c0-4.66-2.49-8.97-6.53-11.31L24.87,145.67c-2.4-1.39-1.42-5.06,1.36-5.06h411.26c5.84,0,9.49,6.33,6.57,11.39h-.01Z
```

On paper: fill `--dallas-ink`. `fill-rule: evenodd`. The second subpath (`M444.05…`) **is** the cursor hole — leave it transparent so paper shows through.

NEVER bbox-trim, flood-fill, flatten to a solid polygon, drop the inner subpath, or fill the hole with `nonzero`. Live solid jagged hexagon = the bug.

~280px tall, uniform scale from the viewBox. No ribbons on the cube.

**Kick whip:** the cube does a **quick 360° spin**, hard cubic ease-in-out, then lands face-forward / upright for Idle. Hole stays evenodd (paper through) while it spins. Reduced motion: cube planted, no spin. **Grok has no bands during this window.**

## Grok — morph (Ver 02 tree)

SDF blend between the 8 official silhouettes. Not a cut. Not globe yaw. Body stays planted; morph in place during the kick. After each kick, land on the next shape WITH its paired HEX.

| # | Shape | Paired HEX |
| --- | --- | --- |
| 1 | Circle | Blue `#1084FE` |
| 2 | Irregular oval / product blob | Orange-red `#FF6700` (REST cold-start = this shape + Black `#000000`) |
| 3 | Rounded square | Teal `#00BCA6` |
| 4 | Pill | Red `#FF263C` |
| 5 | Rounded triangle | Magenta `#FF309B` |
| 6 | Hexagon | Violet `#9159FE` |
| 7 | Cloud | Orange `#FF9800` |
| 8 | Teardrop | Gold `#97683D` |

Walk: `2 → 3 → 4 → 5 → 6 → 7 → 8 → 1 → 2…`
First settle after first kick = rounded square + Teal.
When the walk returns to oval, fill is Orange-red, not black.

Color lerp is **only the two locked pair stops** (current → next). No off-sheet rainbow. Green and Cool Gray never enter the lerp.

## Eyes — do not break

- Two **white** stadiums (pills), planted in **face-space** on the morphing body as a **parallel gaze pair**. Distinct gap. **Not** the dim charcoal Thinking-tab eyes. Article tree uses black on dark — wallpaper keeps WHITE.
- **Shape:** vertical long axis (straight up and down), tilted slightly left (~**−8° to −15°**). Product: **−12°**. Same tilt on both. **Not −28°. Not 45° stuck.**
- **Rest:** camera / center of the face, upright + slight left. **Not** stuck bottom-left. **Not** article Idle upper-right. User overrules that rest pose.
- **Motion:** both stadiums **translate together** as a gaze — look at different points on the face (center, up, side), then return. Do **not** spin each eye independently. Tilt stays locked while the pair shifts.
- Eyes **wink** on Idle and through the kick. Not a static crop.
- Eyes stay readable through the SDF blend. Clip to the silhouette. No eye-whip around the form. No orbit off the face.

**Reduced motion:** freeze Idle (oval + Black, planted pair at camera rest, no lines, cube planted). Wink may freeze.

## Surface (do not invent)

- Canvas 1920×1080. Paper ground.
- Cursor cube ~280px tall. Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Grok face-forward. No Grok body rotate.
- One display line: `Dallas meetup`. Universal Sans trial, exactly once, 44px @ 1920, tracking ~2.4.
- Draw order: paper → cube (kick 360, else upright) + Grok (SDF body + stadiums only) + type.

## Motion — Idle / one kick / Idle

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → one kick → Idle.** Do not hold Thinking as a TV state. **Do not steal Thinking nest or Working ribbons for the kick.**

Idle: official Cursor (upright) + current morph face (shape + paired HEX; cold start = oval + Black) + gaze-pair white stadiums (look around, wink). **No lines.**
Kick: **body SDF morph + color blend current→next + Cursor 360 whip.** Eyes may still gaze and wink. Body stays planted. **No nest. No ribbons.**
After kick: Idle on the new shape WITH its paired HEX.

## Timing — 8s (do not shorten)

Loop = **8s**. Whip slider 0.5–0.7s; rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Super-fast means the whip is short.

| Beat | Duration | Article steal | Job |
| --- | --- | --- | --- |
| Rest | 6.4s | **Idle** | Upright cube + current shape/fill. Parallel stadiums (slight left) translate as a gaze (center / up / side) then return. Wink. No lines. |
| Whip | 0.6s | **Morph + Cursor 360** | SDF blend current→next. HEX lerp of the two locked pair stops. Cube 360 (ease-in-out). Eyes still gaze/wink. Body planted. **No bands on Grok.** |
| Settle | ~1.0s | **Idle** | Cube upright. Landed shape + paired HEX. No lines. |

**Reduced motion:** freeze Idle (upright cube, oval + Black, planted pair, no lines, no spin, no morph).

## Named tokens

Ver 02 HEX. Body fills follow the tree pairing. Green and Gray are named and never drawn as body fills or orbits.

| Token | Hex | Body? |
| --- | --- | --- |
| `--dallas-grok-gold` | `#97683D` | Teardrop |
| `--dallas-grok-red` | `#FF263C` | Pill |
| `--dallas-grok-orange-red` | `#FF6700` | Oval (after walk) |
| `--dallas-grok-orange` | `#FF9800` | Cloud |
| `--dallas-grok-green` | `#00C972` | **Never** |
| `--dallas-grok-teal` | `#00BCA6` | Rounded square |
| `--dallas-grok-blue` | `#1084FE` | Circle |
| `--dallas-grok-violet` | `#9159FE` | Hexagon |
| `--dallas-grok-magenta` | `#FF309B` | Rounded triangle |
| `--dallas-grok-black` | `#000000` | Cold-start oval rest only |
| `--dallas-grok-gray` | `#777777` | **Never** |
