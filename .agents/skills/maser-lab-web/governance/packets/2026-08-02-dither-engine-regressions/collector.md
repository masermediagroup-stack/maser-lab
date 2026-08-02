# Collector — raw artifacts

**Mode:** Govern / Intake  
**Do not** score candidates or propose rules.

## Topic

Maser dither engine Sprint 6 black-screen regressions and sacred contracts

## Sources

| Kind | Link / path |
| --- | --- |
| PR / branch | `cursor/webdesign-maser-surface-engine-*` (surface engine work) |
| Demo | `/demos/maser-dither-engine` (on feature branch) |
| Commit | Fix era `d4d4d6f` — restore VERT + `SAMPLE_GLSL`; CSS material thumbs |
| Docs | `projects/display/maser-dither-engine/AGENTS.md` |
| Docs | `lab/.../engine/AGENTS.md` |
| Docs | `lab/.../docs/engine-lessons.md` |
| Other | Cloud-agent postmortem notes; Materials context exhaustion |

## Verbatim quotes (short)

> Attribute-based VERT without buffer = black canvas.

> Never strip `SAMPLE_GLSL` helpers (`sampleBayer`, `sampleBlue`, posterize, remaps). `DITHER_GLSL` depends on them.

> Materials browser thumbs must stay CSS swatches (or one shared preview). Do not spawn a live canvas per material (~11 contexts kill browsers).

> Material owns structure; Color owns chroma; do not re-add Color behavior chips (Sprint 5).

## Related file paths

- `lab/src/components/projects/display/maser-dither-engine/engine/pipeline/stages.ts`
- `lab/src/components/projects/display/maser-dither-engine/engine/core/SurfaceRenderer.ts`
- `lab/src/components/projects/display/maser-dither-engine/docs/engine-lessons.md`

## Missing evidence

- Public PR URL once merged to `main` (slug may be absent on `main` at intake time)
- Screenshot of black-screen vs restored Playground (optional holdout for evals)
- Source-image unit-6 contract lives on a sibling branch — cross-link when merged
