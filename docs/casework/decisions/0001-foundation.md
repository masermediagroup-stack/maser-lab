# Casework lives in a new repo and publishes unlisted live URLs on masermedia.co

Maser-lab is a UI lab; Casework is an in-house CMS. We will not put the CMS in this monorepo. Studio and private review run on a Casework Vercel app; published projects appear as live rows at `https://masermedia.co/p/[slug]` through a shared renderer package.

Status: accepted (grilling 2026-08-13)

## Context

The original spec described a single Next.js app with public `/`, `/work`, `/about`, `/contact`, snapshot publishing, email/password or magic link, inquiries, ZIP bundles, and rate limits. An audit of maser-lab showed a frontend-only lab (`lab/` Next 16 app, no Supabase). An audit of `masermediagroup-stack/maser-media` showed that https://masermedia.co already has those marketing routes and hardcoded `/work` case pages.

A grilling session locked a different foundation. This ADR records it so later phases do not rebuild the spec as written.

## Decision

1. **New dedicated GitHub repository** for Casework. Maser-lab Phase 0 is this `docs/casework/` packet only. No `casework/` workspace app. No lab registry slug. `gh` in this environment cannot create the repo; a human creates `masermediagroup-stack/casework` (name may vary) before Phase 1.
2. **Headless attach to masermedia.co.** Casework is studio + `/present/[token]` + database. maser-media adds a thin `/p/[slug]` route. One shared Supabase project. One shared `@maser/casework-renderer`.
3. **Existing `/work` stays.** Helm and Main Street are not migrated.
4. **Live published rows.** No `project_snapshots`. Editors unpublish (`draft`/`review`) to edit; `/p/[slug]` 404s until they publish again. `/present` still works on drafts.
5. **Magic link, invite-only.** No passwords. Admin must create `profiles` before a session exists.
6. **Studio host:** Vercel URL in MVP. **Review host:** that same origin `/present/[token]`. **Published host:** masermedia.co `/p/[slug]` only.
7. **Curated maser-lab skills** in the new repo (workflow), not the entire skill inventory.
8. **MVP cuts:** no inquiries, no ZIP, no rate limits, no Casework marketing shell, no snapshots.

Stack for Phase 1 init: Next 16.2.9, React 19.2.4, Tailwind 4, shadcn base-nova + `@base-ui/react`, Motion, Supabase JS 2.112.x + `@supabase/ssr` 0.12.4, Zod, RHF, TipTap 3, dnd-kit 6.3.x, Vitest + RTL, Playwright. Product name isolated in `src/config/product.ts`. Convex is rejected (spec and this ADR require Supabase).

## Considered options

| Topic | Rejected | Why |
| --- | --- | --- |
| Sibling `casework/` in maser-lab | Q1 A | Mixes secrets, public URLs, and a CMS lockfile with a UI lab. Root `vercel.json` already builds only `lab/`. |
| Convert maser-lab into Casework | Q1 C | Destroys the lab. |
| Lab demo only | Q1 D | Not a production in-house app. |
| Casework *is* the public studio site | Q2 A | masermedia.co already is. |
| Reverse-proxy `/work` or `/present` through masermedia.co | Q6 B, Q14 B | Draft and cookie leak onto the marketing CDN. |
| `/work/[slug]` for CMS pages | Q10 A | Collides with hardcoded file routes. |
| Duplicate renderer in maser-media | Q11 B | Will drift. |
| Iframe Casework on masermedia.co | Q11 C | Weak SEO, extra origin. |
| Copy every maser-lab skill | Q13 A | Convex/Firebase/HF skills fight Supabase. |
| Email/password | Q4 A | Studio chose magic link. |
| Snapshot on publish | Q3 B | Studio chose live rows + unpublish-to-edit. |
| Inquiries / ZIP / rate limits in MVP | Q15–18 other options | Cut to keep v1 to authoring, review, and unlisted publish. |

## Consequences

- Phase 1+ happens in the new repo. This maser-lab PR must not scaffold an app.
- maser-media needs a later PR for `/p/[slug]` and a dependency on the renderer. Until then, “publish” can flip status and copy a URL that 404s in production.
- Unpublish-to-edit means clients with the unlisted URL lose it while the studio edits. Share that in the studio UI. There is no rollback of the last public cut.
- Passcode and magic-link brute force are **unprotected** until rate limits are added. Do not treat wide client sharing as safe.
- Font uploads (`woff2`/`woff`) are in scope; ZIP bundles are not.
- Original spec phases 7–8 (sitemap of a Casework `/work` index, OG for a Casework homepage, inquiry admin) are rewritten: unlisted `/p/[slug]` metadata lives on maser-media; conversion stays on the existing contact form.

## Assumptions

- The Casework GitHub repo will live under `masermediagroup-stack`.
- Northline is fictional; demo metrics stay labeled as demo.
- Studio identity on masermedia.co remains Maser Media; Casework chrome can say “Casework” internally.
- Seed users are two invited emails, not committed secrets.
- Unlisted `/p/[slug]` defaults to `noindex` until a later decision to list work.

## Open decisions (not blocking Phase 0)

- Exact GitHub repo name (`casework` vs other).
- Whether `/p/[slug]` is `noindex` forever or only until a “list on /work” flag exists.
- Cloudinary (storage adapter is ready; not wired).
- Rate-limit vendor when that phase is approved (Postgres vs Upstash).
- Custom studio domain (`studio.masermedia.co`).

## Evidence

- maser-lab: `package.json` workspaces `lab`, `packages/*`; `vercel.json` → `lab/.next`; no Supabase; 12 shadcn primitives.
- maser-media: homepage `https://masermedia.co`; `next-app/src/app/work/*` file routes.
- Grilling rounds 1–4, 2026-08-13 (Q1–Q19).

Approver: human (Tyler / Maser Media), via grilling answers.
