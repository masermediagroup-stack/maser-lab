---
name: figma-design-workflow
description: >-
  Integrates Figma into Maser-Lab — design references, design-to-code, code-to-design,
  tokens, and Code Connect for any web UI project (sections, components, forms, nav).
  Use when shaping UI from Figma, syncing demos to Figma, mapping components with
  Code Connect, or when PROJECT.md lists a Figma URL. Load alongside
  maser-lab-web for any project with design references.
---

# Figma Design Workflow (Maser-Lab)

Bridge **Figma design** and the **lab build loop** without breaking the existing Shape → Implement → Review → Transfer lifecycle.

## When to load

| Task | Load |
| --- | --- |
| New project with a Figma or Dribbble reference | This skill + `maser-lab-web` |
| Implement from a Figma URL | This skill + Figma MCP `get_design_context` |
| Push a finished demo to Figma | `figma-generate-design` + `figma-use` |
| Map lab component ↔ Figma component | `figma-code-connect` |
| Build or extend a design system in Figma | `figma-generate-library` + `figma-use` |

**Report** which Figma skill(s) and `FIGMA.md` / `PROJECT.md` design sections you used.

## Operating contract

1. **Figma is a reference layer, not a replacement for `PROJECT.md`.** Motion decisions, states, and acceptance criteria still live in `PROJECT.md`.
2. **Tokens in code win for implementation.** Extract colors, radii, blur, and typography from Figma into `tokens.css` (or Tailwind theme) — do not hardcode one-off hex in components when a token exists.
3. **Verify in the lab, not in Figma alone.** After design-to-code, run `npm run dev` in `lab/` and compare against Figma screenshot or prototype.
4. **Bidirectional sync is explicit.** Design → code (Shape/Implement) and code → design (after demo is stable) are separate steps — state which direction you are working.

## Workflow by request mode

### Shape (design exists in Figma)

1. Read `projects/{category}/{slug}/FIGMA.md` and `PROJECT.md`
2. Call Figma MCP `get_design_context` with `fileKey` + `nodeId` from the URL
3. Extract: layout, typography, color tokens, component boundaries, motion hints
4. Write motion brief into `PROJECT.md` — map Figma states to lab demo states
5. List token gaps (Figma variable → CSS custom property)

### Implement (build from Figma)

1. Complete Shape steps if not done
2. Create `tokens.css` scoped to the project (see `prism/tokens.css`)
3. Implement component under `lab/src/components/projects/{category}/{slug}/`
4. Wire demo route; add Figma URL to `FIGMA.md` → **Implementation** section
5. Run `npm run lint` and `npm run build` in `lab/`
6. Visual diff: Figma screenshot vs browser screenshot at same viewport

### Review

Compare rendered demo against:

- Figma static frame (layout, spacing, color)
- Figma prototype (motion timing — approximate; code is source of truth for springs)
- `PROJECT.md` state matrix

### Code → Figma (demo stable)

Use when a lab demo is review-ready and you want a portfolio/design handoff file:

1. Load `figma-generate-design` + `figma-use`
2. Create or target a team Figma file; document `fileKey` in `FIGMA.md`
3. **Web demos:** run parallel `generate_figma_design` capture + `use_figma` assembly (see `figma-generate-design` skill)
4. Bind tokens to Figma variables where a library exists
5. Update `FIGMA.md` → **Figma file** section with node IDs for key frames

### Code Connect (component mapping)

When Figma components are **published to a team library**:

1. Load `figma-code-connect`
2. Add `ComponentName.figma.ts` next to the lab component (see `lab/figma.config.json` paths)
3. Link Figma URL in file header comment
4. Run Figma Code Connect publish from `lab/` when org plan supports it

## File locations

| Artifact | Path |
| --- | --- |
| Design spec | `projects/{category}/{slug}/FIGMA.md` |
| Interaction spec | `projects/{category}/{slug}/PROJECT.md` |
| Design tokens | `lab/src/components/projects/{category}/{slug}/tokens.css` |
| Code Connect | `lab/src/components/projects/{category}/{slug}/*.figma.ts` |
| Code Connect config | `lab/figma.config.json` |

## URL parsing

| URL | fileKey | nodeId |
| --- | --- | --- |
| `figma.com/design/:fileKey/:name?node-id=X-Y` | `:fileKey` | `X:Y` |
| Community file | use file key from URL | from `node-id` |

## Token extraction pattern

From Figma context or inspect panel → scoped CSS:

```css
/* projects/{slug}/tokens.css */
.{slug-prefix} {
  --{prefix}-bg: #050b14;
  --{prefix}-accent: #38bdf8;
  --{prefix}-glass-bg: rgba(8, 16, 32, 0.72);
  --{prefix}-blur: 24px;
}
```

Document the mapping in `FIGMA.md` → **Token map**.

## Quality gates (Figma-aware)

Before `status: ready`:

- [ ] `FIGMA.md` has file URL and key frame node IDs (if Figma file exists)
- [ ] Token map documents Figma → CSS custom properties
- [ ] Demo visually matches Figma reference at mobile viewport (± reasonable motion variance)
- [ ] `prefers-reduced-motion` still verified in browser (Figma rarely models this)
- [ ] Code Connect added if team library + org plan available

## Routed Figma skills (do not duplicate)

| Need | Skill |
| --- | --- |
| Read/write nodes in Figma | `figma-use` (MANDATORY before `use_figma`) |
| Full page / modal in Figma from code | `figma-generate-design` |
| Code Connect `.figma.ts` files | `figma-code-connect` |
| Variables, components, design system | `figma-generate-library` |
| New blank Figma file | `figma-create-new-file` |
| Motion from Figma prototype | `figma-implement-motion` |

## Example: prism

- **Reference:** Community Figma + Dribbble shot (see `PROJECT.md`)
- **Tokens:** `tokens.css` with `--prism-*` variables
- **Recolor:** orange/lime reference → blue/navy portfolio variant documented in brief
- **Next:** optional `FIGMA.md` + push demo frame to team file when ready
