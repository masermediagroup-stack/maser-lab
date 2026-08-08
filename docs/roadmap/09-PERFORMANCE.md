# 09 — Performance

**Depth: thin** — expand with benchmarks when the suite exists (v0.9+).  
Related: [02](./02-RENDER-PIPELINE.md) · [05](./05-MOBILE-WORKSPACE.md) · [10](./10-QA.md) · `engine/AGENTS.md`

## Stable constraints

| Topic | Rule |
| --- | --- |
| WebGL contexts | Prefer **one** live surface per view; Materials grids = CSS swatches |
| Thumbs | `ThumbBlitEngine` single shared context → bitmaps; no N canvases |
| DPR | Cap reasonably (adapters note DPR ≤ 2 on large surfaces) |
| Mobile | `uMatLowQ` / lowQuality on narrow viewports |
| Resize | Handle canvas resize without leaking FBOs; dispose on unmount |
| Layer recipe | Uniform/bit updates only — **no shader recompile** on value drag |
| Reduced motion | Mute expensive flicker/ambient; keep rendering |

## GPU / CPU

- Controllers pack uniforms on CPU; keep per-frame work bounded (lights ≤ 8).
- Avoid readbacks on the hot path.
- Shader compile/link is cold-path — don’t thrash program recreation.

## React

- Don’t remount `SurfaceCanvas` needlessly (loses GL context).
- Lab shell lists should not mount a live canvas per row.

## Strategies

| Surface | Strategy |
| --- | --- |
| Desktop playground | One preview + panels |
| Mobile lab editor | One preview + sheets; pause work when hidden if needed |
| Consumer apps | Caller owns how many adapters mount; document cost in registry `performanceNotes` |

## Testing / benchmarks (to expand)

- Frame time smoke on Overview + Playground + Card
- Context count audit on Materials page
- Mobile 320 / desktop 1280 checks (`maser-lab-responsive-qa`)

## Horizon

- Continuous FBO thumb refresh without JPEG churn (v0.8+)
- Optional WebGPU path with same semantic contracts
