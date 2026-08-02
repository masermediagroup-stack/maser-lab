# Exemplar: maser-dither-engine

**Slug:** `maser-dither-engine` · **Category:** `display`  
**Demo:** `/demos/maser-dither-engine`  
**Status:** building (surface-engine PR branch; not yet on `main` at packet time)

## Decision

**Status:** accepted (project contract; pending human dual-encode of selected `rule/*` IDs)  
**Scope:** Shared procedural WebGL2 dither / material pipeline and Materials UI  
**Decision:** One shared GLSL program drives all adapters; material owns structure, color owns chroma; never break VERT / `SAMPLE_GLSL` / context budget  
**Rationale:** Sprint 6 black-screen proved that “cleanup” of sacred helpers and attribute layout silently kills the engine; multi-canvas thumbs exhaust WebGL contexts  
**Evidence:** `docs/engine-lessons.md`; project + engine `AGENTS.md`; fix commit era `d4d4d6f` on surface-engine branch  
**Exceptions:** Documented Canvas2D fallback when WebGL unavailable  
**Approver:** lab maintainer (pending formal decision-log accept of any new universal `rule/*`)

## Useful decisions

1. **Single program, many controllers** — extend `engine/pipeline/stages.ts`; do not fork per-adapter shaders.
2. **Ownership table** — lighting = luminance; color = chroma; material = structure/UV/finish; dither = quantization only.
3. **Sacred VERT** — fullscreen triangle via `gl_VertexID`; never switch to `aPos` without binding a VBO in `SurfaceRenderer` in the same change.
4. **Sacred `SAMPLE_GLSL`** — keep `sampleBayer` / `sampleBlue` / posterize helpers; `DITHER_GLSL` depends on them.
5. **Uniform name alignment** — e.g. `uPosterization` (not `uPosterizeLevels`) must match `SurfaceRenderer` uploads.
6. **WebGL context budget** — Materials browser thumbs are CSS swatches; at most one live preview canvas in the detail pane.
7. **Source image unit** — when present, `uSource` on texture unit **6**; cover-fit luminance into the shared pipeline (source-image branch).
8. **Rendered verification required** — Overview + Playground must show a lit non-black surface after any `stages.ts` edit.

## Known flaws (do not copy)

- Engine docs and code may live on a feature branch while `main` lacks the slug — agents must not invent a Three.js substitute.
- Early Sprint 6 briefly shipped a black canvas (VERT + SAMPLE regressions) — treat as cautionary, not a pattern.
- Materials UI once spawned ~11 live contexts — never restore per-thumb canvases.
- Sprint 5 duplicate controls (cursor×influence multiply; Color “behavior” chips owning structure) — do not reintroduce.

## Bad example

```glsl
// Attribute VERT without VBO bind in SurfaceRenderer
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
```

```ts
// Live WebGL canvas per material thumbnail
{materials.map((m) => <SurfaceCanvas key={m.id} material={m.id} />)}
```

## Good example

```glsl
// gl_VertexID fullscreen triangle (no VBO)
vec2 p = POS[gl_VertexID];
```

```tsx
// CSS swatch grid + one detail preview
<button className="material-swatch" style={{ background: swatchCss }} />
{selected ? <SurfaceCanvas material={selected} /> : null}
```

## Sources

- Branch: `cursor/webdesign-maser-surface-engine-*`
- `projects/display/maser-dither-engine/AGENTS.md`
- `lab/.../engine/AGENTS.md`
- `lab/.../docs/engine-lessons.md`
- Governance packet: `../governance/packets/2026-08-02-dither-engine-regressions/`
