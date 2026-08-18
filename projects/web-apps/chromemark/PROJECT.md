# Project: ChromeMark

**Slug:** `chromemark`  
**Category:** web-apps  
**Status:** building  
**Created:** 2026-08-17

## Design reference

- Figma: none
- Other: written product-render brief — machined chrome logo, three-quarter view, transparent export
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Motion designers and web producers who need a floating chrome logo for heroes, intros, and editors. Used per-logo, not continuously.

### Job
Upload a logo and immediately get a premium extruded chrome 3D object that can be spun, framed, and exported with a real alpha channel.

### Current behavior
Greenfield.

### Desired outcome
Default upload looks like a Cinema 4D / Blender product render: mirror-polished face, bright bevel streaks, dark sidewalls, moving reflections. Export has no background.

### Success signal
A clean SVG can be uploaded, left on defaults, exported as a 2048² transparent PNG, and dropped onto footage without fringing or a baked backdrop.

### Non-goals
Accounts, databases, backends, AI matting, bloom/fog/floor shadows, FFmpeg/ProRes in V1, WebGPU.

## States

- [ ] empty (drop zone, no logo)
- [ ] loading (parse / trace)
- [ ] default (logo framed, auto-spin, Mirror Chrome)
- [ ] hover (pointer-fine toolbar / sliders)
- [ ] focus (keyboard on controls and file input)
- [ ] active / pressed (grab-rotate logo)
- [ ] error (invalid SVG, no fills, opaque PNG, WebGL missing, export too large)
- [ ] exporting (progress modal, cancel)
- [ ] export ready (download)
- [ ] prefers-reduced-motion (spin paused; grab + export remain)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | Three.js WebGLRenderer | Real geometry, IBL chrome, deterministic export |
| Live spin | Delta-time, ~8s/rev, linear | Refresh-rate independent; seamless loop |
| Export | Fixed-frame sampling | No dropped frames; loop without duplicate end frame |
| Reduced motion | Pause auto-spin | Manual orbit and export still work |

## Three.js / 3D

| Field | Value |
| --- | --- |
| Target type | Interactive object / product renderer |
| Renderer | WebGL (`WebGLRenderer`), alpha canvas; WebGPU later |
| Decorative? | no — 3D is the product |
| Fallback | Static message when WebGL is unavailable |
| Mobile strategy | Viewer first; controls in a bottom sheet; DPR cap 2 |
| Reduced motion | Pause auto-spin |
| Research docs checked | [WebGLRenderer](https://threejs.org/docs/#api/en/renderers/WebGLRenderer), [MeshPhysicalMaterial](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial), [PMREMGenerator](https://threejs.org/docs/#api/en/extras/PMREMGenerator), [ExtrudeGeometry](https://threejs.org/docs/#api/en/geometries/ExtrudeGeometry), [SVGLoader](https://threejs.org/docs/#examples/en/loaders/SVGLoader), [Scene.environment](https://threejs.org/docs/#api/en/scenes/Scene.environment) |
| CloudAI-X skills used | threejs-fundamentals, threejs-geometry, threejs-materials, threejs-lighting, threejs-textures, threejs-interaction |

### Research summary

Chrome is an environment problem. Use `MeshPhysicalMaterial` at metalness 1 and roughness ~0.11, then light it with a custom studio of HDR `MeshBasicMaterial` cards captured through `PMREMGenerator.fromScene`. Keep `scene.background = null` so preview CSS never enters the buffer. Rotate the logo group (not the camera) so reflections travel. Normalize 2D bounds first, then extrude with depth/bevel scaled by that size so thickness stays consistent. `SVGLoader.createShapes` is deprecated in r185 — use `ShapePath.toShapes()`. ExtrudeGeometry groups: 0 = lids (front/back), 1 = sidewalls. Export via an MSAA RGBA render target, async pixel readback, vertical flip, `putImageData` (straight alpha). Sequence frames use `i / totalFrames` so the last frame is just before 360°.

## Client & portfolio adaptation

Portable unit is `ChromeMarkApp` (app surface). Lab demo chrome stays out of `index.ts`. No `--lab-*` tokens required to render.

## Acceptance criteria

- [ ] Demo route `/demos/chromemark` renders all states above
- [ ] SVG upload extrudes real geometry (not a textured plane)
- [ ] Holes / counters remain holes (O, A, even-odd paths)
- [ ] Chrome shows moving bright and dark reflections while spinning
- [ ] Pointer grab rotates the object; auto-spin resumes without snapping
- [ ] Preview backdrop (black/white/checker) does not affect export
- [ ] Still PNG has transparent corner pixels and no dark halo over white
- [ ] Sequence ZIP is deterministic; one-turn loops without a duplicate end frame
- [ ] 4K export uses the requested render resolution (or a clear GPU-limit error)
- [ ] Replacing logos disposes previous geometries / env targets
- [ ] Unsupported transparent WebM is disabled — never an opaque video
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] `prefers-reduced-motion` pauses spin
- [ ] Component exported from `lab/src/components/projects/web-apps/chromemark/index.ts`

## Open decisions

- ProRes 4444 encoder path is structured but not shipped in V1.
- WebM alpha depends on Chromium WebCodecs; PNG sequence is the production fallback.

## Accepted decisions

- Integrate into Maser-Lab Next.js (not a new Vite app).
- ZIP via existing `fflate`, not JSZip.
- Imperative Three.js, not R3F, so export/alpha stay explicit.
- Product kind: app surface. Registry status stays `building` until Harden + audit.
