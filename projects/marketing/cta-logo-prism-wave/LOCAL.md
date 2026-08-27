# Run locally

This project is meant to be developed and previewed on your machine — not only in Cursor Cloud.

## Setup

```bash
cd lab
npm install
npm run dev
```

Open **http://localhost:3000/demos/cta-logo-prism-wave**

Needs WebGPU for the primary path. Chrome/Edge with WebGPU, or Firefox 141+. If `init()` fails, the demo falls back to a CSS mask sweep on the same tilt plane (`data-wave-mode="css"` on the shell).

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

The visible canvas is a child of `.clpw-logo-viewport`, the element that receives `rotateX/rotateY/translateZ` from `--cta-logo-tilt-*`.

`start-wave.ts` does **not** auto-switch from a CSS transform-string probe. An untilted `preserve-3d` plane still computes as `matrix3d`, so that check false-positives at rest and would kill the GPU path on every load.

Fallback to the CSS mask sweep (`data-wave-mode="css"`) only when `init()` / compile / the device error. Judge flattening on the **live** canvas: if the mark stays screen-aligned while the CSS box tilts, force CSS (or blit to a 2D canvas). Do not leave a page-wide shader behind the mark.

## Transfer

- Per-project notes: `projects/marketing/cta-logo-prism-wave/TRANSFER.md`
- Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` (Transfer checklist)
