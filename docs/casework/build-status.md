# Casework — Build status

Phase-by-phase checklist. **Phase 0 is done in maser-lab** (this packet). Phases 1–9 run in the **new Casework repository** after a human creates it. Do not start a phase until the previous one is approved.

Work phase by phase. At the end of each implementation phase: lint, typecheck, tests, production build, desktop and mobile of the primary flow, files changed, decisions, limitations, AC confirmation — then stop.

## Phase 0 — Repository audit and decision record

**Status: complete** (maser-lab, 2026-08-13)

- [x] Inspect maser-lab (workspaces, Next 16 lab app, no backend, no Casework)
- [x] Inspect maser-media (`https://masermedia.co`, hardcoded `/work`)
- [x] Lock foundation via grilling (see [decisions/0001-foundation.md](./decisions/0001-foundation.md))
- [x] Write [product-brief.md](./product-brief.md)
- [x] Write [architecture.md](./architecture.md)
- [x] Write this checklist
- [x] No feature implementation; no second app inside `lab/`

**Acceptance**

- [x] Audit is evidence-based
- [x] Architecture covers studio, private presentation, unlisted `/p/[slug]`, database, storage, renderer, testing
- [x] Open decisions and spec exceptions are explicit
- [x] No feature implementation started

**This phase did not run** a Casework lint/typecheck/build (no app yet). Lab app was not modified.

**Handoff zip:** download [`casework-handoff.zip`](./casework-handoff.zip) — see [HANDOFF.md](./HANDOFF.md). Do not zip the whole maser-lab repo.

**Next:** Human creates the empty Casework GitHub repo, unzips the handoff, pushes it, then approve Phase 1 **on that repo**.

---

## Phase 1 — Foundation and design system

**Status: pending** (Casework repo)

- [ ] Initialize Next.js, TypeScript, Tailwind, lint, format, Vitest, Playwright
- [ ] Route groups: `(auth)`, `(studio)`, `(presentation)` — **no public marketing group**
- [ ] Semantic tokens for studio UI and project-scoped presentation themes
- [ ] Primitives: Button, IconButton, Input, Textarea, Select, Checkbox, Switch, Dialog, Dropdown, Tabs, Tooltip, Toast, EmptyState, Skeleton, StatusBadge
- [ ] Studio shell: compact sidebar, top bar, placeholder routes
- [ ] No Storybook; `/studio/design-system` in development
- [ ] Scaffold `@maser/casework-renderer` package (empty/theme shell is enough)
- [ ] Copy curated skills; `AGENTS.md` for Casework
- [ ] Product name in `src/config/product.ts`

**Not in this phase:** maser-media `/p/[slug]`, Supabase, full public shell.

---

## Phase 2 — Supabase schema, authentication, and authorization

**Status: pending**

- [ ] Supabase clients: browser, server, middleware (`@supabase/ssr`)
- [ ] Migrations: profiles, clients, projects, chapters, blocks, assets, share_links, studio_settings, events — **not** inquiries, snapshots, or rate-limit tables
- [ ] Magic-link sign-in/out, protected `/studio`, session refresh
- [ ] Invite-only: unknown emails cannot session
- [ ] Admin/editor helpers
- [ ] Seed: two invited users, one client, Northline project shell (no secrets committed)
- [ ] `.env.example` and setup docs
- [ ] Prove anonymous cannot read drafts or private assets

---

## Phase 3 — Clients, projects, and dashboard

**Status: pending**

- [ ] Dashboard: recent projects, status filters, New Project
- [ ] Client list/create/edit/detail; archive not hard-delete
- [ ] Project create + Overview: client, title, slug, summary, year, services, industries, status, visibility, hero
- [ ] Deny slugs that collide with maser-media `/work` file routes
- [ ] Validation, dirty-state, empty/error/loading
- [ ] Unpublish-to-edit rule surfaced when status is `published`

---

## Phase 4 — Asset library and media pipeline

**Status: pending**

- [ ] Direct/resumable uploads; progress, cancel, retry, type/size errors
- [ ] Grid/list, kind filters, search, tags, selection
- [ ] Metadata, alt, usage notes, download permission, version/replace
- [ ] Signed private downloads; no guessable public originals
- [ ] Font uploads (`woff2`/`woff`) as `kind = font`
- [ ] Failed uploads leave no misleading row
- [ ] Individual downloads only (**no ZIP**)

---

## Phase 5 — Story builder

**Status: pending**

- [ ] Chapters + all MVP block Zod schemas and editors
- [ ] Inserter, reorder (dnd-kit + keyboard), duplicate, hide, delete, chapter move
- [ ] Autosave + Saving/Saved/Error
- [ ] Preview uses the shared renderer
- [ ] Seed full Northline story + checked-in licensed media

---

## Phase 6 — Presentation renderer and theming

**Status: pending**

- [ ] Shared renderer: preview, `/present`, and (API-ready) `/p/[slug]`
- [ ] Editorial / Immersive / Systematic
- [ ] Theme controls with contrast floor; uploaded fonts scoped with fallback
- [ ] Chapter nav, captions, lightbox if useful, reduced motion
- [ ] Publish `@maser/casework-renderer` for maser-media to consume

---

## Phase 7 — Private review, asset delivery, and publishing

**Status: pending**

- [ ] Share links: label, expiry, optional passcode (hashed), downloads toggle, revoke, regenerate
- [ ] `/present/[token]` and `/present/[token]/assets` on **Casework host only**
- [ ] Individual signed downloads; **no ZIP**
- [ ] Publish/unpublish: required metadata, hero, alt text; unpublish 404s `/p/[slug]`
- [ ] Live rows (no snapshot)
- [ ] Event log: publish, unpublish, share create/revoke, download, destructive asset
- [ ] Document maser-media `/p/[slug]` contract; implement that route in a **maser-media PR** (may ship in this phase or immediately after)
- [ ] Unlisted pages: default `noindex`; no sitemap of drafts

**Note:** Until the maser-media PR lands, copied `/p/[slug]` URLs 404 on production. Call that out in the studio UI if the route is not live.

---

## Phase 8 — Work index, conversion, and studio settings

**Status: pending (reduced)**

Original spec’s `/work` index, home, About, Contact, and inquiries are **out**. This phase is studio settings plus any leftover chrome:

- [ ] Studio settings: name, mark, accent, contact details for studio chrome, default presentation mode
- [ ] Graceful defaults if settings are empty
- [ ] Optional: copy-unlisted-URL control and “live on masermedia.co/p/…” status
- [ ] Do **not** build Casework `/`, `/work`, `/about`, `/contact`, or inquiries

---

## Phase 9 — Quality, performance, and launch readiness

**Status: pending**

- [ ] Full test suite, typecheck, lint, production build (Casework repo)
- [ ] Playwright: sign-in, project create, upload stub, story edit, preview, share-link, publish, unpublish 404, present access
- [ ] Authz tests including forged IDs and revoked links
- [ ] A11y, reduced motion, media controls, 360/768/1440
- [ ] Media-heavy pass on LCP/INP/CLS
- [ ] Error monitoring hooks; operational runbook; deployment docs
- [ ] Remove dead code and placeholders
- [ ] README: new editor can sign in, create, preview, share, publish

---

## Deferred after MVP

- Rate limits (magic link, passcode)
- ZIP bundles
- Inquiries / conversion on Casework
- Published snapshots / rollback
- Listing Casework projects on masermedia.co `/work`
- Custom studio domain
- Inline comments, DAM, AI copy, PDF, multi-studio, realtime collab, Figma/Drive sync, arbitrary CSS
- Cloudinary (adapter exists; not wired)

## Definition of done (reminder)

See [product-brief.md](./product-brief.md). MVP is authoring + private review + unlisted live publish on masermedia.co `/p/[slug]`, not a replacement marketing site.
