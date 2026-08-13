# Procedural Animation Engine

Reusable animation layer for every Dither Engine component.

## Architecture

| Module | Role |
| --- | --- |
| `types.ts` | Mode IDs, timeline, config, GPU payload |
| `modes/catalog.ts` | Mode registry + control packing (`p0–p7`) |
| `Timeline.ts` | Playhead: play/pause/restart/reverse/loop/ping-pong/speed/scale |
| `ModeBlender.ts` | Smoothstep crossfade between modes |
| `ProceduralAnimationController.ts` | Owns timeline + blender; emits uniforms |
| `animGlsl.ts` | GLSL mode evaluators (aspect-correct, layered) |

## Adding a mode

1. Append to `AnimationModeId` in `types.ts`
2. Add catalog entry with controls + docs in `modes/catalog.ts`
3. Add `modeXxx` + branch in `animGlsl.ts` `evalAnimMode`
4. No UI switch required — `AnimationPanel` reads the catalog

## Layers (shader)

1. **Ambient + distortion** — `sampleAnimation` → UV offset + lumMod  
2. **Interaction** — dampened cursor tug on UV  
3. **Lighting** — `lightMod` nudges gradient light  
4. **Material pipeline** — existing dither/bloom/grain stages  

## Timeline

Designed to grow into a fuller engine timeline. Consumers only need `ProceduralAnimationController.tick(dt)`.
