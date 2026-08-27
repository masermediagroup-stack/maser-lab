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
Read the Blue-HD cloud mark as a prism: a white vapor band travels through the silhouette while Maser blue holds the body. Existing CSS 3D tilt still works on fine pointers.

### Object
`CtaLogoPrismWave` — rasterized logo texture + vgpu fullscreen `effect()` on the CSS tilt plane (not a page-wide shader).

### Current behavior
Production `CtaLogoTilt` tilts the SVG and adds a hover lamp / drop-shadow on `.mm-cta__logo--active`. No wave.

### Desired outcome
White band masked to the mark. Tiny cool (cyan-ish) fringe on the leading edge only — that is the prism. Not an 80s pink/cyan rainbow, not a hue sweep. Hover lamp gone. Tilt kept. Wave always runs (including reduced motion and coarse pointers). Tilt drops on reduced motion and on phones / coarse pointers (same gate as production).

### Success signal
First screen is the real Blue-HD mark with the traveling band. Desktop mouse tilts the plane; the band stays on that plane. Phone and RM keep the wave and lose the tilt. Blue body holds.

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
A white vapor band loops through the cloud. Tilt follows the pointer on desktop.

### Reversibility
Pointer leave eases tilt to rest. Reduced-motion toggle / OS RM / coarse pointer: tilt off, wave continues. Tab hide / off-screen: rAF pauses. WebGPU unavailable or canvas flattening: CSS mask sweep on the same plane.

## States

- [x] idle (slow band, no tilt)
- [x] hover (fine pointer — CSS 3D tilt; band stays on the logo plane)
- [x] prefers-reduced-motion (wave on, tilt off)
- [x] coarse pointer / phone (wave on, tilt off)
- [x] light ground / dark ground (demo; same blue mark)
- [x] tab hidden / off-screen (rAF paused)
- [x] WebGPU unavailable or flatten (CSS mask sweep fallback)
- [ ] focus (N/A — mark is not a link in the lab)
- [ ] loading / success / error / disabled (N/A)

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Wave library | vgpu `effect()` (WGSL, one device) | Locked build — not a raw WebGL stack |
| Logo sampling | Rasterize Blue-HD.svg → texture | vgpu cannot sample SVG |
| Tilt | Production CSS 3D (`--cta-logo-tilt-*`) | Same plane as the canvas |
| Hover lamp | Removed | Locked look |
| Idle wave | Slow UV band | Always-on, not UI chrome (`rule/ui-duration-cap` exception) |
| Hover wave | Same band, plane tilts; modest speed-up | Band travels *with* the tilt, still 2D fill |
| Reduced motion | Wave stays; tilt gated off | Explicit exception to `rule/reduced-motion-required` for the wave only |
| Hover gate | `(hover: hover) and (pointer: fine)` | `rule/hover-gated`; matches production CtaLogoTilt |
| Fallback | CSS mask sweep on the same viewport | If WebGPU canvas flattens `preserve-3d` |

## Three.js / 3D (optional)

| Field | Value |
| --- | --- |
| Target type | 2D fill on the CSS-tilted logo plane |
| Renderer | WebGPU via vgpu (not Three.js) |
| Decorative? | yes — CSS fallback still shows the mark + wave |
| Fallback | CSS `mask-image` sweep, same plane |
| Mobile strategy | Wave full; tilt off (coarse pointer) |
| Reduced motion | Wave full; tilt off |
| Research docs checked | Production `CtaLogoTilt.tsx`; vgpu `concepts-effects`, `getting-started`, `nextjs`, `surface`, `effect` |
| CloudAI-X skills used | none (vgpu, not Three.js) |

## Acceptance criteria

- [ ] Demo route `/demos/cta-logo-prism-wave` renders via DemoHost
- [ ] `npm run lint` and `npm run build` pass in `lab/` (project files)
- [ ] First screen is the Blue-HD mark with the wave (rendered)
- [ ] Desktop mouse tilt works; wave stays on the tilted plane (rendered)
- [ ] Wave keeps running on phone and with reduced motion; tilt does not (rendered)
- [ ] Hover lamp / extra glow on `--active` is gone (rendered)
- [ ] No 80s rainbow; blue body holds; fringe is a tiny cool leading edge (rendered)
- [ ] Demo knobs: wave speed, band width, fringe amount (lab only)
- [ ] Shared `DemoControlMenu` chrome — opaque left rail desktop; product first screen on phone
- [ ] One GPU context + one rAF; pause off-screen; dispose on unmount; compile once
- [ ] Flattening / no-WebGPU uses CSS mask fallback on the same plane (`data-wave-mode`)
- [ ] Component exported from `index.ts` (product-only; knobs stay in the demo)

## Open decisions

None for this drop — look and build are locked. Remaining judgment is on the live canvas (Elite Pixel Guy).

## Accepted decisions

- Wave always runs; tilt is the only thing that drops on RM / coarse pointers (brief).
- 2D fill on the logo plane — no depth lighting, no belly pin, no light-angle knob (brief).
- Canvas lives inside the CSS 3D viewport, not behind the page (brief).
- Demo knobs are lab-only and never enter the product barrel (`maser-lab-export`).
