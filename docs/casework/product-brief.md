# Casework — Product brief

Working name: **Casework**. Keep the name in configuration (`src/config/product.ts` in the Casework repo) so it can be changed later. Do not hard-code it through UI copy, metadata, or emails.

This packet lives in **maser-lab** as a Phase 0 handoff. The product is implemented in a **new dedicated repository**, not in this lab.

Status: Phase 0 complete (decision record). Implementation starts at Phase 1 in the Casework repo.

## Job

Enable a small creative studio (Maser Media) to turn project strategy, process, outcomes, and brand assets into a polished case study without designing and coding a bespoke page for every client.

Secondary jobs:

- Give clients one trustworthy destination for reviewing a case study and downloading approved assets.
- Publish an unlisted URL on [masermedia.co](https://masermedia.co) when the studio is ready to share a project outside a review link.
- Preserve enough visual freedom that each project can feel like its own brand.
- Keep authoring fast enough that the team will actually maintain it.

This is not a generic page builder, DAM replacement, social network, or marketing landing-page generator. It is not the Maser Media marketing site. It is a focused case-study authoring, private review, and unlisted publishing system.

## Audiences and roles

### Studio admin

Manages users, clients, global studio appearance, and all projects. Invite-only; no public registration.

### Studio editor

Creates and edits clients, projects, case-study blocks, assets, preview links, and publication state.

### Client viewer

Opens a private presentation link, browses the case study, and downloads assets explicitly made available to them. No account. Access is a revocable token plus an optional passcode.

### Unlisted visitor

Opens `https://masermedia.co/p/[slug]` for a **published** project. They can read the case study. They are not promised a work index, related-work rail, or inquiry form in MVP. If the project is not `published`, this URL 404s.

The original “public visitor / prospect conversion” audience is served by the existing [maser-media](https://github.com/masermediagroup-stack/maser-media) site (`/`, `/work`, `/about`, `/contact`). Casework does not replace that site.

## Core principles

1. **The work is the spectacle.** Interface chrome recedes; imagery, motion, typography, and applications carry the experience.
2. **Narrative before gallery.** Every project should explain client context, challenge, strategic idea, system, applications, and outcome.
3. **Proof over adjectives.** Show the system working across touchpoints. Include outcomes, testimony, or metrics where available. Label demo metrics as demo.
4. **Structured freedom.** Authors compose from dependable blocks. Project-level theme tokens create distinct presentations.
5. **Two reading speeds.** A visitor can scan title, thesis, services, hero, and results quickly; a client or design-minded reader can explore the full story.
6. **Motion demonstrates behavior.** Animation reveals how an identity works. Respect `prefers-reduced-motion`.
7. **Private means private.** Drafts, review links, and source assets never leak into masermedia.co, search indexes, or generated metadata.
8. **Fast by default.** Large media must not turn the case study into a loading screen.

## Research-informed presentation model

Translate editorial patterns, do not imitate trade dress:

- Broad proof of identity across real applications, with credits (Pentagram-like structure).
- Strategic narrative and impact (COLLINS-like structure).
- Direct chapter language from challenge to change (Ragged Edge-like structure).
- Project-specific visual experience (Base Design-like structure).
- Decomposition of a brand system into type, color, motion, and other behaviors (Gretel-like structure).
- Motion and responsive behavior as part of the identity (DIA-like structure).

Do not copy any studio’s typography, layout, or copy.

## Required user journeys (MVP)

### Internal authoring

Sign in (magic link) → dashboard → create or choose client → create project → enter overview → select presentation theme → add/reorder content blocks → upload and organize assets → preview desktop/mobile → create private review link → publish (unlisted `/p/[slug]` on masermedia.co) → copy that URL.

### Client presentation

Open `https://<studioOrigin>/present/[token]` → optional passcode → see project title and framing → navigate chapters → view media without UI clutter → open approved asset library → filter by type → inspect usage notes → download individual approved files.

### Unlisted published read

Open `https://masermedia.co/p/[slug]` → read the published live record → 404 if not published.

Prospect conversion (work index → related work → inquiry) is **out of Casework MVP**. It remains on masermedia.co as it exists today.

## Information architecture

### Casework app (`studioOrigin`, Vercel URL in MVP)

```text
/auth/sign-in
/studio
/studio/clients
/studio/clients/[clientId]
/studio/projects/new
/studio/projects/[projectId]/overview
/studio/projects/[projectId]/story
/studio/projects/[projectId]/assets
/studio/projects/[projectId]/sharing
/studio/projects/[projectId]/settings
/studio/settings
/studio/design-system          # development reference only
/present/[token]
/present/[token]/assets
```

Project editor: stable left rail (Overview, Story, Assets, Sharing, Settings). Save status and Preview in the top bar. Avoid card-heavy dashboard composition.

### masermedia.co (existing site; thin route added later)

```text
/p/[slug]                      # unlisted published Casework project
```

Existing routes stay as they are: `/`, `/work`, `/work/helm-in-house-saas`, `/work/main-street-pub-grub`, `/about`, `/contact`. Do not migrate those case pages into Casework.

### Not in Casework MVP

```text
/
/work
/about
/contact
```

## Case study anatomy

Default sequence; editors may reorder or omit optional chapters:

1. Hero: client/project name, one-sentence outcome, service tags, year, strong image or video.
2. Snapshot: compact metadata and project scope.
3. Context: what changed in the client’s world.
4. Challenge: the specific business, audience, or cultural problem.
5. Strategic idea: the central thought that connects decisions.
6. Identity system: logo, type, color, image-making, voice, motion, sound, or relevant components.
7. Applications: the system working across real touchpoints.
8. Process: selected sketches or decisions only when they improve understanding.
9. Outcomes: metrics, launch milestones, adoption, press, testimonial, or qualitative impact. Demo metrics labeled as demo.
10. Credits: studio team, client team, collaborators, links, and project date.
11. Continuation: optional. No related-work index or inquiry form required in MVP.

Do not force every case study into a rigid Challenge/Solution/Results essay.

## Content block system

MVP block types:

| Type | Purpose |
| --- | --- |
| `text` | Eyebrow, heading, rich text, width, alignment. |
| `quote` | Quotation, attribution, role, emphasis style. |
| `stat` | One to four metrics with value, label, optional context. |
| `image` | Media, alt text, caption, fit, focal point, width. |
| `imagePair` | Two media items with independent captions and adjustable ratio. |
| `gallery` | Two to six media items using curated grid presets (not masonry). |
| `video` | Hosted file or approved embed, poster, caption, muted-loop controls. |
| `colorPalette` | Named swatches with HEX/RGB/CMYK/Pantone where supplied. |
| `typeSpecimen` | Family, styles, sample copy, optional font asset metadata. |
| `logoShowcase` | Primary/secondary marks on controlled light/dark backgrounds. |
| `beforeAfter` | Accessible toggle or draggable comparison with labels. |
| `chapterBreak` | Short title and optional media background. |
| `assetShelf` | Selected downloadable assets surfaced inside the narrative. |

Block requirements:

- Drag to reorder with keyboard-accessible alternatives.
- Duplicate, hide, delete with confirmation, and move between chapters.
- Autosave after a short debounce; Saving / Saved / Error status.
- Desktop and mobile preview using the **same renderer** as `/present` and `/p/[slug]`.
- Every media item requires alt text or an explicit decorative flag.
- Constrained variants. No free-position canvas in MVP.
- Hidden blocks do not appear in preview, `/present`, or `/p/[slug]`.

Validate `content` and `style` with a discriminated Zod/TypeScript schema keyed by block type.

## Visual direction

### Studio UI

Calm, precise, operational. Neutral white/near-black with one configurable studio accent. Compact controls, 1px dividers, radii 4–8px. Lucide icons. Clear sans-serif UI typeface. No cards-in-cards. No oversized marketing headings.

### Published / presented case study

Editorial and media-led. Full-bleed media alternates with constrained reading columns. Project theme tokens: background, foreground, accent, display font, body font, media radius, transition style.

Three layout modes from the same content:

```text
Editorial   = text-image pacing; strategy-rich work.
Immersive   = larger media, cinematic chapter breaks; motion and campaign work.
Systematic  = precise grids and specimens; identity systems and asset libraries.
```

Brand typography is optional and scoped to the project route (uploaded font assets). If custom fonts fail, the UI remains readable.

Navigation is minimal: studio mark, chapter progress, share, close/back where relevant. Mobile is a deliberate composition.

## Publish and edit rules

- `status = published` is what `https://masermedia.co/p/[slug]` reads (live row, no snapshot).
- To change a published project without showing mid-edit work: set status to `draft` or `review` (the public URL 404s), edit, then publish again. There is no previous public version to roll back to.
- Private `/present/[token]` links continue to work on draft and review projects while they remain active, unexpired, and unrevoked.
- Drafts and review links use `noindex, nofollow` and are excluded from any sitemap.

## Seed project

**Northline Public Market** — fictional regional food hall repositioned as a civic gathering place. Used to exercise every major presentation block.

- Challenge: strong vendors, but the market felt fragmented and transactional.
- Strategic idea: “The city meets here.”
- System: modular wordmark, bold civic typography, vendor color families, documentary photography, practical wayfinding, event-led motion.
- Applications: exterior signage, vendor stalls, reusable packaging, event posters, social templates, website, wayfinding.
- Outcomes: explicitly labeled **demo metrics**, not real client evidence.

Seed media is checked into the Casework repo (clearly licensed local files) with meaningful alt text. No remote hotlinks.

## Non-goals (MVP)

- Replacing masermedia.co marketing pages or the current `/work` index.
- Migrating Helm or Main Street case pages into Casework.
- Inquiry capture, related-work rails, or a Casework-owned contact page.
- ZIP bundles of assets.
- Rate limiting (known limitation — see architecture).
- Published snapshots / rollback of a previous public cut.
- Inline client comments, Figma/Adobe/Drive sync, multi-studio tenancy, full DAM, AI copy, PDF export, custom domains per client, realtime multi-user editing, arbitrary CSS.

## Definition of done (MVP)

A studio editor can create a client, upload media (including project fonts), assemble a coherent case study from structured blocks, preview it at multiple sizes, share a private presentation with selected individual downloads, publish an unlisted `https://masermedia.co/p/[slug]` page, and unpublish to edit without leaking drafts to that URL. The Northline seed demonstrates the complete block set. The experience must be secure enough for private review, accessible, responsive, and visually strong.

Phase-by-phase checklist: [build-status.md](./build-status.md). Architecture: [architecture.md](./architecture.md). Decisions: [decisions/0001-foundation.md](./decisions/0001-foundation.md).
