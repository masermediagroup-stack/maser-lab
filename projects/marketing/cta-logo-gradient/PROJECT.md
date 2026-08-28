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
Read the mark as Blue-HD with a looping four-corner Maser-blue wash (`#10a4ff` + slight white + darker blue). A uniform tiny white ASCII grid fills the whole glyph; seeded cells punch out and return in place. Characters never leave the mark.

### Current behavior
Production `CtaLogoTilt` is a static `#2cafff` SVG with pointer tilt (`MAX_TILT_X=14`, `MAX_TILT_Y=16`, `MAX_LIFT=14`, `LERP=0.12`) and a hover drop-shadow lamp. Closed prism-wave / filament experiments, pond-ripple ASCII, and the footer column-wave are different looks and are not reused here.

### Desired outcome
First paint already shows a looping four-corner Blue-HD wash. A uniform tiny white ASCII grid sits on that wash, clipped sharp to the mark. Glyph size stays at footer font/cell ÷5. Occupancy twinkles from a per-cell seed — no drift, slide, or scale. A vgpu fragment wash upgrades the color body when the GPU is actually painting. CSS wash stays until then. No lamp off the silhouette. Tilt matches production on fine pointer / desktop and drops on phones and reduced motion. The gradient always loops with no seam.

### Success signal
`/demos/cta-logo-gradient` never blanks the lockup. CSS wash is visible before GPU. The wash loops forever (first frame = last frame). White ASCII grain covers the mark. Desktop mouse tilt matches production throw. Touch and `prefers-reduced-motion` keep the wash and drop the tilt.

### Non-goals
Filaments, electric wander, chromatic worms, prism-wave, hover drop-shadow lamps, wide-stage hit targets, computer-use verification, cloning ASCII-effect white-on-black skin, rainbow, readable type / terminal dumps around the logo, frozen grid with only a light band, slanted brightness wipe / fade-to-off sweep, cell-scale bulge toward camera, circular orb, black holes in the mark, black page ground, pond rings, footer column-wave, RGB dust, colored ASCII, Maser-blue glyphs.

## States

- [ ] default (CSS moving wash through Blue-HD + tiny white ASCII grid)
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
| Library | CSS four-corner wash + vgpu bilinear corners + 2D canvas ASCII | CSS is first paint; GPU is the same 4-corner cycle. ASCII occupancy twinkles in place |
| Loop | Corner palette cycle: one period per `--clg-period`; first frame = last frame | No snap / rewind at the seam |
| Grain | Uniform tiny grid, charset `.:+x*#`, white `#ffffff`, footer scale ÷5, seeded occupancy, clipped to Blue-HD | Coverage + scale locked. Cells punch out/in; grid does not move |
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
Moving four-corner Maser-blue wash through Blue-HD. Slight white highlight and slight darker blue at cycling corners. Uniform tiny white ASCII grid with seeded occupancy twinkle. Production tilt on fine pointer. Lamp off. CSS first; vgpu when painting.

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
- [ ] ASCII is a uniform tiny white grid (`.:+x*#`, footer font/cell size ÷5) filling Blue-HD; `#ffffff` only; clipped sharp to the mark
- [ ] ASCII occupancy uses a per-cell seed (not Math.random per frame); cells punch out and return without drifting, sliding, or scaling
- [ ] ASCII never uses footer column-wave, Maser-blue glyphs, RGB dust, or palette scatter; no pond rings, slanted shutdown, cell bulge, or filament
- [ ] Tilt uses MAX_TILT_X=14, MAX_TILT_Y=16, MAX_LIFT=14, LERP=0.12; perspective on the viewport
- [ ] Hit is a rounded box around the lockup, not the wide stage
- [ ] Lamp off (no hover drop-shadow)
- [ ] Tilt only on fine pointer / desktop; drops on phones and reduced motion
- [ ] Gradient always runs
- [ ] Shared `DemoControlMenu` chrome; knobs in the demo, not the product barrel
- [ ] Component exported from `lab/src/components/projects/marketing/cta-logo-gradient/index.ts`

## Open decisions

- Fine-tuning of highlight/shade/glow amounts lives on demo knobs until a Harden pass.

## Accepted decisions

- New slug from `main`. Do not continue PR 59. Do not reuse prism-wave / filament / electric wander shaders.
- Skills loaded: `maser-lab-web` (Implement), `maser-lab-project-scaffold`, `maser-lab-demo-chrome`, `maser-lab-export` (barrel), `vgpu` (https://vgpu.sh), `verification`.
- Rule IDs: `rule/hover-gated`, `rule/reduced-motion-required` (tilt only), `rule/gpu-properties-only` (CSS wash uses `transform`), `rule/demo-all-states`, `rule/project-isolation`.
