# Project: Agent Swarm

**Slug:** `agent-swarm`  
**Category:** feedback  
**Status:** building  
**Created:** 2026-08-23

## Design reference

- Figma: none
- Other: Luminous triangular node formation inspired by contemporary agent-infra hero language (not a clone)
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Designers and developers previewing a loader, orchestration indicator, or compact agent-status graphic in Maser-Lab. Viewed continuously on the demo stage; tuned via the playground panel.

### Job
Read as autonomous agents exchanging work on a mathematically clean triangular lattice. Randomness controls choreography, never geometry.

### Current behavior
Greenfield.

### Desired outcome
Ten luminous nodes in a 1 / 2 / 3 / 4 triangle. Seeded curved swaps (and occasional 3-cycles) resolve precisely onto anchors. The same primitive can sit as a loader, hero graphic, or status indicator.

### Success signal
Identical seed + initial occupancy replays the same sequence. Swapping agents bow around each other rather than colliding. White and spectral presets stay restrained. 60fps without per-frame React state.

### Non-goals
Three.js / WebGL, Vercel branding or layout, drag-to-rebalance, live `agents[]` backend wiring, battery-meter progress fill, orbit mode.

## States

- [x] default — spectral triangle, continuous swap choreography
- [x] hover (pointer fine only) — control buttons / sliders
- [x] focus — keyboard-visible controls
- [x] active / pressed — buttons and sliders
- [x] loading — continuous choreography
- [x] success — resolve into formation + collective pulse
- [x] error — halt, slight destabilize, restrained warning tint
- [x] disabled — animation off / paused
- [x] prefers-reduced-motion — pulse only, no translation

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | SVG + rAF (no new deps) | Crisp cores, inspectable Béziers, no per-frame React |
| Duration | Travel ~800ms, settle ~120ms, idle ~450ms (speed-scaled) | MOVE → SETTLE → BREATHE → MOVE rhythm |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` | Decisive settle onto anchors without overshoot |

## Acceptance criteria

- [ ] Demo route `/demos/agent-swarm` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified in browser
- [ ] Component exported from `lab/src/components/projects/feedback/agent-swarm/index.ts`

## Open decisions

- Cascade / route / orbit / process are typed modes; V1 maps unimplemented ones to swap/shuffle rather than shipping unstable choreography.
- Future `agents[]` status mapping is typed but unwired.

## Accepted decisions

- Category `feedback` (loader / orchestration indicator), slug `agent-swarm`.
- Product-only barrel; demo registers only in `demoRegistry`.
- Layered SVG radial gradients instead of `feGaussianBlur` stacks.
