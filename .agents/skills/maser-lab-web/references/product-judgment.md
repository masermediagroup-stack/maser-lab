# Product judgment

Load for Shape, Implement, Harden, and full Review when the change affects the user’s task, default, scope, consequence, navigation, interaction surface, or reachable states.

Adapted from Vercel product-design operating contract — lab-specific framing for sections and components.

## Compact brief (required)

Answer before pixels:

| Field | Prompt |
| --- | --- |
| User | Who is acting? |
| Job | What are they trying to accomplish? |
| Object | What product/lab object is involved? |
| Current behavior | What exists today? |
| Desired outcome | What should change for the user? |
| Success signal | How do we know it worked? |
| Non-goals | What we will not solve |
| Scope | One section / one component / one adapter |
| Action | Primary CTA or interaction |
| Consequence | What the system will change |
| Reversibility | Undo / exit / reduce-motion path |
| Open decisions | Use `decision-template.md` |

## Material vs mechanical

A **material** decision changes task, default, scope, consequence, navigation, interaction surface, or reachable states.

Usually **not** material: token swaps, copy punctuation, established component substitutions with the same semantics.

## Lab standards tied to judgment

- Brand-first first viewport when the surface is branded (`maser-lab-section-shape` / frontend-design rules)
- One job per section
- Demo must expose every `PROJECT.md` state — `rule/demo-all-states`
- Prefer strong defaults over configuration the user must learn
- Prefer inline disclosure before adding a modal
- Destructive or irreversible actions must name object + consequence (see `copy.md`)

## Evidence order

1. User’s explicit goal
2. Verified demo / product behavior
3. `PROJECT.md` acceptance criteria + `rule/*`
4. Accepted exemplars
5. Adjacent shipped lab demos (evidence, not automatic precedent)
6. General heuristics

## Shipped code is not precedent

A working demo proves existence. Check it against current components, `rules.md`, and explicit guidance before copying.
