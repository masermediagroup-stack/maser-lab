# Run locally

This project is meant to be developed and previewed on your machine — not only in Cursor Cloud.

## Setup

```bash
cd lab
npm install
npm run dev
```

Open **http://localhost:3000/demos/cta-logo-prism-wave**

Needs WebGPU for the primary path. Chrome/Edge with WebGPU, or Firefox 141+. Judge the live shell: `data-wave-mode="vgpu"` means an adapter existed and the canvas path ran. CSS (`data-wave-mode="css"`) is **only** when `navigator.gpu` is missing or `requestAdapter()` returns null (or the device is later lost). Compile/upload/frame errors are logged; they do not dump a WebGPU machine onto CSS.

## Quality checks

```bash
cd lab
npm run lint
npm run build
```

## Cursor IDE (local agent)

1. Open this repo in **Cursor Desktop** (not Cloud Agent).
2. Load `maser-lab-web` (Implement) plus vgpu docs (`npx -y vgpu docs cat concepts-effects`).
3. Do **not** edit masermediagroup-stack/maser-media.

## Component path

`lab/src/components/projects/marketing/cta-logo-prism-wave/`

## Spec

`projects/marketing/cta-logo-prism-wave/PROJECT.md`

## WebGPU vs CSS 3D

The visible filament overlay is a **2D canvas** (or CSS snake) inside `.clpw-logo-viewport`, the element that receives `perspective() rotateX/rotateY/translateZ` from `--cta-logo-tilt-*`.

The WebGPU canvas is **not** a child of that plane. A GPU canvas inside `preserve-3d` flattens ancestor perspective in Chromium, so MAX_TILT 14°/16° reads as a slight squash (~0.1deg). Lab renders off-tree (`.clpw-gpu-host`) and blits onto the 2D canvas in the tilted viewport. Production `CtaLogoTilt` keeps `perspective` on `.mm-cta__logo-link` because there is no WebGPU child.

`start-wave.ts` does **not** auto-switch from a CSS transform-string probe. An untilted `preserve-3d` plane still computes as `matrix3d`, so that check false-positives at rest and would kill the GPU path on every load.

**Compile gate:** never `effect.compile(canvasSurface)` outside `frame()`. vgpu throws `VGPU-SURFACE-NOT-IN-FRAME` ("precompile against an offscreen `target(gpu, …)` instead"). That catch used to dump Chrome-with-WebGPU onto CSS. Compile against a canvas-format **signature**, then draw the surface inside `frameLoop`.

Do not flip to CSS on every `gpu.onError` — validation noise is logged. CSS only when the adapter is actually missing, or the device is lost (`VGPU-DEVICE-LOST` / `gpu.lost`).

**Canvas size:** measure `.clpw-logo-viewport` with `getBoundingClientRect() × DPR` on mount and resize. Cover that box with `position:absolute; inset:0; width:100%; height:100%`. `surface({ autoResize: false, size })` — never let a replaced canvas's intrinsic 300×150 become the backing store. The demo dock does not size the canvas.

**Compositing:** Blue-HD.svg is always an `<img>` in the tilt viewport. A CSS-masked `#10a4ff` layer retints when mask-image works. The vgpu filament is blitted onto a 2D canvas in that viewport (GPU source stays off-tree). CSS fallback is an SVG snake (forks/pinches) masked to the same glyph — not a linear-gradient slit. The mark must not disappear if the pipeline misses or the canvas is empty.

**Tilt (lab vs production):** Overlay layers are `pointer-events: none`, so the pointer often hits `.clpw-logo-stage`. Lab listeners are capture-phase on the stage; mapping uses the **shell** rect (production hover box, MAX_TILT_X=14 / MAX_TILT_Y=16 / MAX_LIFT=14 / LERP 0.12). Vars write on the viewport. Perspective is `perspective(920px)` on the viewport transform (lab) so flatten cannot kill the throw; production keeps it on `.mm-cta__logo-link`. Lab tilts on mouse/pen even when `(hover: hover) and (pointer: fine)` is false. Production keeps that media gate. Touch and reduced motion still skip tilt. No `.mm-cta__logo--active` lamp.

## Transfer

- Per-project notes: `projects/marketing/cta-logo-prism-wave/TRANSFER.md`
- Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` (Transfer checklist)
