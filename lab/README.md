# Maser-Lab

Next.js shell for building and previewing micro-interactions and Three.js systems (Tyler Vea / MaserMedia).

**Agent instructions:** see repository root [`../AGENTS.md`](../AGENTS.md).

| Work type | Load first |
| --- | --- |
| UI / motion micro-interactions | [`.agents/skills/micro-interaction-lab/SKILL.md`](../.agents/skills/micro-interaction-lab/SKILL.md) |
| Three.js / shaders / 3D | [`.agents/skills/maser-lab-threejs/SKILL.md`](../.agents/skills/maser-lab-threejs/SKILL.md) |

## Quick start

```bash
npm install   # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the Maser-Lab gallery. Each project demo lives at `/demos/{slug}`.

## Commands

```bash
npm run lint
npm run build
```

## Three.js

Shared utilities: `src/three/`  
First 3D project: `npm install three @types/three`

Workflow: `.agents/skills/maser-lab-threejs/references/workflow.md`  
Knowledge base: `.agents/skills/maser-lab-threejs/references/threejs-notes.md`

## Shell tokens

Maser-Lab gallery chrome: `src/styles/maser-lab-tokens.css` (`.maser-lab` scope).  
Per-project tokens: `src/components/projects/{category}/{slug}/tokens.css`.
