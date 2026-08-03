# Sprint 7.3 — Creative Engine Restoration & Material Browser Overhaul

**Mode:** Harden · **Engine:** `0.7.3`  
**Skills:** `maser-lab-web` (Harden), `maser-lab-responsive-qa`

## Goals

Restore creative color exploration, replace identical CSS material tiles with live procedural thumbs, make key animations read as their names, and add creative randomize / animation compare — without new major systems or architecture rewrites.

## Color system restored

- All material color slots labeled for creative use: Background, Material Color (ambient), Highlight, Shadow, Accent, Dither, Bloom, Glow, Gradient Start/Mid/End/4th, Overlay, Noise Tint
- Live picker + HEX / RGB / HSL editors (Sprint 7.2 + clarified labels)
- Interaction Light Color / Interaction Color tint sliders
- Stronger shader mix for accent / overlay / noise / dither / bloom / glow so pickers produce obvious results
- Hue-cycle and flow gradient behaviors amplify animated palette motion
- Palette presets + quick palette row in Creative Explore

## Material browser

- **Placeholder CSS tiles removed** from the primary preview path
- `ThumbBlitEngine` — **one** shared WebGL context serializes JPEG captures
- Materials grid / rail show live procedural thumbs (material + wave anim + palette + light + dither)
- Browse: All / Favorites / Recent · Layout: Grid / Rail · Family filters · Search
- Hover/focus preview updates the detail stage; performance badge + recommended comps/anims
- Material Dock thumbs also use the shared blit cache and refresh with scene hash

## Animations

| Mode | Change |
| --- | --- |
| Spiral | Angular advection, center offset, direction, twist UV |
| Lava Lamp | Viscosity, surface tension, organic distort, ∇field UV |
| Radial Pulse | Multi-front rings with width / falloff / repeat (≠ ripple/bloom) |

New route `#/animations` — Animation compare board (blit grid + one live detail).

## Creative explore

Playground panel: randomize palette / lighting / animation / material / entire scene with per-section locks.

## Context budget

Still one blit context for grids/docks + at most one (or two in material compare) interactive `SurfaceCanvas`. No per-tile WebGL.

## Known limits

- Blit thumbs are snapshots (not continuously animating in the grid)
- Project saves still drop blob image URLs
- Canvas2D algorithm parity still open

## Sprint 8 recommendations

- Continuous thumb refresh via shared FBO without JPEG churn
- Persist uploads (data URL / IndexedDB)
- Visual regression for animation × material matrix
- Optional RGB-per-interaction-light
