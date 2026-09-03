# LOOK LOCK — Dallas meetup TV wallpaper

Authority for this slug. Later interrupts win. Do not re-open settled rows.

Stills of the full lockup are rendering on EPG's side. Until they arrive, the two globe stills plus this text are the lock.

## Paper and ink

- `--dallas-paper`: `#F2F1ED` (not pure white). Wallpaper ground.
- `--dallas-ink`: `#111111`. Type is ink. Cube is ink. Skyline dither is paper/ink. Rest globe fill is ink.
- Universal Sans trial (`UniversalSansGrokTest Display Trial` / 400) on the one canvas display line. IBM Plex Sans Condensed on everything small. Largest Plex ≤ 40% of display (44px @ 1920, tracking ~2.4). Never fetch xAI webfonts. Geist is out.

## Surface

- Canvas 1920×1080. Paper ground.
- Cursor cube: SVG path, uniform scale from viewBox `466.73 × 532.09`, ~280px tall, ink. Cube stays clean — no ribbons, no filaments.
- Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Axis tilt 16°.
- One display line: `Dallas meetup`. Universal Sans trial, exactly once, 44px @ 1920, tracking ~2.4.
- Draw order: paper → field filaments → dithered horizon (low) → cube + globe + type.

## Horizon — dithered B/W Dallas skyline

Default **ON** for the TV loop. Demo rail can toggle; product default is on.

Source: Trammell Crow Park CC0 photograph only.
https://commons.wikimedia.org/wiki/File:Dallas_Texas_skyline_overlooking_Trammell_Crow_Park.png
(CC0 1.0, IcedCowboyCoffee, commercial use OK, no attribution required.)

Bayer-dither that photo to paper/ink. Fade the top of the silhouette/dither into the field so it reads as a horizon, not a sticker. Sit it low, behind the globe, not wrapped onto the globe. Hit Reunion Tower (ball-on-a-stalk) and Bank of America Plaza.

**Refused:**

- The teal tourist illustration (`dallas-skyline-illustration-cc-by-2.0.jpg` and anything like it).
- Noun Project / clipart vectors.
- Skyline mapped onto the sphere.

## Galaxy swooshes — FIELD only

Nine Ver 02 chromatic hues, **random assignment**, flowing filaments in the wallpaper field around/behind the ball. Never longitude on the mark. Never meridians. Never parallels. Gray never a filament.

| Stop | Hex |
| --- | --- |
| gold | `#97683D` |
| red | `#FF263C` |
| orange-red | `#FF6700` |
| orange | `#FF9800` |
| green | `#00C972` |
| teal | `#00BCA6` |
| blue | `#1084FE` |
| violet | `#9159FE` |
| magenta | `#FF309B` |

Each filament (or bundle) draws a stop from that set. Hairline filaments in near-parallel, fanning and compressing, on paper. No bloom, glow, screen, or add — paper is light. All nine hold at 1× vs `#F2F1ED`. No star specks.

## Body (globe lock — do not revert)

- Official picker SDFs 1–8. Rest = #2 irregular oval.
- Cold start: oval + ink `#111111`. Flat HEX. No Lambert. No photo-earth. Solid ball.
- **Planted silhouette.** No 360° disc spin. No globe meridians. **No idle bob.** Rest is a hold.
- Walk `2→3→4→5→6→7→8→1`. First **settle** = rounded square + Teal. Oval return = Orange-red, not ink.
- Color and shape **do not change on the whip.** They land in **settle**: next Ver 02 hue **SNAP** (not a rainbow lerp) + next official picker **SDF blend** (not a cut).

## Eyes

- Official **stadium** geometry, planted in face-space. Diagonal (~−28°), higher-right. No slices.
- **Stay planted through whip and morph.** No eye-whip, no orbit, no back-occlusion hide, no Working-state pupil pump.
- Mid-yaw smearing the stadiums is a miss. Do not bring meridians back to sell round.

## Timing lock — 8s (this is the check, not a guess)

Do **not** fill rest with a second motion. Do **not** shorten the loop to make it feel fast. Super-fast means the **whip is short**.

Loop = **8s** total. Whip slider still exists (0.5–0.7s); rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Axis tilt 16°. Land face-forward every time. Linear planet-spin is compare-only, default **OFF**.

| Beat | Time | Look |
| --- | --- | --- |
| **Rest** | **6.4s** | Face-forward **hold**. No secondary motion, no idle bob, no slow residual spin. First rest **must match** the solid-ball still: shape **2 irregular oval**, fill **ink `#111111`**, official stadiums. **No ribbons.** |
| **Whip** | **0.6s** | The **traveling** bit. Hard ease-in-out. **One revolution** of 2–4 ribbons. Land face-forward. Body stays the **current** picker + current fill (first whip is still the **black oval**). Eyes planted. |
| **Settle** | **~1.0s** | Ease-out comes to rest **here**. Next Ver 02 hue **SNAP**. Next official picker **SDF blend**. **No parked bands.** Eyes planted. |

**Reduced motion:** freeze the rest pose (oval + ink, no whip, no morph).

## Working stream (on the mark, whip only)

Product Working is a sparse orbit stream: 2–5 thick ribbons, rounded caps, wrap front/back, then a gap. TV does **not** hold Working. Rest hold → one whip (ribbons only) → settle (color + shape land) → rest.

- Thickness ~4–5% of face. At 300px: **12–15px**.
- 2–4 bands. Not 7. Not a nest. Plane ~−15° (upper-left → right).
- Wrap + clip on the **current still** body during the whip. Back occluded by the fill. Front over the face. Then leave. Settle has no ribbons.
- Ver 02 HEX, **flat**. Do not steal the article ribbon gradients.
- Kill: 7+ hairlines on the mark, meridians/parallels/longitude on the mark, a 360 disc spin, idle bob / residual spin in rest, eye-whip, fill SNAP or SDF morph **during** the whip, rainbow lerp on the body.

## Pairing

| Picker | Shape | Fill |
| --- | --- | --- |
| 1 | Circle | Blue `#1084FE` |
| 2 | Irregular oval | Orange-red `#FF6700` |
| 3 | Rounded square | Teal `#00BCA6` |
| 4 | Pill | Red `#FF263C` |
| 5 | Rounded triangle | Magenta `#FF309B` |
| 6 | Hexagon (pointy top/bottom) | Violet `#9159FE` |
| 7 | Cloud (3 lobes) | Orange `#FF9800` |
| 8 | Teardrop (point up) | Gold `#97683D` |

Green `#00C972` is stream-only. Gray `#777777` never a body fill.
