# How to start the Casework repo

This folder in **maser-lab** is a handoff, not the product. Do not turn maser-lab into Casework. Do not download a zip of the whole lab.

## What to download

After PR #53 is on GitHub, download **only** this file:

[`casework-handoff.zip`](./casework-handoff.zip)

It contains:

- Product brief, architecture, ADR, build status
- Curated agent skills (not the full maser-lab inventory)
- `AGENTS.md` and `README.md` for the new repo

It does **not** contain a Next.js app. Phase 1 scaffolds that in the new repo.

Direct link on this branch:

https://github.com/masermediagroup-stack/maser-lab/raw/cursor/webdesign-casework-phase-0-9a0c/docs/casework/casework-handoff.zip

(After merge, switch `cursor/webdesign-casework-phase-0-9a0c` for `main`.)

Regenerate the zip (from maser-lab root):

```bash
bash docs/casework/pack-handoff.sh
```

## Create the GitHub repo

This environment cannot create repositories. On GitHub:

1. New repository under `masermediagroup-stack`, name `casework` (or similar).
2. Empty README optional — you will replace the tree.

## Load the handoff

```bash
mkdir -p ~/src && cd ~/src
unzip /path/to/casework-handoff.zip
cd casework
git init
git add .
git commit -m "docs: import Casework Phase 0 handoff from maser-lab"
git remote add origin git@github.com:masermediagroup-stack/casework.git
git branch -M main
git push -u origin main
```

Then open a **new** Cursor agent on that repo and approve **Phase 1** (foundation and design system). Do not continue Casework implementation in maser-lab.
