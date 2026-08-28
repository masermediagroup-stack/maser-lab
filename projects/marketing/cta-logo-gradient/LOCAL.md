# Run locally

This project is meant to be developed and previewed on your machine — not only in Cursor Cloud.

## Setup

```bash
cd lab
npm install
npm run dev
```

Open **http://localhost:3000/demos/cta-logo-gradient**

WebGPU is required for the vgpu wash. Without it, the CSS gradient through Blue-HD is the look — that is the intended fallback, not a failure.

## Quality checks

```bash
cd lab
npm run lint
npm run build
npx vgpu check src/components/projects/marketing/cta-logo-gradient/wash.wgsl
```

## Cursor IDE (local agent)

1. Open this repo in **Cursor Desktop** (not Cloud Agent).
2. Load `maser-lab-web` (Implement) plus the vgpu skill.
3. Use a **local** terminal for `npm run dev`.

## Component path

`lab/src/components/projects/marketing/cta-logo-gradient/`

## Spec

`projects/marketing/cta-logo-gradient/PROJECT.md`

## Transfer

- Per-project notes: `projects/marketing/cta-logo-gradient/TRANSFER.md`
- Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` (Transfer checklist)
