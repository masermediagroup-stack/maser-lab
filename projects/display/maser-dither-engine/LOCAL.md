# Local — Maser Dither Engine

```bash
cd lab
npm run dev
```

Open [http://localhost:3000/demos/maser-dither-engine](http://localhost:3000/demos/maser-dither-engine).

Keyboard: `1` Overview · `2` Components · `3` Materials · `4` Presets · `5` Playground · `6` Docs

## Agents — read first

Before editing this project (especially `engine/` or shaders):

1. [`AGENTS.md`](./AGENTS.md) — project contract & ownership table
2. [`engine/AGENTS.md`](../../../lab/src/components/projects/display/maser-dither-engine/engine/AGENTS.md) — sacred VERT / SAMPLE / uniforms
3. [`docs/engine-lessons.md`](../../../lab/src/components/projects/display/maser-dither-engine/docs/engine-lessons.md) — black-screen postmortem

Smoke test after shader edits: canvas must be **non-black**; console must not show `Shader compile error`.
