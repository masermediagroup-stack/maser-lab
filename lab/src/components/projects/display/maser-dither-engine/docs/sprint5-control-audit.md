# Sprint 5 — Control Audit Map

Trace: UI → React state → config → controller → uniform → shader → output.

## Classification legend

E Essential · A Advanced · C Contextual · D Derived · Dup Duplicate · X Ineffective (fixed or removed)

| Label (was) | State key | Uniform / property | Panel | Class | Action |
| --- | --- | --- | --- | --- | --- |
| Soft Edge | softEdge | uSoftEdge | Finish | was X → E | Renamed UV Soft Clamp; drives softClamp01 |
| Depth | depth | uDepth | — | X | Removed from UI (never sampled) |
| Cursor Influence | cursorInfluence | multiplied into uIxInfluence | — | Dup | Merged → Interaction Pointer Influence |
| Influence | interaction.influence | uIxInfluence | Interaction | E | Single owner |
| Animation Speed | animationSpeed | dt multiplier | Animation | E | Renamed Master Time Scale |
| Playback Speed | timeline.playbackSpeed | Timeline | Animation | A | Renamed Timeline Playback Speed |
| Time Scale | timeline.timeScale | Timeline | Animation | A | Advanced only |
| Dither Size | ditherSize / matrixSize | uDitherSize | Dither | E | Renamed Matrix Size |
| Pattern Scale | dither.patternScale | uDitPatternScale | Dither | E | New — distinct from matrix |
| Pixel Density | pixelDensity | uPixelDensity | Dither | A | Renamed Render Density |
| Blue Noise | blueNoiseAmount | uBlueNoiseAmount | Finish | A | Bayer-family mix only |
| Exposure | properties.exposure | uMatExposure | Color | E | Distinct from bloom / light |
| Threshold (mat) | properties.threshold | uMatThreshold | Color | A | Was unused → Tone Gate |
| Smoothness | properties.smoothness | uMatSmoothness | Color | A | Was unused → Tone Gate Softness |
| Light Scatter | properties.lightScatter | uMatScatter | Color | A | Was unused → Noise Scatter |
| Accent / Edge / Noise | colors.* | matAccent/Edge/Noise | Color | A | Were unused → wired in compose |
| Bloom | bloom | uBloom | Lighting | E | Core spill |
| Bloom Radius | bloomRadius | uBloomRadius | Lighting | A | Renamed Bloom Spread |
| Dither Response | light.ditherResponse | uLsDitherResponse | Lighting | E | Light→ink density (≠ contrast) |
| Algorithm | dither.algorithm | uDitAlgo | Dither | E | New family selector |

## Ownership

| Domain | Owner |
| --- | --- |
| Master time | Animation (`animationSpeed`) |
| Pointer influence | Interaction |
| Light geometry | Lighting (`LightShapeConfig`) |
| Palette / exposure | Color |
| Algorithm / matrix / pattern | Dither |
| Grain / Bayer BN mix / UV clamp | Finish |
| Layout copy | Content / Component |

## Precedence

1. Presets initialize domains; user edits override.
2. Local adapter `dither` / `light` / `color` props override defaults for that instance.
3. Master Time Scale × Timeline speeds (Advanced) — documented, not hidden.
4. Reduced motion pauses timeline without wiping saved settings.
