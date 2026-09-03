# LOOK LOCK — Dallas meetup TV wallpaper

Authority for this slug. Later interrupts win. Do not re-open settled rows.

Stills of the full lockup are rendering on EPG's side. Until they arrive, the two globe stills plus this text are the lock.

## Paper and ink

- `--dallas-paper`: `#F2F1ED` (not pure white). Wallpaper ground.
- `--dallas-ink`: `#111111`. Type is ink. Cube is ink. Noun Project skyline is ink. Rest globe fill is ink.
- Universal Sans trial (`UniversalSansGrokTest Display Trial` / 400) on the one canvas display line. IBM Plex Sans Condensed on everything small. Largest Plex ≤ 40% of display (44px @ 1920, tracking ~2.4). Never fetch xAI webfonts. Geist is out.

## Surface

- Canvas 1920×1080. Paper ground.
- Cursor cube: SVG path, uniform scale from viewBox `466.73 × 532.09`, ~280px tall, ink. Cube stays clean — no ribbons, no filaments.
- Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Axis tilt 16°.
- One display line: `Dallas meetup`. Universal Sans trial, exactly once, 44px @ 1920, tracking ~2.4.
- Draw order: paper → Noun Project horizon (low) → cube + globe (kick bands on the mark only) + type. Cube stays clean.

## Horizon — Noun Project Dallas skyline

Default **ON** for the TV loop. Demo rail can toggle; product default is on.

Source: Noun Project Dallas icon **3583788** (Blaise Sewell, Skylines set). Ink silhouette. Sit it low, behind the globe, not wrapped onto the globe. Reunion Tower (ball-on-a-stalk) must read.

**Refused:**

- The teal tourist illustration (`dallas-skyline-illustration-cc-by-2.0.jpg` and anything like it).
- Trammell Crow photograph-as-horizon (that read as a PNG with doodles behind it).
- Skyline mapped onto the sphere.

## Filaments — KICK ONLY (ribbons are the whip)

**2–4 thick flat Ver 02 bands** wrap the planted body. Front and back. ~8–14px at a 300px face. Plane **−15°**. They **cross the eyes**, travel, **then leave**. Sparse. Not Thinking. Not a held nest. Never meridians through the fill. Never a square of doodles on the paper. Gray never a filament.

**Disc stays.** Kill globe yaw. If a 360 disc spin is still in the code, kill it.

Illusion of spin (all in the kick): **planted morph + ribbon wrap + eyes whipping around the form.** Color SNAPS with the next shape in the same kick. Lands **Idle on the new face.**

**Idle: planted face, no bands.** Cube stays clean.

Nine Ver 02 chromatic hues exist as the **palette**. Kick bands use a sparse subset (blue / green / magenta / orange-red):

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

## Body (globe lock — do not revert)

- Official picker SDFs 1–8. Rest = #2 irregular oval.
- Cold start: oval + ink `#111111`. Flat HEX. No Lambert. No photo-earth. Solid ball.
- **Planted silhouette.** Disc stays. **No 360° disc spin. No globe yaw.** No globe meridians. **No idle bob.** Rest is a hold.
- Walk `2→3→4→5→6→7→8→1`. First **kick** lands rounded square + Teal. Oval return = Orange-red, not ink.
- Color and shape change **in the same kick**: next Ver 02 hue **SNAP** (not a rainbow lerp) + planted official picker **SDF blend**. Lands Idle on the new face. The 1s after the kick is Idle hold, not a second morph.

## Eyes

- Official **stadium** geometry. White. No slices.
- **Rest / after-kick Idle / reduced motion:** diagonal (~−28°), higher-right, planted.
- **Kick:** the pair **whips around the form** (Y-orbit of the Idle seat with the ribbon wrap). Hide when they go behind the planted fill. Land Idle on the new face.
- Do not yaw the disc to sell this. Do not bring meridians back to sell round.

## Timing lock — 8s (this is the check, not a guess)

Do **not** fill rest with a second motion. Do **not** shorten the loop to make it feel fast. Super-fast means the **whip is short**.

Loop = **8s** total. Whip slider still exists (0.5–0.7s); rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Axis tilt 16°. Land face-forward every time. Linear planet-spin is compare-only, default **OFF**.

| Beat | Time | Look |
| --- | --- | --- |
| **Rest = Idle** | **6.4s** | Planted face. Official body, flat HEX, white stadiums, **no bands**. Cube clean. First rest: shape **2 irregular oval**, fill **ink `#111111`**. No idle bob, **no globe yaw**. |
| **Whip = kick** | **0.6s** | Illusion of spin: **planted morph + ribbon wrap + eyes whipping around the form.** Color SNAPS with the next shape. 2–4 thick flat Ver 02 wrap front/back, −15°, leave. Disc stays. First kick: oval+ink → rounded square + Teal. |
| **Settle → Idle** | **~1.0s** | Already the **new face**. Idle stadiums. No bands. No second morph. Cube clean. |

**Reduced motion:** freeze Idle (oval + ink, white stadiums, **no bands**, no whip, no morph).

## Working stream (kick only — Grok Bot Working wrap)

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → kick (bands) → Idle.** Do not use Thinking, Waiting, Blocked, or Done as the whip.

Product kick: illusion of spin without globe yaw — planted SDF morph + 2–4 thick flat Ver 02 wrap (front/back, −15°) + eyes whipping around the form. Color SNAPS with the next shape in that same kick. Lands Idle on the new face. Cube stays clean.

- Stroke **8–14px** at a 300px face. Count **2–4**. Sparse. Not a wallpaper field.
- Plane **−15°**. Wrap front/back. Back occluded by the fill. Front over the face. Not meridians through the fill.
- Ver 02 HEX, **flat**. Do not steal the article ribbon gradients.
- Kill: globe yaw / 360 disc spin, parked Idle bands, a held nest through rest, Thinking-state meridians, Waiting/Blocked/Done as the TV whip, idle bob, rainbow lerp on the body, doodles behind a PNG, morph/color delayed until after the kick.

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
