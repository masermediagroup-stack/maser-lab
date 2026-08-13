# 11 — V2 Future (Horizon)

**Status: STUB / HORIZON** — brainstorm only. **Not a backlog ticket list.**  
Nothing here authorizes violating stable contracts in [01](./01-ENGINE-ARCHITECTURE.md), [02](./02-RENDER-PIPELINE.md), or `engine/AGENTS.md`.

Related: [00-VISION](./00-VISION.md) · [DEVELOPMENT-ROADMAP](./DEVELOPMENT-ROADMAP.md)

## Multi-engine Lab (from v1.5)

Ideas for engines that should **reuse Dither’s contracts** (one program · controllers · export split · product tokens):

- Glass Engine · Liquid Engine · Mesh Gradient Engine · Grain Engine
- Motion Engine · Shader Engine · Typography Engine · Transition Engine
- Canvas Engine · Physics Engine · Particle Engine · Pattern Engine · Noise Engine
- Export Engine (shared packaging) · Component Library · Playground · Inspector
- Preset Studio · Marketplace

First real expansion milestone: **v1.5** (e.g. Liquid / Glass), with this file promoted as those engines are specified.

### “Material engine hub” is not this slug

A Lab index that lets you open **Dither Studio**, **Glass Studio**, **Liquid Studio**, etc. is a **future multi-engine Lab shell** — separate projects under `projects/`, not a rename of `maser-dither-engine` and not nested “inner projects” inside the Dither package. Inside Dither, “materials” remain structure looks on the dither pipeline ([03](./03-MATERIAL-SYSTEM.md)).

## Creative systems (3–5 years)

Node Material Editor · Visual Shader Graph · Procedural Noise Designer · Timeline Editor / Sequencer · Animation Curves · Multi-material blending · Procedural Typography · Theme / Design Tokens / Design System Generator · Motion / Transition Designer · Cursor Playground · Creative Coding Sandbox · Procedural Texture Baker · Plugin API

## AI & collaboration (horizon)

AI Material Generation · Prompt → Material · Cloud Sync · Collaborative Editing · Real-time Multiplayer · Material History / Graph · Component Marketplace

## WebGPU

Optional future path **only** with migration discipline that preserves stage semantics and uniform contracts. Not a sneaky renderer rewrite.

## Promote when

Starting a second engine or marketplace/plugin work → replace this stub with architecture decision records and links to that engine’s own docs under `docs/roadmap/` or `projects/...`.
