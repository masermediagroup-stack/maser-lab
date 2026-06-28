# Project lifecycle

## Status flow

```text
draft → building → review → ready → transferred
```

| Status | Meaning |
| --- | --- |
| `draft` | Spec only; no demo or incomplete |
| `building` | Active implementation in `lab/` |
| `review` | Demo exists; motion/a11y review in progress |
| `ready` | Acceptance criteria met; approved for portfolio |
| `transferred` | Copied to portfolio; archived here |

Update `projects/registry.json` when status changes.

## New project checklist

1. Copy `projects/_template/` files → `projects/{category}/{slug}/`
2. Fill `PROJECT.md` (brief, states, acceptance criteria)
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

- [ ] `PROJECT.md` acceptance criteria all checked
- [ ] Component exports documented in `index.ts`
- [ ] Dependencies listed (Framer, GSAP, etc.)
- [ ] No lab-only hacks (hardcoded routes, debug styles)
- [ ] `TRANSFER.md` filled with porting steps
- [ ] Registry status → `transferred`

## File locations

| Artifact | Path |
| --- | --- |
| Spec | `projects/{category}/{slug}/PROJECT.md` |
| Transfer notes | `projects/{category}/{slug}/TRANSFER.md` |
| Component | `lab/src/components/projects/{category}/{slug}/` |
| Demo | `lab/src/app/demos/[slug]/page.tsx` |
| Registry | `projects/registry.json` |
| Categories | `projects/categories.json` |
