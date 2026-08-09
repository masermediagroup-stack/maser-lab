# Procedural Interaction & Lighting Engine

Reusable interaction layer for every Dither Engine component (Sprint 2).

## Architecture

| Module | Role |
| --- | --- |
| `types.ts` | Modes, physics, falloff, trails, ripples, hold/release, lights, GPU payload |
| `modes/catalog.ts` | Interaction mode registry (unique math per mode) |
| `PointerPhysics.ts` | Mode-specific integration toward DOM→UV targets |
| `InteractionController.ts` | Owns physics, lights, ripples, trails, pointer states |
| `interactionGlsl.ts` | Multi-light sample, falloff, ripples, trails, debug overlay |
| `PointerField.ts` / `ScrollField.ts` | Legacy helpers; pointer path prefers controller |

## Pointer pipeline

1. **Input** — `pointermove` / touch / optional external `{ x, y, down? }` (DOM-normalized, **y=0 top**)
2. **Convert** — `setTargetDom(x, y)` → UV (`y_uv = 1 - y_dom`)
3. **Physics** — `PointerPhysics.tick(mode, …)` → smoothed position + velocity
4. **States** — idle → hover → down → hold → release → exit
5. **Pack** — lights / ripples / trails → `InteractionUniformPayload`
6. **GPU** — `sampleInteraction(uv)` composites into the shared FRAG body

Do **not** damp `pointerX`/`pointerY` in `AnimationLoop` — the controller owns them.

## Interaction modes

Follow · Spring · Magnetic · Sticky · Gravity · Repel · Orbit Pointer · Elastic · Pressure · Ripple · None

Each mode uses different integration (not just easing tweaks). See `PointerPhysics.ts`.

## Lighting

Up to **8** `ProceduralLight` slots with roles: ambient, pointer, secondary, accent, animated.

Each exposes enabled, position, radius, intensity, color, animation, phase, offset, blend, moveSpeed.

## Adding a mode

1. Append to `InteractionModeId` in `types.ts`
2. Add catalog entry in `modes/catalog.ts`
3. Implement branch in `PointerPhysics.ts`
4. UI updates automatically via `InteractionPanel`

## Layers vs animation

Sprint 1 animation (`sampleAnimation`) and Sprint 2 interaction (`sampleInteraction`) are independent layers. Reduced motion pauses the animation timeline **and** disables interaction motion.
