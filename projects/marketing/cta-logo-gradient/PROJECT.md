# Project: CTA Logo Gradient

**Slug:** `cta-logo-gradient`  
**Category:** marketing  
**Status:** building  
**Created:** 2026-08-28

## Design reference

- Figma: none
- Other: Production Maser Media `CtaLogoTilt` + `Blue-HD.svg` lockup
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Lab and portfolio viewers looking at the Maser Media CTA lockup. Occasional — a brand moment, not high-frequency chrome.

### Job
Read the mark as Blue-HD with a looping four-corner Maser-blue wash (`#10a4ff` + slight white + darker blue). A uniform tiny ASCII grid fills the whole glyph and stays fully filled. Glyphs take that same four-corner loop at opposite phase. Characters never leave the mark.

### Current behavior
Production `CtaLogoTilt` is a static `#2cafff` SVG with pointer tilt (`MAX_TILT_X=14`, `MAX_TILT_Y=16`, `MAX_LIFT=14`, `LERP=0.12`) and a hover drop-shadow lamp. Closed prism-wave / filament experiments, pond-ripple ASCII, and the footer column-wave are different looks and are not reused here.

### Desired outcome
First paint already shows a looping four-corner Blue-HD wash. A uniform tiny ASCII grid sits on that wash, clipped sharp to the mark. Glyph size stays at footer font/cell ÷5. Every cell stays filled — no sparkle, wink, or punch-out. Glyphs sample the same four-corner loop at opposite phase from the logo body. No drift, slide, or scale. A vgpu fragment wash upgrades the color body when the GPU is actually painting. CSS wash stays until then. No lamp off the silhouette. Tilt matches production on fine pointer / desktop and drops on phones and reduced motion. The gradient always loops with no seam.

### Success signal
`/demos/cta-logo-gradient` never blanks the lockup. CSS wash is visible before GPU. The wash loops forever (first frame = last frame). ASCII grain covers the mark and is the reverse-phase four-corner wash. Desktop mouse tilt matches production throw. Touch and `prefers-reduced-motion` keep the wash and drop the tilt.

### Non-goals
Filaments, electric wander, chromatic worms, prism-wave, hover drop-shadow lamps, wide-stage hit targets, computer-use verification, cloning ASCII-effect white-on-black skin, rainbow, readable type / terminal dumps around the logo, frozen grid with only a light band, slanted brightness wipe / fade-to-off sweep, cell-scale bulge toward camera, circular orb, black holes in the mark, black page ground, pond rings, footer column-wave, RGB dust, sparkle / punch-out occupancy, seeded disappear.

## States

- [ ] default (CSS moving wash through Blue-HD + tiny ASCII grid, reverse-phase fill)
- [ ] gpu-painting (canvas wash after first presented frame; CSS may then hide)
- [ ] gpu-unavailable (CSS wash stays; lockup never blanks)
- [ ] hover tilt (fine pointer / desktop only)
- [ ] rest (tilt lerps back to 0)
- [ ] touch / coarse pointer (no tilt; wash still runs)
- [ ] prefers-reduced-motion / demo RM toggle (no tilt; wash still runs)
- [ ] focus-visible on the lockup hit

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS four-corner wash + vgpu bilinear corners + 2D canvas ASCII | CSS is first paint; GPU is the same 4-corner cycle. Glyphs use opposite phase |
| Loop | Integrated phase (`d(phase)/dt = speed`); angle is heading; first frame = last frame | Speed/angle knobs must not snap or freeze the wash |
| Grain | Uniform tiny grid, charset `.:+x*#`, footer scale ÷5, fully filled, reverse 4-corner wash, clipped to Blue-HD | Coverage + scale locked. No sparkle. Grid does not move |
| Tilt | Production CtaLogoTilt numbers | Keep the desktop 3D throw |
| Duration | Continuous wash (~9s at 1×); tilt lerp 0.12 | Brand moment, not UI chrome |
| Easing | Linear wash travel; tilt lerp | Travel reads as a gradient, not a bounce |
| Reduced motion | Tilt off; wash on | Explicit: gradient always runs |

## Three.js / 3D (optional)

| Field | Value |
| --- | --- |
| Target type | Fullscreen fragment wash, CSS-masked to the lockup |
| Renderer | WebGPU via vgpu; CSS fallback. ASCII is Canvas 2D |
| Decorative? | yes — page works without canvas |
| Fallback | CSS masked gradient (mounted first) |
| Mobile strategy | Full wash; no tilt |
| Reduced motion | Wash continues; tilt disabled |
| Research docs checked | [vgpu web](https://vgpu.sh/docs/get-started/web), [effects](https://vgpu.sh/docs/concepts/effects), [frames](https://vgpu.sh/docs/concepts/frames), [Next.js](https://vgpu.sh/docs/guides/nextjs) |
| CloudAI-X skills used | none (not Three.js) |

## Decision: CTA logo gradient wash

Status: accepted (this Implement brief)

Scope: `marketing/cta-logo-gradient`

Decision:
Moving four-corner Maser-blue wash through Blue-HD. Slight white highlight and slight darker blue at cycling corners. Uniform tiny ASCII grid, fully filled, reverse-phase four-corner wash on the symbols. Production tilt on fine pointer. Lamp off. CSS first; vgpu when painting.

Rationale:
Matches the user drop without inheriting prism-wave / filament / pond / footer-wave language.

Evidence:
Production `CtaLogoTilt.tsx` + `globals.css` `.mm-cta__logo-*`; user brief 2026-08-28.

Exceptions:
Gradient ignores reduced-motion (explicit). Tilt does not.

Assumptions:
WebGPU may be absent on the public preview GPU; CSS wash is the guaranteed color body. ASCII is Canvas 2D and does not need WebGPU.

Open decisions:
Exact highlight/shade mix is knob-tunable in the demo; defaults are the product.

Approver:
User brief (Implement).

## Acceptance criteria

- [ ] Demo route `/demos/cta-logo-gradient` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] CSS wash is visible on first paint; CSS is not hidden until GPU has presented a frame
- [ ] Blue-HD never blanks
- [ ] Wash is a four-corner palette cycle (first frame = last frame) on both CSS and vgpu; no snap at the seam
- [ ] ASCII is a uniform tiny grid (`.:+x*#`, footer font/cell size ÷5) filling Blue-HD; every cell stays filled; clipped sharp to the mark
- [ ] ASCII has no sparkle, punch-out, wink, or seeded disappear; glyphs do not drift, slide, or scale
- [ ] Glyphs sample the same four-corner loop as the logo wash at opposite phase (first frame = last frame)
- [ ] ASCII never uses footer column-wave, RGB dust, pond rings, slanted shutdown, cell bulge, or filament
- [ ] Tilt uses MAX_TILT_X=14, MAX_TILT_Y=16, MAX_LIFT=14, LERP=0.12; perspective on the viewport
- [ ] Hit is a rounded box around the lockup, not the wide stage
- [ ] Lamp off (no hover drop-shadow)
- [ ] Tilt only on fine pointer / desktop; drops on phones and reduced motion
- [ ] Gradient always runs
- [ ] ASCII cell size is pinned (footer font 22 ÷ 5); the lattice restrokes only when the canvas bitmap size changes, never on dock knob ticks
- [ ] Dock knobs only retint / update uniforms; White/Glow must not bleach glyphs out of the mark
- [ ] Wash phase is integrated (`d(phase)/dt = speed`); Speed and Angle knobs must not snap, freeze, or kill the loop
- [ ] Knob ticks only update uniforms / retint; they must not remount the vgpu surface, WebGL context, or ASCII lattice
- [ ] Component exported from `lab/src/components/projects/marketing/cta-logo-gradient/index.ts`

## Open decisions

- Fine-tuning of highlight/shade/glow amounts lives on demo knobs until a Harden pass.

## Accepted decisions

- New slug from `main`. Do not continue PR 59. Do not reuse prism-wave / filament / electric wander shaders.
- Skills loaded: `maser-lab-web` (Implement), `maser-lab-project-scaffold`, `maser-lab-demo-chrome`, `maser-lab-export` (barrel), `vgpu` (https://vgpu.sh), `verification`.
- Rule IDs: `rule/hover-gated`, `rule/reduced-motion-required` (tilt only), `rule/gpu-properties-only` (CSS wash uses `transform`), `rule/demo-all-states`, `rule/project-isolation`.
