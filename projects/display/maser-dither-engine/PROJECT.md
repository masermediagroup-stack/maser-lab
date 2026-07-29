# Project: Maser Dither Engine

**Slug:** `maser-dither-engine`  
**Category:** display  
**Status:** building  
**Created:** 2026-07-28  
**Product kind:** lab

## Design reference

- Figma: none
- Other: Creative-software shell (Figma / Rive / Spline / Linear inspired)
- Design spec: `FIGMA.md`

## Brief

### User / trigger
Lab designers exploring procedural dither materials across many UI adapters.

### Job
Provide a scalable **Maser Lab material-engine module** — shared renderer, component playgrounds, materials, presets, and docs — as the reference architecture for future engines (Glass, Grain, Liquid, CRT, …).

### Brand signal
**Maser Dither Engine** title + live dither material in playgrounds.

### Desired outcome
Feels like a professional design tool: overview first, left sidebar navigation, dedicated component pages — not a single card with an endless slider list.

### Non-goals
- Not rewriting the WebGL pipeline (extracted, not replaced)
- Not shipping every material as ready (stubs reserved)
- Not a general UI kit outside dither materials

## Architecture

```text
Overview · Components · Materials · Presets · Playground · Documentation
Shared engine/ (WebGL2 + Canvas2D) ← all adapters
```

## States

- [x] default (overview)
- [x] component playground
- [x] materials / presets / docs views
- [x] reduced motion
- [x] favorites / recent (persisted)

## Acceptance criteria

- [x] Demo route `/demos/maser-dither-engine` opens overview (not raw controls)
- [x] Left sidebar with search, favorites, recent, keyboard shortcuts 1–6
- [x] 12 component playgrounds share one renderer API
- [x] Grouped collapsible controls with persisted open state
- [x] Materials + presets catalogs
- [x] Product-only barrel; engine not rewritten
- [ ] `npm run lint` / `npm run build` pass
