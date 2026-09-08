# GrokBot Loop Demo Visual

Lab teaching page for the Dallas meetup live demo. Not a client. Separate PR from the Maser card (`meetup loop visualization`). One PR per track. Rehearse with commit resets.

Status: **thin Shape**. Spark scaffolds after this file exists. Typeface pending human confirm (Dice Sans likely).

## Reader and job

Beginners → intermediate Grok users on stage. One glance should show how Lab hands work across bots. Speaker walks the six steps out loud. Not a marketing landing page.

## Thesis

Showroom timeline. Black field, white type, one mark. Step titles one weight lighter than the first cut. Subheads the same white as titles. Animated dots between steps carry the handoff — not arrows, not a flowchart, not a node graph.

Steal: restraint of a product changelog / docs outline. Refuse: SaaS process diagrams, purple gradients, glass cards, Zoah skin, inventing Dice Sans metrics before confirm.

## Composition

- Full-bleed black bg. White text. No chrome clutter on the product (lab dock stays lab chrome).
- **Grok Bot mark** center-bottom of the screen (live Bloub SVG; don’t invent a new mark). Not top-right.
- The **2×3** loop composition sits in the middle of the viewport, horizontally and vertically. Not left-weighted. Not stuck to a top edge.
- Horizontal **2×3** grid. Row 1: Drop → Kickoff → Shape. Row 2: Package → Build → Critique. All six stay. Never drop a step to fit 3 columns.
- Each cell: one small monoline icon sitting with the heading + heading + subhead (copy verbatim). Icon is not a badge.
- Between steps: dots in the gaps (left to right on each row). Not a centered wrap bar in the middle. Dots are the motion, not bouncing cards.
- Optional **Groot spur**: a quiet side note off the main spine (not a required 7th step). Visible as “when product/IA is unknown.”
- Narrow: keep 3 columns if readable. Stack to 1 column only if the stage cannot hold 3. Never drop a step. Mark shrinks but stays center-bottom.

## The six steps (structure — Copy owns final lines)

| # | Intent |
| --- | --- |
| 1 Drop | The job lands |
| 2 Kickoff | Maser sequences |
| 3 Shape | Elite Pixel Guy designs (+ Figma when used) |
| 4 Package | design.md locks decisions |
| 5 Build | Spark ships + fresh preview |
| 6 Critique | Human times the live canvas |

Placeholder titles until Copy lands: Drop / Kickoff / Shape / Package / Build / Critique. Descriptions: the Intent column, spoken-demo short.

## Type (open)

Human said **Dice Sans** (likely). Card track uses Universal Sans — do not share one face across both without a lock.

Until Dice Sans is confirmed + filed: scaffold with a system grotesk stack, named temporary. No Inter as the story. Swap the day Dice lands.

| Role | Treatment |
| --- | --- |
| Display / step title | One weight lighter than the first cut (700, not 800). Still a heading, not caption. |
| Body / step line | Same color as headings (`--loop-text`). Smaller size, readable at stage distance. |
| Caption / Groot spur | Quiet, smaller than body. Only use muted here. |

## Color tokens (product)

| Token | Value | Role |
| --- | --- |
| `--loop-bg` | `#000000` | Page |
| `--loop-text` | `#FFFFFF` | Titles **and** subheads |
| `--loop-text-muted` | `rgba(255,255,255,0.64)` | Groot spur only |
| `--loop-dot` | `#FFFFFF` | Flow dots |
| `--loop-spur` | `rgba(255,255,255,0.64)` | Alias of muted for the optional Groot spur |

No accent rainbow. Mark carries brand color only if the official asset needs it.

## Motion

- Dots between steps animate to show handoff (pulse / travel along the spine).
- Reduced motion: static dots, no travel. Honor OS + lab toggle.
- No staged page-load stagger that eats the first second of the demo.
- Don’t animate keyboard-driven focus. Emil restraint: if it doesn’t teach the handoff, kill it.

## States

| State | Behavior |
| --- | --- |
| Default | All six steps visible. Dots idle or slow travel. |
| Step focus (optional knob) | One step emphasized for the speaker. |
| Reduced motion | Static spine. |
| Groot spur on/off | Demo knob. Default off or quiet. |

## Named refusals

- Process-diagram spaghetti / swimlanes
- CSS-only “premium” glass step cards
- Inventing Dice Sans before confirm
- Putting Universal Sans on this page without a lock
- Required 7th Groot step
- Mixing Track A card look into this page

## Spark

New PR off main. Title: `meetup loop visualization`. Load this file. Scaffold route + demo knobs (step focus, Groot spur, reduced motion). No invented look beyond these tokens. Fresh URL when it boots.

## Copy

Short spoken-demo titles + 1-line descriptions for the six steps. Unslop. Separate from the stage script.

## Locked copy (verbatim — 2026-09-05)

| Step | Title | Line |
| --- | --- | --- |
| 1 | Drop | The job lands: audience, offer, format, where it lives. |
| 2 | Kickoff | Producer sequences the room so nobody freelances the ask. |
| 3 | Shape | Designer owns the look. Figma when a locked component needs it. |
| 4 | Package | design.md locks decisions a stranger can build from. |
| 5 | Build | Engineer ships from the package and drops a fresh preview. |
| 6 | Critique | Human times the live canvas. Keep, cut, or recut. |

Titles stay these six words. Do not rewrite. Separate from the stage script.

## Mark asset (parked 2026-09-05)

Repo: `https://github.com/masermediagroup-stack/Grokbot-animations` — SVG Grok bot avatar (Bloub lineage). Same engine as card 65. Keep PRs separate. Do not import maser-bot-card.

## Layout lock (2026-09-08)

Human via mace. Do not time hq2tle61d after this push.

- Horizontal layout. Not a vertical stack.
- Headings: one type-weight lighter than the current cut.
- Subheadings: same color as headings (`--loop-text`).
- Left to right, max 3 heading columns.
- Six steps stay. Sit as 2 rows × 3 (Drop / Kickoff / Shape, then Package / Build / Critique).
- One small icon per heading, for that topic. Same white hairline as the dots. No new visual system.

## Icons (locked 2026-09-08 — EP)

One monoline mark per heading. White `#FFFFFF` only. Same optical weight as the flow dots. Square-ish 20px live area, 1.5 stroke, round caps, consistent. No fill, no color, no second family. dr leak stays out unless a mark export is asked.

| Step | Icon | Draw |
| --- | --- | --- |
| Drop | tray | Short open tray, arrow pointing down into it. |
| Kickoff | chevrons | Two right-pointing chevrons, same size. Sequence start. |
| Shape | frame | Four corner ticks of a frame. No full rectangle. |
| Package | sheet | Folded corner page. One fold. |
| Build | layers | Two offset rounded rectangles, stacked. |
| Critique | eye | Simple stadium eye, no lashes, no pupil bounce. |

## Spark (this cut)

Load this file. Recut PR 66 to the 2×3 horizontal grid + icons + lighter headings + same-color subheads. Copy lines verbatim. Fresh URL. Prior alias hq2tle61d is stale after the push.

## Placement lock (2026-09-08)

Human via mace. Do not time rg80sk0em or hq2tle61d after this push.

- Center the entire 2×3 loop composition in the viewport, horizontally and vertically.
- Move the animating Grok bot logo to the center bottom of the screen. Live Grokbot-animations mark. Not top-right, not a droplet, not a static still.

## Mark lock (2026-09-08)

Must match card 65 identity. Do not treat any preview as a timing handoff. `rg80sk0em` stays stale.

- Position: center bottom. Not top-right.
- Shape: capsule. Color stock bleu `#3b93f0`. Paper holes = page black `#000000`. Refuse Maser blue.
- Grokbot-animations engine. Not a static still. Not `defaultCycle()` (~31s SEQUENCE).
- **30s curl, then 30s break, then repeat.** Not a one-shot.
- Curl beats, in order, spread across ~30s (do not freeze guessed millisecond tokens): neutre, attentif, curieux, mefiant, thinking (body may leave capsule, engine truth), fier, neutre.
- Break (30s): stay on neutre / capsule. Eyes follow the pointer. During the curl, the expression owns the gaze. Do not fight it with cursor follow.
- Reduced motion: plant neutre, no curl, no pointer chase.

## Demo name (2026-09-08)

**GrokBot Loop Demo Visual.** Lab chrome, accessible name, and registry title. Slug stays `meetup-loop-viz`. Git PR title stays `meetup loop visualization`.

## Dots-in-gap lock (2026-09-08)

Human via mace. Do not treat any preview as a timing handoff. `rg80sk0em` stays stale.

- Dots sit in the gap between steps.
- Vertical center of that gap (the line between steps). Not on the heading block. Not at the top of the heading.
- Horizontally centered in the gap. Not shifted left.
- Same rule on both rows.
- No dots sitting on a heading.
- Reading order is still row 1 then row 2. Do not add a centered wrap/loading bar of dots in the middle of the composition.
- Copy stays verbatim. Do not invent a new system.
