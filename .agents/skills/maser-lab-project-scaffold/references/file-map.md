# Scaffold file map

```text
projects/{category}/{slug}/
  PROJECT.md
  FIGMA.md          # if design refs
  TRANSFER.md       # template until Transfer
  LOCAL.md          # optional

lab/src/components/projects/{category}/{slug}/
  index.ts          # product only
  *-demo.tsx
  tokens.css        # or document CSS-modules-only
  …

lab/src/components/projects/registry.ts
  demoRegistry["{slug}"] = Demo

lab/src/app/demos/[slug]/page.tsx
  DemoHost          # catch-all only
```
