# Meetup loop visualization

Lab teaching page for the Dallas meetup live demo. Not a client. Separate PR from the Maser card (`meetup loop visualization`). One PR per track. Rehearse with commit resets.

Status: **thin Shape**. Spark scaffolds after this file exists. Typeface pending human confirm (Dice Sans likely).

## Reader and job

Beginners → intermediate Grok users on stage. One glance should show how Lab hands work across bots. Speaker walks the six steps out loud. Not a marketing landing page.

## Thesis

Showroom timeline. Black field, white type, one mark. Heavy step titles, lighter one-liners. Animated dots between steps carry the handoff — not arrows, not a flowchart, not a node graph.

Steal: restraint of a product changelog / docs outline. Refuse: SaaS process diagrams, purple gradients, glass cards, Zoah skin, inventing Dice Sans metrics before confirm.

## Composition

- Full-bleed black bg. White text. No chrome clutter on the product (lab dock stays lab chrome).
- **Grok Bot mark** top-right (official face; don’t invent a new mark).
- One vertical stack of six steps. Each step: heavy title + lighter description.
- Between steps: a short run of animated dots showing flow / handoff. Dots are the motion, not bouncing cards.
- Optional **Groot spur**: a quiet side note off the main spine (not a required 7th step). Visible as “when product/IA is unknown.”
- Mobile: same stack, tighter. Mark shrinks but stays top-right.

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
| Display / step title | Heavy weight, large, tight leading |
| Body / step line | Lighter weight, smaller, readable at stage distance |
| Caption / Groot spur | Quiet, smaller than body |

## Color tokens (product)

| Token | Value | Role |
| --- | --- |
| `--loop-bg` | `#000000` | Page |
| `--loop-text` | `#FFFFFF` | Titles |
| `--loop-text-muted` | `rgba(255,255,255,0.64)` | Descriptions (measure contrast ≥4.5:1) |
| `--loop-dot` | `#FFFFFF` | Flow dots |
| `--loop-spur` | `rgba(255,255,255,0.4)` | Optional Groot spur |

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
