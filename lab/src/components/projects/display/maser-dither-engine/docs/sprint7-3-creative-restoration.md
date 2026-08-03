# Sprint 7.3 — Creative Engine Restoration & Material Browser Overhaul

**Mode:** Harden · **Engine:** `0.7.3`  
**Skills:** `maser-lab-web` (Harden), `maser-lab-responsive-qa`

## Goals

Restore creative color exploration, replace identical CSS material tiles with live procedural thumbs, make key animations read as their names, and add creative randomize / animation compare — without new major systems or architecture rewrites.

## 1. Color system restored

| Slot | Wire |
| --- | --- |
| Background | `matBg()` plate mix |
| Material Color (ambient) | Stronger weight-driven plate fill |
| Highlight / Shadow | Core ↔ outer lighting mix |
| Accent | Midtone chroma |
| Dither Color | Dark-region ink tint |
| Bloom / Glow | Additive bloom masks |
| Gradient Start / Mid / End / 4th | Gradient stops + modes |
| Overlay (edgeTint) | Edge vignette tint |
| Noise Tint | Scatter mix |
| Light Color | Interaction per-light tint slider |

Also: HEX / RGB / HSL live pickers, palette presets, gradient modes/behaviors (incl. Hue Cycle / Palette), animated gradients, Creative Explore quick palettes.

## 2. Material browser

- Placeholder CSS tiles removed from primary preview path
- `ThumbBlitEngine` — one shared WebGL context → JPEG thumbs
- Grid / rail, search, favorites, recent, family filters
- Hover/focus preview → detail stage; performance badge + recommended comps/anims
- Material Dock uses same blit cache; refreshes on palette/anim/light/color hash

## 3. Animation improvements

| Mode | Identity |
| --- | --- |
| Spiral | Sharper rotating arms, center offset, direction, twist |
| Lava Lamp | Metaballs + viscosity / tension / distort / ∇field UV |
| Radial Pulse | Multi-front Gaussian rings ≠ ripple sine train |
| Flow Field | Curl streaks |
| Aurora | Vertical curtain veil |
| Magnetic / Orbit / Bloom / … | Existing distinct math retained |

`#/animations` compare board: identical Paper + Aurora + light + dither; blit grid + one live detail.

## 4. Creative explore

Randomize palette / lighting / animation / material / scene with per-section locks.

## 5. Broken systems repaired

- Disconnected-feeling color slots (weak shader mixes)
- Identical dark material placeholder tiles
- Spiral / lava / radial-pulse confusion with neighbors
- Missing animation compare surface

## 6. Remaining weak animations

- **Noise Drift vs Turbulence** — both FBM-family; readable but closest cousins
- **Linear H / V / Diagonal** — intentionally simple; compare board clarifies them
- Blit thumbs are **snapshots** (not continuously animating in the grid)

## Context budget

One blit context for grids/docks + at most 1–2 interactive `SurfaceCanvas`. No per-tile WebGL.

## Sprint 8 recommendations

- Continuous FBO thumb refresh without JPEG churn
- Persist uploads (data URL / IndexedDB)
- Visual regression for animation × material matrix
- Optional RGB-per-interaction-light
- Further split Noise Drift / Turbulence if product wants stricter identity
