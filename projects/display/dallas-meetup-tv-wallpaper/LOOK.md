# LOOK LOCK — Dallas meetup TV wallpaper

Authority for this slug. Later interrupts win. Do not re-open settled rows.

## Surface

- Canvas 1920×1080. Paper `--dallas-paper` `#F2F1ED`.
- Cursor cube: SVG path, uniform scale from viewBox `466.73 × 532.09`, ~280px tall, ink `#111111`. Cube stays clean — no ribbons.
- Grok face diameter 300px, gap 120px, pair lifted ~70px above vertical center. Axis tilt 16°.
- One display line: `Dallas meetup`. Universal Sans trial 400, exactly once, 44px @ 1920, tracking ~2.4. IBM Plex Sans Condensed on demo chrome; largest Plex ≤ 40% of display. Geist is out. Never fetch xAI webfonts.
- Horizon: Noun Project Dallas 3583788 by Blaise Sewell. Ink on paper. Light edge dither OK. Default ON. Credit in demo chrome, not on the TV loop.

## Body

- Official picker SDFs 1–8. Rest = #2 irregular oval.
- Cold start: oval + Black `#000000`. Flat HEX. No Lambert.
- **Planted silhouette.** No 360° disc spin. No globe meridians. Tiny wobble (a few degrees) is fine.
- During the kick: SDF-blend to the next official picker shape. Color lerps **only** current-pair HEX → next-pair HEX (two stops).
- Walk `2→3→4→5→6→7→8→1`. First kick = rounded square + Teal. Oval return = Orange-red, not black.

## Eyes

- Idle: planted white stadiums, diagonal (~−28°), higher-right.
- Kick: the pair **whips around the form** (project on the surface, occlude on the back, reappear on the front). Pump more upright mid-kick. That sells the turn.
- Land Idle: planted stadiums on the new body, official idle tilt.

## Motion — 8s

| Beat | Time | Look |
| --- | --- | --- |
| Idle rest | 6.4s | Planted face. Current shape+HEX. Idle eyes. **No ribbons.** |
| Whip / kick | 0.6s | Morph + two-stop color + 2–4 ribbons wrap the morphing body + eye-whip. |
| After | ~1s | Idle on the **new** body/color. Planted eyes. **No parked bands.** |

Reduced motion freezes Idle (oval+black, no morph, no ribbons, no eye-whip). Linear spin is compare-only, default OFF.

## Working stream

Product Working is a sparse orbit stream: 2–5 thick ribbons, rounded caps, wrap front/back, then a gap. Frames with **no** ribbons are that **gap**, not Idle.

TV does **not** hold Working. Idle → one kick → Idle on the new body.

- Thickness ~4–5% of face. At 300px: **12–15px**.
- 2–4 bands. Not 7. Not a nest. Plane ~−15° (upper-left → right).
- Wrap + clip on the **current** (morphing) body. Back occluded by the fill. Front over the face.
- Ver 02 HEX, **flat**. Do not steal the article ribbon gradients.
- Kill: 7+ hairlines, wallpaper field, meridians as a nest, a 360 disc spin, planted-disc-with-ribbons-only, settle snap on a still face.

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
