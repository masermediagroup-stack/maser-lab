# Component projects

All lab components live under `{category}/{slug}/`. The category folder matches the `category` field in `projects/registry.json`.

```text
lab/src/components/projects/
├── demo-host.tsx
├── registry.ts
├── navigation/
│   └── plotline-tab-nav/
├── hero-section/
├── inputs/
├── feedback/
├── display/
├── scroll/
├── marketing/
└── layout/
```

When adding a demo, import from `@/components/projects/{category}/{slug}` and register in `registry.ts`.
