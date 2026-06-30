# Maser-Lab Three.js Research Agent

## Purpose

Run cloud/web research before Maser-Lab starts a Three.js, shader, 3D, environment, or advanced interaction project. Determine the best current approach before implementation.

## When to use

- New Three.js project or unfamiliar effect type
- Renderer choice (WebGL vs WebGPU vs no Three.js)
- Material/shader/post-processing path unclear
- Before `/poteto-mode` deep reasoning (Shape + Research)

## Inputs

- Project brief or `PROJECT.md`
- Source type (Figma, screenshot, reference URL, concept)
- Target type (shader background, 3D hero, particles, etc.)
- Performance constraints (mobile, decorative vs critical)

## Required sources (priority order)

1. [Official Three.js docs](https://threejs.org/docs/)
2. Official Three.js examples (linked from docs)
3. CloudAI-X skills (see `SKILL.md` routing table)
4. Three.js GitHub / forum — only when docs are insufficient
5. Trusted creative-coding references — last resort

## Questions to answer

- Best Three.js approach for this project?
- WebGLRenderer, WebGPURenderer, or no Three.js?
- Built-in materials, ShaderMaterial, RawShaderMaterial, Node Materials, TSL, post-processing, particles, instancing, or GLTF?
- Shader background vs 3D object vs environment vs scroll scene vs pointer interaction?
- Which docs pages are relevant?
- Which CloudAI-X skills are relevant?
- Performance risks? Mobile risks? A11y / reduced-motion concerns?
- Fallback if WebGL/WebGPU fails?
- Reusable Maser-Lab pattern from this project?

## Outputs (required format)

```markdown
## Research summary
[2–4 sentences]

## Docs checked
- [threejs.org/docs/...](url) — what was verified

## CloudAI-X skills checked
- threejs-* — what was applied

## Recommended implementation path
[Renderer, materials, folder structure]

## Relevant Three.js examples
- [example name](url)

## Risks
- ...

## Fallbacks
- ...

## Mobile strategy
- ...

## Reduced-motion strategy
- ...

## Suggested file structure
- ...

## Suggested reusable patterns
- ...

## Next implementation steps
1. ...
```

## Checks

- [ ] At least one official docs page cited per API decision
- [ ] CloudAI-X recommendation verified against official docs
- [ ] Fallback path documented
- [ ] Mobile and reduced-motion addressed

## Files to update

- `projects/{category}/{slug}/PROJECT.md` — research section
- `references/threejs-notes.md` — if new decision tree insight

## Loop commands

- `/maser-threejs` — start here
- `/poteto-mode` — deep research (needs confirmation; use Shape + this agent)
- `/find-skills` — if gap in CloudAI-X coverage
