# API Reference - LiquidMonochrome

## Component

```tsx
<LiquidMonochrome
  intensity={1}
  direction="bottom-to-top"
  pin
  scrub
  turbulence={0.55}
  noiseScale={0.32}
  liquidStrength={1}
  edgeSoftness={0.45}
  maskSoftness={0.45}
  pinDuration={1.25}
  overscroll={0}
  speed={1}
  seed={7}
  lockPosition={50}
  liquidShader
  meniscusSize={0.018}
  start={undefined}
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
| `children` | `ReactNode` | - | Content to reveal, rendered twice: color + mono |
| `intensity` | `number` | `1` | Mono overlay opacity 0-1 |
| `direction` | `LiquidDirection` | `"bottom-to-top"` | Edge travel direction |
| `pin` | `boolean` | `true` | Pin section during scrub |
| `scrub` | `boolean \| number` | `true` | Scroll-linked smoothing; number means scrub lag seconds |
| `turbulence` | `number` | `0.55` | Waterline wave amplitude multiplier 0-1 |
| `noiseScale` | `number` | `0.32` | Spatial frequency of water waves |
| `liquidStrength` | `number` | `1` | Wave amplitude multiplier |
| `edgeSoftness` | `number` | `0.45` | Smoothness of the clipped reveal boundary |
| `maskSoftness` | `number` | - | Alias for `edgeSoftness` |
| `pinDuration` | `number` | `1.25` | Pin length in viewport heights |
| `overscroll` | `number` | `0` | Extra scroll distance in viewport-height units |
| `speed` | `number` | `1` | Scroll distance multiplier |
| `seed` | `number` | `7` | Wave phase seed |
| `lockPosition` | `number` | `50` | Viewport pin line: `0` top, `50` center, `100` bottom |
| `liquidShader` | `boolean` | `true` | Legacy name; enables idle liquid edge motion |
| `meniscusSize` | `number` | `0.018` | Legacy tuning hook for the hidden SVG geometry path |
| `start` | `string` | auto | ScrollTrigger start override; when omitted, uses `center {lockPosition}%` |
| `end` | `string` | auto | ScrollTrigger end override |
| `duration` | `"scroll" \| number` | `"scroll"` | Scroll mode; numeric duration is reserved |
| `blendMode` | `CSS mix-blend-mode` | `"normal"` | Mono layer blend |
| `disabled` | `boolean` | `false` | Disable pin/scrub |
| `progress` | `number` | - | Manual progress 0-1 |
| `className` | `string` | - | Root class |
| `onProgressChange` | `(p) => void` | - | Called each scroll frame with progress 0-1 |

## Accessibility

- Mono overlay has `aria-hidden="true"` and `pointer-events: none`.
- The hidden waterline SVG is decorative and `aria-hidden`.
- `prefers-reduced-motion` disables pin/scrub and snaps at the midpoint.
- Children remain interactive on the color layer.

## Waterline Note

The monochrome clip mask and hidden SVG path are generated from the same wave points. The path is transparent; the visible effect is the animated black-and-white boundary itself.
