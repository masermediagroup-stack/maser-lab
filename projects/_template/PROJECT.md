# Project: {title}

**Slug:** `{slug}`  
**Category:** navigation | inputs | feedback | display | scroll | marketing | layout  
**Status:** draft | building | review | ready | transferred  
**Created:** YYYY-MM-DD

## Brief

### User / trigger
Who activates this and how often?

### Job
What should the user understand or feel after the interaction?

### Current behavior
What exists today (or "greenfield")?

### Desired outcome
What does "done" feel like?

### Success signal
How do we know it works? (timing, clarity, delight bar)

### Non-goals
What this project explicitly does not solve.

## States

List every reachable state the demo must expose:

- [ ] default
- [ ] hover (pointer fine only)
- [ ] focus
- [ ] active / pressed
- [ ] loading
- [ ] success
- [ ] error
- [ ] disabled
- [ ] prefers-reduced-motion

## Motion decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Library | CSS / WAAPI / Framer / GSAP | |
| Duration | ms | |
| Easing | | |

## Acceptance criteria

- [ ] Demo route `/demos/{slug}` renders all states above
- [ ] `npm run lint` and `npm run build` pass in `lab/`
- [ ] Motion review: no open P0/P1 findings
- [ ] `prefers-reduced-motion` verified in browser
- [ ] Component exported from `lab/src/components/projects/{slug}/index.ts`

## Open decisions

- 
