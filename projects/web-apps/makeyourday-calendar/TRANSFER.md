# Transfer notes — makeyourday-calendar

## Kind

**app** — full interactive calendar experience (not a page section). Port as a route, page, or app shell consumer.

## Export path

```ts
import {
  MakeYourDayCalendarApp,
  type MakeYourDayCalendarAppProps,
  type CalendarEvent,
} from "@/components/projects/web-apps/makeyourday-calendar";
```

Do **not** import `MakeYourDayCalendarDemo` into production. That file is lab-only chrome (`DemoChrome` + reduced-motion toggle) registered via `lab/src/components/projects/registry.ts`.

## Demo route (lab only)

- `/demos/makeyourday-calendar` via `demoRegistry`
- Dedicated route: `/makeyourday-calendar` (same demo component)

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `forceReducedMotion` | `boolean` | `false` | Disables app motion even when OS allows motion. Lab demo also sets `data-reduced-motion` on the chrome wrapper for CSS hooks. |

No required props. Events hydrate from `localStorage` (`STORAGE_KEY` in `constants.ts`) after mount; empty store stays empty until the user adds events.

## Dependencies

| Package | Role |
| --- | --- |
| `react` / `react-dom` | UI (lab: React 19) |
| `lucide-react` | Icons (calendar, chevrons, close, etc.) |
| `next` | Only if hosting in this lab’s App Router; product has no Next-specific imports |

No GSAP, Framer Motion, Three.js, or data-fetching libraries.

## CSS / tokens

- Scope: `tokens.css` is imported by `makeyourday-calendar.tsx` (product), so the package is style-complete without the demo.
- Prefix: `--myd-*` (colors, gradients, type scale, motion durations/easing, radii).
- Root: `[aria-label="MakeYourDay save date calendar app"]` with `[data-reduced-motion]` when forced.
- Fonts: Fraunces (display) + Plus Jakarta Sans (UI), loaded by the lab layout / demo; ensure the host app provides the same families or retokenize.

## Porting checklist

1. Copy `lab/src/components/projects/web-apps/makeyourday-calendar/` **except** `makeyourday-calendar-demo.tsx`.
2. Import `MakeYourDayCalendarApp` from the package `index.ts`.
3. Mount under a full-height container (`min-h-dvh` or equivalent).
4. Persistence is already `localStorage`-backed; swap for a backend if the destination needs sync across devices.
5. Keep `--myd-*` tokens or map them to the destination design system.
6. Verify `prefers-reduced-motion` and optional `forceReducedMotion`.
7. Smoke-test keyboard: tab through hub / calendar / form; Escape closes panels where implemented.

## Out of scope for transfer

- `DemoChrome`, viewport toggles, lab reduced-motion toggle UI
- Dual dedicated demo route under `lab/src/app/makeyourday-calendar/`
- Acceptance of loading/disabled network states (no async API in product yet; storage is sync `localStorage`)
