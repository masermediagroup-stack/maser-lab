# Copy

Load in **Copy** mode, and whenever user-facing strings or accessible names change.

Do not broaden Copy mode into layout or interaction redesign — report structural blockers instead.

## Principles

- Name the **exact object** and **consequence** of important actions
- Prefer **Verb + Noun** for primary and destructive CTAs (`Delete project`, not `Confirm` / `OK` / bare `Delete`)
- Keep loading control labels **stable**; use busy/loading affordances — do not swap the label to “Loading…”
- Accessible names required for icon-only buttons and form controls (`web-design-guidelines`)
- Demo chrome strings (route tabs, reduced-motion toggle) must have accessible names (`maser-lab-demo-chrome`)
- Empty / error / permission copy must tell the user what happened and what to do next

## Lab surfaces

| Surface | Guidance |
| --- | --- |
| Product barrel UI | Client-facing; no “lab” or “demo” voice |
| DemoHost chrome | Lab voice OK; keep short; a11y names required |
| PROJECT.md briefs | Job language, not marketing fluff |
| Transfer docs | Precise API names; no template placeholders |

## Bad / good

**Bad:** `OK`, `Submit`, `Click here`, `Confirm`

**Good:** `Create account`, `Save changes`, `Delete message`, `Try again`

## Route out

- Full a11y audit → `web-design-guidelines`
- Brand voice for a section Shape → `maser-lab-section-shape` / `frontend-design`
- Motion naming → `animation-vocabulary` (not copy rewriting)
