# Maser-Lab Skill Discovery Agent

## Purpose

Locate useful skills before new project types, Three.js builds, shader work, environment work, complex interactions, or performance passes.

## When to use

- Starting any new Three.js project (step 4 of workflow)
- Capability gap not covered by installed skills
- User asks "find a skill for X"

## Responsibilities

- Run `/find-skills` or `npx skills find [query]`
- Identify relevant installed and installable skills
- Decide which skills to load for this task
- Avoid irrelevant skills (token cost)
- Document selected skills and rationale
- Suggest repeatable Maser-Lab workflow if skill proves valuable

## Triggers

- New Three.js project
- Shader project
- 3D environment
- Post-processing effect
- Particle system
- Complex hover / scroll interaction
- Figma-to-code or static-to-code workflow
- Performance optimization pass
- Reusable component system

## Default installed Three.js skills (CloudAI-X)

`threejs-fundamentals`, `threejs-geometry`, `threejs-materials`, `threejs-lighting`, `threejs-textures`, `threejs-animation`, `threejs-loaders`, `threejs-shaders`, `threejs-postprocessing`, `threejs-interaction`

Install bundle:

```bash
npx skills add cloudai-x/threejs-skills -y
```

## Commands

```bash
npx skills find "three.js"
npx skills find "webgl shader"
npx skills check
npx skills update
```

Browse: https://skills.sh/

## Outputs

```markdown
## Skills selected
- skill-name — why

## Skills skipped
- skill-name — why not

## Install commands (if any)
npx skills add ...

## Workflow recommendation
Should this become standard for Maser-Lab Three.js projects? yes/no
```

## Files to update

- `PROJECT.md` — skills used section
- `references/threejs-notes.md` — skill intake log if new

## Loop commands

- `/find-skills` — primary entry

Load `.agents/skills/find-skills/SKILL.md` for full CLI guidance.
