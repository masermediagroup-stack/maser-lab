# Transfer: Heatmap

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { HeatmapPoster } from "@/components/projects/display/heatmap-poster";
```

## Dependencies

- `vgpu` (WebGPU field)
- `@huggingface/transformers` (Depth Anything V2 Small, lazy)

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| format | `"9-16" \| "a4"` | `"9-16"` | Poster crop. LUT does not change. |
| look | `HeatmapLook` | defaults | Heat / Mid / Ground / Speed / Wave / grain |
| image | `HeatmapImageSource \| null` | `null` | Upload. Not a generated face. |
| forceReducedMotion | `boolean` | `false` | Hold the wave |

## Public assets

List files to copy from `lab/public/`:

- `lab/public/assets/heatmap-poster/` (demo samples only)

## Porting steps

1. Copy `lab/src/components/projects/display/heatmap-poster/` to portfolio repo
2. Copy public assets listed above if the host needs samples
3. Install dependencies listed above
4. Keep `--heatmap-*` tokens from `tokens.css`. Do not require `--lab-*`
5. Add showcase page; wire props to portfolio router
6. Preview deploy on Vercel → QA → production deploy
7. Set registry status → `transferred`

## Notes

- Live URL (after deploy):
- Lab / section poster. Demo chrome is not in the barrel.
- Read `design.md` before renaming tokens.
