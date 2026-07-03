# API Reference — LiquidMonochrome

## Component

```tsx
<LiquidMonochrome
  intensity={1}
  direction="bottom-to-top"
  pin
  scrub
  turbulence={0.5}
  noiseScale={0.3}
  liquidStrength={1}
  edgeSoftness={0.45}
  maskSoftness={0.45}
  pinDuration={1.25}
  overscroll={0}
  speed={1}
  seed={7}
  start="top top"
  end={undefined}
  duration="scroll"
  blendMode="normal"
  disabled={false}
  progress={undefined}
  className=""
  onProgressChange={(p) => {}}
>
  {children}
</LiquidMonochrome>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Content to reveal (rendered twice: color + mono) |
| `intensity` | `number` | `1` | Mono overlay opacity 0–1 |
| `direction` | `LiquidDirection` | `"bottom-to-top"` | Edge travel direction |
| `pin` | `boolean` | `true` | Pin section during scrub |
| `scrub` | `boolean \| number` | `true` | Scroll-linked smoothing (number = scrub lag seconds) |
| `turbulence` | `number` | `0.55` | Edge noise strength 0–1 |
| `noiseScale` | `number` | `0.32` | Spatial frequency of waves |
| `liquidStrength` | `number` | `1` | Wave amplitude multiplier |
| `edgeSoftness` | `number` | `0.45` | Softer, taller waves |
| `maskSoftness` | `number` | — | Alias for `edgeSoftness` |
| `pinDuration` | `number` | `1.25` | Pin length in viewport heights |
| `overscroll` | `number` | `0` | Extra scroll distance (vh) after reveal |
| `speed` | `number` | `1` | Scroll distance multiplier |
| `seed` | `number` | `7` | Noise pattern seed |
| `start` | `string` | `"top top"` | ScrollTrigger start |
| `end` | `string` | auto | ScrollTrigger end override |
| `duration` | `"scroll" \| number` | `"scroll"` | Scroll mode (number reserved) |
| `blendMode` | `CSS mix-blend-mode` | `"normal"` | Mono layer blend |
| `disabled` | `boolean` | `false` | Disable scroll binding |
| `progress` | `number` | — | Manual progress 0–1 |
| `className` | `string` | — | Root class |
| `onProgressChange` | `(p: number) => void` | — | Progress callback |

## Directions

- `bottom-to-top` — ink rises from bottom (default)
- `top-to-bottom` — flows downward
- `left-to-right` / `right-to-left` — horizontal variants

## Exports

```ts
import {
  LiquidMonochrome,
  buildLiquidClipPath,
  fbm,
  noise2D,
  LIQUID_MONOCHROME_DEFAULTS,
} from "@/components/projects/scroll/liquid-monochrome";
```

## Accessibility

- Mono overlay has `aria-hidden="true"` and `pointer-events: none`
- `prefers-reduced-motion`: disables pin/scrub; snaps at 50% scroll
- Children remain interactive on color layer
