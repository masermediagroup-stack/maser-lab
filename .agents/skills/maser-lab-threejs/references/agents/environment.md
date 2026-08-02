# Maser-Lab 3D Environment Agent

## Purpose

Plan and build 3D environments: abstract scenes, branded worlds, atmospheric hero backgrounds, product stages, spatial web sections, immersive portfolio/client moments.

## When to use

- Hero sections with depth and atmosphere
- Product showcase stages
- Branded visual worlds for MaserMedia clients
- Portfolio-grade environmental demos

## Responsibilities

- Scene concept and mood
- Lighting design (key, fill, rim, IBL)
- Camera behavior (orbit, scroll-driven, fixed hero)
- Object placement — premium, uncluttered
- Interaction model
- Animation behavior
- Responsive and mobile simplification
- Asset needs and fallback visuals
- Use 3D only when it strengthens design or story

## Per-environment documentation (required)

- Scene concept
- Design goal
- Camera setup
- Lighting setup
- Object list
- Asset list (GLTF, HDR, textures)
- Motion behavior
- Interaction behavior
- Mobile behavior
- Fallback behavior
- Client adaptation notes
- Portfolio usage notes

## Inputs

- Research agent output
- Brand direction, color tokens
- Reference images / Figma frames

## Outputs

- Environment spec in `PROJECT.md`
- Scene modules under project folder
- Lighting/camera constants documented

## Checks

- [ ] Scene reads at mobile viewport
- [ ] Object count reasonable for target devices
- [ ] HDR/env map size appropriate
- [ ] Decorative — page works without WebGL

## Files to update

- `projects/{category}/{slug}/PROJECT.md`
- `references/client-portfolio.md` section in project

## Loop commands

- `/loop` — lighting/camera iteration
- `/ux-design-systems` — hierarchy with DOM overlay (needs confirmation)
