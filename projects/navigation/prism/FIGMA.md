# Figma: Navigation Glass Blue Morph (Liquid Glass Top Nav)

**Slug:** `prism`  
**Project name:** Prism  
**Nav brand label:** Prism  
**Category:** navigation

## Figma file

| Field | Value |
| --- | --- |
| `fileKey` | `f2TLFWW5Eg8aqczRjuZ403` |
| File URL | https://www.figma.com/design/f2TLFWW5Eg8aqczRjuZ403/Maser-Lab-web-component-and-interaction-file |
| Page | `0:1` — Glass Nav - Blue and Black |
| Primary frame | `12:273` — Prism Nav Glass with Teal |
| Nav component | `12:274` — PrismGlassNavigation |
| Default state | Gallery selected (`12:292` / `12:293`) |

## Design tokens (from Figma)

| Token | Value |
| --- | --- |
| Nav size | 860 × 72px |
| Font | Figtree Medium 15px (17px brand) |
| Glass border | `rgba(255,255,255,0.1)` @ 0.833px |
| Selector gradient | `#befff2` → `#defff8` |
| Active text | `#1b1b1b` |
| Inactive text | `#ffffff` |
| Profile icon (glass) | `rgba(255,255,255,0.2)` circle |

## Lab implementation

| Component | Path |
| --- | --- |
| `LiquidGlassTopNav` | `liquid-glass-top-nav.tsx` |
| Demo | `/demos/prism` |

### Interaction (code)

- Teal pill slides between Home / Explore / Library / Gallery — **pointer:** liquid spring (0.42s, bounce 0.2) on transform; **keyboard:** instant snap
- Active category label → black
- Profile button: glass by default; teal gradient + black icon/text **only when Profile is selected**
- Press feedback (scale 0.97) and pointer-gated hover on category links

## Implementation sync

| Date | Notes |
| --- | --- |
| 2026-06-28 | Manual Figma design `12:274` integrated into lab |
