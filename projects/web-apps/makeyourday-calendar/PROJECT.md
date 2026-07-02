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

## Design QA Pass — Hover, Color, and Gradient Consistency

**Date:** 2026-07-02  
**Mode:** Harden (design polish)  
**Scope:** `makeyourday-calendar` demo + shared lab chrome used on this route

### What was inspected

- Hover, focus, and active states across month lines, day dial, panel buttons, event CTA, form fields, and lab demo chrome
- Color usage in `tokens.css` and `makeyourday-calendar-demo.tsx`
- Gradient usage for background rays, wave accent, panel border, primary CTA hover, and mobile scrim
- Motion timing on interactive controls
- Responsive sticky summary bar and reduced-motion behavior

### Hover border issues found

| Location | Finding | Action |
| --- | --- | --- |
| MakeYourDay app controls | No hover border flashes on cards, buttons, or month lines — hovers used color, glow, transform, and gradient | Kept intentional treatments |
| Lab `LabButton` ghost variant | Generic accent border flash on hover (`hover:border-accent`) | Replaced with subtle background tint + text color shift; border stays stable |
| Form `focus-within` fields | Border + 1px ring on focus (not hover) | Kept for accessibility; values moved to tokens |

### Color inconsistencies found

- Near-duplicate blacks: `#050505`, `#000`, and multiple `rgba(5,5,5,…)` scrim values
- Near-duplicate text whites: `#f5f7ff`, `#d8e1ff`, `#ffffff` used interchangeably
- Repeated accent rgba glow values hardcoded instead of shared tokens
- Success/warn semantic colors scattered as one-off rgba/hex values
- Demo wrapper hardcoded `bg-[#050505]` instead of project token

### Gradient inconsistencies found

- Accent gradient used at both `90deg` (wave) and `135deg` (CTA hover) without documented roles
- Panel border gradient used a third stop not referenced elsewhere
- Background, ray, and scrim gradients duplicated inline rather than tokenized

### What was changed

- Expanded `tokens.css` with background, text, border, semantic, glow, gradient, hover, motion, and radius token groups
- Replaced scattered hardcoded colors/gradients with token references across the MakeYourDay stylesheet
- Unified secondary control hover: lift + surface tint + shadow (no border change)
- Unified primary CTA hover via `--myd-gradient-accent` and shared glow tokens
- Added danger-button hover using warn tokens (background shift, no border flash)
- Pointed demo wrapper at `--myd-bg` / `--myd-text`
- Removed generic lab ghost-button hover border treatment

### Tokens reused or created

**Created:** `--myd-bg-deep`, `--myd-text-soft`, `--myd-text-inverse`, `--myd-surface`, `--myd-overlay`, `--myd-scrim-*`, `--myd-focus-surface`, `--myd-grid`, `--myd-border-focus*`, `--myd-success-*`, `--myd-warn-*`, `--myd-glow-*`, `--myd-gradient-*`, `--myd-hover-*`, `--myd-duration-*`, `--myd-ease-*`, `--myd-radius-sm/md`

**Reused:** `--myd-bg`, `--myd-text`, `--myd-blue`, `--myd-violet`, `--myd-mint`, `--myd-warn`, `--myd-border`, `--myd-border-strong`, `--myd-muted`, `--myd-faint`, `--myd-line*`, `--myd-panel*`

### Skills and commands used

- `maser-lab-web` (Harden mode)
- `web-design-guidelines` (visual/a11y review framing)
- `/find-skills` — confirmed existing lab skills sufficient; no new skill install required

### Loops run

- None — single focused pass; no multi-pattern iteration loop needed

### Still needs review

- Month grid / agenda views (listed as open decision)
- Whether wave gradient should also use `135deg` for pixel parity with CTA (currently `90deg` by design for horizontal stem accent)
- Portfolio transfer polish pass after human motion review sign-off

## UX update — Events hub, calendar, and edit flow

**Date:** 2026-07-02

### Flow changes

| Entry | Behavior |
| --- | --- |
| Top **Events** button | Opens **hub**: lists saved events for the selected day plus Add / Show / Delete actions |
| Month **calendar icon** (next to day dial) | Opens full **month grid**; selecting a day opens the day **menu** (Add / Show / Delete) |
| **Show events** list | Tap an event → detail view with **pencil edit** in panel header |
| **Edit** | Opens form pre-filled; save updates the event |

### Visual changes

- Removed gradient border from event panel (borderless surface)
- Panel header uses bottom separator only (no boxed border)
- Menu rows use horizontal dividers instead of bordered cards

### Copy

- Replaced remaining “plan/plans” language with “event/events”
