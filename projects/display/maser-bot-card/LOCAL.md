# Run locally

This project is meant to be developed and previewed on your machine — not only in Cursor Cloud.

## Setup

```bash
cd lab
npm install
npm run dev
```

Open **http://localhost:3000/demos/maser-bot-card**

## Quality checks

```bash
cd lab
npm run lint
npm run build
```

## Cursor IDE (local agent)

1. Open this repo in **Cursor Desktop** (not Cloud Agent).
2. Load the `maser-lab-web` skill for any web UI work (sections, components, forms, motion, a11y).
3. Use a **local** terminal for `npm run dev` so you can exercise all states in `PROJECT.md`.

## Component path

`lab/src/components/projects/display/maser-bot-card/`

## Spec

`projects/display/maser-bot-card/PROJECT.md`  
Package: `projects/display/maser-bot-card/design.md`

## Transfer

- Per-project notes: `projects/display/maser-bot-card/TRANSFER.md`
- Universal checklist: `.agents/skills/maser-lab-web/references/project-lifecycle.md` (Transfer checklist)
