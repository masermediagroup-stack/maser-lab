# Export barrel checklist

Quick gate before `ready`:

- [ ] `index.ts` exports product component(s) + public types
- [ ] `index.ts` does **not** export `*Demo`
- [ ] Demo imported in `lab/src/components/projects/registry.ts` from demo file
- [ ] Product does not import `@/components/lab/demo-chrome`
- [ ] Product does not import other `{category}/{slug}` packages
- [ ] `TRANSFER.md` import snippet matches real export symbol
- [ ] Remote default media documented or replaced with `public/` assets
