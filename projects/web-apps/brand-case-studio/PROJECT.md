# Project: Brand Case Studio

**Slug:** `brand-case-studio`  
**Category:** web-apps  
**Status:** building  
**Created:** 2026-08-11

## Design reference

- Figma: none
- Other: greenfield — in-house client brand asset presentation tool
- Design spec: `FIGMA.md` in this folder

## Brief

### User / trigger
Maser Media team preparing brand deliverables for a client review. Intake happens once per project; presentation is revisited many times during the engagement.

### Job
Collect brand assets and project narrative in one place, then auto-compose a polished case-study presentation clients can browse without seeing raw files or folder structure.

### Current behavior
Greenfield. No existing intake or presentation surface in the lab.

### Desired outcome
Two clear layers: an **intake studio** for uploading copy, images, colors, and typography; and a **presentation layer** that normalizes that data into a scrollable, editorial case study with hero, narrative sections, asset grid, palette, and type specimens.

### Success signal
User can create a case study, add assets via upload or URL, save locally, switch to presentation mode, and see a client-ready layout without manual layout work.

### Non-goals
- Multi-user auth or team permissions (v1 — Convex mutations are open)
- Full CMS or block editor
- Replacing Figma or DAM systems

## Kind

**app** — full interactive studio + presentation surface. Transfer via `TRANSFER.md`.

## States

- [x] default (case index)
- [x] intake (create / edit case study)
- [x] present (client-facing case study view)
- [x] empty (no saved cases)
- [x] hover (pointer fine only)
- [x] focus
- [x] active / pressed
- [ ] loading — shown during cloud sync / media upload (future polish)
- [x] success (save confirmation)
- [x] error (storage / import failure)
- [x] prefers-reduced-motion

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS + Framer Motion | Editorial reveals on presentation scroll; intake stays fast |
| Duration | 200–400ms presentation reveals | Case studies feel considered, not flashy |
| Easing | ease-out / custom deceleration | Content arrives and settles |

## Acceptance criteria

- [x] Demo route `/demos/brand-case-studio` renders index, intake, present, and empty states
- [x] `npm run lint` and `npm run build` pass in `lab/` (brand-case-studio scope; repo-wide lint has pre-existing pixel-info-card findings)
- [ ] `prefers-reduced-motion` verified in browser
- [x] Product exported from `index.ts`; demo is lab-only
- [x] localStorage persistence with JSON import/export
- [x] Presentation layer derives from normalized intake data (no duplicate manual layout)

## Open decisions

- Whether v2 adds team auth for intake (Convex auth)
- Server-side PDF render vs print stylesheet (v1 uses print)
- Static before/after split for reduced-motion users on public share pages (slider remains keyboard-accessible)

## Milestone — next steps shipped (2026-08-11)

- [x] Convex cloud sync for case studies (`lab/convex/`)
- [x] Vercel Blob upload API with local data-URL fallback
- [x] Public share route `/case/[slug]` (published cases only)
- [x] Interactive before/after slider in presentation
- [x] Drag-and-drop asset ordering in intake
- [x] PDF export via print stylesheet + Export PDF control
