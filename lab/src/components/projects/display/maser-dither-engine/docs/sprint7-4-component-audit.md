# Sprint 7.4 — Component & preset audit

**Mode:** Harden · **Engine:** `0.7.4`  
**Skills:** `maser-lab-web` (Harden)

## Fixes

| Issue | Fix |
| --- | --- |
| Avatar felt ~30 FPS | Default `animationSpeed` → `1`; avatar/badge/progress/scrollbar/loader floor speed at ≥1 |
| Spiral arm fractions break | Arm Count step `1`; `floor` in GLSL; `packModeParams` rounds integer-step controls |
| Lava lamp breaks at high merge/speed | Soft clamps on size/merge/viscosity/distort; capped field + UV offset |
| Hero Background duplicate | Removed; Section Background covers atmospheric planes; old hashes remap |
| Loader looked like avatar | Spinning conic-masked dither ring with punched center |
| Missing size variance | SM–XL on badge, loader, progress, scrollbar |
| Progress static | Auto 0→100 loop (DOM rAF) + speed / manual mode |
| Saved presets open as defaults | Playground `key` no longer included `pendingProjectId` (remount wiped snapshot after apply) |

## Verify

- Save As from playground → Studio → Open → material / animation / colors match
- Spiral Arm Count only integers
- Lava Lamp at max merge/size/speed stays stable
- Loader visibly spins; progress loops 0→100
