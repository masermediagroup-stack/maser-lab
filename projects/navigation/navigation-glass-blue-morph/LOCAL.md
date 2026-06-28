# Run locally

This project is meant to be developed and previewed on your machine — not only in Cursor Cloud.

## Setup

```bash
git fetch origin
git checkout cursor/webdesign-glass-blue-morph-nav-6a75
cd lab
npm install
npm run dev
```

Open **http://localhost:3000/demos/navigation-glass-blue-morph**

## Quality checks

```bash
cd lab
npm run lint
npm run build
```

## Cursor IDE (local agent)

1. Open this repo in **Cursor Desktop** (not Cloud Agent).
2. Load the `micro-interaction-lab` skill for motion/a11y work.
3. Use **local** terminal for `npm run dev` so you can interact with the nav and compare to the [Dribbble reference](https://dribbble.com/shots/23413962-Glassmorphism-nav-bar-micro-interaction).

## Component path

`lab/src/components/projects/navigation/navigation-glass-blue-morph/`

## Spec

`projects/navigation/navigation-glass-blue-morph/PROJECT.md`
