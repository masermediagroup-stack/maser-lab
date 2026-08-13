# Casework — Architecture

Evidence-based plan for a **new dedicated Casework repository**, with a thin unlisted route on the existing [maser-media](https://github.com/masermediagroup-stack/maser-media) site. This file does not authorize an app inside maser-lab.

Companion docs: [product-brief.md](./product-brief.md), [decisions/0001-foundation.md](./decisions/0001-foundation.md), [build-status.md](./build-status.md).

## Repository audit (maser-lab, 2026-08-13)

Maser-lab is a frontend testing lab. It is not a CMS.

| Present | Absent (needed for Casework) |
| --- | --- |
| npm workspaces: `lab`, `packages/*` | No Casework app, no `apps/` |
| Next.js 16.2.9, React 19.2.4, Tailwind 4.3.1 | No Supabase, auth, middleware, API routes, Server Actions |
| shadcn `base-nova` + `@base-ui/react` (12 primitives) | No Dialog, Dropdown, Tabs, Tooltip, Toast, Checkbox, Form, EmptyState, Skeleton, StatusBadge |
| Vitest 4.1.10 (dither-only), Playwright 1.61 (stale SummitPath spec) | No RTL coverage for a product, no CI, no Prettier, no `.env.example` |
| `docs/roadmap/` (Dither engine) | Casework docs now live under `docs/casework/` |
| `vercel.json` builds **only** `lab/` | No Casework deploy target in this repo |

**Reuse as patterns, not as runtime:** Tailwind 4 + shadcn base-nova + Base UI, `cn()`, compact studio density, product-vs-shell token separation (`--lab-*` must never be required). Do not import files from `lab/`.

**Do not:** nest Casework under `lab/`, register a `projects/registry.json` slug, or convert this repo into Casework.

Existing marketing site (facts, not assumptions):

- Repo: `masermediagroup-stack/maser-media`
- Live: https://masermedia.co
- App: `next-app/` (Next 16, React 19, Tailwind 4, shadcn, Base UI)
- Hardcoded work: `/work`, `/work/helm-in-house-saas`, `/work/main-street-pub-grub`

## System shape

```text
┌─────────────────────────┐     ┌──────────────────────────┐
│ Casework (new repo)     │     │ maser-media (existing)   │
│ studioOrigin (Vercel)   │     │ https://masermedia.co    │
│ /studio /auth /present  │     │ / /work /about /contact  │
│ @maser/casework-renderer│     │ /p/[slug]  (thin route)  │
└───────────┬─────────────┘     └────────────┬─────────────┘
            │                                │
            └────────────┬───────────────────┘
                         ▼
              Supabase (one project)
              Postgres + Auth + Storage
```

- Casework owns authoring, magic-link sessions, private review, uploads, and the renderer package.
- maser-media owns the agency marketing site and adds a **thin** `/p/[slug]` page that reads **published** live rows and renders with `@maser/casework-renderer`.
- Both apps use the **same** Supabase project. Never ship the service-role key to either browser bundle.

This agent (and Phase 0 in maser-lab) does **not** edit maser-media. The `/p/[slug]` route is a later PR in that repo, after the renderer package exists.

To start the Casework repo, download [`casework-handoff.zip`](./casework-handoff.zip) and follow [HANDOFF.md](./HANDOFF.md). Do not clone maser-lab as Casework.

## Casework folder structure (new repo, Phase 1)

```text
casework/
  AGENTS.md
  .agents/skills/                 # curated pack only — see below
  src/
    app/
      (auth)/                     # magic-link sign-in
      (studio)/studio/...
      (presentation)/present/[token]/...
    components/
      ui/                         # primitives (copy shadcn patterns; do not import lab)
      studio/
      presentation/
      blocks/
    lib/
      supabase/                   # browser, server, middleware clients
      storage/                    # adapter (Supabase now; Cloudinary later)
      blocks/                     # Zod discriminated unions
      config/product.ts           # { name: "Casework", slug: "casework" }
    styles/
      studio.css
      presentation.css
  packages/
    casework-renderer/            # published as @maser/casework-renderer
  supabase/
    migrations/
    seed/
  public/seed/                    # licensed Northline stills (also uploaded in seed)
  e2e/
  vitest.config.ts
```

No `(public)` marketing route group in Casework MVP.

## Route and host boundaries

| Surface | Host | Routes | Who |
| --- | --- | --- | --- |
| Studio | `studioOrigin` (Vercel `*.vercel.app` in MVP) | `/studio/*`, `/auth/*` | admin, editor |
| Private review | `studioOrigin` | `/present/[token]`, `/present/[token]/assets` | token holder |
| Unlisted published | `https://masermedia.co` | `/p/[slug]` | anyone with the URL, only if `published` |
| Agency marketing | `https://masermedia.co` | `/`, `/work`, `/about`, `/contact` | unchanged; not Casework |

Product config stores `publicOrigin` (`https://masermedia.co`) and `studioOrigin` (Vercel URL). Custom studio domain is post-MVP.

Private tokens must **never** be rewritten through masermedia.co (CDN, cache, and draft-leak risk).

## Authentication and authorization

- Studio: Supabase Auth **magic link only**. Invite-only: an admin inserts `profiles` (email + role) before a link can create a session. Unknown emails get no session. No password auth. No public sign-up.
- Roles: `admin` | `editor` on `profiles.id → auth.users.id`.
- Client viewers: no account. `share_links.token_hash` (and optional `passcode_hash`). Show the raw token **once** at creation. Revoke and regenerate supported.
- Enforce RLS on every user-owned or private table and bucket, **and** re-check authorization in server code for sensitive operations.
- Middleware: unauthenticated users hitting `/studio/*` redirect to sign-in. Session refresh via `@supabase/ssr`.

## Data model

Implement migrations, generated database types, timestamps, indexes, foreign keys, and soft archival (`status = archived`) where appropriate.

Tables from the original spec, with MVP exceptions called out:

- `profiles` — as specified (`role`: admin, editor).
- `clients` — as specified.
- `projects` — as specified (`status`: draft, review, published, archived; `visibility` retained for future use; unlisted `/p/[slug]` only serves `status = published`).
- `chapters` — as specified.
- `blocks` — as specified; JSON validated by Zod, never spread untyped.
- `assets` — as specified. Font files use `kind = font`.
- `share_links` — as specified; store hashes only.
- `studio_settings` — singleton: studio name, mark, accent, contact details for chrome (not a public marketing CMS).
- `events` — publish, unpublish, share-link create/revoke, download, destructive asset action. Lightweight view/download log without invasive tracking.

**Not in MVP schema**

- `project_snapshots` — live rows; unpublish to edit.
- `inquiries` — use existing masermedia.co contact form.
- Rate-limit tables — none (known limitation).

Publish rule: `/p/[slug]` queries `projects` where `slug = $slug AND status = 'published'`, then visible chapters/blocks. If the row is not published, 404. Autosave while `draft`/`review` cannot appear on masermedia.co. Autosave while `published` **would** appear; the product rule is: editors must unpublish before editing (studio UI must block or warn and require the status flip).

## Storage

- Supabase Storage for MVP. `lib/storage/` is an adapter so Cloudinary can be added later without rewriting callers.
- Private originals: signed URLs. No guessable public URLs for drafts or source files.
- Public delivery on `/p/[slug]` only for media that belongs to a published project (derivatives or signed public objects — decide in Phase 4; default to not exposing the original bucket publicly).
- Validate file type and size on client and server. Reject executables and unexpected formats.
- Font uploads: `woff2` (and `woff` if needed), project-scoped `@font-face`, fallback to studio UI font on failure.
- Failed uploads must not leave a misleading database row.
- Direct/resumable uploads; do not proxy full large files through a serverless function.

## Renderer package

`@maser/casework-renderer` is the single composition for:

1. Studio desktop/mobile preview
2. `/present/[token]`
3. masermedia.co `/p/[slug]`

It consumes typed block JSON + project theme tokens. It must not import studio chrome, lab tokens, or Next.js-only studio code. maser-media depends on this package; it does not duplicate block renderers.

Layout modes `Editorial` | `Immersive` | `Systematic` are renderer concerns. Theme tokens are constrained; reject unreadable combinations (contrast floor).

## Security and privacy

- Service-role credentials stay server-side (Casework server and, if needed, maser-media server components only).
- Draft and review: `noindex, nofollow`; excluded from sitemaps.
- `/p/[slug]` is unlisted (not in `/work`). Still set canonical + robots according to studio preference in Phase 7; default `noindex` for unlisted pages unless explicitly opted into indexing later.
- Sanitize TipTap HTML and approved embeds.
- **Rate limits are deferred.** Magic-link and passcode attempts are unprotected in MVP. Treat this as a launch risk; add Postgres or Upstash limits before any wide client sharing.

## Performance and accessibility budgets

Carry the original budgets onto `/present` and `/p/[slug]`:

- Lighthouse 90+ on a representative published page where it can be measured.
- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75 when field data exists.
- Reserved media dimensions; responsive images; lazy-load below-fold; hero is the only prioritized LCP asset.
- Video muted and user-controllable; never autoplay audio.
- `prefers-reduced-motion`.
- Visible focus, heading order, landmarks, keyboard, contrast, descriptive download labels.
- Core flows at 360, 768, 1440, and a wide desktop viewport.

## Testing boundaries

| Layer | Where | What |
| --- | --- | --- |
| Unit | Casework Vitest | Zod block schemas, slug rules, publish-status helpers, token hashing |
| Component | Vitest + RTL | Studio primitives, status badge, unpublish-to-edit affordance |
| Authz | SQL / integration | RLS: anonymous cannot read drafts or private assets; editor cannot escalate to admin |
| E2E | Playwright on Casework | Magic-link (stubbed), project create, story edit, preview, share-link, unpublish 404 vs publish |
| E2E (later) | maser-media | `/p/[slug]` published vs 404 |

Phase 0 in maser-lab: no Casework app, so no lint/typecheck/build of Casework. Lab lint is unchanged.

## Skill and workflow transfer (new repo)

Copy these skills into the Casework repo and follow them:

- `maser-lab-web` (Shape / Implement / Review / Harden — primary workflow)
- `verification`
- `web-design-guidelines`
- `shadcn`
- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `review-animations`, `ui-animation`, `emil-design-eng`, `frontend-design`

Do **not** copy Three.js, Dither, Convex, Firebase, or Hugging Face skills. They will fight this stack.

Work phase by phase. Stop for approval after each phase. Do not scaffold Casework inside maser-lab.

## Proposed versions (pin exactly at Phase 1 init)

Record resolved versions in the Casework lockfile. Intended set:

| Package | Version (as of 2026-08-13) |
| --- | --- |
| next | 16.2.9 (align with lab; maser-media is on 16.1.6 — renderer must not depend on a mismatched Next API) |
| react / react-dom | 19.2.4 |
| typescript | 5.x |
| tailwindcss | 4.3.x |
| @base-ui/react | ^1.6 (lab) |
| shadcn | ^4.12 |
| lucide-react | ^1.21 |
| motion | current 12.x (`motion`, not `framer-motion` import path) |
| @supabase/supabase-js | 2.112.x |
| @supabase/ssr | 0.12.4 |
| zod | current 3.x/4.x at init |
| react-hook-form | current |
| @tiptap/react + starter-kit | 3.x |
| @dnd-kit/core | 6.3.x |
| vitest | 4.x |
| @testing-library/react | current |
| @playwright/test | 1.61.x |

## Environment (Casework `.env.example`, Phase 2)

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server only
NEXT_PUBLIC_PRODUCT_NAME=Casework
NEXT_PUBLIC_PUBLIC_ORIGIN=https://masermedia.co
NEXT_PUBLIC_STUDIO_ORIGIN=          # Vercel URL
```

No secrets in git. Seed two users via env-provided emails, not committed passwords (magic link).

## maser-media integration (later PR, not this repo)

1. Depend on `@maser/casework-renderer`.
2. Add `app/p/[slug]/page.tsx`: if project not published → `notFound()`.
3. Do not add Casework studio routes there.
4. Leave `/work/*` file routes in place. Never reuse those slugs for Casework projects (enforce in Casework slug validation with a denylist: `helm-in-house-saas`, `main-street-pub-grub`, and `work` itself).
