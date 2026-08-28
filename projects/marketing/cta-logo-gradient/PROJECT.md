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
Read the mark as living Maser blue: a wash of brand blue with a slight white highlight and a slight darker blue traveling through the glyph, while desktop still gets the production 3D tilt.

### Current behavior
Production `CtaLogoTilt` is a static `#2cafff` SVG with pointer tilt (`MAX_TILT_X=14`, `MAX_TILT_Y=16`, `MAX_LIFT=14`, `LERP=0.12`) and a hover drop-shadow lamp. Closed prism-wave / filament experiments are a different look and are not reused here.

### Desired outcome
First paint already shows a moving gradient through Blue-HD. A vgpu fragment wash upgrades it when the GPU is actually painting. Glow stays inside the mark. No lamp off the silhouette. Tilt matches production on fine pointer / desktop and drops on phones and reduced motion. The gradient always runs.

### Success signal
`/demos/cta-logo-gradient` never blanks the lockup. CSS wash is visible before GPU. Desktop mouse tilt matches production throw. Touch and `prefers-reduced-motion` keep the wash and drop the tilt.

### Non-goals
Filaments, electric wander, chromatic worms, prism-wave, hover drop-shadow lamps, wide-stage hit targets, computer-use verification.

## States

- [ ] default (CSS moving wash through Blue-HD)
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
| Library | CSS transform wash + vgpu `effect`/`frameLoop` | CSS is first paint; GPU is the same wash, not a different material |
| Tilt | Production CtaLogoTilt numbers | Keep the desktop 3D throw |
| Duration | Continuous wash (~9s at 1×); tilt lerp 0.12 | Brand moment, not UI chrome |
| Easing | Linear wash travel; tilt lerp | Travel reads as a gradient, not a bounce |
| Reduced motion | Tilt off; wash on | Explicit: gradient always runs |

## Three.js / 3D (optional)

| Field | Value |
| --- | --- |
| Target type | Fullscreen fragment wash, CSS-masked to the lockup |
| Renderer | WebGPU via vgpu; CSS fallback |
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
Moving Maser-blue gradient through Blue-HD. Slight white highlight and slight darker blue in the travel. Glow inside the glyph. Production tilt on fine pointer. Lamp off. CSS first; vgpu when painting.

Rationale:
Matches the user drop without inheriting prism-wave / filament language.

Evidence:
Production `CtaLogoTilt.tsx` + `globals.css` `.mm-cta__logo-*`; user brief 2026-08-28.

Exceptions:
Gradient ignores reduced-motion (explicit). Tilt does not.

Assumptions:
WebGPU may be absent on the public preview GPU; CSS wash is the guaranteed look.

Open decisions:
Exact highlight/shade mix is knob-tunable in the demo; defaults are the product.

Approver:
User brief (Implement).

## Acceptance criteria

- [ ] Demo route `/demos/cta-logo-gradient` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] CSS wash is visible on first paint; CSS is not hidden until GPU has presented a frame
- [ ] Blue-HD never blanks
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
