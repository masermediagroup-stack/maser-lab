---
name: maser-lab-export
description: >-
  Transfer-mode enforcer for Maser-Lab products. Use when marking a project ready,
  preparing portfolio transfer, auditing index.ts barrels, filling TRANSFER.md,
  or when asked about export readiness / portable public API. Ensures product-only
  exports, complete transfer notes, and no lab-chrome leakage.
---

# Maser-Lab Export

Enforce a **clean public API** so lab products transfer to portfolio/client repos without demos, tuning chrome, or stub docs.

Load after `maser-lab-web` Transfer mode. Do not replace lifecycle rules — enforce them.

## When to load

| Trigger | Action |
| --- | --- |
| Transfer mode / "ready for portfolio" | Full export gate |
| "What's exportable?" / barrel review | Audit `index.ts` |
| Status bump `review` → `ready` | Run checklist; block on failures |
| New project scaffolding | Define product vs demo export contract |

## Product kinds

| Kind | Examples | Portable unit |
| --- | --- | --- |
| **Section / chrome** | plotline, prism, summitpath, liquid, blobby, service-showcase | One product component + `tokens.css` + assets |
| **Lab / workspace** | text-animation-lab, page-transitions-lab | Snippets / generators / sibling packages — **not** the lab shell |
| **App surface** | makeyourday-calendar | App component (not Demo) + tokens + persistence notes |

Name the kind in the transfer report. Labs must document the real portable path (e.g. `lab/src/components/text-animations/`).

## Non-negotiable export contract

### 1. Barrel rules (`index.ts`)

**Product-only public API.**

```ts
// ✅ Product
export { PlotlineTabNav, type PlotlineTabNavProps } from "./tab-nav";
export { NAV_ITEMS } from "./constants";

// ❌ Never in product barrel
export { PlotlineTabNavDemo } from "./plotline-tab-nav-demo";
```

| Rule | Detail |
| --- | --- |
| Product export required | At least one non-Demo component (or documented portable sibling path for labs) |
| Demo not in barrel | Demos register only in `lab/src/components/projects/registry.ts` (`demoRegistry`) |
| Types exported | Props and public unions from product modules |
| No cross-slug imports | Product must not import other `{category}/{slug}` packages |
| No demo-chrome imports | Product must not import `@/components/lab/demo-chrome` |

Optional companion file: `index.demo.ts` only if a project explicitly needs a demo barrel — never the default.

### 2. `TRANSFER.md` completeness

Block `ready` if any of these remain template placeholders:

- `{title}`, `{category}`, `{slug}`, `ComponentName`
- Empty Dependencies / Props / Public assets when the product has them
- Missing porting steps for tokens and aliases

Required sections (see `projects/_template/TRANSFER.md` + lifecycle Transfer checklist):

1. Export import snippet (real path + symbol)
2. Dependencies (npm packages)
3. Props table
4. Public assets (`lab/public/…`)
5. Porting steps (copy folder, tokens, aliases, showcase)
6. Notes (lab vs section, sibling packages, live URL later)

### 3. Assets & remote media

| Issue | Severity | Fix |
| --- | --- | --- |
| Product defaults use Unsplash/remote CDN | P1 | Move to `lab/public/` or mark demo-only data |
| Product hardcodes `/demos/…` routes | P0 | Props / callbacks only |
| Tokens mixed with lab shell variables | P1 | Load `maser-lab-token-system` |

### 4. Status honesty

Before registry `status: "ready"`:

- [ ] `PROJECT.md` acceptance criteria all true (run `maser-lab-acceptance-audit`)
- [ ] Product exported from `index.ts` (or lab portable path documented)
- [ ] `TRANSFER.md` filled with no placeholders
- [ ] Demo not re-exported from product barrel
- [ ] `npm run lint` + `npm run build` pass in `lab/`
- [ ] Reduced motion verified (or N/A documented)

## Audit procedure

1. Read `projects/{category}/{slug}/PROJECT.md`, `TRANSFER.md`, `index.ts`
2. Classify product kind
3. Diff barrel exports vs files (`*Demo`, `*-demo.tsx`)
4. Grep product files for `demo-chrome`, other project slugs, remote image hosts
5. Score P0/P1/P2 findings
6. Output transfer report (below)

## Transfer report format

```markdown
## Export audit — {slug}

**Kind:** section | lab | app
**Ready?** yes | no

### Barrel
- Product symbols: …
- Demo leakage: none | list

### TRANSFER.md
- Placeholders remaining: …
- Gaps: …

### Findings
| Pri | Finding | Fix |
| --- | --- | --- |
| P0 | … | … |

### Portable copy set
- `lab/src/components/projects/{category}/{slug}/` (exclude `*-demo.tsx` if not needed)
- tokens / assets: …
```

## Anti-patterns (observed)

- `makeyourday-calendar/index.ts` exporting only Demo while PROJECT marks export done
- Every project re-exporting `*Demo` from the same barrel as product
- Stub TRANSFER files with template `{category}/{slug}` paths
- Treating text-animation-lab shell as the portable unit instead of `text-animations/`

## Related

- Lifecycle: `maser-lab-web/references/project-lifecycle.md`
- Tokens: `maser-lab-token-system`
- Honesty gate: `maser-lab-acceptance-audit`
- Scaffold: `maser-lab-project-scaffold`
