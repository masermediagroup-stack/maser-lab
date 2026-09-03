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
- Draw order: paper → Noun Project horizon (low) → cube + globe (Idle/Working orbits on the mark) + type.

## Horizon — Noun Project Dallas skyline

Default **ON** for the TV loop. Demo rail can toggle; product default is on.

Source: Noun Project Dallas icon **3583788** (Blaise Sewell, Skylines set). Ink silhouette. Sit it low, behind the globe, not wrapped onto the globe. Reunion Tower (ball-on-a-stalk) must read.

**Refused:**

- The teal tourist illustration (`dallas-skyline-illustration-cc-by-2.0.jpg` and anything like it).
- Trammell Crow photograph-as-horizon (that read as a PNG with doodles behind it).
- Skyline mapped onto the sphere.

## Filaments — ON THE MARK (not a wallpaper field)

Chat-line filaments orbit the **body** and travel **with the mark**, like the Working avatar in Grok Bot chat (Benji Taylor). Never longitude / meridians / parallels through the fill. Never a square of doodles on the paper. Gray never a filament.

Idle: orbits may exist but they are **quiet** and parked. Working whip: they kick into gear and travel one revolution. Settle: ease back to Idle quiet.

Nine Ver 02 chromatic hues on those mark orbits:

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

- Official **stadium** geometry, planted in face-space. Diagonal (~−28°), higher-right. No slices.
- **Stay planted through whip and morph.** No eye-whip, no orbit, no back-occlusion hide, no Working-state pupil pump.
- Mid-yaw smearing the stadiums is a miss. Do not bring meridians back to sell round.

## Timing lock — 8s (this is the check, not a guess)

Do **not** fill rest with a second motion. Do **not** shorten the loop to make it feel fast. Super-fast means the **whip is short**.

Loop = **8s** total. Whip slider still exists (0.5–0.7s); rest = `loop − whip − 1s`. Product: rest **6.4s**, whip **0.6s**, settle **~1.0s**. Axis tilt 16°. Land face-forward every time. Linear planet-spin is compare-only, default **OFF**.

| Beat | Time | Look |
| --- | --- | --- |
| **Rest = Idle** | **6.4s** | Calm, slightly curious. Face-forward **hold**. No idle bob, no body spin. First rest matches the solid-ball still: shape **2 irregular oval**, fill **ink `#111111`**, official stadiums. Orbits may exist but they are **quiet** and parked — not a wallpaper field. |
| **Whip = Working** | **0.6s** | “Kicks into gear.” Chat-line filaments orbit the body and travel **with the mark**. Hard ease-in-out. **One revolution**. Land face-forward. Body stays the **current** picker + current fill (first whip is still the **black oval**). Eyes planted. Not Thinking / Waiting / Blocked / Done. |
| **Settle → Idle** | **~1.0s** | Ease-out back to Idle. Next Ver 02 hue **SNAP**. Next official picker **SDF blend**. Orbits quiet again. Eyes planted. |

**Reduced motion:** freeze Idle (oval + ink, quiet parked orbits, no whip, no morph).

## Working stream (on the mark — Grok Bot Working only)

Motion source: https://x.ai/news/designing-grok-bot (John Bai; avatar motion by Benji Taylor). Lifecycle is Idle / Working / Waiting / Blocked / Thinking / Done. **TV maps Idle → Working → Idle.** Do not use Thinking, Waiting, Blocked, or Done as the whip.

Product Working is chat-line filaments that orbit the body and travel with the mark. Rest hold (Idle, quiet orbits) → one Working whip → settle back to Idle (color + shape land).

- Chat-line stroke, 5 bands. Not 7+ hairlines. Not a wallpaper field.
- Plane ~−15° (upper-left → right). Wrap front/back on the **current** body. Back occluded by the fill. Front over the face. Not meridians through the fill.
- Ver 02 HEX, **flat**. Do not steal the article ribbon gradients.
- Kill: Thinking-state meridians, Waiting/Blocked/Done as the TV whip, a 360 disc spin, idle bob, eye-whip, fill SNAP or SDF morph **during** the whip, rainbow lerp on the body, doodles behind a PNG.

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
