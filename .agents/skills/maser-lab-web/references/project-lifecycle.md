# Project lifecycle

## Status flow

```text
draft → building → review → ready → transferred
```

| Status | Meaning |
| --- | --- |
| `draft` | Spec only; no demo or incomplete |
| `building` | Active implementation in `lab/` |
| `review` | Demo exists; quality review in progress (layout, a11y, motion as applicable) |
| `ready` | Acceptance criteria met; approved for portfolio |
| `transferred` | Copied to portfolio; archived here |

Update `projects/registry.json` when status changes.

## New project checklist

1. Copy `projects/_template/` files → `projects/{category}/{slug}/` (includes `FIGMA.md`)
2. Fill `PROJECT.md` (brief, states, acceptance criteria) and `FIGMA.md` if Figma or design refs exist
3. Add slug to `registry.json` with `status: "draft"` and a valid `category` from `categories.json`
4. Create `lab/src/components/projects/{category}/{slug}/`
5. Add or extend `lab/src/app/demos/[slug]/page.tsx`
6. Set status to `building` when implementation starts

## Demo page requirements

Every demo route must include:

- **Title and one-line purpose**
- **State matrix** — UI to trigger each state in `PROJECT.md`
- **Reduced motion note** — how behavior changes
- **Props/API snippet** — for portfolio transfer

## Transfer checklist (Transfer mode)

Per-slug porting details: `projects/{category}/{slug}/TRANSFER.md`. Universal process below.

### Phase 1 — Ready in Maser-Lab

- [ ] `PROJECT.md` acceptance criteria all checked
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Every state in `PROJECT.md` exercised (hover, focus, keyboard, mobile, reduced motion)
- [ ] Motion review clean — no open P0/P1 findings
- [ ] `prefers-reduced-motion` honored
- [ ] Registry status → `ready`
- [ ] `TRANSFER.md` filled: export, props, dependencies, porting steps, public assets
- [ ] Component exports documented in `index.ts`
- [ ] No lab-only hacks (hardcoded routes, debug styles)

### Phase 2 — Extract from lab

Copy:

```text
lab/src/components/projects/{category}/{slug}/
lab/public/images/…  (if referenced)
```

- [ ] Copy component folder into portfolio repo
- [ ] Copy assets into portfolio `public/` (or CDN)
- [ ] Install dependencies from `TRANSFER.md`
- [ ] Import or merge `tokens.css` / theme variables
- [ ] Fix import aliases to portfolio `tsconfig` paths

### Phase 3 — Integrate in portfolio

- [ ] Add showcase page or gallery entry
- [ ] Wire props to portfolio router/state
- [ ] Match layout shell, metadata, SEO
- [ ] Responsive + keyboard QA outside lab chrome
- [ ] Portfolio `npm run lint` and `npm run build` pass

### Phase 4 — Deploy on Vercel

- [ ] Preview deploy — visual QA on preview URL (all states, mobile, reduced motion)
- [ ] Production deploy after preview sign-off
- [ ] Smoke-test live production URL

### Phase 5 — Close out in Maser-Lab

- [ ] Registry status → `transferred`
- [ ] Optional: note live portfolio URL in `TRANSFER.md` **Notes**

## File locations

| Artifact | Path |
| --- | --- |
| Spec | `projects/{category}/{slug}/PROJECT.md` |
| Figma / design sync | `projects/{category}/{slug}/FIGMA.md` |
| Transfer notes | `projects/{category}/{slug}/TRANSFER.md` |
| Local dev notes | `projects/{category}/{slug}/LOCAL.md` |
| Code Connect config | `lab/figma.config.json` |
| Component | `lab/src/components/projects/{category}/{slug}/` |
| Demo | `lab/src/app/demos/[slug]/page.tsx` |
| Registry | `projects/registry.json` |
| Categories | `projects/categories.json` |
