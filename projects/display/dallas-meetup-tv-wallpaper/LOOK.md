# LOOK LOCK — Dallas meetup TV wallpaper

Authority for this slug. Later interrupts win. Do not re-open settled rows.

Stills of the full lockup are rendering on EPG's side. Until they arrive, the two globe stills plus this text are the lock.

## Paper and ink

- `--dallas-paper`: `#F2F1ED` (not pure white). Wallpaper ground.
- `--dallas-ink`: `#111111`. Type is ink. Cube is ink. Skyline dither is paper/ink. Rest globe fill is ink.
- Geist Sans on the one canvas display line. IBM Plex Sans Condensed on everything small. Largest Plex ≤ 40% of display (44px @ 1920, tracking ~2.4). Never fetch xAI webfonts.

## Surface

- Canvas 1920×1080. Paper ground.
- Cursor cube: SVG path, uniform scale from viewBox `466.73 × 532.09`, ~280px tall, ink. Cube stays clean — no ribbons, no filaments.
- Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Axis tilt 16°.
- One display line: `Dallas meetup`. Geist Sans, exactly once, 44px @ 1920, tracking ~2.4.
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

Eight sampled Grok 4 colors, **random assignment**, flowing filaments in the wallpaper field around/behind the ball. Never longitude on the mark. Never meridians. Never parallels.

Provenance: sampled from xAI Grok 4 artwork, **not** published brand tokens. Keep all eight in tokens even if pale stops vanish on paper.

| Stop | Hex |
| --- | --- |
| rose | `#CF525C` |
| red | `#F15336` |
| orange | `#FEB87C` |
| cream | `#FFE4A6` |
| pale icy | `#C4D3E1` |
| cyan | `#AAD5EA` |
| blue | `#86A4C6` |
| indigo | `#7775A5` |

Each filament (or bundle) draws a stop from that set. Flow like the Grok 4 artwork: hairline filaments in near-parallel, fanning and compressing, on paper. No bloom, glow, screen, or add — paper is light. If a filament wouldn't hold at 1× vs `#F2F1ED`, fall back toward indigo/rose/red rather than drawing invisible paper-on-paper. No star specks.

## Body (globe lock — do not revert)

- Official picker SDFs 1–8. Rest = #2 irregular oval.
- Cold start: oval + ink `#111111`. Flat HEX. No Lambert. No photo-earth. Solid ball.
- **Planted silhouette.** No 360° disc spin. No globe meridians. Tiny wobble (a few degrees) is fine.
- During the kick: SDF-blend to the next official picker shape. Color lerps **only** current-pair HEX → next-pair HEX (two stops).
- Walk `2→3→4→5→6→7→8→1`. First kick = rounded square + Teal. Oval return = Orange-red, not ink.

## Eyes

- Idle: planted white stadiums, diagonal (~−28°), higher-right. Official stadium eyes. No slices.
- Kick: the pair **whips around the form** (project on the surface, occlude on the back, reappear on the front). Pump more upright mid-kick. That sells the turn.
- Land Idle: planted stadiums on the new body, official idle tilt.

## Whip-spin — 8s (do not revert to linear planet-spin)

Rest face-forward. One revolution, traveling portion ~0.5–0.7s (product 0.6s), hard ease-in-out, then settle. Tilt 16°. Land face-forward every time. Linear planet-spin is the miss / compare-only, default OFF.

| Beat | Time | Look |
| --- | --- | --- |
| Idle rest | 6.4s | Planted face. Current shape+HEX. Idle eyes. **No ribbons.** |
| Whip / kick | 0.6s | Morph + two-stop color + 2–4 ribbons wrap the morphing body + eye-whip. |
| After | ~1s | Idle on the **new** body/color. Planted eyes. **No parked bands.** |

Reduced motion freezes Idle (oval+ink, no morph, no ribbons, no eye-whip).

## Working stream (on the mark, kick only)

Product Working is a sparse orbit stream: 2–5 thick ribbons, rounded caps, wrap front/back, then a gap. Frames with **no** ribbons are that **gap**, not Idle.

TV does **not** hold Working. Idle → one kick → Idle on the new body.

- Thickness ~4–5% of face. At 300px: **12–15px**.
- 2–4 bands. Not 7. Not a nest. Plane ~−15° (upper-left → right).
- Wrap + clip on the **current** (morphing) body. Back occluded by the fill. Front over the face.
- Ver 02 HEX, **flat**. Do not steal the article ribbon gradients.
- Kill: 7+ hairlines on the mark, meridians/parallels/longitude on the mark, a 360 disc spin, planted-disc-with-ribbons-only, settle snap on a still face.

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
