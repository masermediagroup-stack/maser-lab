# Project: MakeYourDay Calendar

**Slug:** `makeyourday-calendar`  
**Category:** web-apps  
**Status:** review  
**Created:** 2026-07-01

## Design reference

- Figma: none
- Other: `/Users/tylervea/Documents/makeyourday-main`
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
A user saving small date-based reminders. Month/day selection may happen occasionally, while event browsing and form entry happen a few times per session.

### Job
Make the user feel like they are choosing a precise day, then give them a clear path to add, browse, inspect, or remove saved events.

### Current behavior
Imported from a static HTML/CSS/JS prototype with a vertical month selector, animated day dial, modal panel, localStorage persistence, and custom time wheels.

### Desired outcome
The lab demo preserves the app concept as a working web-app surface, with reachable event states and a foundation for future calendar views and UX polish.

### Success signal
Users can select a month, adjust a day, open the event panel, add an event, view details, delete events, use keyboard focus, and switch reduced motion without losing state clarity.

### Non-goals
This import does not add full monthly grid views, recurring events, reminders, accounts, backend sync, or portfolio-ready final polish.

## States

- [x] default
- [x] hover (pointer fine only)
- [x] focus
- [x] active / pressed
- [ ] loading
- [x] success
- [x] error
- [ ] disabled
- [x] empty
- [x] prefers-reduced-motion

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS + React state | Keeps the imported web app light and portable while preserving the original prototype's interaction model. |
| Duration | 120-280ms for controls, 360ms panel reveal | Frequent actions stay quick; the panel reveal gets enough time to explain spatial continuity from selected date to detail surface. |
| Easing | ease-out / cubic deceleration | Input feedback should arrive quickly and settle gently. |

## Acceptance criteria

- [x] Demo route `/demos/makeyourday-calendar` renders all states above
- [x] `npm run lint` and `npm run build` pass in `lab/`
- [x] Motion review: no open P0/P1 findings
- [x] `prefers-reduced-motion` verified in browser
- [x] Component exported from `lab/src/components/projects/web-apps/makeyourday-calendar/index.ts`

## Open decisions

- Whether the next iteration should add month grid views, agenda view, or both.
- Whether event persistence should stay localStorage-only or move to a backend-backed save flow.
