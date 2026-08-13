#!/usr/bin/env bash
# Pack Casework Phase 0 docs + curated skills into casework-handoff.zip
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STAGING="$(mktemp -d)"
DEST_DIR="$STAGING/casework"
ZIP_OUT="$ROOT/docs/casework/casework-handoff.zip"

SKILLS=(
  maser-lab-web
  verification
  web-design-guidelines
  shadcn
  vercel-react-best-practices
  vercel-composition-patterns
  review-animations
  ui-animation
  emil-design-eng
  frontend-design
)

mkdir -p "$DEST_DIR/docs/decisions" "$DEST_DIR/.agents/skills"

cp "$ROOT/docs/casework/product-brief.md" "$DEST_DIR/docs/product-brief.md"
cp "$ROOT/docs/casework/architecture.md" "$DEST_DIR/docs/architecture.md"
cp "$ROOT/docs/casework/build-status.md" "$DEST_DIR/docs/build-status.md"
cp "$ROOT/docs/casework/decisions/0001-foundation.md" "$DEST_DIR/docs/decisions/0001-foundation.md"

for skill in "${SKILLS[@]}"; do
  src="$ROOT/.agents/skills/$skill"
  if [[ ! -d "$src" ]]; then
    echo "missing skill: $skill" >&2
    exit 1
  fi
  cp -R "$src" "$DEST_DIR/.agents/skills/$skill"
done

# Drop lab-only governance packets that would send agents into dither work.
rm -rf "$DEST_DIR/.agents/skills/maser-lab-web/governance/packets/2026-08-02-dither-engine-regressions"

cat > "$DEST_DIR/README.md" << 'EOF'
# Casework

In-house case-study authoring, private review, and unlisted publish for Maser Media.

This repository starts as a **Phase 0 handoff**. There is no application yet.

Read in order:

1. [docs/product-brief.md](docs/product-brief.md)
2. [docs/architecture.md](docs/architecture.md)
3. [docs/decisions/0001-foundation.md](docs/decisions/0001-foundation.md)
4. [docs/build-status.md](docs/build-status.md)

Next approved step is **Phase 1** in this repo: Next.js app shell, studio/presentation route groups, design tokens, primitives. Do not implement Casework inside maser-lab.

Published unlisted URLs will live at `https://masermedia.co/p/[slug]` (thin route in maser-media, later). Studio and `/present/[token]` live here.
EOF

cat > "$DEST_DIR/AGENTS.md" << 'EOF'
# Casework — Agent instructions

**Casework** is Maser Media’s case-study CMS: studio authoring, private client review, unlisted publish onto masermedia.co.

This is not maser-lab. Do not scaffold lab demos, dither engines, or a second app inside a lab.

## Product docs (load first)

- `docs/product-brief.md`
- `docs/architecture.md`
- `docs/decisions/0001-foundation.md`
- `docs/build-status.md`

Work **one phase at a time**. Stop for approval after each phase. Phase 0 is done. Phase 1 is the first code phase.

## Skills to load

| Task | Load |
| --- | --- |
| Any product UI | `.agents/skills/maser-lab-web/SKILL.md` (Shape / Implement / Review / Harden) |
| End-to-end verification | `.agents/skills/verification/SKILL.md` |
| Accessibility | `.agents/skills/web-design-guidelines/SKILL.md` |
| Primitives | `.agents/skills/shadcn/SKILL.md` |
| React/Next performance | `.agents/skills/vercel-react-best-practices/SKILL.md` |
| Composition | `.agents/skills/vercel-composition-patterns/SKILL.md` |
| Motion review | `.agents/skills/review-animations/SKILL.md` |
| Motion craft | `.agents/skills/ui-animation/SKILL.md`, `.agents/skills/emil-design-eng/SKILL.md` |
| Expressive UI | `.agents/skills/frontend-design/SKILL.md` |

Ignore maser-lab-web routes that point at lab-only skills (project scaffold, demo-chrome, dither, Three.js, export to portfolio). Follow `docs/architecture.md` instead.

Do **not** use Convex, Firebase, or Hugging Face skills. Backend is Supabase.

## Hosts

- Studio + `/present/[token]`: this app (`studioOrigin`, Vercel URL in MVP)
- Published unlisted: `https://masermedia.co/p/[slug]` (maser-media, later PR)
- Do not build Casework `/`, `/work`, `/about`, `/contact`

## Product name

Read `src/config/product.ts` once it exists. Until Phase 1, the working name is Casework.
EOF

# Normalize line endings and drop junk
find "$DEST_DIR" -name '.DS_Store' -delete

rm -f "$ZIP_OUT"
(
  cd "$STAGING"
  zip -qr "$ZIP_OUT" casework
)

echo "wrote $ZIP_OUT ($(wc -c < "$ZIP_OUT") bytes)"
rm -rf "$STAGING"
