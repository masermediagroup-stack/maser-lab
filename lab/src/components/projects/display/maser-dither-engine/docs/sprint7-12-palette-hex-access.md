# Sprint 7.12 — Palette presets + custom HEX on every component

**Mode:** Harden · **Engine:** `0.7.12`

## Problem

Palette Studio and HEX / RGB / HSL editors lived only inside the Color accordion (`MaterialPanel`). On mobile, the **Materials** tab focused `material` → `ProceduralMaterialPanel` only, so palette presets and custom hex codes were unreachable. On desktop they were easy to miss under a collapsed accordion.

## Fix

1. **Pinned `Palette & colors` strip** after Base Plate on desktop (and on the mobile Color tab) — full `MaterialPanel` with palette presets + picker + HEX / RGB / HSL for every material color slot.
2. **Mobile bottom nav** — Materials → **Color**; sheet title **Color & material**; tab opens `colors` + `material` panels (`focusGroups: ["colors", "material"]`).
3. **Color accordion** renamed **Color tone** (brightness / contrast / gradient sliders only) so it no longer duplicates the studio.
4. **HEX draft state** — typing incomplete hex no longer fights the controlled value.
5. Control search hits for `colors` route to the Color mobile tab.

## Verify

- Desktop: open any component → strip under Base Plate → pick a palette → edit HEX.
- Mobile (≤900px): Color tab → same strip + procedural material.
- Switch Card / Button / Progress / etc. — color config is shared engine state and remains editable.
