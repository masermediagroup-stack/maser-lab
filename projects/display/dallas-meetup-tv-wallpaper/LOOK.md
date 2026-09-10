# LOOK LOCK — Dallas meetup TV wallpaper

USER OVERRIDE. Later interrupts win. Encode corrections in `design.md`.
Requested look lock path `/workspace/dallas-meetup-tv/globe-look/LOOK.md` is not in this checkout; this file is the lab copy.

## Quality + silk ground (locked 2026-09-10)

### Stage
- Canvas / composition stays **1920×1080**. Do not stretch the composition to fill a different aspect.
- Letterbox on laptop/desktop. Never CSS-scale type below 1.
- Viewing: wall TV + laptop/desktop only. Not mobile.

### Marks + type
- Cursor cube and Grok mark: **pure SVG** (`preserveAspectRatio="xMidYMid meet"`) at Figma native px. No PNG lockups. No CSS stretch.
- No downscale then upscale. No CSS blur. No soft shadow that eats edges.
- Type: Universal Sans **TTF** (`font-display: block`). Headline 48/400, subline 36/300 in the 1920×1080 frame. No independent type scale. Letterbox may uniformly scale the whole board to fit a laptop viewport.
- Headline **48px / 400**, subline **36px / 300**, x=72, y=931, white.
- Marks sit **on top of** the ground as DOM. The ground never samples through them. Do **not** fake that with a center vignette.

### Ground
- **WebGL2** silk/fold **moving gradient** on every load (including Vercel). Dark black + charcoal/grey, sparse **white hint** on the brightest ridges. No chroma.
- Look-only reference: Unicorn embed `eFskEoMG10ENKSC2rBFp`. Remake from scratch. **Do not embed Unicorn. Do not copy the watermark.** No `unicornstudio-react`.
- Large soft masses + dark crease folds. Visible autonomous drift (folds travel in a few seconds). No mouse-follow. No glyphs. No code lattice.
- Reduced motion / pause = still frame of the live shader (not a CSS black fill).
- Full-bleed behind the lockup on the true 1920×1080 stage. GPU buffer pinned to **1920×1080** (dpr 1) so the canvas cannot overflow the frame. Opaque surface.
- Demo preview letterboxes the whole 1920×1080 board with one uniform scale. Do not independently scale or stretch logos or type.
- Ground must not compete with the Grok and Cursor faces. Skyline stays off.
- Do **not** call vgpu `init()` on this canvas. A successful WebGPU context owns the canvas and can leave a static black field; WebGL2 then cannot start.
- If WebGL2 cannot compile: live **CPU shader** of the same field. Never a static wash, Unicorn SDK, circle glyphs, or the old 4-blob wash.

### Loop (keep)
Sequential 3-logo fade Grok → SpaceX → Cursor over `loopSeconds` (default **120s**). Fade-out then fade-in; at most one logo visible. Idle carousel only.

## Killed, fully

Dallas skyline. Globe yaw / 360 **body** spin / any Grok body turn. Eye-whip. Independent HEX wraps.
**Light organic / white head Grok.** **Static PNG face crop.** **Smashed overlapping white pills that never wink.**
**Dim article Thinking eyes.** **Stuck bottom-left stadiums.** **Stuck top-right / 45° article Idle rest.** **Independent eye spin.** **−28° stadiums.**
**Broken eyes during morph / sheared stadiums.** **Green body fill.** **Cool Gray body fill.**
**Pill / Cloud / Teardrop cycle landings.** **Rounded triangle / Magenta cycle landings.** **Oversized Grok vs cube.**
**Thinking nest.** **Working ribbons.** **Thick mid.** **Sparse 2–4 bands.** **Any colored orbits / arcs / bands around Grok.**
**Paper `#F2F1ED` ground.** **Kick / whip / Grok SDF morph as the live model.** **Circle-glyph / neo code field.** **Basic 4-blob / CTA-style wash as the hero field.** **Unicorn Studio embed** (watermark / no Legend). **Mouse-follow ground.**
**Center vignette / lockup-zone dim that reads as a static gradient.**
**Retiming prior unique hosts** (`l9j8bqkli`, `bcbmzn4wu`, `36jk9847c`, `988sxfcwn`, `7m70m0875`, every Unicorn host, branch alias). Fresh unique host when it lands. Do not hand the branch alias.

## Tokens (idle)

- `--dallas-stage`: `#060606` — stage chrome / ground floor
- `--dallas-text-on-dark`: `#FFFFFF` — type
- Display: Universal Sans trial 400 @ 48px and 300 @ 36px, once, tracking 0
- Body/labels: IBM Plex Sans Condensed. Geist out. Never fetch xAI webfonts.
