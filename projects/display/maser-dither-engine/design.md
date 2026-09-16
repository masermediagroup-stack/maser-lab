# Maser Dither Engine — Lab craft cut

Lab material engine for procedural dither surfaces. Lab only (`maser-lab`). No client ship in this PR.

No Figma. Package owns the look; Spark names the stack for this cut.

## Reader job

Judge one live dither field in under a second: pattern reads, material has structure, motion is quiet and purposeful. Swap adapter / material / palette / algorithm / **animation preset** / **sliders** without leaving the Lab dock. Studio stays behind Open studio for deep authoring.

## Kind + stack (locked 2026-09-15)

| Call | Lock |
|---|---|
| Kind | GPU **dither field** — ordered / noise threshold patterns on a fullscreen triangle, applied through adapters |
| Stack | **WebGL2** on existing `packages/dither-engine` `SurfaceCanvas` — one shared GLSL pipeline (`stages.ts` + `SurfaceRenderer`) |
| Refuse engines | Three.js scene graph · vgpu wash · second WebGL program · Canvas2D as primary (fallback only) |

Why WebGL2: one program, `gl_VertexID` triangle, `SAMPLE_GLSL` / `uPosterization` contracts. Three would fork materials and add a scene we do not need. vgpu is wash-only and cannot own Bayer / matrix / adapter craft.

## Look thesis

Print-density dither as a **material**, not a filter soup. Default cut reads as graphite paper under a soft wave — ordered Bayer cells at 8×8, measured grain, bloom as light falloff not neon glow. Pattern period stays readable at phone distance. Motion stays in the field (wave), not in chrome.

Steal structure from print halftone + CRT lab tools (matrix size, pattern scale, algorithm personality). Refuse UnrealBloom soup, neon rainbow palettes as house fill, and thumbnail grids of live canvases.

## Default craft cut (first paint — exact)

Assessor must land on this without hunting studio routes.

| Knob | Default |
|---|---|
| Adapter | `field` (full-bleed) |
| Material | `paper` |
| Palette | `graphite` |
| Algorithm | `bayer` |
| Matrix size | `8` |
| Pattern scale | `1` |
| Animation | `wave` |
| Grain / bloom | `MONOCHROME_DEFAULTS` amounts |
| Workspace | craft cut (not studio) |

Cut palette options (dock only): Graphite · Paper · Aurora · Terminal · Chrome.

Cut adapters: Full field · Card · Button · Badge — **one** live `SurfaceCanvas`; adapters swap in place.

## Reads-as (observable)

1. **Field lit** — first paint is a full-bleed dither, never black / never studio Overview empty.
2. **Bayer personality** — ordered cells; matrix 2 / 4 / 8 / 32 / 64 look distinct when changed.
3. **Paper + graphite** — quiet grey print; not Acid / Heat Map house default.
4. **Wave motion** — soft drift across the field; pointer follow stays optional via interaction defaults.
5. **Grain** — film/print noise on the surface, not a second glow layer.
6. **Bloom** — light-shape falloff; slight, not bloom soup.
7. **Adapter swap** — card / button / badge crop the same material into UI shapes without a second GPU context.
8. **Findable knobs** — animation preset + sliders on the craft-cut Lab dock; no Studio / Overview hunt.

## Motion

| Event | Behavior |
|---|---|
| Idle (craft cut) | Wave mode on the field; compositor-friendly uniforms only |
| Reduced motion (OS or dock) | Timeline paused; CRT flicker muted; **surface still visible** (frozen frame, not blank) |
| Offscreen / tab hidden | `IntersectionObserver` + `visibilitychange` → animation loop **stop** (no rAF) |
| DPR | Cap **2**; mobile `uMatLowQ` path unchanged |
| Chrome | No motion on Lab dock open/close beyond Lab chrome standing |

Emile: under 300ms on any UI chrome that animates; never animate keyboard; never animate blur radius (there is no glass on this cut).

## States (reachable on the craft cut)

1. Default field — paper / graphite / Bayer 8 / wave  
2. Adapter card · button · badge  
3. Palette swap (five cut palettes)  
4. Algorithm swap (engine set; Bayer is house for assessor)  
5. Matrix size steps  
6. Grain / bloom / pattern scale tuned  
7. Animation preset swap + that mode’s sliders  
8. Material structure sliders  
9. Reduced motion on  
10. Reset → defaults above  
11. Open studio (lab shell — not the assessor product)

## Lab chrome

- Opaque left rail desktop; product first on phone; knobs under the fold  
- Knobs in `maser-dither-engine-demo.tsx` only — never leak into product barrel  
- Craft-cut dock must expose **Animation preset** (default Wave) plus that mode’s sliders, **Material** plus its structure sliders, and dither grain / bloom / pattern scale — do not hide those behind Studio / Overview  
- Studio (`DitherEngineApp` / `shell/`) behind dock **Open studio** — do not transfer `shell/`  
- Reduced-motion dock control: `aria-label="Toggle reduced motion"`

## Spark Verb+Noun (do)

Keep SingleWebGL2Pipeline · Paint OneSurfaceCanvas · Swap Adapter InPlace · Honor BayerDefault · Pause Loop Offscreen · Freeze Field OnReducedMotion · Cap DPR AtTwo · Gate Studio BehindDock · Keep Knobs InDemo · Surface AnimationPreset OnDock · Keep Sliders OnCraftCut · Sync Portable Package

## Refuse

Three.js / vgpu on this cut · parallel dither renderer · black first paint · studio Overview as demo entry · grid of live thumbs · document scroll-lock fighting knobs-under-fold · bloom soup / neon house palette · shipping `shell/` · inventing a second engine · computerUse as the only QA gate · animation preset / sliders only in studio

## Product vs lab

**Portable:** `engine/`, `react/SurfaceCanvas`, adapters, export, `tokens.css` (see `TRANSFER.md`).  
**Not portable:** demo CSS, `DemoControlMenu` knobs, studio shell.

## Dock discoverability (locked 2026-09-16)

Human: cannot find where to change **animation preset** and **slider options** in the engine. UX fail on the craft cut.

| Call | Lock |
|---|---|
| Decision | Surface animation preset + slider options on the **craft-cut Lab dock**, visible without hunting or opening studio. |
| Scope | Craft cut / Lab dock only. Product barrel stays knob-free. |
| Evidence | Human cannot find animation preset + sliders. |
| Exceptions | Deep authoring stays behind Open studio. |
| Bad | Preset / sliders only in studio Overview, a buried menu, or a second route. |
| Good | Assessor lands on the field and can change animation + sliders from the dock they already see. |

Do not invent look. Tokens, field, defaults unchanged.

Open fail (add): **findable knobs** — animation preset + sliders on the craft-cut dock. Time newest unique until canvas moves.

## Preview (time this)

Dock/canvas unique (time this until canvas moves): https://maser-5wo0byba3-masermediagroup.vercel.app/demos/maser-dither-engine  
PR 69 merged as `e74824f`. Branch alias goes stale on next push.  
Stale unique: https://maser-orajrohfc-masermediagroup.vercel.app/demos/maser-dither-engine

## Eye pass (2026-09-16 — Pixel Pusher dock lock)

No computerUse on this pass (standing). Package locked from live cut defaults + dock discoverability. Human / assessor confirms GPU non-black on the unique URL.

| Beat | Pass if |
|---|---|
| First paint | Full-bleed dither field lit — not black, not studio Overview |
| Default material | Paper + graphite Bayer 8 reads as quiet print |
| Wave | Soft field motion; not thrash |
| Knob swap | Adapter / palette / algorithm / matrix change the same surface |
| Findable knobs | Animation preset + sliders on craft-cut dock; Open studio not required |
| Reduced motion | Field freezes visible; no blank |
| One context | Never more than one live WebGL canvas on the cut |
| Chrome | Dock under fold on phone; left rail desktop; no eyebrow chrome |

### Open fails (confirm on unique)

1. **Non-black GPU** — confirm field is lit on mid-Android / desktop preview (finish agent did not pixel-check).  
2. Encode this file over starter `projects/display/maser-dither-engine/design.md` — Pixel Pusher dock lock encoded 2026-09-16.

Park corrections below when timed.
