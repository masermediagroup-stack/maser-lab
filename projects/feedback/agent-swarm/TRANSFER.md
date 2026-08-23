# Transfer: Agent Swarm

Fill when status → `ready` or `transferred`.

Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` → **Transfer checklist**.

## Export

```tsx
import { AgentSwarm } from "@/components/projects/feedback/agent-swarm";
```

## Dependencies

- React 19 (ref as a prop). No extra animation libraries required.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| mode | AgentSwarmMode | `"swap"` | Choreography mode |
| seed | string \| number | `18427` | Deterministic PRNG seed |
| nodeCount | 6 \| 10 \| 15 | `10` | Triangular-number agent count |
| speed | number | `1` | Duration multiplier (`0` = paused) |
| status | idle \| loading \| success \| error | `"loading"` | Loader lifecycle |
| colorMode | white \| spectral \| cool \| warm \| custom | `"spectral"` | Palette |
| paused | boolean | `false` | Freeze translation |

## Public assets

- none

## Porting steps

1. Copy `lab/src/components/projects/feedback/agent-swarm/` to portfolio repo (exclude `demo/` and `*-demo.tsx`)
2. Copy `tokens.css` with the component
3. No extra npm dependencies
4. Adjust import paths
5. Add showcase page; wire props
6. Preview deploy → QA → production
7. Set registry status → `transferred`

## Notes

- Demo chrome is not portable. Product does not require `--lab-*` tokens.
- Live URL (after deploy):
