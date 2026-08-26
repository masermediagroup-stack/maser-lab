# Project: Kinetic Perspective Bars

**Slug:** `kinetic-perspective-bars`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-10

## Design reference

- Figma: none
- Other: Uploaded reference — dark architectural slab sequence with thin edge strokes (inspiration only; not a 1:1 copy)
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Lab visitors and portfolio reviewers exploring a kinetic 3D motion study. Interaction is continuous (auto wave) with optional hover lift and click/tap ripple.

### Job
Communicate a premium, gallery-like architectural motion sculpture — precise, dark, dimensional, and hypnotic — not an audio equalizer.

### Current behavior
Greenfield. First React Three Fiber project in Maser-Lab.

### Desired outcome
A centered sequence of thin rounded rectangular slabs on near-black, with a seamless traveling elevation wave, optional pointer influence, four motion modes, lab demo-dock knobs (not product chrome), and code export reflecting live parameters.

### Success signal
Seamless 5–7s wave loop; clear perspective depth via thin edge strokes; hover/ripple blend without snapping; mode crossfade ~0.8s; 60 FPS target; reduced-motion honored; lint/build pass.

### Non-goals
Free orbit controls; bright fills/glows; Framer Motion on 3D bars; music-visualizer aesthetics; hardcoded per-bar meshes.

## States

- [x] default (traveling wave)
- [x] hover (pointer fine — nearest + falloff lift)
- [x] focus (keyboard-accessible chrome controls)
- [x] active / pressed (click/tap ripple)
- [x] paused
- [x] reduced-motion (static or very slow)
- [x] WebGL unavailable (static fallback)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | React Three Fiber + Three.js (`useFrame`) | Real 3D geometry and synchronized frame loop |
| UI motion | Framer Motion (drawers/panels only) | Keep sculpture animation off the main-thread React tree |
| Wave period | ~5–7s across sequence | Spec requirement; seamless sine-based loop |
| Mode blend | 0.8s crossfade | Avoid formula snaps |
| Easing | Shaped sine (more dwell at rest) | Sculptural rise, not bounce |

## Three.js / 3D

| Field | Value |
| --- | --- |
| Target type | Kinetic 3D sculpture / motion study |
| Renderer | WebGL via R3F Canvas |
| Decorative? | no — 3D is the experience; fallback when WebGL missing |
| Fallback | StaticFallback + SR description |
| Mobile strategy | Fit scale / DPR clamp; tap ripple; compact controls |
| Reduced motion | Static formation or very slow wave (toggle) |
| Research docs checked | [Camera](https://threejs.org/docs/#api/en/cameras/PerspectiveCamera), [OrthographicCamera](https://threejs.org/docs/#api/en/cameras/OrthographicCamera), [EdgesGeometry](https://threejs.org/docs/#api/en/geometries/EdgesGeometry), [Raycaster](https://threejs.org/docs/#api/en/core/Raycaster) |
| CloudAI-X skills used | threejs-fundamentals, threejs-geometry, threejs-materials, threejs-animation, threejs-interaction |

## Skills loaded

- `maser-lab-web` (Implement mode)
- `maser-lab-threejs` (Implement)
- `vercel-react-best-practices` (dynamic import, client boundary)

## Acceptance criteria

- [x] Demo route `/demos/kinetic-perspective-bars` renders sculpture + controls
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Motion review: no open P0/P1 findings (initial implement pass)
- [x] `prefers-reduced-motion` supported
- [x] Component exported from `lab/src/components/projects/display/kinetic-perspective-bars/index.ts`
- [x] No free orbit; camera fixed (optional micro-drift)
- [x] Four modes with blend; export drawer reflects live params

## Open decisions

- None blocking — orthographic vs low-FOV perspective chosen as low-FOV perspective for reference match with optional ortho toggle via camera zoom framing.

## Harden notes (2026-07-26)

**Mode:** Harden (stability audit)

**P0 fixed:** Rapid Leva / perspective changes exhausted the browser WebGL context limit (`Too many active WebGL contexts` → sculpture context lost). Root cause: `isWebGLAvailable()` allocated a throwaway WebGL context on every React render via `ThreeCanvas`.

**Also fixed:**
- Stable Canvas `gl` / `camera` props (avoid R3F reconfigure churn)
- KineticBar geometry dispose no longer tied to material identity changes
- Stable bar keys (no remount storm on width/thickness)
- Mode blend honors latest mode mid-crossfade
- Reset syncs Leva store so panel values do not fight React state
- Height profile clamps inverted min/max while dragging
- Hover picks each bar via per-bar hit meshes (actual height) — no plane/max-height fallback
- Chrome middle spacer no longer captures pointer events over the canvas (hover was fully blocked)

**Skills loaded:** `maser-lab-web` (Harden), `maser-lab-threejs` (Harden / Performance & Fallback / Interaction UX)
