# Project: CTA Logo Prism Wave

**Slug:** `cta-logo-prism-wave`  
**Category:** marketing  
**Status:** building  
**Created:** 2026-08-27  
**Kind:** section (CTA logo mark + CSS 3D tilt)

## Design reference

- Figma: none
- Other: Live production [masermedia.co](https://masermedia.co) CTA (`#contact`) — `CtaLogoTilt` + `.mm-cta__logo-*` in maser-media `next-app`. Asset: `/assets/Blue-HD.svg`
- Design spec: `FIGMA.md` (no file)

## Brief

### User / trigger
Lab visitor judging the Maser cloud mark. Occasional — pointer hover on desktop; always-on wave on phones. Not high-frequency chrome.

### Job
Read the Blue-HD cloud mark as a prism: sequential continuous glass lines travel through the silhouette (deeper blue on light, pale on dark) while Maser blue holds the body as solid glass. Glow lives inside the glyph. Existing CSS 3D tilt still works on fine pointers.

### Object
`CtaLogoPrismWave` — rasterized logo texture + vgpu fullscreen `effect()` on the CSS tilt plane (not a page-wide shader).

### Current behavior
Production `CtaLogoTilt` tilts the SVG and adds a hover lamp / drop-shadow on `.mm-cta__logo--active`. No wave.

### Desired outcome
2–5 similar-weight continuous glass lines in the mark at once, overlapping. Each trip enters from a random place on the glyph (edges, top, bottom, right, corners) — not a single left-middle origin. RGB split / prism fringe on the stroke, cyan-leaning at the lead (not an 80s rainbow, not blobs, not a halo around the mark). Not dashed wedges, not a lamp off the mark. Light ground: deeper blue through the glass. Dark ground: pale internal line. Glow is in-glyph only. Logo body is Maser blue solid glass. Hover lamp gone. Tilt kept. Wave always runs (including reduced motion and coarse pointers). Tilt drops on reduced motion and on phones / coarse pointers (same gate as production). CSS filament stays visible until the GPU blit actually paints pixels.

### Success signal
First screen is blue glass + overlapping glass lines (never a blank wait for GPU compile). Desktop mouse tilts the plane; the filament stays on that plane. Phone and RM keep the wave and lose the tilt.

### Non-goals
- Touching the maser-media client repo
- Three.js / dither engine / page-wide background shader
- Per-pixel lighting, depth, belly pin, light-angle knob
- 80s rainbow / hue sweep
- Product export of demo knobs
- Full CTA section (headline + Start a project)

### Scope
One marketing-category lab section + demo route. Lab chrome OK.

### Action
Look at the mark. Hover (fine pointer) to tilt.

### Consequence
Two to five glass lines occupy the cloud together. Tilt follows the pointer on desktop.

### Reversibility
Pointer leave eases tilt to rest. Reduced-motion toggle / OS RM / coarse pointer: tilt off, wave continues. Tab hide / off-screen: rAF pauses. WebGPU unavailable: SVG snake filament on the same plane (CSS fallback).

## States

- [x] idle (slow band, no tilt)
- [x] hover (fine pointer — CSS 3D tilt while over the rounded lockup pad; band stays on the logo plane)
- [x] prefers-reduced-motion (wave on, tilt off)
- [x] coarse pointer / phone (wave on, tilt off)
- [x] light ground / dark ground (demo; same blue mark)
- [x] tab hidden / off-screen (rAF paused)
- [x] WebGPU unavailable or flatten (SVG snake filament fallback)
- [ ] focus (N/A — mark is not a link in the lab)
- [ ] loading / success / error / disabled (N/A)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Wave library | vgpu `effect()` (WGSL, one device) | Locked build — not a raw WebGL stack |
| Logo sampling | Rasterize Blue-HD.svg → texture | vgpu cannot sample SVG |
| Tilt | Production constants (14 / 16 / 14, lerp 0.12). Perspective baked into the viewport transform; GPU canvas is off-tree and blitted onto a 2D overlay on that plane | WebGPU child flattened parent perspective; 14° read as a squash |
| Hover lamp | Removed | Locked look |
| Idle wave | 2–5 similar-weight overlapping wanders | Replaces sequential single-file trips; not 50/50 dashed wedges (`rule/ui-duration-cap` exception) |
| Spawn origin | Hashed perimeter per GPU trip; CSS uses 5 spread paths (left, right, top, bottom, corner) | Entries feel random across the lockup — not left-middle every time |
| Hover wave | Same filaments, plane tilts; modest speed-up | Band travels *with* the tilt, still 2D fill |
| Glow | In-glyph only, clipped to Blue-HD | Light through glass — not a drop-shadow lamp off the mark |
| Fringe | RGB split on the stroke, cyan-leaning at the lead (vgpu + CSS) | Prism aberration inside the glass — not a hue sweep, not blobs, not a halo around the mark |
| Reduced motion | Wave stays; tilt gated off | Explicit exception to `rule/reduced-motion-required` for the wave only |
| Hover gate (production site) | `(hover: hover) and (pointer: fine)` | `rule/hover-gated`; CtaLogoTilt on masermedia.co |
| Hover gate (this lab demo) | mouse/pen `pointermove`; skip touch; RM still off | EPG judging box may fail the fine-pointer media |
| Fallback | Overlapping SVG snakes from spread origins, clipped to Blue-HD | Until GPU blit paints, and whenever the adapter is missing |

## Three.js / 3D (optional)

| Field | Value |
| --- | --- |
| Target type | 2D fill on the CSS-tilted logo plane |
| Renderer | WebGPU via vgpu (not Three.js) |
| Decorative? | yes — CSS fallback still shows the mark + wave |
| Fallback | SVG snake path, CSS-masked to Blue-HD, same plane |
| Mobile strategy | Wave full; tilt off (coarse pointer) |
| Reduced motion | Wave full; tilt off |
| Research docs checked | Production `CtaLogoTilt.tsx`; vgpu `concepts-effects`, `getting-started`, `nextjs`, `surface`, `effect` |
| CloudAI-X skills used | none (vgpu, not Three.js) |

## Acceptance criteria

- [x] Demo route `/demos/cta-logo-prism-wave` renders via DemoHost
- [x] `npm run build` passes in `lab/`; project files lint clean (repo `npm run lint` still fails on pre-existing `pixel-info-card` setState-in-effect)
- [x] First screen is the Blue-HD mark with overlapping glass lines (CSS until GPU paints; never a blank compile gap)
- [x] Desktop mouse tilt works; wave stays on the tilted plane (rendered)
- [x] Wave keeps running on phone and with reduced motion; tilt does not (rendered)
- [x] Hover lamp / extra glow on `--active` is gone (rendered)
- [x] No 80s rainbow; blue body is solid glass; 2–5 similar-weight lines; RGB split on the stroke (cyan on the lead); glow inside the glyph
- [x] Demo knobs: wave speed, band width, fringe amount (lab only)
- [x] Shared `DemoControlMenu` chrome — opaque left rail desktop; product first screen on phone
- [ ] One GPU context + one rAF; pause off-screen; dispose on unmount; compile once against a target signature (not the live Surface outside `frame()`). Chrome with WebGPU must report `data-wave-mode="vgpu"` (this VM has no adapter — `vgpu doctor` unhealthy). Canvas CSS box equals the tilt viewport (not 300×150).
- [x] CSS mask fallback is on the same plane from first paint; `data-wave-mode="vgpu"` only after blit copies filament pixels. Adapter missing or empty blit stays `"css"`. Blue-HD never blanks.
- [x] Blue-HD mark is always painted in the tilt viewport (img + CSS retint); wave overlays; empty canvas never replaces the glyph
- [x] Component exported from `index.ts` (product-only; knobs stay in the demo)

## Open decisions

None for this drop — look and build are locked. Remaining judgment is on the live canvas (Elite Pixel Guy).

## Accepted decisions

- Wave always runs; tilt is the only thing that drops on RM / coarse pointers (brief).
- 2D fill on the logo plane — no depth lighting, no belly pin, no light-angle knob (brief).
- Canvas lives inside the CSS 3D viewport, not behind the page (brief).
- The Blue-HD mark is always an `<img>` in that viewport. Shader/CSS paint the filament only.
- Demo knobs are lab-only and never enter the product barrel (`maser-lab-export`).
- Lab tilt hits one rounded pad around the MASER + MEDIA lockup, not letter alpha and not the wide stage. Mouse/pen even if `(hover: hover) and (pointer: fine)` is false. Production `CtaLogoTilt` keeps the fine-pointer gate.
