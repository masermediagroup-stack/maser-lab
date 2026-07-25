# Project: Torn Gradient Transitions

**Slug:** `torn-gradient-transitions`
**Category:** layout
**Status:** building
**Created:** 2026-07-25

## Design reference

- Figma: none
- Behavioural reference: [glimm.dev](https://glimm.dev) — persistent full-screen shader layer, directional sweeps, palette/duration/easing/band controls, mid-transition content swap, provider + link + hook API. **Control model and DX reference only — not a visual clone.**
- Lab UI pattern: `text-animation-lab` / `page-transitions-lab` workspace (monochrome chrome, stage → controls → export)
- Design spec: `FIGMA.md`
- Architecture notes: `NOTES.md`

## Skills loaded

- `maser-lab-web` (Implement) — modes, lifecycle, demo/product split, motion judgment
- `maser-lab-threejs` (Implement + Shader Systems) — raw Three.js quad, disposal, fallbacks, quality gates
- `threejs-shaders` — `ShaderMaterial`, uniform typing, derivative extensions, perf rules
- `maser-lab-project-scaffold` — spec → registry → component → `demoRegistry` wiring
- `maser-lab-demo-chrome` — `DemoLabBrand`, `ReducedMotionToggle`, state matrix, product `aria-label`
- `maser-lab-export` — product-only barrel, `TRANSFER.md` contract
- `maser-lab-token-system` — `--tgt-*` product tokens, no `--lab-*` dependency

## Brief

### User / trigger

Two audiences. **Visitors** of a premium site experience the transition a handful of times per session on route change. **Design engineers** use the lab workspace to art-direct the material, then export a configured preset.

### Job

Give a route change physical presence. The screen should read as a sheet of thick, bubbly, gradient-dyed handmade paper being stretched and torn across the viewport — with the destination revealed underneath — rather than a colour mask fading over the interface.

### Current behavior

`page-transitions-lab` covers CSS wipes plus two Three.js one-shots (curtain fall, pixel wormhole). Neither has a persistent shader layer, a reusable provider/link/hook API, procedural material depth, or a full control + export surface.

### Desired outcome

A persistent WebGL overlay driven by one full-screen shader quad, wrapped in a `TornTransitionProvider` / `TornTransitionLink` / `useTornTransition` API, tunable through ~70 live controls across six art-directed presets, exportable as real configured code, and shareable via URL state.

### Success signal

Freeze the transition at 40 % coverage and the leading edge reads as torn material with visible thickness, raised bubbles, fibre breakup and directional light — not a blurred gradient. Controls change the render without remounting the renderer. Exported code contains the current values.

### Non-goals

- Cloning glimm.dev visually
- Capturing real route DOM (html2canvas / View Transitions API)
- A router-specific production adapter (the API is router-agnostic; the lab drives an in-preview page stack)
- Post-processing chains, bloom, or a second WebGL context

## Implementation plan

1. **Scaffold** — spec folder, `projects/registry.json` entry, component folder, `demoRegistry` wiring, catch-all `[slug]` route.
2. **Shader core** — GLSL chunk modules (`noise`, `bubbles`, `paper`, `lighting`) composed into one fragment shader; full-screen triangle-style quad on an orthographic camera.
3. **Renderer** — `TornTransitionOverlay` owns one persistent `WebGLRenderer`, mounted for the provider's lifetime, `setAnimationLoop` only while animating, on-demand single frames while tuning.
4. **State machine** — pure reducer in `transition-state-machine.ts` (`idle → entering → covered → content-swapping → revealing → settling → complete`), advanced by a time-based `step()` rather than timeout chains, with a watchdog against stuck overlays.
5. **Provider / hook / link** — context exposes `startTransition({ onCovered })`, phase, progress; `TornTransitionLink` keeps anchor semantics and modifier-click behaviour.
6. **Lab workspace** — preview stage with four distinct demo pages, preset rail, grouped controls, export panel, performance readout, draggable origin.
7. **URL state + presets** — diff-against-preset encoded into `?tgt=`, `history.replaceState`, debounced.
8. **Harden** — reduced motion, no-WebGL fallback, context loss, mobile quality mode, responsive QA at 320/1280.

## Shader layer stack

| # | Layer | Purpose |
| --- | --- | --- |
| 1 | Direction field | Normalised sweep coordinate per direction mode (linear / diagonal / radial / pointer) |
| 2 | Torn edge | Hierarchical offset: low-frequency lobes → medium tears → ridged fibres → fragments/holes → bridges |
| 3 | Bubble field | Jittered, domain-warped Voronoi spherical caps with per-cell radius, smooth merge creases, edge inflation, pointer response |
| 4 | Paper | Anisotropic fibres, pulp grain, speckle, wrinkles, density variation, deckle |
| 5 | Height + normals | Analytic bubble gradient + 3-tap micro-detail gradient + analytic edge bulge |
| 6 | Lighting | Diffuse, rim, Blinn-Phong specular, cavity AO, edge highlight, underside darkness, cast shadow |
| 7 | Gradient | Cosine / stops / spectral / mono palettes, bent by the height field and normals |
| 8 | Finishing | Grain, dither, edge glow, chromatic separation, vignette, alpha |

## States

- [x] idle (renderer mounted, loop paused, canvas pointer-events none)
- [x] entering (lead edge sweeping in)
- [x] covered (full coverage hold)
- [x] content-swapping (page stack swaps under the sheet)
- [x] revealing (trail edge sweeping out)
- [x] settling
- [x] complete → idle
- [x] scrubbed / frozen (manual progress inspection)
- [x] interrupted (new transition during an active one)
- [x] rapid repeat navigation
- [x] reduced motion (opacity crossfade, no shader animation)
- [x] WebGL unavailable (CSS soft-wipe fallback)
- [x] WebGL context lost / restored
- [x] mobile quality mode
- [x] custom preset saved
- [x] URL-restored settings

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Engine | Raw Three.js `ShaderMaterial` on one full-screen quad | No R3F reconciler in the hot path; matches `pixel-wormhole-scene` precedent; one context for the provider's life |
| Clock | Single rAF driven by the overlay, phase derived from elapsed time | Timeout chains desync under tab-throttling and interruption |
| Progress → edge | Two independent signed edges (`uLead`, `uTrail`) | Lets the sheet genuinely pass over the viewport instead of fading out |
| Swap timing | `swapMidpoint` measured against *coverage*, not wall clock | Content can never change while the user can still see the old page |
| Easing | `expo`/`quint`/`circ` out-in family + edge-velocity shaping | Decelerated arrival without spring bounce on a full-screen mask |
| Reduced motion | 160 ms opacity crossfade, shader loop never starts | `rule/reduced-motion-required` — keeps state clarity, removes travel |
| Idle cost | `setAnimationLoop(null)` when phase is `idle` and nothing is being tuned | `rule/gpu-properties-only` spirit — do not burn GPU for a static overlay |
| Interruption | New transition during `revealing`/`settling` restarts intro; during `entering`/`covered` it re-targets `onCovered` | `rule/interruptible-dynamic-motion` — never queue a second overlay |

## Presets

| Preset | Direction | Character |
| --- | --- | --- |
| Soft Pulp | left→right | Warm off-white, cream/gray/blush, wide soft edge, gentle bubbles |
| Iridescent Tear | diagonal | Violet/blue/silver/white, medium depth, strong reflections, non-metallic |
| Carbon Paper | right→left | Black/charcoal/graphite, fibrous edge, strong grain, controlled highlights |
| Inflated Gradient | radial expand | Large merged bubbles, cyan→violet, thick material |
| Deckled White | bottom→top | Monochrome white pulp, rough deckled edge, deep cavity shadow |
| Electric Fiber | pointer origin | Black base, orange/red/magenta fibres travelling through the tear |

## Acceptance criteria

- [ ] Demo route `/demos/torn-gradient-transitions` renders via `DemoHost` + `demoRegistry`
- [ ] One persistent WebGL context; no context created per transition
- [ ] Six presets, each visually distinct and art-directed
- [ ] All control groups (Motion, Shape, Bubbles, Paper, Depth & Lighting, Gradient, Finishing) affect the render live without remount
- [ ] Four distinct demo pages with real content variety
- [ ] All eight direction modes work
- [ ] Provider / Link / hook API exported from `index.ts` (product-only)
- [ ] Export panel emits code containing current values across 6 tabs
- [ ] URL round-trip restores preset + control deltas
- [ ] `prefers-reduced-motion` uses an opacity crossfade and never starts the shader loop
- [ ] No-WebGL fallback keeps navigation usable
- [ ] Renderer pauses while idle (verified via FPS readout / instrumentation)
- [ ] Rapid repeated navigation cannot leave the overlay stuck
- [ ] Keyboard, modifier-click and touch/swipe navigation work
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Responsive at 320 and 1280

## Research notes

- Official Three.js docs checked: `WebGLRenderer` (`setAnimationLoop`, `setPixelRatio`, `forceContextLoss`), `ShaderMaterial` (uniforms, `glslVersion`), `OrthographicCamera`, `PlaneGeometry`, `BufferGeometry`, `Color.setHex`/`convertSRGBToLinear`, `WebGLRenderer.outputColorSpace`.
- `webglcontextlost` / `webglcontextrestored` handled on the canvas element directly; `event.preventDefault()` is required for restore to fire.
- GLSL is authored as typed template-literal modules (`*.glsl.ts`). The repo has no raw-loader/glslify rule in `next.config.ts`, and the existing `pixel-wormhole-scene` precedent is inline `/* glsl */` strings — `.glsl.ts` keeps the chunk structure without adding a bundler dependency.
- Bubble normals are analytic. For a spherical cap of radius `r` centred at the Voronoi site, `h = sqrt(1 − (d/r)²)` and `∇h = −offset / (r² · h)`, so the nearest-site offset returned by the Voronoi pass gives an exact gradient for free — no extra height taps.

## Open decisions

- Should the production adapter ship for Next.js App Router first, or stay router-agnostic with a documented recipe?
- Should a future version drive real DOM snapshots (View Transitions API) under the sheet instead of an in-preview page stack?
