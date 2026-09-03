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

## Filaments — KICK ONLY (not a wallpaper field, not a held nest)

**2–3 thick Ver 02 bands** wrap the body on the Idle→Working kick. Front and back. ~8–14px at a 300px face. They travel with the spin, **then leave**. Sparse. Not Thinking. Not a 5-filament chat-line cluster. Never longitude / meridians / parallels through the fill. Never a square of doodles on the paper. Gray never a filament.

**Idle rest: NO orbits.** If bands are still sitting through rest, kill them. Settle: NO orbits. Held Working after they leave is only the eye pump.

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
- **Planted silhouette.** No 360° disc spin. No globe meridians. **No idle bob.** Rest is a hold.
- Walk `2→3→4→5→6→7→8→1`. First **settle** = rounded square + Teal. Oval return = Orange-red, not ink.
- Color and shape **do not change on the whip.** They land in **settle**: next Ver 02 hue **SNAP** (not a rainbow lerp) + next official picker **SDF blend** (not a cut).

## Eyes

- Official **stadium** geometry, planted in face-space. White. No slices.
- **Rest / settle / reduced motion = Idle:** diagonal (~−28°), higher-right.
- **Whip = Working pump:** more upright. Still planted — no orbit, no yaw smear, no back-occlusion hide.
- Held Working after the bands leave is **this pump only**. Still no orbits.
- Mid-yaw smearing the stadiums is a miss. Do not bring meridians back to sell round.

## Timing lock — 8s (this is the check, not a guess)

Do **not** fill rest with a second motion. Do **not** shorten the loop to make it feel fast. Super-fast means the **whip is short**.

Loop = **8s** total. Whip slider still exists (0.5–0.7s); rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Axis tilt 16°. Land face-forward every time. Linear planet-spin is compare-only, default **OFF**.

| Beat | Time | Look |
| --- | --- | --- |
| **Rest = Idle** | **6.4s** | Official body, flat HEX, white stadiums, **NO orbits**. Cube clean. First rest: shape **2 irregular oval**, fill **ink `#111111`**. Face-forward **hold**. No idle bob, no body spin. |
| **Whip = Idle→Working kick** | **0.6s** | **2–3 thick Ver 02 bands** wrap the body (front/back, ~8–14px at 300px face), travel with the spin, **then leave**. Sparse. Not Thinking. Not a held nest. Eyes pump more upright. Body stays the **current** picker + current fill (first whip is still the **black oval**). |
| **Held Working** | late whip, after bands leave | **Eye pump only** (more upright). Still no orbits. |
| **Settle → Idle** | **~1.0s** | Shape/color **SNAP** (Ver 02 hue) + next official picker **SDF blend**. Back to Idle. No bands. Idle stadiums. |

**Reduced motion:** freeze Idle (oval + ink, white stadiums, **no orbits**, no whip, no morph).

## Working stream (kick only — Grok Bot Working wrap)

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → kick (bands) → Idle.** Do not use Thinking, Waiting, Blocked, or Done as the whip.

Product kick: 2–3 thick Ver 02 bands wrap the **current** body (front/back), travel with the spin, then **leave**. Idle rest has **no** orbits. After they leave, held Working is only the eye pump. Settle snaps color/shape on a still Idle face.

- Stroke **8–14px** at a 300px face. Count **2–3**. Sparse. Not a 5-filament nest. Not a wallpaper field.
- Plane ~−15° (upper-left → right). Wrap front/back on the **current** body. Back occluded by the fill. Front over the face. Not meridians through the fill.
- Ver 02 HEX, **flat**. Do not steal the article ribbon gradients.
- Kill: parked Idle orbits, a held nest through rest or settle, Thinking-state meridians, Waiting/Blocked/Done as the TV whip, a 360 disc spin, idle bob, yaw-smeared eyes, fill SNAP or SDF morph **during** the whip, rainbow lerp on the body, doodles behind a PNG.

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
