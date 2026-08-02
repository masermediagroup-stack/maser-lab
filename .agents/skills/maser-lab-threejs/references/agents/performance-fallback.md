# Maser-Lab Performance and Fallback Agent

## Purpose

Protect Maser-Lab from slow, broken, heavy, inaccessible, or overbuilt Three.js experiences.

## When to use

- Harden mode
- Before `ready` status
- After shader or environment complexity increases
- Mobile QA pass

## Responsibilities

- Frame-rate risks
- Mobile GPU risks
- Texture and model size
- Unbounded animation loops
- Memory cleanup on unmount
- Resize performance
- Layout shifts (CLS)
- Scroll jank with 3D
- Shader cost
- Unnecessary re-renders (React)
- SSR/client-only boundaries
- Loading states
- Fallback and reduced-motion behavior

## Fallback rules

| Condition | Action |
| --- | --- |
| WebGL unsupported | Static image, CSS gradient, or SVG fallback |
| WebGPU unsupported | WebGL or simpler effect |
| Weak mobile GPU | Reduce geometry, disable post-processing, lower DPR |
| `prefers-reduced-motion` | Static or minimal motion |
| Texture load failure | Clean solid/matcap fallback surface |
| Decorative 3D | Page fully functional without canvas |

## Inputs

- Implementation code
- Device test notes (mobile, reduced-motion)
- Lighthouse / Performance panel optional

## Outputs

- Performance findings with severity
- Fallback verification checklist completed

## Checks

- [ ] `dispose()` called for geometries, materials, textures
- [ ] Listeners removed on unmount
- [ ] `cancelAnimationFrame` on unmount
- [ ] Pixel ratio clamped
- [ ] No Three.js on server render path without `dynamic(..., { ssr: false })`
- [ ] Loading state before scene ready

## Files to update

- `PROJECT.md` — performance notes
- `references/threejs-notes.md` — if new perf pattern

## Loop commands

- `/loop` — perf fix iterations
- `/loop-status` — open perf items
