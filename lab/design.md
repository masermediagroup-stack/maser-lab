# Lab chrome — UI/UX for demos

Shell only. Not the projects. Product canvases keep their own type, color, and motion.

PR title: **lab ui/UX update for demos**

Loaded: better-ui, better-interface, better-typography, better-writing, better-layout, better-colors, better-accessibility, maser-lab-demo-chrome, maser-lab-token-system. Live refs: cursor.com, cursor.com/docs, vercel.com/geist, current lab/ source on main.

## Reader and job

Someone walking the lab to time a demo. Pick a piece in under two seconds. Open knobs without reading HUD chrome. The canvas stays the show.

## Thesis

The lab is a showroom, not a kit HUD.

Steal Cursor tool density: named rows, sentence-case labels, quiet selected state, no micro-caps. Steal Vercel Geist roles: Sans for UI, Mono only for values/code, label-14 as the default control text, gray by role not by glow.

Refuse Vercel triangle, vbg grain, and Geist on any product. Refuse Maser cyan glow as chrome hover. Refuse mono as the shell face.

## Scope

In:

- Index (`lab/src/app/page.tsx`)
- Shared chrome (`demo-chrome.tsx`, `--lab-*` tokens, `.lab-shell`, `.lab-card`)
- Dock / rail / knobs / back / reduced-motion / viewport toggles
- Demo-not-wired empty

Out:

- Anything inside a product component
- Shader fields, marks, client type, client color

Standing layout that does not move: opaque left rail on desktop; product owns the first screen on phone, knobs under the fold. No dim, no glass plate, no sticky mobile footer.

## Eyebrow rule (mechanical)

Never use a small tracked-out uppercase line as a heading, group label, or kicker.

Illegal in `.maser-lab` chrome:

- `text-transform: uppercase` on any control, group, or page heading
- `letter-spacing` > `0.02em` on text 14px or smaller
- `font-size` under 12px anywhere in chrome
- `font-mono` + `uppercase` stacked
- A caption (12px) as the only heading for a group

Replace with a real title: Geist Sans, sentence case, 13px / 500 for groups, 16px / 560 for the demo name.

Caption exists only under a real title (status, hint, frame size). It is never the heading.

Lint after transfer: flag `uppercase` and `tracking-[` inside `lab/src/components/lab/` and `lab/src/app/page.tsx`.

## Type

Geist is already loaded in layout.tsx. The bug is `.lab-shell { font-mono }` and font-mono on every control.

| Role | Face | Size / leading / weight | Use |
| --- | --- | --- | --- |
| Display | Geist Sans | 32/40, 560, tracking -0.02em | Index h1 |
| Title | Geist Sans | 16/20, 560 | Demo name in the rail; index row title |
| Section | Geist Sans | 13/18, 500 | Group titles. Sentence case. |
| Body | Geist Sans | 14/20, 400 | Index purpose, empty copy |
| Label | Geist Sans | 13/18, 400 | Control names |
| Value | Geist Mono | 12/16, 400, tabular-nums | Range readout, hex, code |
| Caption | Geist Sans | 12/16, 400 | Status, frame size. Never a heading. |

Kill `.lab-shell { @apply font-mono }`. Shell is font-sans (Geist). Mono is opt-in on values.

Index kicker Senior design engineering and section Projects are eyebrows. Delete both. The h1 is the title. The list does not need a tracked-out Projects heading because the page is only projects.

Copy owns replacement lines. Until Copy lands them: h1 Lab. No kicker. Row titles stay as registry titles.

## Color (`--lab-*` only)

Quiet Vercel-dark. Accent is selection, not decoration.

| Token | Value | Role | Contrast on --lab-bg |
| --- | --- | --- | --- |
| `--lab-bg` | `#0A0A0A` | Page / rail | — |
| `--lab-bg-elevated` | `#111111` | Row hover | — |
| `--lab-surface` | `#161616` | Control fill | — |
| `--lab-border` | `#2A2A2A` | Structure | hairline, not text |
| `--lab-text-primary` | `#EDEDED` | Titles, labels | 16.9:1 |
| `--lab-text-secondary` | `#C6C6C6` | Purpose, group | 11.6:1 |
| `--lab-text-muted` | `#A1A1AA` | Caption, idle toggle | 7.7:1 |
| `--lab-accent-primary` | `#EDEDED` | Selected control | — |
| `--lab-focus` | `#EDEDED` | focus-visible 2px ring | — |

Maser blue `#10A4FF` stays on the wordmark only. Not card hover, not selected knobs, not status pills.

Delete `--lab-glow`. Card hover is surface lift plus border `#3A3A3A`, no bloom.

`--lab-text-muted` at rgba(248,248,248,0.48) on `#0A0A0B` is 4.42:1. Fail. Do not keep it.

## Index

Desktop: two columns. Left sticky category names. Right a stacked list of rows.
A row is not a glowing card. Full-width hit, title, one-line purpose, status as caption. Hover is surface lift. Focus-visible is a 2px ring. No cyan pill.

Phone: same list, no left column. Category name once above its rows.

Hide agent commands from the public index.

## Dock

Keep the collapse control and the locked rail geometry.

When open: text link Lab as back, not a bordered chip. Demo title at Title role. Purpose as one Caption line. Groups use space, not a hairline plus 10px overline. Group title is Section. Keep role group and aria-label.

Controls: Label over the input. Value trailing on the same baseline for ranges.

Shared row: Reduce motion as the on-state label. Viewport segments: Desktop, Phone, Live. Resolution numbers go in aria-label only.

LabControlGroup 10px uppercase tracking is banned. New group title: Geist Sans 13/18/500, secondary, sentence case.

Drop mono extra-small on LabButton, LabRange, LabColor, LabSelect. Labels use Label role. Values use Value role.

Press scale 0.96, ease cubic-bezier 0.2 0 0 1, 150ms, named properties only. No transition all. No bounce ease on chrome.

Open rail radius 0. Inner controls 6px with 12px padding. Collapsed chip outer 8px, padding 4px, inner 4px.

## States

Default: ink on lab-bg, hairline structure. Hover: elevated fill, no glow. Focus-visible: 2px lab-focus ring. Press: scale 0.96. Selected: hairline plus elevated fill, color is not the only cue. Disabled: 40 percent opacity, still a name. Empty index: No demos yet plus one next step from Copy. Demo missing: restyle the not-wired card to these tokens. Reduced motion: honor OS and the demo toggle. No staged entrance on load.

Index rows are real links. Rail back is a link to slash. Viewport is a group of buttons with aria-pressed.

## Findings on current main (chrome only)

HIGH LabControlGroup: 10px uppercase tracking 0.14em on muted. Replace with Section 13/500 sentence case. Eyebrow is the heading. 10px plus 4.42:1 muted fails contrast.

HIGH page.tsx kickers: mono uppercase tracking 0.2em on Senior design engineering and Projects. Delete. Real h1, no fake section overline.

HIGH lab-text-muted: 0.48 white is 4.42:1. Use A1A1AA at 7.7:1.

MEDIUM lab-shell: font-mono overrides loaded Geist. Shell is Sans. Mono is values only.

MEDIUM lab-card hover: cyan glow. Use surface lift. Accent is not decoration.

MEDIUM LabButton: add press scale 0.96 and named transition properties.

LOW viewport labels: Desktop 1920 becomes Desktop / Phone / Live.

Product canvases: not reviewed.

## Generated-design refusals

- Inter, or a second sans next to Geist
- Tiny uppercase overlines as premium
- Glass, blur scrims, cyan bloom
- Vercel triangle, vbg, grid wallpaper
- Geist inside a client product
- Rebuilding the dock as a sheet or a bottom tab bar
- Staggered page-load entrance on the index
- Badge soup: status pills, Maser-Lab chip, cyan tags

## Spark

New PR, title lab ui/UX update for demos. Load this file. Touch only lab chrome files listed in Scope. Fresh public preview of slash and one demo rail after the first push. Do not restyle a product canvas to prove the shell.

Copy: index empty, not-wired, and any new visible chrome strings. Existing registry titles stay.

## Live inspect 2026-09-04

These five are locks, not suggestions. Encoded from rendered index + Dallas demo rail. Do not ship chrome that still matches the refused screens.

Refused on the index: tracked-out `SENIOR DESIGN ENGINEERING` eyebrow, Geist Mono as the shell face, cyan status pills.

Refused on the Dallas rail: IBM Plex Condensed at a computed ~8.35px, `PLAYBACK` / `WHIP` / `KICK` / `PRESENTATION` / `EXPORT` eyebrows, cyan sliders and selected fills, extra round control on the canvas/field.

### 1. Chrome type is Geist at token sizes. Demos do not restyle the dock.

Dallas rail computed IBM Plex Condensed at 8.35px. Shared chrome stays Geist Sans at token sizes: Label 13, Title 16, Section 13. Value is Geist Mono 12.

A demo MUST NOT restyle the dock (`LabControlGroup`, `LabButton`, `LabRange`, `LabSelect`). Dock CSS wins inheritance and descendant product type (IBM Plex, condensed, 10px, uppercase tracking).

Un-scale if a parent is shrinking it. Chrome root is 16px. Computed Label/Section never 8px.

### 2. html 112.5% must not enlarge chrome rem.

`html { font-size: 112.5% }` is why index rem type reads huge. Chrome root is 16px. Do not let html 112.5% or a demo scale node shrink or enlarge rail type. Chrome sizes are px tokens, not rem tied to that html bump.

### 3. Group titles are sentence case.

`PLAYBACK` / `WHIP` / `KICK` / `PRESENTATION` / `EXPORT` → Playback, Whip, Kick, Presentation, Export. `LabControlGroup` is Section 13/18/500, secondary, sentence case. No uppercase tracked overline.

### 4. One menu toggle. Never on the product field.

Kill the extra round control on the canvas/field. Keep the collapse control in the rail. Never put a second chrome toggle on the product field. That extra control is chrome leaking onto the canvas — kill it in `demo-chrome`, do not restyle Dallas product marks or shaders.

### 5. Sliders and selected fills are not Maser blue.

Elevated hairline, not `#10A4FF`. Range accent, selected knobs, and status are `--lab-accent-primary` / elevated fill / `#3A3A3A` hover border. Blue stays on the wordmark only.
