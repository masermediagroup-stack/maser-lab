# Dallas Meetup TV Wallpaper — Design Directives

## Galaxy ramp: hue follows density, not position (EPG)

On the original Grok 4 hero the motif is not pure linework: it is
**hairlines on top of a soft mesh-gradient wash**. The lines themselves are
white/silvery; the COLOR lives in the glow underneath. That does not change
the white-ground build — it reinforces it. On black the lines are light and
the wash carries colour. On white we invert: the ink carries the colour and
density does the job the wash did.

On black the Grok 4 artwork paints light; on white we paint INK. The ramp
inverts in role: density does what bloom did, and hue follows density instead
of screen position.

### Ramp rules

- **Cut** cream `#FFE4A6` and pale icy `#C4D3E1` as line colors. On white
  they are the paper. Never stroke with them.
- **Indigo `#7775A5`** is the default filament. It is the darkest stop and
  carries the bulk of every bundle.
- **Blue `#86A4C6` and cyan `#AAD5EA`** take the open body, but only where
  a bundle is dense enough to hold value. A lone cyan hairline on white is
  a dropout.
- **Rose `#CF525C`, red `#F15336`, orange `#FEB87C`** are reserved for the
  compressed limb seam. Heat is earned where the ellipse collapses and
  filaments stack, nowhere else.
- **Orange** is the weakest hot stop on white; walk it only as the transition
  into the seam.

### Density computation

Two components, both from existing geometry:

1. **Edge-on-ness of the meridian.** `edgeOn = 1 - abs(sin(lambda + theta))`.
   1 at the limb, 0 face-on.
2. **Arc-length compression.** Points crowd near vertical tangents. Take local
   arc compression and normalize.

Combined: `density = edgeOn * 0.7 + arcCompression * 0.3`, clamped to 0..1.

Mapping: low density → indigo, mid → blue → cyan, high → orange → red → rose.

### Legibility floor

Every filament that reads as a line must be legible against white at 1×.
Cyan on white is marginal. If a filament's stop + opacity + width would not
hold on its own, either raise opacity or fall back toward indigo. Do not ship
hairlines that dissolve into the paper. If a stop cannot be line, it is paper.

### Refusals

- No bloom, glow, screen, or add blend on white.
- No banded ramp (discrete colour bands).
- No hot stop painted on a sparse bundle.
- No star specks (black-background language; looks like dust on white).
- Normal blending only.
- Parallels: quiet, largely indigo. Colour lives in the meridians.

## Type

Settled. Do not re-open.

- Display (`Dallas meetup`): Geist Sans. The user named Geist sans
  twice. Never Geist Mono on that line.
- Body, labels, info: IBM Plex Sans Condensed. Geist does not creep
  into small type.
- GeistMono is available for a genuine structural mono cut only.
- Never Universal Sans. Never load xAI's self-hosted files.
- Tokens: `--dallas-font` (display), `--dallas-font-ui` (body).

## Skyline

Approved. Additive only, demo-rail toggle, default OFF. Procedural
silhouette from the CC0 Trammell Crow Park photo as a proportion
reference. Must not re-layout marks or type.
